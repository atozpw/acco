<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\PayablePayment;
use App\Models\Project;
use App\Models\PurchaseInvoice;
use App\Models\ReceivablePayment;
use App\Models\SalesInvoice;
use App\Services\Dashboard\DetailExpenseService;
use App\Services\Dashboard\DetailProfitLossService;
use App\Services\Dashboard\DetailRevenueService;
use App\Services\Report\Finance\ProfitLossService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ProfitLossService $profitLossService,
        private readonly DetailProfitLossService $detailProfitLossService,
        private readonly DetailRevenueService $detailRevenueService,
        private readonly DetailExpenseService $detailExpenseService,
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

        $currentYear = Carbon::now()->year;
        $yearOptions = range($currentYear - 4, $currentYear + 1);

        return inertia('dashboard', [
            'summary' => [
                'income' => $report['totals']['income'] ?? 0,
                'expense' => $report['totals']['expense'] ?? 0,
                'net_profit' => $report['totals']['net_profit'] ?? 0,
            ],
            'filters' => $filters,
            'options' => [
                'departments' => $departments
                    ->map(fn ($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'projects' => $projects
                    ->map(fn ($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                    ])
                    ->values(),
                'year_options' => $yearOptions,
            ],
            'sales_chart' => $this->buildSalesChart(
                $filters['sales_year'],
                $filters['department_id'],
                $filters['project_id'],
            ),
            'purchase_chart' => $this->buildPurchaseChart(
                $filters['purchase_year'],
                $filters['department_id'],
                $filters['project_id'],
            ),
        ]);
    }

    public function profitLoss(Request $request): Response
    {
        $payload = $this->detailProfitLossService->generate($request);

        return inertia('dashboard/detail-profit-loss', $payload);
    }

    public function revenue(Request $request): Response
    {
        $payload = $this->detailRevenueService->generate($request);

        return inertia('dashboard/detail-revenue', $payload);
    }

    public function expense(Request $request): Response
    {
        $payload = $this->detailExpenseService->generate($request);

        return inertia('dashboard/detail-expense', $payload);
    }

    private function resolveFilters(Request $request): array
    {
        $dateFrom = (string) $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = (string) $request->input('date_to', Carbon::now()->endOfMonth()->toDateString());
        $currentYear = Carbon::now()->year;

        return [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
            'sales_year' => $request->filled('sales_year') ? (int) $request->input('sales_year') : $currentYear,
            'purchase_year' => $request->filled('purchase_year') ? (int) $request->input('purchase_year') : $currentYear,
        ];
    }

    private function buildSalesChart(int $year, ?int $departmentId, ?int $projectId): array
    {
        $monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        $receivables = ReceivablePayment::query()
            ->whereYear('date', $year)
            ->when($departmentId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('department_id', $departmentId)))
            ->when($projectId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('project_id', $projectId)))
            ->selectRaw('MONTH(date) as month, SUM(amount) as total')
            ->groupByRaw('MONTH(date)')
            ->pluck('total', 'month');

        $directlyPaidSales = SalesInvoice::query()
            ->whereYear('date', $year)
            ->where('is_paid', true)
            ->whereDoesntHave('receivablePaymentDetails')
            ->when($departmentId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('department_id', $departmentId)))
            ->when($projectId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('project_id', $projectId)))
            ->selectRaw('MONTH(date) as month, SUM(total) as total')
            ->groupByRaw('MONTH(date)')
            ->pluck('total', 'month');

        $invoices = SalesInvoice::query()
            ->whereYear('date', $year)
            ->when($departmentId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('department_id', $departmentId)))
            ->when($projectId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('project_id', $projectId)))
            ->selectRaw('MONTH(date) as month, SUM(total) as total')
            ->groupByRaw('MONTH(date)')
            ->pluck('total', 'month');

        $result = [];
        for ($month = 1; $month <= 12; $month++) {
            $result[] = [
                'label' => $monthLabels[$month - 1],
                'receivable' => round((float) ($receivables[$month] ?? 0) + (float) ($directlyPaidSales[$month] ?? 0), 2),
                'invoice' => round((float) ($invoices[$month] ?? 0), 2),
            ];
        }

        return $result;
    }

    private function buildPurchaseChart(int $year, ?int $departmentId, ?int $projectId): array
    {
        $monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        $payables = PayablePayment::query()
            ->whereYear('date', $year)
            ->when($departmentId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('department_id', $departmentId)))
            ->when($projectId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('project_id', $projectId)))
            ->selectRaw('MONTH(date) as month, SUM(amount) as total')
            ->groupByRaw('MONTH(date)')
            ->pluck('total', 'month');

        $directlyPaidPurchases = PurchaseInvoice::query()
            ->whereYear('date', $year)
            ->where('is_paid', true)
            ->whereDoesntHave('payablePaymentDetails')
            ->when($departmentId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('department_id', $departmentId)))
            ->when($projectId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('project_id', $projectId)))
            ->selectRaw('MONTH(date) as month, SUM(total) as total')
            ->groupByRaw('MONTH(date)')
            ->pluck('total', 'month');

        $invoices = PurchaseInvoice::query()
            ->whereYear('date', $year)
            ->when($departmentId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('department_id', $departmentId)))
            ->when($projectId, fn ($q) => $q->whereHas('details', fn ($d) => $d->where('project_id', $projectId)))
            ->selectRaw('MONTH(date) as month, SUM(total) as total')
            ->groupByRaw('MONTH(date)')
            ->pluck('total', 'month');

        $result = [];
        for ($month = 1; $month <= 12; $month++) {
            $result[] = [
                'label' => $monthLabels[$month - 1],
                'payable' => round((float) ($payables[$month] ?? 0) + (float) ($directlyPaidPurchases[$month] ?? 0), 2),
                'invoice' => round((float) ($invoices[$month] ?? 0), 2),
            ];
        }

        return $result;
    }
}
