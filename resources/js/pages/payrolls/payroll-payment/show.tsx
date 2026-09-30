import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
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
import payrollPayments from '@/routes/payroll-payments';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { RotateCcw, Search, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PayrollDetailDialog, {
    type PayrollDetailPayload,
} from './partials/payroll-detail-dialog';

type OptionItem = {
    id: number;
    code?: string;
    name: string;
};

type PayrollItem = {
    id: number;
    earning_amount: string | number;
    deduction_amount: string | number;
    total_amount: string | number;
    contact?: OptionItem | null;
    department?: OptionItem | null;
    project?: OptionItem | null;
};

type PayrollPaymentPayload = {
    id: number;
    payroll_periode_id: number;
    coa_id: number;
    department_id: number;
    project_id: number | null;
    reference_no: string;
    date: string;
    formatted_date?: string | null;
    description: string;
    amount: string | number;
    coa?: OptionItem | null;
    department?: OptionItem | null;
    project?: OptionItem | null;
    created_by?: OptionItem | null;
    periode?: {
        id: number;
        reference_no: string;
        description: string;
        payrolls?: PayrollItem[];
    } | null;
};

type Props = {
    payment: PayrollPaymentPayload;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penggajian', href: payrollPayments.index().url },
    { title: 'Pembayaran', href: payrollPayments.index().url },
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

export default function PayrollPaymentShow({ payment }: Props) {
    const [search, setSearch] = useState<string>('');
    const [loadingPayrollId, setLoadingPayrollId] = useState<number | null>(
        null,
    );
    const [selectedPayrollDetail, setSelectedPayrollDetail] =
        useState<PayrollDetailPayload | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] =
        useState<boolean>(false);

    const payrolls = useMemo(
        () => payment.periode?.payrolls ?? [],
        [payment.periode?.payrolls],
    );

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

    const handleOpenPayrollDetail = async (payrollId: number) => {
        setLoadingPayrollId(payrollId);
        try {
            const response = await fetch(
                payrollPayments.payroll(payrollId).url,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil data rincian gaji');
            }

            const detailData: PayrollDetailPayload = await response.json();
            setSelectedPayrollDetail(detailData);
            setIsDetailDialogOpen(true);
        } catch {
            toast.error('Gagal', {
                description: 'Terjadi kesalahan saat mengambil rincian gaji.',
            });
        } finally {
            setLoadingPayrollId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`Detail ${payment.description || payment.reference_no}`}
            />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Pembayaran Gaji"
                        description="Tinjau rincian pembayaran gaji karyawan"
                    />
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={payrollPayments.index().url}>
                                <Undo2 className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                <Separator className="-mt-2 mb-6" />

                <div className="space-y-8">
                    {/* Ringkasan Data Umum Pembayaran */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-6">
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Nomor Referensi
                                </span>
                                <p className="align-top text-sm font-medium">
                                    {payment.reference_no}
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Deskripsi
                                </span>
                                <p className="text-sm font-medium">
                                    {payment.description || '-'}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Departemen
                                </span>
                                <p className="text-sm font-medium">
                                    {payment.department?.name || '-'}
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Proyek
                                </span>
                                <p className="text-sm font-medium">
                                    {payment.project?.name || '-'}
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Tanggal Transaksi
                                </span>
                                <p className="text-sm font-medium">
                                    {payment.formatted_date ||
                                        payment.date ||
                                        '-'}
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Total Pembayaran (Rp)
                                </span>
                                <p className="text-sm font-medium">
                                    {formatCurrency(payment.amount)}
                                </p>
                            </div>
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
                                            Penghasilan (Rp)
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Potongan (Rp)
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Total (Rp)
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
                                                    : 'Tidak ada data daftar gaji untuk pembayaran ini.'}
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
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Buka rincian gaji"
                                                            disabled={
                                                                loadingPayrollId ===
                                                                payroll.id
                                                            }
                                                            onClick={() =>
                                                                handleOpenPayrollDetail(
                                                                    payroll.id,
                                                                )
                                                            }
                                                        >
                                                            {loadingPayrollId ===
                                                            payroll.id ? (
                                                                <Spinner className="size-4" />
                                                            ) : (
                                                                <Search className="size-4" />
                                                            )}
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

                <PayrollDetailDialog
                    open={isDetailDialogOpen}
                    onOpenChange={setIsDetailDialogOpen}
                    payroll={selectedPayrollDetail}
                />
            </div>
        </AppLayout>
    );
}
