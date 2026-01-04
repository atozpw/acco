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
import cashBank from '@/routes/cash-bank';
import expense from '@/routes/expense';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Printer, Settings2, Share2, Undo2 } from 'lucide-react';

interface CoaInfo {
    id: number;
    code: string;
    name: string;
}

interface DepartmentInfo {
    id: number;
    code: string;
    name: string;
}

interface ProjectInfo {
    id: number;
    code: string;
    name: string;
}

interface UserInfo {
    id: number;
    name: string;
}

interface ContactInfo {
    id: number;
    name: string;
}

interface ExpenseDetailPayload {
    coa: CoaInfo | null;
    department: DepartmentInfo | null;
    project: ProjectInfo | null;
    amount: string;
    note: string | null;
}

interface ExpensePayload {
    id: number;
    reference_no: string;
    formatted_date: string | null;
    description: string | null;
    amount: string;
    contact: ContactInfo | null;
    created_by: UserInfo | null;
    details: ExpenseDetailPayload[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kas & Bank', href: cashBank.index().url },
    { title: 'Pengeluaran', href: expense.index().url },
    { title: 'Detail', href: '' },
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

const formatDebitCredit = (value: number) =>
    value > 0 ? formatCurrency(value) : '-';

export default function ExpenseShowScreen({
    expense: data,
}: {
    expense: ExpensePayload;
}) {
    const totalAmount = data.amount ? parseFloat(data.amount) : 0;
    const contactLabel = data.contact?.name ?? '-';

    const generalInfo = [
        { label: 'Nomor Referensi', value: data.reference_no },
        { label: 'Tanggal', value: data.formatted_date ?? '-' },
        { label: 'Deskripsi', value: data.description?.trim() || '-' },
    ];

    const departmentLabel =
        data.details.length > 0 && data.details[0].department
            ? data.details[0].department.name
            : 'N/A';
    const projectLabel =
        data.details.length > 0 && data.details[0].project
            ? data.details[0].project.name
            : 'N/A';
    const metaInfo = [
        {
            label: 'Departemen',
            value: departmentLabel,
        },
        {
            label: 'Proyek',
            value: projectLabel,
        },
    ];

    const detailRows = data.details.map((detail, index) => ({
        key: `detail-${detail.coa?.id ?? index}-${index}`,
        account: detail.coa,
        note: detail.note ?? '-',
        amount: detail.amount ? parseFloat(detail.amount) : 0,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pengeluaran ${data.reference_no}`} />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Pengeluaran"
                        description="Tinjau informasi transaksi pengeluaran kas/bank"
                    />
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={expense.index().url}>
                                <Undo2 /> Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={expense.edit(data.id)}>
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
                    <p className="font-medium">{contactLabel}</p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
                                <TableHead className="min-w-[150px]">
                                    Catatan
                                </TableHead>
                                <TableHead className="min-w-[150px] pe-4 text-right">
                                    Jumlah
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
                                            {row.note ?? '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="pe-4 text-right">
                                        {formatDebitCredit(row.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted/50 font-semibold">
                                <TableCell className="ps-4" colSpan={3}>
                                    Total
                                </TableCell>
                                <TableCell className="pe-4 text-right">
                                    {formatDebitCredit(totalAmount)}
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
