<?php

namespace App\Services\Dashboard;

use App\Models\JournalDetail;
use App\Models\SalesInvoice;
use App\Services\Report\Finance\ProfitLossService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DetailRevenueService
{
    public function __construct(
        private readonly ProfitLossService $profitLossService,
        private readonly JournalDetail $journalDetail,
        private readonly SalesInvoice $salesInvoice,
    ) {}

    public function generate(Request $request): array
    {
        $period = $this->resolvePeriod($request);

        $filters = [
            'date_from' => $period['start']->toDateString(),
            'date_to' => $period['end']->toDateString(),
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
        ];

        $report = $this->profitLossService->generate($filters);

        $detailRows = $this->fetchRevenueDetails($filters, $period['start'], $period['end']);

        $summary = $this->buildSummary($report, $detailRows, $filters, $period['start'], $period['end']);

        $previousMonthStart = $period['start']->copy()->subMonthNoOverflow()->startOfMonth();
        $previousMonthEnd = $previousMonthStart->copy()->endOfMonth();
        $previousMonthTotal = $this->sumIncomeForPeriod($filters, $previousMonthStart, $previousMonthEnd);

        $previousYearStart = $period['start']->copy()->subYear()->startOfMonth();
        $previousYearEnd = $previousYearStart->copy()->endOfMonth();
        $previousYearTotal = $this->sumIncomeForPeriod($filters, $previousYearStart, $previousYearEnd);

        $nextMonthStart = $period['start']->copy()->addMonthNoOverflow()->startOfMonth();

        return [
            'period' => [
                'label' => $this->formatPeriodLabel($period['start']),
                'month' => $period['month'],
                'year' => $period['year'],
                'date_from' => $period['start']->toDateString(),
                'date_to' => $period['end']->toDateString(),
                'navigation' => [
                    'previous' => [
                        'month' => $previousMonthStart->month,
                        'year' => $previousMonthStart->year,
                        'label' => $this->formatPeriodLabel($previousMonthStart),
                    ],
                    'next' => [
                        'month' => $nextMonthStart->month,
                        'year' => $nextMonthStart->year,
                        'label' => $this->formatPeriodLabel($nextMonthStart),
                    ],
                ],
            ],
            'summary' => $summary,
            'comparisons' => [
                'mom' => [
                    'growth' => $this->calculateGrowth($summary['total_amount'], $previousMonthTotal),
                    'current' => $summary['total_amount'],
                    'previous' => $previousMonthTotal,
                    'label' => $this->formatPeriodLabel($previousMonthStart),
                ],
                'yoy' => [
                    'growth' => $this->calculateGrowth($summary['total_amount'], $previousYearTotal),
                    'current' => $summary['total_amount'],
                    'previous' => $previousYearTotal,
                    'label' => $this->formatPeriodLabel($previousYearStart),
                ],
            ],
            'chart' => $this->buildDailySeries($detailRows, $period['start'], $period['end']),
            'breakdowns' => [
                'sources' => $this->buildBreakdown($detailRows, fn($detail) => [
                    'key' => (string) ($detail->coa_id ?? 0),
                    'label' => $detail->coa->name ?? 'Tidak ada akun',
                ]),
                'departments' => $this->buildBreakdown($detailRows, fn($detail) => [
                    'key' => (string) ($detail->department_id ?? 0),
                    'label' => $detail->department->name ?? 'N/A',
                ]),
                'projects' => $this->buildBreakdown($detailRows, fn($detail) => [
                    'key' => (string) ($detail->project_id ?? 0),
                    'label' => $detail->project->name ?? 'N/A',
                ]),
            ],
            'filters' => [
                'month' => $period['month'],
                'year' => $period['year'],
                'department_id' => $filters['department_id'],
                'project_id' => $filters['project_id'],
            ],
        ];
    }

    private function resolvePeriod(Request $request): array
    {
        $now = Carbon::now();

        $fromInput = $request->input('date_from');
        $toInput = $request->input('date_to');
        $fromDate = $fromInput ? Carbon::make($fromInput) : null;
        $toDate = $toInput ? Carbon::make($toInput) : null;

        if ($fromDate || $toDate) {
            $start = ($fromDate ?? $toDate)->copy()->startOfDay();
            $end = ($toDate ?? $fromDate ?? $start)->copy()->endOfDay();
        } else {
            $monthInput = (int) $request->input('month', 0);
            $yearInput = (int) $request->input('year', 0);

            $month = $monthInput >= 1 && $monthInput <= 12 ? $monthInput : $now->month;
            $year = $yearInput >= 2000 ? $yearInput : $now->year;

            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = $start->copy()->endOfMonth();
        }

        return [
            'start' => $start,
            'end' => $end,
            'month' => (int) $start->month,
            'year' => (int) $start->year,
        ];
    }

    private function fetchRevenueDetails(array $filters, Carbon $periodStart, Carbon $periodEnd): Collection
    {
        $departmentId = $filters['department_id'] ?? null;
        $projectId = $filters['project_id'] ?? null;

        return $this->journalDetail
            ->newQuery()
            ->with([
                'journal:id,date',
                'coa:id,name,is_debit,coa_classification_id',
                'coa.classification:id,type',
                'department:id,name',
                'project:id,name',
            ])
            ->whereHas('journal', function ($query) use ($periodStart, $periodEnd) {
                $query->whereBetween('date', [
                    $periodStart->toDateString(),
                    $periodEnd->toDateString(),
                ]);
            })
            ->whereHas('coa', function ($query) {
                $query
                    ->where('is_debit', false)
                    ->whereHas('classification', fn($classification) => $classification->where('type', ProfitLossService::CLASSIFICATION_TYPE));
            })
            ->when($departmentId, fn($builder) => $builder->where('department_id', $departmentId))
            ->when($projectId, fn($builder) => $builder->where('project_id', $projectId))
            ->get([
                'id',
                'journal_id',
                'coa_id',
                'debit',
                'credit',
                'department_id',
                'project_id',
                'note',
            ]);
    }

    private function buildSummary(array $report, Collection $details, array $filters, Carbon $periodStart, Carbon $periodEnd): array
    {
        $totalAmount = round((float) ($report['totals']['income'] ?? 0), 2);
        $transactionCount = $details->pluck('journal_id')->filter()->unique()->count();
        $customerCount = $this->salesInvoice
            ->newQuery()
            ->whereBetween('date', [
                $periodStart->toDateString(),
                $periodEnd->toDateString(),
            ])
            ->when($filters['department_id'], function ($query, $departmentId) {
                $query->whereHas('details', function ($detailQuery) use ($departmentId) {
                    $detailQuery->where('department_id', $departmentId);
                });
            })
            ->when($filters['project_id'], function ($query, $projectId) {
                $query->whereHas('details', function ($detailQuery) use ($projectId) {
                    $detailQuery->where('project_id', $projectId);
                });
            })
            ->distinct('contact_id')
            ->count('contact_id');
        $averageValue = $transactionCount > 0
            ? round($totalAmount / $transactionCount, 2)
            : 0.0;

        return [
            'total_amount' => $totalAmount,
            'customer_count' => $customerCount,
            'transaction_count' => $transactionCount,
            'average_value' => $averageValue,
        ];
    }

    private function buildDailySeries(Collection $details, Carbon $start, Carbon $end): array
    {
        $grouped = $details
            ->filter(fn($detail) => $detail->journal && $detail->journal->date)
            ->groupBy(function ($detail) {
                return Carbon::make($detail->journal->date)->toDateString();
            });

        $labels = [];
        $series = [];
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            $dateKey = $cursor->toDateString();
            $dailyTotal = $grouped
                ->get($dateKey, collect())
                ->sum(function ($detail) {
                    return $this->calculateAmount(
                        (bool) ($detail->coa?->is_debit ?? false),
                        (float) $detail->debit,
                        (float) $detail->credit,
                    );
                });

            $labels[] = $cursor->format('j');
            $series[] = round((float) $dailyTotal, 2);

            $cursor->addDay();
        }

        return [
            'labels' => $labels,
            'series' => [
                'amounts' => $series,
            ],
        ];
    }

    private function buildBreakdown(Collection $details, callable $resolver, int $limit = 10): array
    {
        $grouped = [];

        foreach ($details as $detail) {
            $meta = $resolver($detail);
            $key = $meta['key'];
            $label = $meta['label'];

            if ($key === '') {
                continue;
            }

            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'label' => $label,
                    'amount' => 0.0,
                ];
            }

            $grouped[$key]['amount'] += $this->calculateAmount(
                (bool) ($detail->coa?->is_debit ?? false),
                (float) $detail->debit,
                (float) $detail->credit,
            );
        }

        $total = array_sum(array_map(fn($row) => $row['amount'], $grouped));

        $items = collect($grouped)
            ->sortByDesc('amount')
            ->take($limit)
            ->map(function ($row) use ($total) {
                $amount = round((float) $row['amount'], 2);

                return [
                    'label' => $row['label'],
                    'amount' => $amount,
                ];
            })
            ->values()
            ->all();

        return [
            'total' => round((float) $total, 2),
            'items' => $items,
        ];
    }

    private function sumIncomeForPeriod(array $filters, Carbon $start, Carbon $end): float
    {
        $scopedFilters = $this->withPeriod($filters, $start, $end);
        $report = $this->profitLossService->generate($scopedFilters);

        return round((float) ($report['totals']['income'] ?? 0), 2);
    }

    private function withPeriod(array $filters, Carbon $start, Carbon $end): array
    {
        $filters['date_from'] = $start->toDateString();
        $filters['date_to'] = $end->toDateString();

        return $filters;
    }

    private function calculateAmount(bool $isDebitAccount, float $debit, float $credit): float
    {
        return $isDebitAccount
            ? $debit - $credit
            : $credit - $debit;
    }

    private function calculateGrowth(float $current, float $previous): ?float
    {
        if (abs($previous) < 0.00001) {
            if (abs($current) < 0.00001) {
                return 0.0;
            }

            return 100.0;
        }

        return round((($current - $previous) / abs($previous)) * 100, 2);
    }

    private function formatPeriodLabel(Carbon $date): string
    {
        return $date
            ->copy()
            ->locale('id')
            ->translatedFormat('F Y');
    }
}
