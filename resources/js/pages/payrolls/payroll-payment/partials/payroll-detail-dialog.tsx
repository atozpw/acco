import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { useMemo } from 'react';

type OptionItem = {
    id: number;
    code?: string;
    name: string;
};

type PayrollComponentInfo = {
    id: number;
    code?: string;
    name: string;
    type: 'earning' | 'deduction';
};

type DetailItemPayload = {
    id: number;
    payroll_id: number;
    payroll_component_id: number;
    amount: string | number;
    component?: PayrollComponentInfo | null;
};

type PayrollPeriodSummary = {
    id: number;
    reference_no: string;
    date?: string;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;
    category?: OptionItem | null;
};

export type PayrollDetailPayload = {
    id: number;
    payroll_periode_id: number;
    contact_id: number;
    department_id: number;
    project_id: number | null;
    earning_amount: string | number;
    deduction_amount: string | number;
    total_amount: string | number;
    periode?: PayrollPeriodSummary | null;
    contact?: OptionItem | null;
    department?: OptionItem | null;
    project?: OptionItem | null;
    details: DetailItemPayload[];
};

export type PayrollDetailDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payroll: PayrollDetailPayload | null;
};

const parseNumber = (val: string | number | null | undefined): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const num = parseFloat(val);
    return Number.isNaN(num) ? 0 : num;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);

export default function PayrollDetailDialog({
    open,
    onOpenChange,
    payroll,
}: PayrollDetailDialogProps) {
    const earnings = useMemo(
        () =>
            (payroll?.details ?? []).filter(
                (d) => d.component?.type === 'earning',
            ),
        [payroll?.details],
    );

    const deductions = useMemo(
        () =>
            (payroll?.details ?? []).filter(
                (d) => d.component?.type === 'deduction',
            ),
        [payroll?.details],
    );

    const totalEarnings = useMemo(
        () => earnings.reduce((sum, item) => sum + parseNumber(item.amount), 0),
        [earnings],
    );

    const totalDeductions = useMemo(
        () =>
            deductions.reduce((sum, item) => sum + parseNumber(item.amount), 0),
        [deductions],
    );

    const totalNet = totalEarnings - totalDeductions;

    const contactName = payroll?.contact?.name ?? '-';
    const categoryName = payroll?.periode?.category?.name ?? '-';
    const departmentName = payroll?.department?.name ?? '-';
    const projectName = payroll?.project?.name ?? '-';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl md:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Rincian Gaji</DialogTitle>
                    <DialogDescription>
                        Tinjau rincian komponen gaji
                    </DialogDescription>
                </DialogHeader>

                <div className="no-scrollbar -mx-4 max-h-[70vh] space-y-8 overflow-y-auto px-4">
                    <Separator />
                    
                    {/* Ringkasan Data Umum */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="grid gap-1">
                            <span className="text-sm text-muted-foreground">
                                Karyawan
                            </span>
                            <p className="text-sm font-medium">{contactName}</p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm text-muted-foreground">
                                Kategori Gaji
                            </span>
                            <p className="text-sm font-medium">
                                {categoryName}
                            </p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm text-muted-foreground">
                                Departemen
                            </span>
                            <p className="text-sm font-medium">
                                {departmentName}
                            </p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm text-muted-foreground">
                                Proyek
                            </span>
                            <p className="text-sm font-medium">{projectName}</p>
                        </div>
                    </div>

                    {/* Dua Kolom Komponen Gaji: Penghasilan & Potongan */}
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Sisi Kiri: Komponen Penghasilan */}
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-sm font-semibold">
                                Komponen Penghasilan
                            </h3>

                            <div className="overflow-hidden rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Komponen</TableHead>
                                            <TableHead className="w-[160px] text-right">
                                                Nilai (Rp)
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {earnings.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    className="py-6 text-center text-sm text-muted-foreground"
                                                >
                                                    Tidak ada komponen
                                                    penghasilan.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            earnings.map((detail, index) => (
                                                <TableRow
                                                    key={detail.id || index}
                                                >
                                                    <TableCell className="text-sm">
                                                        {detail.component
                                                            ?.name ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm">
                                                        {formatCurrency(
                                                            parseNumber(
                                                                detail.amount,
                                                            ),
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell className="text-sm text-muted-foreground">
                                                Subtotal Penghasilan
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                {formatCurrency(totalEarnings)}
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </div>

                        {/* Sisi Kanan: Komponen Potongan */}
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-sm font-semibold">
                                Komponen Potongan
                            </h3>

                            <div className="overflow-hidden rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Komponen</TableHead>
                                            <TableHead className="w-[160px] text-right">
                                                Nilai (Rp)
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deductions.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    className="py-6 text-center text-sm text-muted-foreground"
                                                >
                                                    Tidak ada komponen potongan.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            deductions.map((detail, index) => (
                                                <TableRow
                                                    key={detail.id || index}
                                                >
                                                    <TableCell className="text-sm">
                                                        {detail.component
                                                            ?.name ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm">
                                                        {formatCurrency(
                                                            parseNumber(
                                                                detail.amount,
                                                            ),
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell className="text-sm text-muted-foreground">
                                                Subtotal Potongan
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                {formatCurrency(
                                                    totalDeductions,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Ringkasan Perhitungan & Total */}
                    <div className="grid gap-4 lg:col-span-2 lg:ml-auto lg:w-full lg:max-w-lg">
                        <div className="flex items-center justify-between text-sm">
                            <span>Total Penghasilan</span>
                            <span className="font-medium">
                                {formatCurrency(totalEarnings)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Total Potongan</span>
                            <span className="font-medium">
                                {formatCurrency(totalDeductions)}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span>Total Gaji Bersih</span>
                            <span className="font-semibold">
                                {formatCurrency(totalNet)}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
