import type { ComboboxItem } from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
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
import { Spinner } from '@/components/ui/spinner';
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
import payablePayment from '@/routes/payable-payment';
import sales from '@/routes/sales';
import salesInvoice from '@/routes/sales-invoice';
import type { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ListFilterPlus,
    ReceiptText,
    RotateCcw,
    Search,
    Undo2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import AccountReceivableFilterDialog, {
    ReceivableFilterValues,
} from './partials/filter-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Daftar Piutang Usaha', href: accountReceivable.index().url },
    { title: 'Detail', href: '' },
];

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '25', value: '25' },
    { item: '50', value: '50' },
    { item: '100', value: '100' },
];

type AgingBuckets = {
    lt_30: number;
    between_30_60: number;
    between_60_90: number;
    gt_90: number;
};

type InvoiceDetail = {
    id: number;
    reference_no: string;
    date: string | null;
    formatted_date: string | null;
    aging: AgingBuckets;
    details?: ReceivableDetailsPayload;
};

type ReceivableDetailPayment = {
    id: number;
    reference_no: string | null;
    date: string | null;
    formatted_date: string | null;
    aging: AgingBuckets;
};

type ReceivableDetailsPayload = {
    invoice: InvoiceDetail;
    payments: ReceivableDetailPayment[];
} | null;

type ReceivableFilters = {
    tax_amount: 'with' | 'without' | null;
    date_from: string | null;
    date_to: string | null;
    perPage: number;
    search: string | null;
    invoiceIdForDetail: number | null;
};

type PageProps = {
    contact_id: number;
    invoice: CursorPagination<InvoiceDetail>;
    filters: ReceivableFilters;
};

const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return '-';
    const numeric =
        typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(numeric)) return '-';

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

