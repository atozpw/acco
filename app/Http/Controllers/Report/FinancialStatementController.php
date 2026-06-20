<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\CoaClassification;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Project;
use App\Services\Report\Finance\BalanceSheetService;
use App\Services\Report\Finance\CashFlowService;
use App\Services\Report\Finance\ProfitLossService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class FinancialStatementController extends Controller
{
    public function __construct(
        private readonly ProfitLossService $profitLossService,
        private readonly BalanceSheetService $balanceSheetService,
        private readonly CashFlowService $cashFlowService,
    ) {}

    public function index(): Response
    {
        return inertia('report/finance/index');
    }

    public function profitLoss(Request $request): Response
    {
        $filters = $this->buildStatementFilters($request);

        $report = $this->profitLossService->generate($filters);

        $classificationOptions = CoaClassification::query()
            ->where('type', ProfitLossService::CLASSIFICATION_TYPE)
            ->active()
            ->whereHas('coas', fn($query) => $query->where('is_active', 1))
            ->get(['id', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return inertia('report/finance/profit-loss', [
            'report' => $report,
            'filters' => $filters,
            'options' => [
                'classifications' => $classificationOptions
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'departments' => $departments
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'projects' => $projects
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
            ],
        ]);
    }

    public function balanceSheet(Request $request): Response
    {
        $filters = $this->buildStatementFilters($request);

        $report = $this->balanceSheetService->get($filters);

        $classificationOptions = CoaClassification::query()
            ->where('type', BalanceSheetService::CLASSIFICATION_TYPE)
            ->active()
            ->whereHas('coas', fn($query) => $query->where('is_active', 1))
            ->get(['id', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $customers = Contact::query()
            ->where('is_customer', 1)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return inertia('report/finance/balance-sheet', [
            'report' => $report,
            'filters' => $filters,
            'options' => [
                'classifications' => $classificationOptions
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'departments' => $departments
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'projects' => $projects
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'customers' => $customers
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
            ],
        ]);
    }

    public function balanceSheetComparison(Request $request): Response
    {
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        $baseFilters = [
            'classification_id' => $request->filled('classification_id') ? (int) $request->input('classification_id') : null,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
            'customer_id' => $request->filled('customer_id') ? (int) $request->input('customer_id') : null,
        ];

        // Periode 1: Akumulasi s/d akhir bulan terpilih
        $currentMonthStart = Carbon::create($year, $month, 1)->toDateString();
        $currentMonthEnd = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();
        $currentMonthFilters = array_merge($baseFilters, [
            'date_from' => $currentMonthStart,
            'date_to' => $currentMonthEnd,
        ]);

        // Periode 2: Akumulasi s/d akhir bulan sebelumnya
        $currentYearStart = Carbon::create($year, 1, 1)->toDateString();
        $currentYearEnd = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();
        $currentYearFilters = array_merge($baseFilters, [
            'date_from' => $currentYearStart,
            'date_to' => $currentYearEnd,
        ]);

        // Periode 3: Akumulasi s/d 31 Desember tahun lalu
        $prevYearStart = Carbon::create($year - 1, 1, 1)->toDateString();
        $prevYearEnd = Carbon::create($year - 1, 12, 31)->toDateString();
        $prevYearFilters = array_merge($baseFilters, [
            'date_from' => $prevYearStart,
            'date_to' => $prevYearEnd,
        ]);

        $reportCurrentMonth = $this->balanceSheetService->get($currentMonthFilters);
        $reportCurrentYear = $this->balanceSheetService->get($currentYearFilters);
        $reportPrevYear = $this->balanceSheetService->get($prevYearFilters);

        $classificationOptions = CoaClassification::query()
            ->where('type', BalanceSheetService::CLASSIFICATION_TYPE)
            ->active()
            ->whereHas('coas', fn($query) => $query->where('is_active', 1))
            ->get(['id', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $customers = Contact::query()
            ->where('is_customer', 1)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        // Format label periode
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return inertia('report/finance/balance-sheet-comparison', [
            'report' => [
                'current_month' => $reportCurrentMonth,
                'current_year' => $reportCurrentYear,
                'previous_year' => $reportPrevYear,
            ],
            'filters' => [
                'month' => $month,
                'year' => $year,
                'classification_id' => $baseFilters['classification_id'],
                'department_id' => $baseFilters['department_id'],
                'project_id' => $baseFilters['project_id'],
                'customer_id' => $baseFilters['customer_id'],
            ],
            'periods' => [
                'current_month' => $monthNames[$month] . ' ' . $year,
                'current_year' => '1 Januari - ' . $monthNames[$month] . ' ' . $year,
                'previous_year' => '1 Januari ' . ($year - 1) . ' - 31 Desember ' . ($year - 1),
            ],
            'options' => [
                'classifications' => $classificationOptions
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'departments' => $departments
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'projects' => $projects
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'customers' => $customers
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
            ],
        ]);
    }

    public function cashFlow(Request $request): Response
    {
        $filters = $this->buildStatementFilters($request);

        $report = $this->cashFlowService->generate($filters);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return inertia('report/finance/cash-flow', [
            'report' => $report,
            'filters' => $filters,
            'options' => [
                'departments' => $departments
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'projects' => $projects
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
            ],
        ]);
    }

    private function buildStatementFilters(Request $request): array
    {
        $dateFrom = (string) $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = (string) $request->input('date_to', Carbon::now()->toDateString());

        return [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'classification_id' => $request->filled('classification_id') ? (int) $request->input('classification_id') : null,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
            'customer_id' => $request->filled('customer_id') ? (int) $request->input('customer_id') : null,
        ];
    }
}
