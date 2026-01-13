<?php

namespace App\Services\Report\Finance;

use App\Models\Coa;
use App\Models\CoaClassification;
use App\Models\JournalDetail;
use Illuminate\Support\Collection;

class ProfitLossService
{
    public const CLASSIFICATION_TYPE = 'profit-loss';

    public function __construct(
        private readonly JournalDetail $journalDetail,
    ) {}

    /**
     * Generate Profit and Loss report data.
     * @param array $filters
     * @return array
     */
    public function generate(array $filters = []): array
    {
        $classificationId = $this->normalizeId($filters['classification_id'] ?? null);

        $classifications = CoaClassification::query()
            ->where('type', self::CLASSIFICATION_TYPE)
            ->active()
            ->when($classificationId, fn($query) => $query->where('id', $classificationId))
            ->whereHas('coas', fn($query) => $query->where('is_active', 1))
            ->with(['coas' => fn($query) => $query->where('is_active', 1)])
            ->get();

        $amounts = $this->collectAmounts($filters, $classificationId);

        $classificationPayload = $classifications->map(function (CoaClassification $classification) use ($amounts) {
            $accounts = $this->buildCoaTreeWithAmount($classification->coas, $amounts);

            return [
                'classification_id' => $classification->id,
                'classification_name' => $classification->name,
                'accounts' => $accounts->toArray(),
                'total' => round($accounts->sum('amount'), 2),
            ];
        })->all();

        $incomeTotal = $this->sumByDebitFlag($amounts, false);
        $expenseTotal = $this->sumByDebitFlag($amounts, true);

        return [
            'classifications' => $classificationPayload,
            'totals' => [
                'income' => round($incomeTotal, 2),
                'expense' => round($expenseTotal, 2),
                'net_profit' => round($incomeTotal - $expenseTotal, 2),
            ],
        ];
    }

    private function collectAmounts(array $filters, ?int $classificationId): Collection
    {
        $rows = $this->journalRows($filters, $classificationId);

        return $rows->mapWithKeys(function ($row) {
            $coaId = (int) $row->coa_id;
            $isDebit = (bool) $row->is_debit;

            return [
                $coaId => [
                    'amount' => $this->calculateAmount($isDebit, (float) $row->total_debit, (float) $row->total_credit),
                    'is_debit' => $isDebit,
                ],
            ];
        });
    }

    private function journalRows(array $filters, ?int $classificationId): Collection
    {
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;
        $departmentId = $filters['department_id'] ?? null;
        $projectId = $filters['project_id'] ?? null;

        $query = $this->journalDetail
            ->newQuery()
            ->selectRaw('coa_id, SUM(debit) as total_debit, SUM(credit) as total_credit')
            ->whereHas('coa.classification', function ($classification) use ($classificationId) {
                $classification->where('type', self::CLASSIFICATION_TYPE);

                if ($classificationId) {
                    $classification->where('id', $classificationId);
                }
            })
            ->when($dateFrom || $dateTo, function ($builder) use ($dateFrom, $dateTo) {
                $builder->whereHas('journal', function ($journal) use ($dateFrom, $dateTo) {
                    if ($dateFrom) {
                        $journal->whereDate('date', '>=', $dateFrom);
                    }

                    if ($dateTo) {
                        $journal->whereDate('date', '<=', $dateTo);
                    }
                });
            })
            ->when($departmentId, fn($builder) => $builder->where('department_id', $departmentId))
            ->when($projectId, fn($builder) => $builder->where('project_id', $projectId))
            ->groupBy('coa_id');

        $rows = $query->get();

        $coaMap = $this->fetchCoaDebitFlags($rows->pluck('coa_id'));

        return $rows->map(function ($row) use ($coaMap) {
            $row->is_debit = $coaMap[$row->coa_id] ?? false;

            return $row;
        });
    }

    private function calculateAmount(bool $isDebitAccount, float $debit, float $credit): float
    {
        return $isDebitAccount
            ? $debit - $credit
            : $credit - $debit;
    }

    private function sumByDebitFlag(Collection $amounts, bool $isDebit): float
    {
        return $amounts
            ->filter(fn(array $row) => $row['is_debit'] === $isDebit)
            ->sum(fn(array $row) => $row['amount']);
    }

    private function normalizeId(int|string|null $id): ?int
    {
        if ($id === null || $id === '') {
            return null;
        }

        return (int) $id;
    }

    private function buildCoaTreeWithAmount($coas, Collection $amounts): Collection
    {
        $grouped = $coas->groupBy('parent_id');

        $build = function ($parentId) use (&$build, $grouped, $amounts) {
            return ($grouped[$parentId] ?? collect())->map(function ($coa) use ($build, $amounts) {
                $children = $build($coa->id);
                $childrenTotal = $children->sum('amount');
                $selfAmount = $amounts->get($coa->id)['amount'] ?? 0;

                return [
                    'id' => $coa->id,
                    'code' => $coa->code,
                    'name' => $coa->name,
                    'amount' => round($selfAmount + $childrenTotal, 2),
                    'children' => $children,
                ];
            })->values();
        };

        return $build(null);
    }

    private function fetchCoaDebitFlags(Collection $coaIds): array
    {
        $ids = $coaIds->filter()->unique();

        if ($ids->isEmpty()) {
            return [];
        }

        return Coa::query()
            ->whereIn('id', $ids)
            ->pluck('is_debit', 'id')
            ->map(fn($value) => (bool) $value)
            ->all();
    }
}
