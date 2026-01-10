import Heading from '@/components/heading';
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
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import sales from '@/routes/sales';
import salesInvoice from '@/routes/sales-invoice';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Printer, Settings2, Share2, Undo2 } from 'lucide-react';

interface ProductInfo {
    id: number;
    code: string;
    name: string;
}

interface InvoiceDetailPayload {
    id: number;
    qty: number | string;
    price: number | string;
    amount: number | string;
    discount_percent: number | string;
    discount_amount: number | string;
    tax_amount: number | string;
    total: number | string;
    tax_rate?: number | string | null;
    product: ProductInfo | null;
}

interface InvoiceContact {
    id: number;
    name: string;
    address?: string | null;
}

interface InvoicePayload {
    id: number;
    reference_no: string;
    formatted_date: string | null;
    description: string | null;
    contact: InvoiceContact | null;
    details: InvoiceDetailPayload[];
    amount: number | string;
    discount_percent: number | string;
    discount_amount: number | string;
    tax_amount: number | string;
    total: number | string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Invoice Penjualan', href: salesInvoice.index().url },
    { title: 'Detail', href: '' },
];

const parseNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const numeric = parseFloat(value);
    return Number.isNaN(numeric) ? 0 : numeric;
};

const formatQty = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

const formatPercent = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

export default function SalesInvoiceShowScreen({
    invoice,
}: {
    invoice: InvoicePayload;
}) {
    const details = invoice.details ?? [];
    const contactName = invoice.contact?.name ?? '-';
    const contactAddress = invoice.contact?.address?.trim() || '-';
    const pageTitle = invoice.reference_no
        ? `Detail Invoice ${invoice.reference_no}`
        : 'Detail Invoice';

    const generalInfo = [
        { label: 'Nomor Invoice', value: invoice.reference_no },
        { label: 'Tanggal Invoice', value: invoice.formatted_date ?? '-' },
        { label: 'Deskripsi', value: invoice.description ?? '-' },
    ];

    const metaInfo = [{ label: 'Alamat', value: contactAddress }];

    const subtotal = parseNumber(invoice.amount);
    const discountPercent = parseNumber(invoice.discount_percent);
    const discountAmount = parseNumber(invoice.discount_amount);
    const taxAmount = parseNumber(invoice.tax_amount);
    const totalAmount = parseNumber(invoice.total);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Invoice Penjualan"
                        description="Tinjau detail data invoice penjualan"
                    />
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={salesInvoice.index().url}>
                                <Undo2 />
                                Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={salesInvoice.edit(invoice.id).url}>
                                <Settings2 />
                                Perbarui
                            </Link>
                        </Button>
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

                <div className="grid gap-1 text-sm">
                    <p>Kepada:</p>
                    <p className="font-medium">{contactName}</p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                        {metaInfo.map((item) => (
                            <div
                                key={item.label}
                                className="grid grid-cols-[160px_16px_1fr] gap-3 text-sm"
                            >
                                <p>{item.label}</p>
                                <p className="text-center">:</p>
                                <p>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {generalInfo.map((item) => (
                            <div
                                key={item.label}
                                className="grid grid-cols-[160px_16px_1fr] gap-3 text-sm"
                            >
                                <p>{item.label}</p>
                                <p className="text-center">:</p>
                                <p>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="min-w-[140px] ps-4">
                                    Kode Produk
                                </TableHead>
                                <TableHead className="min-w-[220px]">
                                    Nama Produk
                                </TableHead>
                                <TableHead className="min-w-[80px] text-right">
                                    Quantity
                                </TableHead>
                                <TableHead className="min-w-[160px] text-right">
                                    Harga Satuan
                                </TableHead>
                                <TableHead className="min-w-[50px] text-right">
                                    Diskon
                                </TableHead>
                                <TableHead className="min-w-[160px] text-right">
                                    Nilai
                                </TableHead>
                                <TableHead className="min-w-[50px] pe-4 text-right">
                                    Pajak
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {details.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-sm"
                                    >
                                        Tidak ada detail invoice.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                details.map((detail) => {
                                    const qtyValue = parseNumber(detail.qty);
                                    const unitPrice = parseNumber(detail.price);
                                    const discountPercentValue = parseNumber(
                                        detail.discount_percent,
                                    );
                                    const amountValue = parseNumber(
                                        detail.amount,
                                    );
                                    const hasTaxRate =
                                        detail.tax_rate !== null &&
                                        detail.tax_rate !== undefined;
                                    const taxRateValue = hasTaxRate
                                        ? parseNumber(detail.tax_rate)
                                        : 0;

                                    return (
                                        <TableRow key={detail.id}>
                                            <TableCell className="ps-4">
                                                {detail.product?.code ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="line-clamp-2 whitespace-normal">
                                                    {detail.product?.name ??
                                                        '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatQty(qtyValue)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(unitPrice)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {`${formatPercent(
                                                    discountPercentValue,
                                                )}%`}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(amountValue)}
                                            </TableCell>
                                            <TableCell className="pe-4 text-right">
                                                {hasTaxRate
                                                    ? `${formatPercent(
                                                          taxRateValue,
                                                      )}%`
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="border-0">
                                <TableCell
                                    className="ps-4 text-right"
                                    colSpan={4}
                                >
                                    Subtotal
                                </TableCell>
                                <TableCell className="text-right">:</TableCell>
                                <TableCell
                                    className="pe-4 text-right"
                                    colSpan={2}
                                >
                                    {formatCurrency(subtotal)}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-0">
                                <TableCell
                                    className="ps-4 text-right"
                                    colSpan={4}
                                >
                                    Diskon ({formatPercent(discountPercent)}%)
                                </TableCell>
                                <TableCell className="text-right">:</TableCell>
                                <TableCell
                                    className="pe-4 text-right"
                                    colSpan={2}
                                >
                                    {formatCurrency(discountAmount)}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-0">
                                <TableCell
                                    className="ps-4 text-right"
                                    colSpan={4}
                                >
                                    Pajak
                                </TableCell>
                                <TableCell className="text-right">:</TableCell>
                                <TableCell
                                    className="pe-4 text-right"
                                    colSpan={2}
                                >
                                    {formatCurrency(taxAmount)}
                                </TableCell>
                            </TableRow>
                            <TableRow className="font-semibold">
                                <TableCell
                                    className="ps-4 text-right"
                                    colSpan={4}
                                >
                                    Total Nilai
                                </TableCell>
                                <TableCell className="text-right">:</TableCell>
                                <TableCell
                                    className="pe-4 text-right"
                                    colSpan={2}
                                >
                                    {formatCurrency(totalAmount)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
