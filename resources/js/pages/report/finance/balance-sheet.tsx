import type { ComboboxItem } from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import financialStatement from '@/routes/financial-statement';
import report from '@/routes/report';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ListFilterPlus, Printer, Share2, Undo2 } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { type DateRange } from 'react-day-picker';
import BalanceSheetFilterDialog, {
    type BalanceSheetFilterValues,
} from './partials/balance-sheet-filter-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laporan',
        href: report.index.url(),
    },
    {
        title: 'Laporan Keuangan',
        href: financialStatement.index.url(),
    },
    {
        title: 'Neraca',
        href: '',
    },
];

type AccountNode = {
    id: number;
    code?: string | null;
    name: string;
    amount: number;
    children?: AccountNode[];
};

type ClassificationReport = {
    classification_id: number;
    classification_name: string;
    accounts: AccountNode[];
    total: number;
};

type BalanceSheetReport = {
    classifications: ClassificationReport[];
    totals: {
        income: number;
        expense: number;
        net_profit: number;
    };
};

type BalanceSheetFilters = {
    date_from: string | null;
    date_to: string | null;
    classification_id: number | null;
    department_id: number | null;
    project_id: number | null;
    customer_id: number | null;
};

type OptionItem = {
    id: number;
    name: string;
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

const deriveDateRange = (
    from?: string | null,
    to?: string | null,
): DateRange | undefined => {
    const fromDate = parseDateValue(from);
    const toDate = parseDateValue(to);

    if (!fromDate && !toDate) return undefined;

    return {
        from: fromDate ?? toDate,
        to: toDate ?? fromDate,
    } as DateRange;
};

type PageProps = {
    report: BalanceSheetReport;
    filters: BalanceSheetFilters;
    options: {
        classifications: OptionItem[];
        departments: OptionItem[];
        projects: OptionItem[];
        customers: OptionItem[];
    };
};

const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    const numeric =
        typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(numeric)) return '-';

    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numeric);
};

const formatDateLabel = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const renderAccounts = (accounts: AccountNode[], depth = 0) => {
    return accounts.map((account) => (
        <Fragment key={`${account.id}-${depth}`}>
            <TableRow>
                <TableCell className="w-full ps-8">
                    <div
                        className="flex flex-col gap-0.5"
                        style={{ paddingLeft: `${depth * 24}px` }}
                    >
                        <span>
                            {account.code ? `${account.code} - ` : ''}
                            {account.name}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="w-[50px]">Rp</TableCell>
                <TableCell className="min-w-[175px] pe-4 text-right">
                    {formatCurrency(account.amount)}
                </TableCell>
            </TableRow>
            {account.children && account.children.length > 0
                ? renderAccounts(account.children, depth + 1)
                : null}
        </Fragment>
    ));
};

export default function BalanceSheetReportPage({
    report,
    filters,
    options,
}: PageProps) {
    const classificationItems: ComboboxItem[] = [
        { label: 'Semua', value: '' },
        ...options.classifications.map((item) => ({
            value: String(item.id),
            label: item.name,
        })),
    ];

    const departmentItems: ComboboxItem[] = [
        { label: 'Semua', value: '' },
        ...options.departments.map((item) => ({
            value: String(item.id),
            label: item.name,
        })),
    ];

    const projectItems: ComboboxItem[] = [
        { label: 'Semua', value: '' },
        ...options.projects.map((item) => ({
            value: String(item.id),
            label: item.name,
        })),
    ];

    const customerItems: ComboboxItem[] = [
        { label: 'Semua', value: '' },
        ...options.customers.map((item) => ({
            value: String(item.id),
            label: item.name,
        })),
    ];

    const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

    const selectedDateRange = useMemo(
        () => deriveDateRange(filters.date_from, filters.date_to),
        [filters.date_from, filters.date_to],
    );

    const filterValues = useMemo<BalanceSheetFilterValues>(
        () => ({
            dateRange: selectedDateRange,
            classificationId: filters.classification_id
                ? String(filters.classification_id)
                : '',
            departmentId: filters.department_id
                ? String(filters.department_id)
                : '',
            projectId: filters.project_id ? String(filters.project_id) : '',
            customerId: filters.customer_id ? String(filters.customer_id) : '',
        }),
        [
            selectedDateRange,
            filters.classification_id,
            filters.department_id,
            filters.project_id,
            filters.customer_id,
        ],
    );

    const handleApplyFilters = (values: BalanceSheetFilterValues) => {
        const query: Record<string, string | number> = {};
        const dateFromValue = formatDateForQuery(
            values.dateRange?.from ?? null,
        );
        const dateToValue = formatDateForQuery(values.dateRange?.to ?? null);

        if (dateFromValue) query.date_from = dateFromValue;
        if (dateToValue) query.date_to = dateToValue;
        if (values.classificationId)
            query.classification_id = Number(values.classificationId);
        if (values.departmentId)
            query.department_id = Number(values.departmentId);
        if (values.projectId) query.project_id = Number(values.projectId);
        if (values.customerId) query.customer_id = Number(values.customerId);

        router.get(financialStatement.balanceSheet.url(), query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleResetFilters = () => {
        router.get(
            financialStatement.balanceSheet.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const classificationRows = report?.classifications ?? [];
    const hasData = classificationRows.length > 0;
    const periodLabel =
        filters.date_from || filters.date_to
            ? `${formatDateLabel(filters.date_from)} - ${formatDateLabel(filters.date_to)}`
            : 'Semua periode';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Neraca" />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Laporan Neraca"
                        description="Ringkasan posisi keuangan untuk periode terpilih"
                    />
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href={financialStatement.index.url()}>
                                <Undo2 /> Kembali
                            </Link>
                        </Button>
                        <BalanceSheetFilterDialog
                            open={filtersDialogOpen}
                            onOpenChange={setFiltersDialogOpen}
                            trigger={
                                <Button variant="outline">
                                    <ListFilterPlus />
                                    Filter
                                </Button>
                            }
                            classificationItems={classificationItems}
                            departmentItems={departmentItems}
                            projectItems={projectItems}
                            customerItems={customerItems}
                            values={filterValues}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                        />
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button aria-label="Open menu">
                                    <Share2 />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Printer />
                                        Cetak
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Separator className="-mt-2 mb-6" />

                <div className="text-center">
                    <HeadingSmall title="NERACA" description={periodLabel} />
                </div>

                <div className="mt-6 overflow-hidden rounded-md border">
                    {hasData ? (
                        <Table>
                            <TableBody>
                                {classificationRows.map((classification) => (
                                    <Fragment
                                        key={classification.classification_id}
                                    >
                                        <TableRow className="bg-muted/50">
                                            <TableCell className="w-full ps-4">
                                                {
                                                    classification.classification_name
                                                }
                                            </TableCell>
                                            <TableCell className="w-[50px]">
                                                Rp
                                            </TableCell>
                                            <TableCell className="min-w-[175px] pe-4 text-right">
                                                {formatCurrency(
                                                    classification.total,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {classification.accounts &&
                                        classification.accounts.length > 0
                                            ? renderAccounts(
                                                  classification.accounts,
                                              )
                                            : null}
                                    </Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            Tidak ada data untuk periode dan filter yang
                            dipilih.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
