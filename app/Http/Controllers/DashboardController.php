<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Project;
use App\Services\Dashboard\DetailProfitLossService;
use App\Services\Report\Finance\ProfitLossService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ProfitLossService $profitLossService,
        private readonly DetailProfitLossService $detailProfitLossService,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $this->resolveFilters($request);

        $report = $this->profitLossService->generate($filters);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return inertia('dashboard', [
            'summary' => [
                'income' => $report['totals']['income'] ?? 0,
                'expense' => $report['totals']['expense'] ?? 0,
                'net_profit' => $report['totals']['net_profit'] ?? 0,
            ],
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

    public function profitLoss(Request $request)
    {
        $payload = $this->detailProfitLossService->generate($request);

        return inertia('dashboard/detail-profit-loss', $payload);
    }

    private function resolveFilters(Request $request): array
    {
        $dateFrom = (string) $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = (string) $request->input('date_to', Carbon::now()->endOfMonth()->toDateString());

        return [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
        ];
    }
}
