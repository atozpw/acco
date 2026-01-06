import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
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
import generalJournal from '@/routes/general-journal';
import ledger from '@/routes/ledger';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ReceiptText, Undo2 } from 'lucide-react';

interface DetailInfo {
    id: number;
    code: string;
    name: string;
}

interface UserInfo {
    id: number;
    name: string;
}

interface DetailPayload {
    coa: DetailInfo | null;
    department: DetailInfo | null;
    project: DetailInfo | null;
    debit: number | string;
    credit: number | string;
    note: string | null;
}

interface Payload {
    id: number;
    reference_no: string;
    formatted_date: string | null;
    description: string | null;
    amount: string;
    created_by: UserInfo | null;
    details: DetailPayload[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Akuntansi',
        href: ledger.index().url,
    },
    {
        title: 'Jurnal Umum',
        href: generalJournal.index().url,
    },
    { title: 'Detail', href: '' },
];

const parseAmount = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const numeric = parseFloat(value);
    return Number.isNaN(numeric) ? 0 : numeric;
};

const formatCurrency = (value: string | number | null | undefined) => {
    const numeric = parseAmount(value);
    const hasFraction = !Number.isInteger(numeric);

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: hasFraction ? 2 : 0,
        maximumFractionDigits: hasFraction ? 2 : 0,
    }).format(numeric);
};

export default function GeneralJournalShowScreen({
    journal: data,
}: {
    journal: Payload;
}) {
    const details = data.details ?? [];

    const generalInfo = [
        { label: 'Nomor Referensi', value: data.reference_no },
        { label: 'Tanggal', value: data.formatted_date ?? '-' },
        { label: 'Deskripsi', value: data.description?.trim() || '-' },
    ];

    const metaInfo = [
        {
            label: 'Departemen',
            value: details.some((d) => d.department)
                ? Array.from(
                      new Set(details.map((d) => d.department?.name ?? 'N/A')),
                  ).join(', ')
                : 'N/A',
        },
        {
            label: 'Proyek',
            value: details.some((d) => d.project)
                ? Array.from(
                      new Set(details.map((d) => d.project?.name ?? 'N/A')),
                  ).join(', ')
                : 'N/A',
        },
    ];

    const detailRows = data.details.map((detail, index) => ({
        key: `detail-${detail.coa?.id ?? index}-${index}`,
        account: detail.coa,
        note: detail.note ?? '-',
        debit: parseAmount(detail.debit),
        credit: parseAmount(detail.credit),
    }));

    const totalDebit = detailRows.reduce(
        (sum, row) => sum + parseAmount(row.debit),
        0,
    );
    const totalCredit = detailRows.reduce(
        (sum, row) => sum + parseAmount(row.credit),
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Jurnal Umum ${data.reference_no}`} />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Jurnal Umum"
                        description="Tinjau informasi transaksi jurnal umum"
                    />
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={generalJournal.index().url}>
                                <Undo2 /> Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={generalJournal.voucher(data.id)}>
                                <ReceiptText />
                                Voucher
                            </Link>
                        </Button>
                    </div>
                </div>

                <Separator className="-mt-2 mb-6" />

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                        {generalInfo.map((item) => (
                            <div
                                key={item.label}
                                className="grid grid-cols-[150px_16px_1fr] gap-3 text-sm"
                            >
                                <p>{item.label}</p>
                                <p className="text-center">:</p>
                                <p>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {metaInfo.map((item) => (
                            <div
                                key={item.label}
                                className="grid grid-cols-[150px_16px_1fr] gap-3 text-sm"
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
                                <TableHead className="min-w-[115px] ps-4">
                                    Kode Akun
                                </TableHead>
                                <TableHead className="min-w-[180px]">
                                    Nama Akun
                                </TableHead>
                                <TableHead className="min-w-[150px]">
                                    Catatan
                                </TableHead>
                                <TableHead className="min-w-[160px] text-right">
                                    Debit
                                </TableHead>
                                <TableHead className="min-w-[160px] pe-4 text-right">
                                    Kredit
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {detailRows.map((row) => (
                                <TableRow key={row.key}>
                                    <TableCell className="ps-4">
                                        {row.account?.code ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="line-clamp-2 whitespace-normal">
                                            {row.account?.name ?? '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="line-clamp-2 whitespace-normal">
                                            {row.note}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(row.debit)}
                                    </TableCell>
                                    <TableCell className="pe-4 text-right">
                                        {formatCurrency(row.credit)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted/50 font-semibold">
                                <TableCell className="ps-4" colSpan={3}>
                                    Total
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(totalDebit)}
                                </TableCell>
                                <TableCell className="pe-4 text-right">
                                    {formatCurrency(totalCredit)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>

                <div className="mt-10 flex flex-col gap-12 md:flex-row md:justify-between">
                    <div className="gap-1 text-sm">
                        <p>Dibuat oleh:</p>
                        <p>{data.created_by?.name ?? '-'}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
