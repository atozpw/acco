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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import financialStatement from '@/routes/financial-statement';
import report from '@/routes/report';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ListFilterPlus, Printer, Share2, Undo2 } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import ProfitLossComparisonFilterDialog, {
    type ComparisonFilterValues,
} from './partials/profit-loss-comparison-filter-dialog';

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
        title: 'Laba Rugi Perbandingan',
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

type ProfitLossReport = {
    classifications: ClassificationReport[];
    totals: {
        income: number;
        expense: number;
        net_profit: number;
    };
};

type ComparisonFilters = {
    month: number;
    year: number;
    classification_id: number | null;
    department_id: number | null;
    project_id: number | null;
};

type OptionItem = {
    id: number;
    name: string;
};

type PageProps = {
    report: {
        current_month: ProfitLossReport;
        current_year: ProfitLossReport;
        previous_year: ProfitLossReport;
    };
    filters: ComparisonFilters;
    periods: {
        current_month: string;
        current_year: string;
        previous_year: string;
    };
    options: {
        classifications: OptionItem[];
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

const buildAmountMap = (
    report: ProfitLossReport,
): Map<number, number> => {
    const map = new Map<number, number>();

    const walk = (accounts: AccountNode[]) => {
        for (const account of accounts) {
            map.set(account.id, account.amount);
            if (account.children && account.children.length > 0) {
                walk(account.children);
            }
        }
    };

    for (const classification of report.classifications) {
        walk(classification.accounts);
    }

    return map;
};

const buildClassificationTotalMap = (
    report: ProfitLossReport,
): Map<number, number> => {
    const map = new Map<number, number>();
    for (const classification of report.classifications) {
        map.set(classification.classification_id, classification.total);
    }
    return map;
};

const renderComparisonAccounts = (
    accounts: AccountNode[],
    prevMonthMap: Map<number, number>,
    prevYearMap: Map<number, number>,
    depth = 0,
) => {
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
                <TableCell className="min-w-[150px] pe-4 text-right">
                    {formatCurrency(prevYearMap.get(account.id) ?? 0)}
                </TableCell>
                <TableCell className="w-[50px]">Rp</TableCell>
                <TableCell className="min-w-[150px] pe-4 text-right">
                    {formatCurrency(prevMonthMap.get(account.id) ?? 0)}
                </TableCell>
                <TableCell className="w-[50px]">Rp</TableCell>
                <TableCell className="min-w-[150px] pe-4 text-right">
                    {formatCurrency(account.amount)}
                </TableCell>
            </TableRow>
            {account.children && account.children.length > 0
                ? renderComparisonAccounts(
                    account.children,
                    prevMonthMap,
                    prevYearMap,
                    depth + 1,
                )
                : null}
        </Fragment>
    ));
};

