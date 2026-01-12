<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\CoaClassification;
use App\Models\Department;
use App\Models\Project;
use App\Services\Report\Finance\ProfitLossService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class FinancialStatementController extends Controller
{
    public function __construct(private readonly ProfitLossService $profitLossService) {}

    public function index(): Response
    {
        return inertia('report/finance/index');
    }

    public function profitLoss(Request $request): Response
    {
        $dateFrom = (string) $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = (string) $request->input('date_to', Carbon::now()->toDateString());

        $filters = [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'classification_id' => $request->filled('classification_id') ? (int) $request->input('classification_id') : null,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
        ];

        $report = $this->profitLossService->generate($filters);

        $classificationOptions = CoaClassification::query()
            ->where('type', ProfitLossService::CLASSIFICATION_TYPE)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $departments = Department::query()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

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
                        'code' => $item->code,
                        'name' => $item->name,
                    ])
                    ->values(),
                'projects' => $projects
                    ->map(fn($item) => [
                        'id' => $item->id,
                        'code' => $item->code,
                        'name' => $item->name,
                    ])
                    ->values(),
            ],
        ]);
    }
}
