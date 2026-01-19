import type { ComboboxItem } from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
};

type OptionItem = {
    id: number;
    name: string;
};

type DashboardOptions = {
    departments: OptionItem[];
    projects: OptionItem[];
};

type PageProps = {
    summary: DashboardSummary;
    filters: DashboardFilters;
    options: DashboardOptions;
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
    type: 'profit_loss' | 'income' | 'expense',
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
    } else {
        return '#';
    }
};

export default function Dashboard({ summary, filters, options }: PageProps) {
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

        router.get(dashboardIndex().url, query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleResetFilters = () => {
        router.get(
            dashboardIndex().url,
            {},
            { preserveScroll: true, preserveState: true },
        );
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
            href: buildDetailUrl('income', activeFilters),
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
                </div>
            </div>
        </AppLayout>
    );
}
