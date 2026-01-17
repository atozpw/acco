import type { ComboboxItem } from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import SimplePaginate from '@/components/simple-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDebounceValue } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';
import accountReceivable from '@/routes/account-receivable';
import sales from '@/routes/sales';
import type { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ListFilterPlus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import AccountReceivableFilterDialog, {
    type ReceivableFilterValues,
} from './partials/filter-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Daftar Piutang Usaha', href: '' },
];

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '25', value: '25' },
    { item: '50', value: '50' },
    { item: '100', value: '100' },
];

type ReceivableRow = {
    id: number;
    contact_name: string;
    total: number;
    paid: number;
    outstanding: number;
};

type ReceivableFilters = {
    tax_amount: 'with' | 'without' | null;
    date_from: string | null;
    date_to: string | null;
    perPage: number;
    search: string | null;
};

const formatCurrency = (value: number | string) => {
    const numeric =
        typeof value === 'string' ? parseFloat(value) : Number(value ?? 0);

    if (Number.isNaN(numeric)) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numeric);
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
    receivables: CursorPagination<ReceivableRow>;
    filters: ReceivableFilters;
};

export default function AccountReceivableIndexPage({
    receivables,
    filters,
}: PageProps) {
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 25),
    );
    const [search, setSearch] = useState(filters.search || '');
    const searchBounce = useDebounceValue(search, 300);

    const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

    const baseFilterQuery = useMemo(() => {
        const query: Record<string, string | number> = {};
        if (filters.tax_amount !== null && filters.tax_amount !== undefined) {
            query.tax_amount = filters.tax_amount;
        }
        if (filters.date_from) query.date_from = filters.date_from;
        if (filters.date_to) query.date_to = filters.date_to;
        return query;
    }, [filters.tax_amount, filters.date_from, filters.date_to]);

    useEffect(() => {
        if (
            searchBounce !== filters.search ||
            Number(itemsPage) !== filters.perPage
        ) {
            router.get(
                accountReceivable.index(),
                {
                    ...baseFilterQuery,
                    perPage: Number(itemsPage),
                    search: searchBounce || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    }, [
        searchBounce,
        itemsPage,
        filters.search,
        filters.perPage,
        baseFilterQuery,
    ]);

    const taxItems = useMemo<ComboboxItem[]>(
        () => [
            { label: 'Semua', value: '' },
            { label: 'Dengan Pajak', value: 'with' },
            { label: 'Tanpa Pajak', value: 'without' },
        ],
        [],
    );

    const selectedDateRange = useMemo(
        () => deriveDateRange(filters.date_from, filters.date_to),
        [filters.date_from, filters.date_to],
    );

    const filterValues = useMemo<ReceivableFilterValues>(
        () => ({
            dateRange: selectedDateRange,
            taxAmount:
                filters.tax_amount !== null && filters.tax_amount !== undefined
                    ? String(filters.tax_amount)
                    : '',
        }),
        [selectedDateRange, filters.tax_amount],
    );

    const handleApplyFilters = (values: ReceivableFilterValues) => {
        const query: Record<string, string | number> = {
            perPage: Number(itemsPage),
        };

        const dateFromValue = formatDateForQuery(
            values.dateRange?.from ?? null,
        );
        const dateToValue = formatDateForQuery(values.dateRange?.to ?? null);

        if (dateFromValue) query.date_from = dateFromValue;
        if (dateToValue) query.date_to = dateToValue;
        if (values.taxAmount) query.tax_amount = values.taxAmount;

        router.get(accountReceivable.index(), query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleResetFilters = () => {
        router.get(
            accountReceivable.index(),
            { perPage: Number(itemsPage) },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Piutang Usaha" />

            <div className="px-5 py-6">
                <Heading
                    title="Daftar Piutang Usaha"
                    description="Menampilkan dafatar perinci piutang usaha"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-sm lg:w-[250px]"
                                placeholder="Cari ..."
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <AccountReceivableFilterDialog
                            open={filtersDialogOpen}
                            onOpenChange={setFiltersDialogOpen}
                            trigger={
                                <Button variant="outline">
                                    <ListFilterPlus /> Filter
                                </Button>
                            }
                            taxItems={taxItems}
                            values={filterValues}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                        />
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[220px] ps-4">
                                        Nama Pelanggan
                                    </TableHead>
                                    <TableHead className="w-[180px] text-right">
                                        Total Piutang Usaha
                                    </TableHead>
                                    <TableHead className="w-[180px] text-right">
                                        Lunas
                                    </TableHead>
                                    <TableHead className="w-[180px] text-right">
                                        Sisa
                                    </TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {receivables.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    receivables.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                <div className="whitespace-normal">
                                                    {item.contact_name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(item.paid)}
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(
                                                    item.outstanding,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                <Button
                                                    variant="ghost"
                                                    aria-label="Open detail"
                                                    className="size-8"
                                                    asChild
                                                >
                                                    <Link
                                                        href={
                                                            accountReceivable.show(
                                                                item.id,
                                                            ).url
                                                        }
                                                    >
                                                        <Search />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end px-2">
                        <div className="flex items-center space-x-6 lg:space-x-8">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium">
                                    Rows per page
                                </p>
                                <Select
                                    value={itemsPage}
                                    onValueChange={setItemsPage}
                                >
                                    <SelectTrigger className="w-[65px]">
                                        <SelectValue aria-label={itemsPage}>
                                            {itemsPage}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listPerPage.map((item, index) => (
                                            <SelectItem
                                                key={`per-page-${index}`}
                                                value={String(item.value)}
                                            >
                                                {item.item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <SimplePaginate
                                prevHref={receivables.prev_page_url}
                                nextHref={receivables.next_page_url}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
