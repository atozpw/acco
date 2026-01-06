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
import { Link } from '@inertiajs/react';
import { Printer, Settings2, Share2, Undo2 } from 'lucide-react';

export interface EntityInfo {
    id: number;
    code: string;
    name: string;
}

export interface JournalDetailPayload {
    id: number;
    debit: string;
    credit: string;
    coa: EntityInfo | null;
    department: EntityInfo | null;
    project: EntityInfo | null;
}

export interface UserInfo {
    id: number;
    name: string;
}

export interface JournalPayload {
    id: number;
    reference_no: string;
    date: string | null;
    formatted_date: string | null;
    description: string | null;
    details: JournalDetailPayload[];
    created_by: UserInfo | null;
}

export interface JournalVoucherDetailProps {
    journal: JournalPayload;
    backUrl: string;
    updateUrl?: string;
    showUpdateAction?: boolean;
}

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

const formatDebitCredit = (value: string): string => {
    const numeric = parseAmount(value);
    return numeric > 0 ? formatCurrency(numeric) : formatCurrency(0);
};

export function JournalVoucherDetail({
    journal,
    backUrl,
    updateUrl,
    showUpdateAction = false,
}: JournalVoucherDetailProps) {
    const details = journal.details ?? [];

    const totals = details.reduce(
        (acc, detail) => {
            acc.debit += parseAmount(detail.debit);
            acc.credit += parseAmount(detail.credit);
            return acc;
        },
        { debit: 0, credit: 0 },
    );

    const generalInfo = [
        { label: 'Nomor Referensi', value: journal.reference_no },
        { label: 'Tanggal', value: journal.formatted_date ?? '-' },
        {
            label: 'Deskripsi',
            value: journal.description?.trim().length
                ? journal.description
                : '-',
        },
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

    return (
        <div className="px-5 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <Heading title="Jurnal Voucher" description="" />
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link href={backUrl}>
                            <Undo2 /> Kembali
                        </Link>
                    </Button>
                    {showUpdateAction && updateUrl && (
                        <Button asChild>
                            <Link href={updateUrl}>
                                <Settings2 />
                                Perbarui
                            </Link>
                        </Button>
                    )}
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
                            <TableHead className="min-w-[225px]">
                                Nama Akun
                            </TableHead>
                            <TableHead className="min-w-[140px]">
                                Departemen
                            </TableHead>
                            <TableHead className="min-w-[175px] text-right">
                                Debit
                            </TableHead>
                            <TableHead className="min-w-[175px] pe-4 text-right">
                                Kredit
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {details.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-sm"
                                >
                                    Tidak ada detail jurnal.
                                </TableCell>
                            </TableRow>
                        ) : (
                            details.map((detail) => (
                                <TableRow key={detail.id}>
                                    <TableCell className="ps-4">
                                        {detail.coa?.code ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="line-clamp-2 whitespace-normal">
                                            {detail.coa?.name ?? '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="line-clamp-2 whitespace-normal">
                                            {detail.department?.name ?? 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatDebitCredit(detail.debit)}
                                    </TableCell>
                                    <TableCell className="pe-4 text-right">
                                        {formatDebitCredit(detail.credit)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-muted/50 font-semibold">
                            <TableCell className="ps-4" colSpan={3}>
                                Total
                            </TableCell>
                            <TableCell className="text-right">
                                {formatCurrency(totals.debit)}
                            </TableCell>
                            <TableCell className="pe-4 text-right">
                                {formatCurrency(totals.credit)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            <div className="mt-10 flex flex-col gap-12 md:flex-row md:justify-between">
                <div className="gap-1 text-sm">
                    <p>Dibuat oleh:</p>
                    <p>{journal.created_by?.name ?? '-'}</p>
                </div>
            </div>
        </div>
    );
}

export default JournalVoucherDetail;