export default function AccountReceivableShowPage({
    contact_id,
    invoice,
    filters,
}: PageProps) {
    const [invoiceId, setInvoiceId] = useState<number | null>(
        filters.invoiceIdForDetail ?? null,
    );
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 25),
    );
    const [search, setSearch] = useState(filters.search || '');
    const searchBounce = useDebounceValue(search, 300);

    const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const detailRequestRef = useRef<symbol | null>(null);
    const skipFetchRef = useRef(false);

    const detailSource = useMemo<ReceivableDetailsPayload>(() => {
        if (!invoice.data || invoice.data.length === 0) return null;
        const explicitMatch = invoice.data.find(
            (item) =>
                item.details?.invoice?.id !== undefined &&
                item.details.invoice.id === invoiceId,
        );
        if (explicitMatch?.details) {
            return explicitMatch.details;
        }

        const firstWithDetail = invoice.data.find((item) => item.details);
        return firstWithDetail?.details ?? null;
    }, [invoice.data, invoiceId]);

    const detailInvoice = detailSource?.invoice ?? null;
    const shouldShowDetails = invoiceId !== null;
    const isDetailReady =
        shouldShowDetails && !!detailInvoice && detailInvoice.id === invoiceId;
    const selectedDetail = isDetailReady ? detailInvoice : null;
    const showDetailSkeleton = shouldShowDetails && isDetailLoading;
    const showDetailEmpty =
        shouldShowDetails && !isDetailLoading && !selectedDetail;
    const shouldRenderDetailRow = selectedDetail !== null && !isDetailLoading;
    const selectedDetailPayments: ReceivableDetailPayment[] = isDetailReady
        ? (detailSource?.payments ?? [])
        : [];

    const stopDetailLoading = () => {
        detailRequestRef.current = null;
        setIsDetailLoading(false);
    };

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
        if (skipFetchRef.current) {
            skipFetchRef.current = false;
            return;
        }

        const shouldTrackDetailLoading =
            invoiceId !== null && invoiceId !== filters.invoiceIdForDetail;
        const requestToken = shouldTrackDetailLoading
            ? Symbol('invoice-detail-request')
            : null;

        if (
            searchBounce !== filters.search ||
            Number(itemsPage) !== filters.perPage ||
            invoiceId !== filters.invoiceIdForDetail
        ) {
            router.get(
                accountReceivable.show(contact_id),
                {
                    ...baseFilterQuery,
                    perPage: Number(itemsPage),
                    search: searchBounce || undefined,
                    invoiceIdForDetail: invoiceId || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onStart: () => {
                        if (shouldTrackDetailLoading && requestToken) {
                            detailRequestRef.current = requestToken;
                            setIsDetailLoading(true);
                        }
                    },
                    onFinish: () => {
                        if (
                            shouldTrackDetailLoading &&
                            requestToken &&
                            detailRequestRef.current === requestToken
                        ) {
                            stopDetailLoading();
                        }
                    },
                },
            );
        }
    }, [
        invoiceId,
        contact_id,
        searchBounce,
        itemsPage,
        filters.search,
        filters.perPage,
        baseFilterQuery,
        filters.invoiceIdForDetail,
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

        skipFetchRef.current = true;
        setInvoiceId(null);
        stopDetailLoading();

        if (dateFromValue) query.date_from = dateFromValue;
        if (dateToValue) query.date_to = dateToValue;
        if (values.taxAmount) query.tax_amount = values.taxAmount;

        router.get(accountReceivable.show(contact_id), query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleResetFilters = () => {
        skipFetchRef.current = true;
        setInvoiceId(null);
        stopDetailLoading();

        router.get(
            accountReceivable.show(contact_id),
            { perPage: Number(itemsPage) },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Piutang Usaha" />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Piutang Usaha"
                        description="Menampilkan informasi rinci piutang usaha"
                    />
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href={accountReceivable.index().url}>
                                <Undo2 /> Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <Input
                            className="text-sm lg:w-[250px]"
                            placeholder="Cari ..."
                            autoComplete="off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="flex items-center gap-3">
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
                            {invoiceId !== null && (
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => {
                                        setInvoiceId(null);
                                        stopDetailLoading();
                                    }}
                                >
                                    <RotateCcw />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[150px] ps-4">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="min-w-[180px]">
                                        No. Invoice
                                    </TableHead>
                                    <TableHead className="w-[180px] text-right">
                                        {'< 30 Hari'}
                                    </TableHead>
                                    <TableHead className="w-[180px] text-right">
                                        {'30 - 60 Hari'}
                                    </TableHead>
                                    <TableHead className="w-[180px] text-right">
                                        {'60 - 90 Hari'}
                                    </TableHead>
                                    <TableHead className="w-[180px] pe-4 text-right">
                                        {'> 90 Hari'}
                                    </TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.data.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="ps-4 align-baseline">
                                            {invoice.formatted_date}
                                        </TableCell>
                                        <TableCell className="align-baseline">
                                            {invoice.reference_no}
                                        </TableCell>
                                        <TableCell className="text-right align-baseline">
                                            {formatCurrency(
                                                invoice.aging.lt_30,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right align-baseline">
                                            {formatCurrency(
                                                invoice.aging.between_30_60,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right align-baseline">
                                            {formatCurrency(
                                                invoice.aging.between_60_90,
                                            )}
                                        </TableCell>
                                        <TableCell className="pe-4 text-right align-baseline">
                                            {formatCurrency(
                                                invoice.aging.gt_90,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right align-baseline">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                aria-label="Open detail"
                                                className="size-8"
                                                onClick={() => {
                                                    setInvoiceId(invoice.id);
                                                }}
                                            >
                                                <Search />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {invoice.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
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
                                prevHref={invoice.prev_page_url}
                                nextHref={invoice.next_page_url}
                            />
                        </div>
                    </div>

                    {shouldShowDetails && (
                        <div className="space-y-4">
                            <HeadingSmall
                                title="Rincian Piutang"
                                description="Linimasa piutang usaha"
                            />
                            <div className="overflow-hidden rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[150px] ps-4">
                                                Tanggal
                                            </TableHead>
                                            <TableHead className="min-w-[180px]">
                                                No. Referensi
                                            </TableHead>
                                            <TableHead className="w-[180px] text-right">
                                                {'< 30 Hari'}
                                            </TableHead>
                                            <TableHead className="w-[180px] text-right">
                                                {'30 - 60 Hari'}
                                            </TableHead>
                                            <TableHead className="w-[180px] text-right">
                                                {'60 - 90 Hari'}
                                            </TableHead>
                                            <TableHead className="w-[180px] text-right">
                                                {'> 90 Hari'}
                                            </TableHead>
                                            <TableHead className="w-[80px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {showDetailSkeleton && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Spinner /> Memuat
                                                        detail piutang...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {showDetailEmpty && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    Detail piutang tidak
                                                    ditemukan.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {shouldRenderDetailRow &&
                                            selectedDetail && (
                                                <>
                                                    <TableRow>
                                                        <TableCell className="ps-4 align-baseline">
                                                            {
                                                                selectedDetail.formatted_date
                                                            }
                                                        </TableCell>
                                                        <TableCell className="align-baseline">
                                                            {
                                                                selectedDetail.reference_no
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-right align-baseline">
                                                            {formatCurrency(
                                                                selectedDetail
                                                                    .aging
                                                                    .lt_30,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right align-baseline">
                                                            {formatCurrency(
                                                                selectedDetail
                                                                    .aging
                                                                    .between_30_60,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right align-baseline">
                                                            {formatCurrency(
                                                                selectedDetail
                                                                    .aging
                                                                    .between_60_90,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right align-baseline">
                                                            {formatCurrency(
                                                                selectedDetail
                                                                    .aging
                                                                    .gt_90,
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
                                                                        salesInvoice.voucher(
                                                                            selectedDetail.reference_no,
                                                                        ).url
                                                                    }
                                                                >
                                                                    <ReceiptText />
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    {selectedDetailPayments.map(
                                                        (payment) => (
                                                            <TableRow
                                                                key={payment.id}
                                                            >
                                                                <TableCell className="ps-4 align-baseline">
                                                                    {
                                                                        payment.formatted_date
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="align-baseline">
                                                                    {
                                                                        payment.reference_no
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-right align-baseline">
                                                                    {formatCurrency(
                                                                        payment
                                                                            .aging
                                                                            .lt_30,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right align-baseline">
                                                                    {formatCurrency(
                                                                        payment
                                                                            .aging
                                                                            .between_30_60,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right align-baseline">
                                                                    {formatCurrency(
                                                                        payment
                                                                            .aging
                                                                            .between_60_90,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right align-baseline">
                                                                    {formatCurrency(
                                                                        payment
                                                                            .aging
                                                                            .gt_90,
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
                                                                                payment.reference_no
                                                                                    ? payablePayment.voucher(
                                                                                          payment.reference_no,
                                                                                      )
                                                                                          .url
                                                                                    : '#'
                                                                            }
                                                                        >
                                                                            <ReceiptText />
                                                                        </Link>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </>
                                            )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
