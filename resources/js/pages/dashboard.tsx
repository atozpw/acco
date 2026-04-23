import type { ComboboxItem } from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import DashboardFilterDialog, {
    type DashboardFilterValues,
} from '@/pages/dashboard/partials/filter-dialog';
import { dashboard as dashboardIndex } from '@/routes';
import dashboardRoutes from '@/routes/dashboard';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    DollarSign,
    Info,
    ListFilterPlus,
    TrendingDown,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    type TooltipProps,
} from 'recharts';

type DashboardSummary = {
    income: number;
    expense: number;
    net_profit: number;
};

type DashboardFilters = {
    date_from: string | null;
    date_to: string | null;
    department_id: number | null;
    project_id: number | null;
    sales_year: number;
    purchase_year: number;
};

type OptionItem = {
    id: number;
    name: string;
};

type DashboardOptions = {
    departments: OptionItem[];
    projects: OptionItem[];
    year_options: number[];
};

type SalesChartPoint = {
    label: string;
    receivable: number;
    invoice: number;
};

type PurchaseChartPoint = {
    label: string;
    payable: number;
    invoice: number;
};

type PageProps = {
    summary: DashboardSummary;
    filters: DashboardFilters;
    options: DashboardOptions;
    sales_chart: SalesChartPoint[];
    purchase_chart: PurchaseChartPoint[];
};

type StatCardConfig = {
    key: string;
    label: string;
    value: number;
    icon: LucideIcon;
    info: string;
    meta: string;
    accent: string;
    href: string;
};

type TooltipItem = NonNullable<TooltipProps<number, string>['payload']>[number];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '',
    },
];

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return 'Rp 0,00';
    }

    return `Rp ${currencyFormatter.format(value)}`;
};

const formatDateForQuery = (date?: Date | null) => {
    if (!date || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateValue = (value?: string | null) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed;
};

const deriveDateRange = (from?: string | null, to?: string | null) => {
    const fromDate = parseDateValue(from);
    const toDate = parseDateValue(to);

    if (!fromDate && !toDate) return undefined;

    return {
        from: fromDate ?? toDate,
        to: toDate ?? fromDate,
    };
};

const buildDetailUrl = (
    type: 'profit_loss' | 'revenue' | 'expense',
    filters?: DashboardFilters,
) => {
    const query: Record<string, string> = {};
    if (filters?.date_from) query.date_from = filters.date_from;
    if (filters?.date_to) query.date_to = filters.date_to;
    if (filters?.department_id)
        query.department_id = String(filters.department_id);
    if (filters?.project_id) query.project_id = String(filters.project_id);

    if (type === 'profit_loss') {
        return dashboardRoutes.profitLoss.url(
            Object.keys(query).length ? { query } : undefined,
        );
    }

    if (type === 'revenue') {
        return dashboardRoutes.revenue.url(
            Object.keys(query).length ? { query } : undefined,
        );
    }

    if (type === 'expense') {
        return dashboardRoutes.expense.url(
            Object.keys(query).length ? { query } : undefined,
        );
    }

    return '#';
};

const formatAxisValue = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return value.toLocaleString('id-ID');
};

const monthFullNameMap: Record<string, string> = {
    Jan: 'Januari',
    Feb: 'Februari',
    Mar: 'Maret',
    Apr: 'April',
    Mei: 'Mei',
    Jun: 'Juni',
    Jul: 'Juli',
    Agu: 'Agustus',
    Sep: 'September',
    Okt: 'Oktober',
    Nov: 'November',
    Des: 'Desember',
};

const buildMonthLabelFormatter = (year: number) => (label: unknown) => {
    const abbr = String(label ?? '');
    const fullName = monthFullNameMap[abbr] ?? abbr;
    return `${fullName} ${year}`;
};

const renderTooltipValue = (rawValue: unknown, item?: TooltipItem) => {
    const numericValue = Number(rawValue ?? 0) || 0;
    const colorSource =
        item?.color ??
        (typeof item?.payload === 'object' && item?.payload !== null
            ? (((item.payload as Record<string, unknown>).stroke as string) ??
              ((item.payload as Record<string, unknown>).fill as string))
            : undefined);

    return (
        <span className="flex items-center gap-2">
            <span
                className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                    backgroundColor: colorSource || 'var(--color-border)',
                }}
            />
            <span className="font-mono font-medium">
                {formatCurrency(numericValue)}
            </span>
        </span>
    );
};

const salesChartConfig = {
    receivable: {
        label: 'Pembayaran Piutang',
        color: 'hsl(160 84% 39%)',
    },
    invoice: {
        label: 'Invoice Penjualan',
        color: 'hsl(199 89% 48%)',
    },
} as const;

const purchaseChartConfig = {
    payable: {
        label: 'Pembayaran Utang',
        color: 'hsl(346 77% 49%)',
    },
    invoice: {
        label: 'Invoice Pembelian',
        color: 'hsl(271 91% 65%)',
    },
} as const;

