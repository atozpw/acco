import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import accountReceivable from '@/routes/account-receivable';
import receivablePayment from '@/routes/receivable-payment';
import sales from '@/routes/sales';
import salesInvoice from '@/routes/sales-invoice';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ReceiptText, Undo2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Daftar Piutang Usaha', href: accountReceivable.index().url },
    { title: 'Detail Account Receivable', href: '' },
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
    total: number;
};

type DetailRecord = {
    invoice: InvoiceDetail;
    payments: InvoiceDetail[];
};

type PageProps = {
    invoice: InvoiceDetail;
    details: DetailRecord;
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

export default function AccountReceivableShowPage({
    invoice,
    details,
}: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Account Receivable" />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Account Receivable"
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="ps-4 align-baseline">
                                    {invoice.formatted_date}
                                </TableCell>
                                <TableCell className="align-baseline">
                                    {invoice.reference_no}
                                </TableCell>
                                <TableCell className="text-right align-baseline">
                                    {formatCurrency(invoice.aging.lt_30)}
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
                                    {formatCurrency(invoice.aging.gt_90)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-8 space-y-4">
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
                                <TableRow>
                                    <TableCell className="ps-4 align-baseline">
                                        {details.invoice.formatted_date}
                                    </TableCell>
                                    <TableCell className="align-baseline">
                                        {details.invoice.reference_no}
                                    </TableCell>
                                    <TableCell className="text-right align-baseline">
                                        {formatCurrency(details.invoice.total)}
                                    </TableCell>
                                    <TableCell className="text-right align-baseline">
                                        {formatCurrency(0)}
                                    </TableCell>
                                    <TableCell className="text-right align-baseline">
                                        {formatCurrency(0)}
                                    </TableCell>
                                    <TableCell className="text-right align-baseline">
                                        {formatCurrency(0)}
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
                                                        details.invoice
                                                            .reference_no,
                                                    ).url
                                                }
                                            >
                                                <ReceiptText />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                {details.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="ps-4 align-baseline">
                                            {payment.formatted_date}
                                        </TableCell>
                                        <TableCell className="align-baseline">
                                            {payment.reference_no}
                                        </TableCell>
                                        <TableCell className="text-right align-baseline">
                                            {formatCurrency(
                                                payment.aging.lt_30,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right align-baseline">
                                            {formatCurrency(
                                                payment.aging.between_30_60,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right align-baseline">
                                            {formatCurrency(
                                                payment.aging.between_60_90,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right align-baseline">
                                            {formatCurrency(
                                                payment.aging.gt_90,
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
                                                        receivablePayment.voucher(
                                                            payment.reference_no,
                                                        ).url
                                                    }
                                                >
                                                    <ReceiptText />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
