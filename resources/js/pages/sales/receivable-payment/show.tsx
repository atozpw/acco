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
import receivablePayment from '@/routes/receivable-payment';
import sales from '@/routes/sales';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Printer, Settings2, Share2, Undo2 } from 'lucide-react';

interface InvoiceInfo {
    id: number;
    reference_no: string;
    formatted_date: string | null;
    discount_amount?: number | string | null;
}

interface PaymentDetailPayload {
    id: number;
    amount: number | string;
    sales_invoice: InvoiceInfo | null;
}

interface ContactInfo {
    id: number;
    name: string;
}

interface PaymentPayload {
    id: number;
    reference_no: string;
    formatted_date: string | null;
    description?: string | null;
    amount: number | string;
    contact: ContactInfo | null;
    details: PaymentDetailPayload[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Pembayaran Piutang', href: receivablePayment.index().url },
    { title: 'Detail', href: '' },
];

const parseNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const numeric = parseFloat(String(value));
    return Number.isNaN(numeric) ? 0 : numeric;
};

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

export default function ReceivablePaymentShowScreen({
    payment,
}: {
    payment: PaymentPayload;
}) {
    const details = payment.details ?? [];
    const contactName = payment.contact?.name ?? '-';
    const descriptionValue = payment.description?.trim() || '-';
    const pageTitle = payment.reference_no
        ? `Detail Pembayaran ${payment.reference_no}`
        : 'Detail Pembayaran';

    const sourceInfo = [{ label: 'Deskripsi', value: descriptionValue }];

    const generalInfo = [
        { label: 'Nomor Referensi', value: payment.reference_no },
        { label: 'Tanggal', value: payment.formatted_date ?? '-' },
    ];

    const totalAmount = details.reduce(
        (sum, detail) => sum + parseNumber(detail.amount),
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Pembayaran Piutang"
                        description="Tinjau informasi pembayaran piutang usaha"
                    />
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={receivablePayment.index().url}>
                                <Undo2 />
                                Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={receivablePayment.edit(payment.id).url}>
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
                    <p>Dari:</p>
                    <p className="font-medium">{contactName}</p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                        {sourceInfo.map((item) => (
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
                                <TableHead className="min-w-[180px] ps-4">
                                    Nomor Invoice
                                </TableHead>
                                <TableHead className="min-w-[160px]">
                                    Tanggal Invoice
                                </TableHead>
                                <TableHead className="min-w-[160px] text-right">
                                    Diskon
                                </TableHead>
                                <TableHead className="min-w-[160px] pe-4 text-right">
                                    Nilai
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {details.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-sm"
                                    >
                                        Tidak ada detail pembayaran.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                details.map((detail) => {
                                    const invoice = detail.sales_invoice;
                                    const discountValue = invoice
                                        ? parseNumber(invoice.discount_amount)
                                        : 0;
                                    const amountValue = parseNumber(
                                        detail.amount,
                                    );

                                    return (
                                        <TableRow key={detail.id}>
                                            <TableCell className="ps-4">
                                                {invoice?.reference_no ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {invoice?.formatted_date ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {invoice
                                                    ? formatCurrency(
                                                          discountValue,
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="pe-4 text-right">
                                                {formatCurrency(amountValue)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted/50 font-semibold">
                                <TableCell
                                    className="ps-4 text-right"
                                    colSpan={3}
                                >
                                    Total Nilai
                                </TableCell>
                                <TableCell className="pe-4 text-right">
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
