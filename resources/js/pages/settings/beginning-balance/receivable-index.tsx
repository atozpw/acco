import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

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
import BeginningBalanceLayout from '@/layouts/settings/beginning-balance-layout';
import beginningBalance from '@/routes/beginning-balance';
import { CirclePlus } from 'lucide-react';

type InvoiceContact = {
    id: number;
    name: string;
};

type InvoiceProps = {
    id: number;
    reference_no: string;
    date: string;
    amount: string | number;
    contact?: InvoiceContact | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: beginningBalance.index.url(),
    },
    {
        title: 'Saldo Awal',
        href: beginningBalance.receivable.index.url(),
    },
    {
        title: 'Piutang Usaha',
        href: '',
    },
];

const formatCurrency = (value: string | number | null | undefined) => {
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

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export default function BeginningBalanceReceivableIndex({
    invoices,
}: {
    invoices: InvoiceProps[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saldo Awal Piutang Usaha" />

            <BeginningBalanceLayout>
                <div className="space-y-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <HeadingSmall
                            title="Saldo Awal Piutang Usaha"
                            description="Mengisi saldo awal piutang usaha"
                        />
                        <Button asChild>
                            <Link
                                href={beginningBalance.receivable.create.url()}
                            >
                                <CirclePlus /> Buat Baru
                            </Link>
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[120px] ps-4">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="min-w-[200px]">
                                        Nama Pelanggan
                                    </TableHead>
                                    <TableHead className="min-w-[160px]">
                                        No. Invoice
                                    </TableHead>
                                    <TableHead className="min-w-[140px] pe-4 text-right">
                                        Sisa
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                {formatDate(item.date)}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="whitespace-normal">
                                                    {item.contact?.name ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                {item.reference_no}
                                            </TableCell>
                                            <TableCell className="pe-4 text-right align-baseline">
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </BeginningBalanceLayout>
        </AppLayout>
    );
}
