import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import payrollPeriods from '@/routes/payroll-periods';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ReceiptText, RotateCcw, Search, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type OptionItem = {
    id: number;
    name: string;
};

type PayrollPayload = {
    id: number;
    earning_amount: string | number;
    deduction_amount: string | number;
    total_amount: string | number;
    contact?: OptionItem | null;
    department?: OptionItem | null;
    project?: OptionItem | null;
};

type PayrollPeriodPayload = {
    id: number;
    reference_no: string;
    date: string;
    formatted_date?: string | null;
    start_date: string | null;
    end_date: string | null;
    formatted_start_date?: string | null;
    formatted_end_date?: string | null;
    description: string;
    category?: OptionItem | null;
    created_by?: OptionItem | null;
    payrolls: PayrollPayload[];
};

type Props = {
    period: PayrollPeriodPayload;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penggajian', href: payrollPeriods.index().url },
    { title: 'Daftar Gaji & Tunjangan', href: payrollPeriods.index().url },
    { title: 'Detail', href: '' },
];

const parseNumber = (val: string | number | null | undefined): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const num = parseFloat(val);
    return Number.isNaN(num) ? 0 : num;
};

const formatCurrency = (value: number | string | null | undefined) => {
    const num = parseNumber(value);
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

export default function PayrollPeriodShow({ period }: Props) {
    const [search, setSearch] = useState<string>('');

    const payrolls = useMemo(() => period.payrolls ?? [], [period.payrolls]);

    const filteredPayrolls = useMemo(() => {
        if (!search.trim()) return payrolls;
        const q = search.toLowerCase();
        return payrolls.filter(
            (p) =>
                p.contact?.name?.toLowerCase().includes(q) ||
                p.department?.name?.toLowerCase().includes(q) ||
                p.project?.name?.toLowerCase().includes(q),
        );
    }, [payrolls, search]);

    const totalEarning = useMemo(
        () =>
            filteredPayrolls.reduce(
                (acc, p) => acc + parseNumber(p.earning_amount),
                0,
            ),
        [filteredPayrolls],
    );

    const totalDeduction = useMemo(
        () =>
            filteredPayrolls.reduce(
                (acc, p) => acc + parseNumber(p.deduction_amount),
                0,
            ),
        [filteredPayrolls],
    );

    const grandTotal = useMemo(
        () =>
            filteredPayrolls.reduce(
                (acc, p) => acc + parseNumber(p.total_amount),
                0,
            ),
        [filteredPayrolls],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${period.description}`} />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Daftar Gaji atau Tunjangan"
                        description="Tinjau rincian dari daftar gaji atau tunjangan karyawan"
                    />
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={payrollPeriods.index().url}>
                                <Undo2 className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                <Separator className="-mt-2 mb-6" />

                <div className="space-y-8">
                    {/* Ringkasan Data Umum Periode */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="grid gap-1">
                            <span className="text-sm text-muted-foreground">
                                Nomor Referensi
                            </span>
                            <p className="text-sm font-medium">
                                {period.reference_no}
                            </p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm text-muted-foreground">
                                Kategori Gaji
                            </span>
                            <p className="text-sm font-medium">
                                {period.category ? period.category.name : '-'}
                            </p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm text-muted-foreground">
                                Tanggal Transaksi
                            </span>
                            <p className="text-sm font-medium">
                                {period.formatted_date || period.date || '-'}
                            </p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm text-muted-foreground">
                                Rentang Periode
                            </span>
                            <p className="text-sm font-medium">
                                {period.formatted_start_date ||
                                period.formatted_end_date
                                    ? `${period.formatted_start_date || '-'} s.d. ${period.formatted_end_date || '-'}`
                                    : '-'}
                            </p>
                        </div>
                        <div className="grid gap-1 md:col-span-2">
                            <span className="text-sm text-muted-foreground">
                                Keterangan
                            </span>
                            <p className="text-sm font-medium">
                                {period.description || '-'}
                            </p>
                        </div>
                        <div className="grid gap-1 md:col-span-2">
                            <span className="text-sm text-muted-foreground">
                                Dibuat Oleh
                            </span>
                            <p className="text-sm font-medium">
                                {period.created_by?.name || '-'}
                            </p>
                        </div>
                    </div>

                    {/* Bagian Tabel Payroll Karyawan */}
                    <div className="mt-12 space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <HeadingSmall
                                title="Data Payroll"
                                description="Rincian data payroll karyawan"
                            />
                            <div className="flex items-center gap-2">
                                <div className="relative w-full sm:w-[260px]">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        className="pl-9 text-sm"
                                        placeholder="Cari karyawan, departemen..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                {search && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearch('')}
                                    >
                                        <RotateCcw className="size-4" /> Reset
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[50px] text-center">
                                            No
                                        </TableHead>
                                        <TableHead>Nama Karyawan</TableHead>
                                        <TableHead>Departemen</TableHead>
                                        <TableHead>Proyek</TableHead>
                                        <TableHead className="text-right">
                                            Penghasilan(Rp)
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Potongan(Rp)
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Total(Rp)
                                        </TableHead>
                                        <TableHead className="w-[80px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayrolls.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                {search
                                                    ? 'Tidak ditemukan data karyawan yang cocok dengan pencarian.'
                                                    : 'Tidak ada data daftar gaji untuk periode ini.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPayrolls.map(
                                            (payroll, index) => (
                                                <TableRow key={payroll.id}>
                                                    <TableCell className="text-center">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {payroll.contact
                                                            ?.name || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {payroll.department
                                                            ?.name || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {payroll.project
                                                            ?.name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            payroll.earning_amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            payroll.deduction_amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            payroll.total_amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={
                                                                    payrollPeriods.payroll(
                                                                        {
                                                                            period: period.id,
                                                                            payroll:
                                                                                payroll.id,
                                                                        },
                                                                    ).url
                                                                }
                                                            >
                                                                <ReceiptText className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    )}
                                </TableBody>
                                {filteredPayrolls.length > 0 && (
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                Total ({filteredPayrolls.length}{' '}
                                                Karyawan)
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(totalEarning)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(totalDeduction)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(grandTotal)}
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableFooter>
                                )}
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
