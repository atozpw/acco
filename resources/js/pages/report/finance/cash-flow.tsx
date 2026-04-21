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
import { Fragment, useEffect, useMemo, useState } from 'react';
import { type DateRange } from 'react-day-picker';
import CashFlowFilterDialog, {
    type CashFlowFilterValues,
} from './partials/cash-flow-filter-dialog';

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
        title: 'Arus Kas',
        href: '',
    },
];

type CashFlowAccount = {
    coa_id: number;
    coa_code: string | null;
    coa_name: string;
    amount: number;
    children: CashFlowAccount[];
};

type CashFlowSection = {
    key: string;
    name: string;
    accounts: CashFlowAccount[];
    total: number;
};

type CashFlowReport = {
    sections: CashFlowSection[];
    balances: {
        opening: number;
        net_change: number;
        closing: number;
    };
};

type CashFlowFilters = {
    date_from: string | null;
    date_to: string | null;
    department_id: number | null;
    project_id: number | null;
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
    report: CashFlowReport;
    filters: CashFlowFilters;
    options: {
        departments: OptionItem[];
        projects: OptionItem[];
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

const AccountRows = ({
    account,
    depth,
}: {
    account: CashFlowAccount;
    depth: number;
}) => {
    const indent = depth * 24 + 32; // 32px base padding + 24px per level
    const hasChildren = account.children && account.children.length > 0;

    return (
        <Fragment key={account.coa_id}>
            <TableRow>
                <TableCell
                    className="w-full"
                    style={{ paddingLeft: `${indent}px` }}
                >
                    <span>
                        {account.coa_code ? `${account.coa_code} - ` : ''}
                        {account.coa_name}
                    </span>
                </TableCell>
                <TableCell className="w-[50px]">Rp</TableCell>
                <TableCell className="min-w-[175px] pe-4 text-right">
                    {formatCurrency(account.amount)}
                </TableCell>
            </TableRow>
            {hasChildren &&
                account.children.map((child) => (
                    <AccountRows
                        key={child.coa_id}
                        account={child}
                        depth={depth + 1}
                    />
                ))}
        </Fragment>
    );
};

export default function CashFlowReportPage({
    report,
    filters,
    options,
}: PageProps) {
    const [hasHistory, setHasHistory] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasHistory(window.history.length > 1);
        }
    }, []);

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

    const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

    const selectedDateRange = useMemo(
        () => deriveDateRange(filters.date_from, filters.date_to),
        [filters.date_from, filters.date_to],
    );

    const filterValues = useMemo<CashFlowFilterValues>(
        () => ({
            dateRange: selectedDateRange,
            departmentId: filters.department_id
                ? String(filters.department_id)
                : '',
            projectId: filters.project_id ? String(filters.project_id) : '',
        }),
        [selectedDateRange, filters.department_id, filters.project_id],
    );

    const handleApplyFilters = (values: CashFlowFilterValues) => {
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

        router.get(financialStatement.cashFlow.url(), query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleResetFilters = () => {
        router.get(
            financialStatement.cashFlow.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const sections = report?.sections ?? [];
    const hasData = sections.length > 0;
    const periodLabel =
        filters.date_from || filters.date_to
            ? `${formatDateLabel(filters.date_from)} - ${formatDateLabel(filters.date_to)}`
            : 'Semua periode';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Arus Kas" />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Laporan Arus Kas"
                        description="Ringkasan arus kas untuk periode terpilih"
                    />
                    <div className="flex gap-3">
                        {hasHistory ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                <Undo2 />
                                Kembali
                            </Button>
                        ) : (
                            <Button variant="outline" asChild>
                                <Link href={financialStatement.index.url()}>
                                    <Undo2 /> Kembali
                                </Link>
                            </Button>
                        )}
                        <CashFlowFilterDialog
                            open={filtersDialogOpen}
                            onOpenChange={setFiltersDialogOpen}
                            trigger={
                                <Button variant="outline">
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
                    <HeadingSmall title="ARUS KAS" description={periodLabel} />
                </div>

                <div className="mt-6 overflow-hidden rounded-md border">
                    {hasData ? (
                        <Table>
                            <TableBody>
                                {sections.map((section) => (
                                    <Fragment key={section.key}>
                                        <TableRow className="bg-muted/50">
                                            <TableCell className="w-full ps-4 font-medium">
                                                {section.name}
                                            </TableCell>
                                            <TableCell className="w-[50px]" />
                                            <TableCell className="min-w-[175px] pe-4" />
                                        </TableRow>
                                        {section.accounts.map((account) => (
                                            <AccountRows
                                                key={account.coa_id}
                                                account={account}
                                                depth={0}
                                            />
                                        ))}
                                        <TableRow className="font-medium">
                                            <TableCell className="w-full ps-4">
                                                Total {section.name}
                                            </TableCell>
                                            <TableCell className="w-[50px]">
                                                Rp
                                            </TableCell>
                                            <TableCell className="min-w-[175px] pe-4 text-right">
                                                {formatCurrency(section.total)}
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                ))}
                                <TableRow className="bg-muted/50 font-medium">
                                    <TableCell className="w-full ps-4">
                                        Saldo Kas Awal
                                    </TableCell>
                                    <TableCell className="w-[50px]">
                                        Rp
                                    </TableCell>
                                    <TableCell className="min-w-[175px] pe-4 text-right">
                                        {formatCurrency(
                                            report?.balances?.opening,
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow className="bg-muted/50 font-medium">
                                    <TableCell className="w-full ps-4">
                                        Kenaikan (Penurunan) Kas Bersih
                                    </TableCell>
                                    <TableCell className="w-[50px]">
                                        Rp
                                    </TableCell>
                                    <TableCell className="min-w-[175px] pe-4 text-right">
                                        {formatCurrency(
                                            report?.balances?.net_change,
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow className="bg-muted/50 font-medium">
                                    <TableCell className="w-full ps-4">
                                        Saldo Kas Akhir
                                    </TableCell>
                                    <TableCell className="w-[50px]">
                                        Rp
                                    </TableCell>
                                    <TableCell className="min-w-[175px] pe-4 text-right">
                                        {formatCurrency(
                                            report?.balances?.closing,
                                        )}
                                    </TableCell>
                                </TableRow>
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