export default function ProfitLossComparisonPage({
    report: reportData,
    filters,
    periods,
    options,
}: PageProps) {
    const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

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

    // Build lookup maps for previous period amounts
    const prevMonthMap = useMemo(
        () => buildAmountMap(reportData.current_year),
        [reportData.current_year],
    );
    const prevYearMap = useMemo(
        () => buildAmountMap(reportData.previous_year),
        [reportData.previous_year],
    );
    const prevMonthClassTotalMap = useMemo(
        () => buildClassificationTotalMap(reportData.current_year),
        [reportData.current_year],
    );
    const prevYearClassTotalMap = useMemo(
        () => buildClassificationTotalMap(reportData.previous_year),
        [reportData.previous_year],
    );

    const filterValues = useMemo<ComparisonFilterValues>(
        () => ({
            month: String(filters.month),
            year: String(filters.year),
            classificationId: filters.classification_id
                ? String(filters.classification_id)
                : '',
            departmentId: filters.department_id
                ? String(filters.department_id)
                : '',
            projectId: filters.project_id ? String(filters.project_id) : '',
        }),
        [
            filters.month,
            filters.year,
            filters.classification_id,
            filters.department_id,
            filters.project_id,
        ],
    );

    const handleApplyFilters = (values: ComparisonFilterValues) => {
        const query: Record<string, string | number> = {
            month: Number(values.month),
            year: Number(values.year),
        };

        if (values.classificationId)
            query.classification_id = Number(values.classificationId);
        if (values.departmentId)
            query.department_id = Number(values.departmentId);
        if (values.projectId) query.project_id = Number(values.projectId);

        router.get(
            financialStatement.profitLossComparison.url(),
            query,
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleResetFilters = () => {
        router.get(
            financialStatement.profitLossComparison.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const classificationRows = reportData?.current_month?.classifications ?? [];
    const hasData = classificationRows.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laba Rugi Perbandingan" />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Laba Rugi Perbandingan"
                        description="Perbandingan kinerja laba rugi antar periode"
                    />
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href={financialStatement.index.url()}>
                                <Undo2 /> Kembali
                            </Link>
                        </Button>
                        <ProfitLossComparisonFilterDialog
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
                    <HeadingSmall
                        title="LABA RUGI PERBANDINGAN"
                        description={`Periode berakhir pada ${periods.current_month}`}
                    />
                </div>

                <div className="mt-6 overflow-hidden rounded-md border">
                    {hasData ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-full ps-4">
                                        Akun
                                    </TableHead>
                                    <TableHead
                                        className="min-w-[200px] pe-4 text-center"
                                        colSpan={2}
                                    >
                                        S/D Tahun Lalu
                                    </TableHead>
                                    <TableHead
                                        className="min-w-[200px] pe-4 text-center"
                                        colSpan={2}
                                    >
                                        S/D Bulan Ini
                                    </TableHead>
                                    <TableHead
                                        className="min-w-[200px] pe-4 text-center"
                                        colSpan={2}
                                    >
                                        Bulan Ini
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classificationRows.map((classification) => (
                                    <Fragment
                                        key={
                                            classification.classification_id
                                        }
                                    >
                                        <TableRow className="bg-muted/50">
                                            <TableCell className="w-full ps-4 font-medium">
                                                {
                                                    classification.classification_name
                                                }
                                            </TableCell>
                                            <TableCell className="w-[50px]">
                                                Rp
                                            </TableCell>
                                            <TableCell className="min-w-[150px] pe-4 text-right font-medium">
                                                {formatCurrency(
                                                    prevYearClassTotalMap.get(
                                                        classification.classification_id,
                                                    ) ?? 0,
                                                )}
                                            </TableCell>
                                            <TableCell className="w-[50px]">
                                                Rp
                                            </TableCell>
                                            <TableCell className="min-w-[150px] pe-4 text-right font-medium">
                                                {formatCurrency(
                                                    prevMonthClassTotalMap.get(
                                                        classification.classification_id,
                                                    ) ?? 0,
                                                )}
                                            </TableCell>
                                            <TableCell className="w-[50px]">
                                                Rp
                                            </TableCell>
                                            <TableCell className="min-w-[150px] pe-4 text-right font-medium">
                                                {formatCurrency(
                                                    classification.total,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {classification.accounts &&
                                            classification.accounts.length > 0
                                            ? renderComparisonAccounts(
                                                classification.accounts,
                                                prevMonthMap,
                                                prevYearMap,
                                            )
                                            : null}
                                    </Fragment>
                                ))}
                                <TableRow className="bg-muted/50 font-medium">
                                    <TableCell className="w-full ps-4">
                                        Laba Rugi Bersih
                                    </TableCell>
                                    <TableCell className="w-[50px]">
                                        Rp
                                    </TableCell>
                                    <TableCell className="min-w-[150px] pe-4 text-right">
                                        {formatCurrency(
                                            reportData.previous_year.totals.net_profit,
                                        )}
                                    </TableCell>
                                    <TableCell className="w-[50px]">
                                        Rp
                                    </TableCell>
                                    <TableCell className="min-w-[150px] pe-4 text-right">
                                        {formatCurrency(
                                            reportData.current_year.totals.net_profit,
                                        )}
                                    </TableCell>
                                    <TableCell className="w-[50px]">
                                        Rp
                                    </TableCell>
                                    <TableCell className="min-w-[150px] pe-4 text-right">
                                        {formatCurrency(
                                            reportData.current_month.totals.net_profit,
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
