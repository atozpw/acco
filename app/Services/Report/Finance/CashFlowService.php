<?php

namespace App\Services\Report\Finance;

use App\Models\Coa;
use App\Models\JournalDetail;

class CashFlowService
{
    /**
     * COA code threshold: Harta with code >= this value is classified as Investing activity.
     * Codes 140+ = Aset Tetap, Aset Lain-Lain.
     */
    private const INVESTING_COA_CODE_THRESHOLD = 140;

    /**
     * Journal category code to exclude (internal cash transfer — both sides are is_cash_bank=1,
     * so they cancel out and must not be double-counted as a cash flow event).
     */
    private const EXCLUDE_CATEGORY_CODE = 'CT';

    public function generate(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;
        $departmentId = $filters['department_id'] ?? null;
        $projectId = $filters['project_id'] ?? null;

        $openingBalance = $this->getOpeningBalance($dateFrom);
        $sections = $this->buildSections($dateFrom, $dateTo, $departmentId, $projectId);

        $netChange = round(array_sum(array_column($sections, 'total')), 2);

        return [
            'sections' => $sections,
            'balances' => [
                'opening' => round($openingBalance, 2),
                'net_change' => $netChange,
                'closing' => round($openingBalance + $netChange, 2),
            ],
        ];
    }

    /**
     * Sum of all cash/bank movements before the period start = opening cash balance.
     */
    private function getOpeningBalance(?string $beforeDate): float
    {
        $result = JournalDetail::query()
            ->whereHas('coa', fn ($q) => $q->where('is_cash_bank', 1))
            ->when(
                $beforeDate,
                fn ($q) => $q->whereHas('journal', fn ($j) => $j->whereDate('date', '<', $beforeDate)),
            )
            ->selectRaw('COALESCE(SUM(debit) - SUM(credit), 0) as net')
            ->first();

        return (float) ($result?->net ?? 0);
    }

    /**
     * Build the three cash flow sections (Operating, Investing, Financing) by inspecting
     * the counter-entry (non-cash) side of every cash journal within the period.
     *
     * Sign convention for each counter-entry row: cash_effect = credit - debit
     *   - Counter credit (revenue / liability decrease) → positive = cash inflow  ✓
     *   - Counter debit  (expense / asset increase)     → negative = cash outflow ✓
     */
    private function buildSections(
        ?string $dateFrom,
        ?string $dateTo,
        mixed $departmentId,
        mixed $projectId,
    ): array {
        // Query actual cash-effect amounts (aggregated) per non-cash COA within the period.
        // Keyed by coa_id for O(1) lookup when building tree nodes below.
        $amountsByCoa = JournalDetail::query()
            ->selectRaw('coa_id, SUM(debit) as total_debit, SUM(credit) as total_credit')
            ->whereHas('coa', fn ($q) => $q->where('is_cash_bank', 0))
            ->whereHas('journal', function ($q) use ($dateFrom, $dateTo) {
                $q->whereHas('category', fn ($c) => $c->where('code', '!=', self::EXCLUDE_CATEGORY_CODE))
                    ->whereHas('details', fn ($d) => $d->whereHas('coa', fn ($c) => $c->where('is_cash_bank', 1)));

                if ($dateFrom) {
                    $q->whereDate('date', '>=', $dateFrom);
                }

                if ($dateTo) {
                    $q->whereDate('date', '<=', $dateTo);
                }
            })
            ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->groupBy('coa_id')
            ->get()
            ->keyBy('coa_id');

        // Load ALL non-cash-bank COAs ordered by code, then group by parent_id
        // so we can build a proper parent → children map.
        $allCoas = Coa::query()
            ->where('is_cash_bank', 0)
            ->orderBy('code')
            ->get();

        // Group by parent_id. Root nodes have parent_id = null (stored as '' after groupBy).
        $byParent = $allCoas->groupBy(fn ($coa) => $coa->parent_id ?? 'root');

        /**
         * Recursively build a tree node for a COA.
         * The node's `amount` is its own transaction amount PLUS the sum of all
         * descendants, so parent rows always show the rolled-up total.
         */
        $buildNode = function (Coa $coa) use (&$buildNode, $byParent, $amountsByCoa): array {
            $children = $byParent->get((string) $coa->id, collect());
            $childNodes = $children->map(fn ($child) => $buildNode($child))->values()->all();

            $row = $amountsByCoa->get($coa->id);
            $ownAmount = $row
                ? round((float) $row->total_credit - (float) $row->total_debit, 2)
                : 0.0;

            $childrenTotal = array_sum(array_column($childNodes, 'amount'));
            $totalAmount = round($ownAmount + $childrenTotal, 2);

            return [
                'coa_id' => (int) $coa->id,
                'coa_code' => $coa->code,
                'coa_name' => $coa->name,
                'amount' => $totalAmount,
                'children' => $childNodes,
            ];
        };

        // Only root COAs (parent_id = null) are section entry-points.
        $rootCoas = $byParent->get('root', collect());

        $accumulator = [
            'operating' => [],
            'investing' => [],
            'financing' => [],
        ];

        foreach ($rootCoas as $coa) {
            $section = $this->classifySection($coa);
            $accumulator[$section][] = $buildNode($coa);
        }

        return $this->formatSections($accumulator);
    }

    /**
     * Classify a counter-entry COA into a cash flow section based on its classification
     * and COA code (for Harta sub-types).
     *
     * Rules:
     *   - Modal (classification_id = 3)                   → Financing
     *   - Harta (classification_id = 1) with code >= 140  → Investing  (Aset Tetap / Aset Lain)
     *   - Everything else                                  → Operating
     */
    private function classifySection(Coa $coa): string
    {
        $classificationId = (int) $coa->coa_classification_id;

        if ($classificationId === 3) {
            return 'financing';
        }

        if ($classificationId === 1 && (int) $coa->code >= self::INVESTING_COA_CODE_THRESHOLD) {
            return 'investing';
        }

        return 'operating';
    }

    private function formatSections(array $accumulator): array
    {
        $sectionMeta = [
            'operating' => 'Arus Kas dari Aktivitas Operasi',
            'investing' => 'Arus Kas dari Aktivitas Investasi',
            'financing' => 'Arus Kas dari Aktivitas Pendanaan',
        ];

        $sections = [];

        foreach ($sectionMeta as $key => $name) {
            $accounts = $accumulator[$key];
            $total = round(array_sum(array_column($accounts, 'amount')), 2);

            $sections[] = [
                'key' => $key,
                'name' => $name,
                'accounts' => $accounts,
                'total' => $total,
            ];
        }

        return $sections;
    }

    private function emptySection(): array
    {
        return [
            ['key' => 'operating', 'name' => 'Arus Kas dari Aktivitas Operasi', 'accounts' => [], 'total' => 0],
            ['key' => 'investing', 'name' => 'Arus Kas dari Aktivitas Investasi', 'accounts' => [], 'total' => 0],
            ['key' => 'financing', 'name' => 'Arus Kas dari Aktivitas Pendanaan', 'accounts' => [], 'total' => 0],
        ];
    }
}
