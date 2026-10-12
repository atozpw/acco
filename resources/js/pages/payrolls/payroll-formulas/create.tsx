import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import InputDecimal from '@/components/form/input-decimal';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import payrollFormulas from '@/routes/payroll-formulas';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type OptionItem = {
    id: number;
    code?: string;
    name: string;
};

type PayrollComponentOption = {
    id: number;
    code: string;
    name: string;
    type: 'earning' | 'deduction';
};

type Props = {
    payrollCategories: OptionItem[];
    contacts: OptionItem[];
    departments: OptionItem[];
    projects: OptionItem[];
    payrollComponents: PayrollComponentOption[];
};

type DetailItem = {
    payroll_component_id: string;
    amount: number;
    formatted_amount: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penggajian', href: payrollFormulas.index().url },
    { title: 'Perhitungan', href: payrollFormulas.index().url },
    { title: 'Buat Baru', href: '' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);

export default function PayrollFormulaCreateScreen({
    payrollCategories = [],
    contacts = [],
    departments = [],
    projects = [],
    payrollComponents = [],
}: Props) {
    const categoryItems: ComboboxItem[] = useMemo(
        () =>
            payrollCategories.map((c) => ({
                value: String(c.id),
                label: c.code ? `${c.code} - ${c.name}` : c.name,
            })),
        [payrollCategories],
    );

    const contactItems: ComboboxItem[] = useMemo(
        () =>
            contacts.map((c) => ({
                value: String(c.id),
                label: c.name,
            })),
        [contacts],
    );

    const departmentItems: ComboboxItem[] = useMemo(
        () =>
            departments.map((d) => ({
                value: String(d.id),
                label: d.code ? `${d.code} - ${d.name}` : d.name,
            })),
        [departments],
    );

    const projectItems: ComboboxItem[] = useMemo(
        () =>
            projects.map((p) => ({
                value: String(p.id),
                label: p.code ? `${p.code} - ${p.name}` : p.name,
            })),
        [projects],
    );

    const earningComponentItems: ComboboxItem[] = useMemo(
        () =>
            payrollComponents
                .filter((c) => c.type === 'earning')
                .map((c) => ({
                    value: String(c.id),
                    label: c.code ? `${c.code} - ${c.name}` : c.name,
                })),
        [payrollComponents],
    );

    const deductionComponentItems: ComboboxItem[] = useMemo(
        () =>
            payrollComponents
                .filter((c) => c.type === 'deduction')
                .map((c) => ({
                    value: String(c.id),
                    label: c.code ? `${c.code} - ${c.name}` : c.name,
                })),
        [payrollComponents],
    );

    const { data, setData, post, processing, errors, transform } = useForm({
        payroll_category_id: '',
        contact_id: '',
        department_id: departments[0] ? String(departments[0].id) : '',
        project_id: '',
    });

    const [earnings, setEarnings] = useState<DetailItem[]>([
        { payroll_component_id: '', amount: 0, formatted_amount: '0,00' },
    ]);

    const [deductions, setDeductions] = useState<DetailItem[]>([
        { payroll_component_id: '', amount: 0, formatted_amount: '0,00' },
    ]);

    const addEarningRow = () => {
        setEarnings((prev) => [
            ...prev,
            { payroll_component_id: '', amount: 0, formatted_amount: '0,00' },
        ]);
    };

    const removeEarningRow = (index: number) => {
        setEarnings((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length > 0
                ? next
                : [
                      {
                          payroll_component_id: '',
                          amount: 0,
                          formatted_amount: '0,00',
                      },
                  ];
        });
    };

    const updateEarningRow = (
        index: number,
        field: keyof DetailItem,
        value: string | number,
    ) => {
        setEarnings((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const addDeductionRow = () => {
        setDeductions((prev) => [
            ...prev,
            { payroll_component_id: '', amount: 0, formatted_amount: '0,00' },
        ]);
    };

    const removeDeductionRow = (index: number) => {
        setDeductions((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length > 0
                ? next
                : [
                      {
                          payroll_component_id: '',
                          amount: 0,
                          formatted_amount: '0,00',
                      },
                  ];
        });
    };

    const updateDeductionRow = (
        index: number,
        field: keyof DetailItem,
        value: string | number,
    ) => {
        setDeductions((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const totalEarnings = useMemo(
        () =>
            earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
        [earnings],
    );

    const totalDeductions = useMemo(
        () =>
            deductions.reduce(
                (sum, item) => sum + (Number(item.amount) || 0),
                0,
            ),
        [deductions],
    );

    const totalNet = totalEarnings - totalDeductions;

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const activeEarnings = earnings.filter(
            (e) => e.payroll_component_id && Number(e.amount) >= 0,
        );
        const activeDeductions = deductions.filter(
            (d) => d.payroll_component_id && Number(d.amount) >= 0,
        );

        const allDetails = [...activeEarnings, ...activeDeductions].map(
            (item) => ({
                payroll_component_id: Number(item.payroll_component_id),
                amount: Number(item.amount),
            }),
        );

        transform((currentData) => ({
            ...currentData,
            payroll_category_id: currentData.payroll_category_id
                ? Number(currentData.payroll_category_id)
                : '',
            contact_id: currentData.contact_id
                ? Number(currentData.contact_id)
                : '',
            department_id: currentData.department_id
                ? Number(currentData.department_id)
                : '',
            project_id: currentData.project_id
                ? Number(currentData.project_id)
                : null,
            earning_amount: totalEarnings,
            deduction_amount: totalDeductions,
            total_amount: totalNet,
            details: allDetails,
        }));

        post(payrollFormulas.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Perhitungan gaji berhasil dibuat.',
                });
            },
            onError: (errs) => {
                const errorValues = Object.values(errs);
                toast.error('Gagal', {
                    description:
                        errorValues[0] ||
                        'Terjadi kesalahan saat menyimpan data perhitungan gaji.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Perhitungan Baru" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Perhitungan"
                    description="Buat baru formula perhitungan gaji"
                />

                <Separator className="mb-8" />

                <form onSubmit={handleSubmit} className="space-y-8 xl:px-12">
                    {/* Bagian 1: Data Utama */}
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[260px] xl:w-[320px]">
                            <HeadingSmall
                                title="Data Umum"
                                description="Pilih kategori gaji, karyawan, serta unit departemen"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label>Kategori Gaji</Label>
                                    <InputCombobox
                                        name="payroll_category_id"
                                        items={categoryItems}
                                        placeholder="Pilih kategori gaji"
                                        value={data.payroll_category_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'payroll_category_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.payroll_category_id}
                                    />
                                </div>

                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label>Karyawan</Label>
                                    <InputCombobox
                                        name="contact_id"
                                        items={contactItems}
                                        placeholder="Pilih karyawan"
                                        value={data.contact_id}
                                        onValueChange={(value) =>
                                            setData('contact_id', value)
                                        }
                                    />
                                    <InputError message={errors.contact_id} />
                                </div>
                            </div>

                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label>Departemen</Label>
                                    <InputCombobox
                                        name="department_id"
                                        items={departmentItems}
                                        placeholder="Pilih departemen"
                                        value={data.department_id}
                                        onValueChange={(value) =>
                                            setData('department_id', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.department_id}
                                    />
                                </div>

                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label>Proyek (Opsional)</Label>
                                    <InputCombobox
                                        name="project_id"
                                        items={projectItems}
                                        placeholder="Pilih proyek"
                                        value={data.project_id}
                                        onValueChange={(value) =>
                                            setData('project_id', value)
                                        }
                                    />
                                    <InputError message={errors.project_id} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bagian 2: Detail Komponen (Dua Sisi: Kiri Penghasilan, Kanan Potongan) */}
                    <div className="flex flex-col space-y-8">
                        <aside className="w-full">
                            <HeadingSmall
                                title="Detail Perhitungan"
                                description="Atur komponen penghasilan dan potongan"
                            />
                        </aside>
                        <Separator className="lg:hidden" />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Sisi Kiri: Komponen Penghasilan */}
                            <div className="flex flex-col space-y-4 rounded-lg border bg-card p-4 shadow-sm">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground">
                                            Komponen Penghasilan
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Komponen penambah gaji (Earning)
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addEarningRow}
                                    >
                                        <PlusCircle className="mr-1.5 size-4" />
                                        Tambah
                                    </Button>
                                </div>

                                <div className="overflow-hidden rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-[40px] px-3 py-2 text-center">
                                                    #
                                                </TableHead>
                                                <TableHead className="min-w-[180px] px-3 py-2">
                                                    Komponen
                                                </TableHead>
                                                <TableHead className="w-[170px] px-3 py-2 text-right">
                                                    Nominal (Rp)
                                                </TableHead>
                                                <TableHead className="w-[50px] px-2 py-2" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {earnings.map((row, index) => (
                                                <TableRow
                                                    key={`earning-${index}`}
                                                >
                                                    <TableCell className="px-3 py-2 text-center text-xs text-muted-foreground">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2">
                                                        <InputCombobox
                                                            name={`earnings.${index}.payroll_component_id`}
                                                            items={
                                                                earningComponentItems
                                                            }
                                                            placeholder="Pilih komponen..."
                                                            value={
                                                                row.payroll_component_id
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                updateEarningRow(
                                                                    index,
                                                                    'payroll_component_id',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 text-right">
                                                        <InputDecimal
                                                            placeholder="0,00"
                                                            value={
                                                                row.formatted_amount
                                                            }
                                                            onValueChange={(
                                                                formatted,
                                                                numeric,
                                                            ) => {
                                                                updateEarningRow(
                                                                    index,
                                                                    'amount',
                                                                    numeric,
                                                                );
                                                                updateEarningRow(
                                                                    index,
                                                                    'formatted_amount',
                                                                    formatted,
                                                                );
                                                            }}
                                                            className="text-right"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-2 py-2 text-center">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="Hapus baris"
                                                            onClick={() =>
                                                                removeEarningRow(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
                                    <span>Subtotal Penghasilan</span>
                                    <span className="font-semibold">
                                        {formatCurrency(totalEarnings)}
                                    </span>
                                </div>
                            </div>

                            {/* Sisi Kanan: Komponen Potongan */}
                            <div className="flex flex-col space-y-4 rounded-lg border bg-card p-4 shadow-sm">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground">
                                            Komponen Potongan
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Komponen pengurang gaji (Deduction)
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addDeductionRow}
                                    >
                                        <PlusCircle className="mr-1.5 size-4" />
                                        Tambah
                                    </Button>
                                </div>

                                <div className="overflow-hidden rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-[40px] px-3 py-2 text-center">
                                                    #
                                                </TableHead>
                                                <TableHead className="min-w-[180px] px-3 py-2">
                                                    Komponen
                                                </TableHead>
                                                <TableHead className="w-[170px] px-3 py-2 text-right">
                                                    Nominal (Rp)
                                                </TableHead>
                                                <TableHead className="w-[50px] px-2 py-2" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {deductions.map((row, index) => (
                                                <TableRow
                                                    key={`deduction-${index}`}
                                                >
                                                    <TableCell className="px-3 py-2 text-center text-xs text-muted-foreground">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2">
                                                        <InputCombobox
                                                            name={`deductions.${index}.payroll_component_id`}
                                                            items={
                                                                deductionComponentItems
                                                            }
                                                            placeholder="Pilih komponen..."
                                                            value={
                                                                row.payroll_component_id
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                updateDeductionRow(
                                                                    index,
                                                                    'payroll_component_id',
                                                                    value,
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 text-right">
                                                        <InputDecimal
                                                            placeholder="0,00"
                                                            value={
                                                                row.formatted_amount
                                                            }
                                                            onValueChange={(
                                                                formatted,
                                                                numeric,
                                                            ) => {
                                                                updateDeductionRow(
                                                                    index,
                                                                    'amount',
                                                                    numeric,
                                                                );
                                                                updateDeductionRow(
                                                                    index,
                                                                    'formatted_amount',
                                                                    formatted,
                                                                );
                                                            }}
                                                            className="text-right"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-2 py-2 text-center">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="Hapus baris"
                                                            onClick={() =>
                                                                removeDeductionRow(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
                                    <span>Subtotal Potongan</span>
                                    <span className="font-semibold">
                                        {formatCurrency(totalDeductions)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Ringkasan Perhitungan & Total */}
                        <div className="grid gap-4 rounded-md border p-4 lg:col-span-2 lg:ml-auto lg:w-full lg:max-w-lg">
                            <div className="flex items-center justify-between text-sm">
                                <span>Total Penghasilan</span>
                                <span className="font-semibold">
                                    {formatCurrency(totalEarnings)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Total Potongan</span>
                                <span className="font-semibold">
                                    {formatCurrency(totalDeductions)}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between text-base">
                                <span>Total Gaji Bersih</span>
                                <span className="font-bold">
                                    {formatCurrency(totalNet)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Tombol Aksi */}
                    <div className="flex items-center justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="mr-3"
                        >
                            <Link href={payrollFormulas.index().url}>
                                Batal
                            </Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perhitungan'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
