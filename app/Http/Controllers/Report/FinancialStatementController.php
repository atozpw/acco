<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\CoaClassification;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Project;
use App\Services\Report\Finance\BalanceSheetService;
use App\Services\Report\Finance\ProfitLossService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class FinancialStatementController extends Controller
{
    public function __construct(
        private readonly ProfitLossService $profitLossService,
        private readonly BalanceSheetService $balanceSheetService,
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
