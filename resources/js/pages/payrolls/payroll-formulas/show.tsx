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
import { usePermission } from '@/hooks/use-permission';
import AppLayout from '@/layouts/app-layout';
import payrollFormulas from '@/routes/payroll-formulas';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Settings2, Undo2 } from 'lucide-react';
import { useMemo } from 'react';

type OptionItem = {
    id: number;
    code?: string;
    name: string;
};

type PayrollComponentInfo = {
    id: number;
    code: string;
    name: string;
    type: 'earning' | 'deduction';
};

type DetailItemPayload = {
    id: number;
    payroll_formula_id: number;
    payroll_component_id: number;
    amount: string | number;
    component?: PayrollComponentInfo | null;
};

type PayrollFormulaPayload = {
    id: number;
    payroll_category_id: number;
    contact_id: number;
    department_id: number;
    project_id: number | null;
    earning_amount: string | number;
    deduction_amount: string | number;
    total_amount: string | number;
    category?: OptionItem | null;
    contact?: OptionItem | null;
    department?: OptionItem | null;
    project?: OptionItem | null;
    created_by?: { id: number; name: string } | null;
    createdBy?: { id: number; name: string } | null;
    created_at?: string | null;
    updated_at?: string | null;
    details: DetailItemPayload[];
};

type Props = {
    formula: PayrollFormulaPayload;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penggajian', href: payrollFormulas.index().url },
    { title: 'Perhitungan', href: payrollFormulas.index().url },
    { title: 'Detail', href: '' },
];

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

export default function PayrollFormulaShowScreen({ formula }: Props) {
    const { hasPermission } = usePermission();

    const earnings = useMemo(
        () =>
            (formula.details ?? []).filter(
                (d) => d.component?.type === 'earning',
            ),
        [formula.details],
    );

    const deductions = useMemo(
        () =>
            (formula.details ?? []).filter(
                (d) => d.component?.type === 'deduction',
            ),
        [formula.details],
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

    const contactName = formula.contact?.name ?? '-';
    const categoryName = formula.category?.name ?? '-';
    const departmentName = formula.department?.name ?? '-';
    const projectName = formula.project?.name ?? '-';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Perhitungan - ${contactName}`} />

            <div className="px-5 py-6">
                {/* Header Action Bar */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Perhitungan"
                        description="Tinjau rincian formula komponen gaji"
                    />
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={payrollFormulas.index().url}>
                                <Undo2 className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                        {hasPermission(['payroll-formulas.update']) && (
                            <Button asChild>
                                <Link
                                    href={payrollFormulas.edit(formula.id).url}
                                >
                                    <Settings2 className="size-4" />
                                    Edit Perhitungan
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Separator className="-mt-2 mb-6" />

                <div className="space-y-8">
                    {/* Ringkasan Data Umum */}
                    <div className="grid gap-6 md:max-w-2xl md:grid-cols-2">
                        <div className="grid gap-6">
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Karyawan
                                </span>
                                <p className="text-sm font-medium">
                                    {contactName}
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Kategori Gaji
                                </span>
                                <p className="text-sm font-medium">
                                    {categoryName}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-6">
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
                                <p className="text-sm font-medium">
                                    {projectName}
                                </p>
                            </div>
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
            </div>
        </AppLayout>
    );
}
