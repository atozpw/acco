<?php

namespace App\Services\Dashboard;

use App\Models\JournalDetail;
use App\Services\Report\Finance\ProfitLossService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DetailProfitLossService
{
    public function __construct(
        private readonly ProfitLossService $profitLossService,
        private readonly JournalDetail $journalDetail,
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

        $summary = [
            'income' => round((float) ($report['totals']['income'] ?? 0), 2),
            'expense' => round((float) ($report['totals']['expense'] ?? 0), 2),
            'net_profit' => round((float) ($report['totals']['net_profit'] ?? 0), 2),
        ];

        $periodStart = $period['start']->copy();
        $periodEnd = $period['end']->copy();

        $previousMonthStart = $periodStart->copy()->subMonthNoOverflow()->startOfMonth();
        $previousMonthEnd = $previousMonthStart->copy()->endOfMonth();
        $previousMonthReport = $this->profitLossService->generate(
            $this->withPeriod($filters, $previousMonthStart, $previousMonthEnd)
        );
        $previousMonthNet = (float) ($previousMonthReport['totals']['net_profit'] ?? 0);

        $previousYearStart = $periodStart->copy()->subYear()->startOfMonth();
        $previousYearEnd = $previousYearStart->copy()->endOfMonth();
        $previousYearReport = $this->profitLossService->generate(
            $this->withPeriod($filters, $previousYearStart, $previousYearEnd)
        );
        $previousYearNet = (float) ($previousYearReport['totals']['net_profit'] ?? 0);

        $nextMonthStart = $periodStart->copy()->addMonthNoOverflow()->startOfMonth();

        return [
            'period' => [
                'label' => $this->formatPeriodLabel($periodStart),
                'month' => $period['month'],
                'year' => $period['year'],
                'date_from' => $periodStart->toDateString(),
                'date_to' => $periodEnd->toDateString(),
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
            'margins' => [
                'gross' => $this->calculateMargin($summary['net_profit'], $summary['income']),
                'operating' => $this->calculateMargin($summary['net_profit'], $summary['income']),
                'net' => $this->calculateMargin($summary['net_profit'], $summary['income']),
            ],
            'comparisons' => [
                'mom' => [
                    'growth' => $this->calculateGrowth($summary['net_profit'], $previousMonthNet),
                    'current' => $summary['net_profit'],
                    'previous' => $previousMonthNet,
                    'label' => $this->formatPeriodLabel($previousMonthStart),
                ],
                'yoy' => [
                    'growth' => $this->calculateGrowth($summary['net_profit'], $previousYearNet),
                    'current' => $summary['net_profit'],
                    'previous' => $previousYearNet,
                    'label' => $this->formatPeriodLabel($previousYearStart),
                ],
            ],
            'chart' => $this->buildDailySeries($filters, $periodStart, $periodEnd),
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

    private function withPeriod(array $filters, Carbon $start, Carbon $end): array
    {
        $filters['date_from'] = $start->toDateString();
        $filters['date_to'] = $end->toDateString();

        return $filters;
    }

    private function calculateMargin(?float $result, ?float $base): ?float
    {
        if ($result === null || $base === null || abs($base) < 0.00001) {
            return null;
        }

        return round(($result / $base) * 100, 2);
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

    private function buildDailySeries(array $filters, Carbon $periodStart, Carbon $periodEnd): array
    {
        $departmentId = $filters['department_id'] ?? null;
        $projectId = $filters['project_id'] ?? null;

        $details = $this->journalDetail
            ->newQuery()
            ->with(['journal:id,date', 'coa:id,is_debit,coa_classification_id', 'coa.classification:id,type'])
            ->whereHas('coa.classification', fn($query) => $query->where('type', ProfitLossService::CLASSIFICATION_TYPE))
            ->whereHas('journal', function ($query) use ($periodStart, $periodEnd) {
                $query->whereBetween('date', [$periodStart->toDateString(), $periodEnd->toDateString()]);
            })
            ->when($departmentId, fn($builder) => $builder->where('department_id', $departmentId))
            ->when($projectId, fn($builder) => $builder->where('project_id', $projectId))
            ->get(['id', 'journal_id', 'coa_id', 'debit', 'credit', 'department_id', 'project_id']);

        $aggregated = [];

        foreach ($details as $detail) {
            if (!$detail->journal || !$detail->coa) {
                continue;
            }

            $entryDate = Carbon::make($detail->journal->date)?->toDateString();

            if ($entryDate === null) {
                continue;
            }

            $isDebit = (bool) $detail->coa->is_debit;
            $key = $entryDate . '|' . ($isDebit ? '1' : '0');

            if (!isset($aggregated[$key])) {
                $aggregated[$key] = [
                    'entry_date' => $entryDate,
                    'is_debit' => $isDebit,
                    'total_debit' => 0.0,
                    'total_credit' => 0.0,
                ];
            }

            $aggregated[$key]['total_debit'] += (float) $detail->debit;
            $aggregated[$key]['total_credit'] += (float) $detail->credit;
        }

        $rows = collect($aggregated)->groupBy('entry_date');

        $labels = [];
        $incomeSeries = [];
        $expenseSeries = [];
        $netSeries = [];

        $cursor = $periodStart->copy();
        while ($cursor->lte($periodEnd)) {
            $dateKey = $cursor->toDateString();
            /** @var Collection<int, array<string, mixed>> $dailyRows */
            $dailyRows = $rows->get($dateKey, collect());

            $income = 0.0;
            $expense = 0.0;

            foreach ($dailyRows as $row) {
                $amount = $this->calculateAmount((bool) $row['is_debit'], (float) $row['total_debit'], (float) $row['total_credit']);

                if ((bool) $row['is_debit']) {
                    $expense += $amount;
                } else {
                    $income += $amount;
                }
            }

            $labels[] = $cursor->format('j');
            $incomeSeries[] = round($income, 2);
            $expenseSeries[] = round($expense, 2);
            $netSeries[] = round($income - $expense, 2);

            $cursor->addDay();
        }

        return [
            'labels' => $labels,
            'series' => [
                'income' => $incomeSeries,
                'expense' => $expenseSeries,
                'net_profit' => $netSeries,
            ],
        ];
    }

    private function calculateAmount(bool $isDebitAccount, float $debit, float $credit): float
    {
        return $isDebitAccount
            ? $debit - $credit
            : $credit - $debit;
    }

    private function formatPeriodLabel(Carbon $date): string
    {
        return $date
            ->copy()
            ->locale('id')
            ->translatedFormat('F Y');
    }
}