export default function Dashboard({
    summary,
    filters,
    options,
    sales_chart,
    purchase_chart,
}: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const totals: DashboardSummary = summary ?? {
        income: 0,
        expense: 0,
        net_profit: 0,
    };

    const activeFilters: DashboardFilters = {
        date_from: filters?.date_from ?? null,
        date_to: filters?.date_to ?? null,
        department_id: filters?.department_id ?? null,
        project_id: filters?.project_id ?? null,
        sales_year: filters?.sales_year ?? new Date().getFullYear(),
        purchase_year: filters?.purchase_year ?? new Date().getFullYear(),
    };

    const departmentItems: ComboboxItem[] = useMemo(
        () => [
            { value: '', label: 'Semua' },
            ...options.departments.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        ],
        [options.departments],
    );

    const projectItems: ComboboxItem[] = useMemo(
        () => [
            { value: '', label: 'Semua' },
            ...options.projects.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        ],
        [options.projects],
    );

    const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

    const selectedDateRange = useMemo(
        () => deriveDateRange(activeFilters.date_from, activeFilters.date_to),
        [activeFilters.date_from, activeFilters.date_to],
    );

    const filterValues = useMemo<DashboardFilterValues>(
        () => ({
            dateRange: selectedDateRange,
            departmentId: activeFilters.department_id
                ? String(activeFilters.department_id)
                : '',
            projectId: activeFilters.project_id
                ? String(activeFilters.project_id)
                : '',
        }),
        [
            selectedDateRange,
            activeFilters.department_id,
            activeFilters.project_id,
        ],
    );

    const handleApplyFilters = (values: DashboardFilterValues) => {
        const query: Record<string, string | number> = {};
        const dateFromValue = formatDateForQuery(
            values.dateRange?.from ?? null,
        );
        const dateToValue = formatDateForQuery(values.dateRange?.to ?? null);

        if (dateFromValue) query.date_from = dateFromValue;
        if (dateToValue) query.date_to = dateToValue;
        if (values.departmentId)
            query.department_id = Number(values.departmentId);
        if (values.projectId) query.project_id = Number(values.projectId);
        query.sales_year = activeFilters.sales_year;
        query.purchase_year = activeFilters.purchase_year;

        router.get(dashboardIndex().url, query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleResetFilters = () => {
        router.get(
            dashboardIndex().url,
            {
                sales_year: activeFilters.sales_year,
                purchase_year: activeFilters.purchase_year,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleSalesYearChange = (year: string) => {
        const query: Record<string, string | number> = {};
        if (activeFilters.date_from) query.date_from = activeFilters.date_from;
        if (activeFilters.date_to) query.date_to = activeFilters.date_to;
        if (activeFilters.department_id)
            query.department_id = activeFilters.department_id;
        if (activeFilters.project_id)
            query.project_id = activeFilters.project_id;
        query.sales_year = Number(year);
        query.purchase_year = activeFilters.purchase_year;
        router.get(dashboardIndex().url, query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handlePurchaseYearChange = (year: string) => {
        const query: Record<string, string | number> = {};
        if (activeFilters.date_from) query.date_from = activeFilters.date_from;
        if (activeFilters.date_to) query.date_to = activeFilters.date_to;
        if (activeFilters.department_id)
            query.department_id = activeFilters.department_id;
        if (activeFilters.project_id)
            query.project_id = activeFilters.project_id;
        query.sales_year = activeFilters.sales_year;
        query.purchase_year = Number(year);
        router.get(dashboardIndex().url, query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const statCards: StatCardConfig[] = [
        {
            key: 'profit',
            label: 'Keuntungan',
            value: totals.net_profit ?? 0,
            icon: DollarSign,
            info: 'Total keuntungan berdasarkan jumlah dari total pendapatan dikurangi total biaya periode aktif',
            meta:
                totals.net_profit >= 0
                    ? 'Kinerja positif, pertahankan momentum ini.'
                    : 'Terjadi rugi bersih, cek laporan untuk evaluasi lebih lanjut.',
            accent: 'bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-100',
            href: buildDetailUrl('profit_loss', activeFilters),
        },
        {
            key: 'income',
            label: 'Penerimaan',
            value: totals.income ?? 0,
            icon: TrendingUp,
            info: 'Akumulasi penerimaan dan jumlah dari pendapatan selama periode terpilih',
            meta: 'Termasuk seluruh pendapatan operasional dan non-operasional.',
            accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
            href: buildDetailUrl('revenue', activeFilters),
        },
        {
            key: 'expense',
            label: 'Pengeluaran',
            value: totals.expense ?? 0,
            icon: TrendingDown,
            info: 'Total biaya dan pengeluaran yang tercatat pada periode terpilih',
            meta: 'Pantau pengeluaran besar untuk menjaga arus kas tetap sehat.',
            accent: 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-100',
            href: buildDetailUrl('expense', activeFilters),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                    <Heading
                        title="Selamat Datang"
                        description={`Hi, ${auth.user.name}`}
                    />
                    <DashboardFilterDialog
                        open={filtersDialogOpen}
                        onOpenChange={setFiltersDialogOpen}
                        trigger={
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-2"
                            >
                                <ListFilterPlus />
                                Filter
                            </Button>
                        }
                        departmentItems={departmentItems}
                        projectItems={projectItems}
                        values={filterValues}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                    />
                </div>

                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {statCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Card
                                    key={card.key}
                                    className="px-0 py-0 dark:bg-sidebar/50"
                                >
                                    <CardContent className="flex flex-row items-start justify-between gap-4 p-4">
                                        <div className="flex flex-1 items-start gap-3">
                                            <div
                                                className={`rounded-xl p-2 ${card.accent}`}
                                            >
                                                <Icon className="size-5" />
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        {card.label}
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="text-muted-foreground transition hover:text-primary"
                                                                    aria-label={
                                                                        card.info
                                                                    }
                                                                >
                                                                    <Info className="size-3" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {card.info}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Link
                                                        href={card.href}
                                                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                                                    >
                                                        Detail
                                                        <ChevronRight className="size-3" />
                                                    </Link>
                                                </div>
                                                <p className="text-lg font-semibold tracking-tight">
                                                    {formatCurrency(card.value)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        {/* Sales Chart */}
                        <Card className="dark:bg-sidebar/50">
                            <CardHeader>
                                <CardTitle>Penjualan</CardTitle>
                                <CardDescription>
                                    Data invoice dan piutang per bulan
                                </CardDescription>
                                <CardAction>
                                    <Select
                                        value={String(activeFilters.sales_year)}
                                        onValueChange={handleSalesYearChange}
                                    >
                                        <SelectTrigger className="w-[90px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            {options.year_options.map((y) => (
                                                <SelectItem
                                                    key={y}
                                                    value={String(y)}
                                                >
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardAction>
                            </CardHeader>
                            <CardContent className="pe-6">
                                <ChartContainer
                                    config={salesChartConfig}
                                    className="h-[320px] w-full"
                                >
                                    <ComposedChart data={sales_chart}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(148, 163, 184, 0.4)"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={formatAxisValue}
                                        />
                                        <ChartTooltip
                                            cursor={{
                                                fill: 'var(--color-receivable)',
                                                opacity: 0.08,
                                            }}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={buildMonthLabelFormatter(
                                                        activeFilters.sales_year,
                                                    )}
                                                    formatter={(
                                                        value,
                                                        _name,
                                                        item,
                                                    ) =>
                                                        renderTooltipValue(
                                                            value,
                                                            item as TooltipItem,
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <ChartLegend
                                            verticalAlign="bottom"
                                            align="left"
                                            content={<ChartLegendContent />}
                                        />
                                        <Bar
                                            dataKey="receivable"
                                            fill="var(--color-receivable)"
                                            radius={[4, 4, 0, 0]}
                                            barSize={16}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="invoice"
                                            stroke="var(--color-invoice)"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                        />
                                    </ComposedChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Purchase Chart */}
                        <Card className="dark:bg-sidebar/50">
                            <CardHeader>
                                <CardTitle>Pembelian</CardTitle>
                                <CardDescription>
                                    Data invoice dan utang per bulan
                                </CardDescription>
                                <CardAction>
                                    <Select
                                        value={String(
                                            activeFilters.purchase_year,
                                        )}
                                        onValueChange={handlePurchaseYearChange}
                                    >
                                        <SelectTrigger className="w-[90px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            {options.year_options.map((y) => (
                                                <SelectItem
                                                    key={y}
                                                    value={String(y)}
                                                >
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardAction>
                            </CardHeader>
                            <CardContent className="pe-6">
                                <ChartContainer
                                    config={purchaseChartConfig}
                                    className="h-[320px] w-full"
                                >
                                    <ComposedChart data={purchase_chart}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(148, 163, 184, 0.4)"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={formatAxisValue}
                                        />
                                        <ChartTooltip
                                            cursor={{
                                                fill: 'var(--color-payable)',
                                                opacity: 0.08,
                                            }}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={buildMonthLabelFormatter(
                                                        activeFilters.purchase_year,
                                                    )}
                                                    formatter={(
                                                        value,
                                                        _name,
                                                        item,
                                                    ) =>
                                                        renderTooltipValue(
                                                            value,
                                                            item as TooltipItem,
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <ChartLegend
                                            verticalAlign="bottom"
                                            align="left"
                                            content={<ChartLegendContent />}
                                        />
                                        <Bar
                                            dataKey="payable"
                                            fill="var(--color-payable)"
                                            radius={[4, 4, 0, 0]}
                                            barSize={16}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="invoice"
                                            stroke="var(--color-invoice)"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                        />
                                    </ComposedChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
