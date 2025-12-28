import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import InputDecimal from '@/components/form/input-decimal';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import cashBank from '@/routes/cash-bank';
import expense from '@/routes/expense';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronDownCircle, PlusCircle, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';

export type ContactOption = {
    id: number;
    name: string;
};

export type CoaOption = {
    id: number;
    code: string;
    name: string;
};

export type DepartmentOption = {
    id: number;
    code: string;
    name: string;
};

export type ProjectOption = {
    id: number;
    code: string;
    name: string;
};

type ExpenseDetailForm = {
    coa_id: string;
    amount: string;
    note: string;
    department_id: string;
    project_id: string;
};

type ExpenseFormData = {
    contact_id: string;
    coa_id: string;
    reference_no: string;
    date: string;
    description: string;
    amount: string;
    details: ExpenseDetailForm[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kas & Bank',
        href: cashBank.index().url,
    },
    {
        title: 'Pengeluaran',
        href: expense.index().url,
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

const formatLocal = (value: string | number) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

export default function ExpenseCreateScreen({
    contacts,
    cashCoas,
    coas,
    departments,
    projects,
    today,
}: {
    contacts: ContactOption[];
    cashCoas: CoaOption[];
    coas: CoaOption[];
    departments: DepartmentOption[];
    projects: ProjectOption[];
    today: string;
}) {
    const contactItems: ComboboxItem[] = contacts.map((c) => ({
        value: String(c.id),
        label: c.name,
    }));

    const cashCoaItems: ComboboxItem[] = cashCoas.map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.name}`,
    }));

    const expenseCoaItems: ComboboxItem[] = coas.map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.name}`,
    }));

    const departmentItems: ComboboxItem[] = departments.map((d) => ({
        value: String(d.id),
        label: `${d.code} - ${d.name}`,
    }));

    const projectItems: ComboboxItem[] = projects.map((p) => ({
        value: String(p.id),
        label: `${p.code} - ${p.name}`,
    }));

    const initialDetail: ExpenseDetailForm = {
        coa_id: '',
        amount: '0.00',
        note: '',
        department_id: '1',
        project_id: '',
    };

    const { data, setData, post, processing, errors } =
        useForm<ExpenseFormData>({
            contact_id: '',
            coa_id: '',
            reference_no: '',
            date: today,
            description: '',
            amount: '0.00',
            details: [{ ...initialDetail }],
        });

    const [formattedAmount, setFormattedAmount] = useState<string>('');
    const [formattedDetailAmounts, setFormattedDetailAmounts] = useState<
        string[]
    >(['']);

    const [rowExpanded, setRowExpanded] = useState<boolean[]>(() =>
        data.details.map(() => false),
    );

    const addRow = () => {
        setData('details', [...data.details, { ...initialDetail }]);
        setFormattedDetailAmounts((prev) => [
            ...prev,
            formatLocal(initialDetail.amount),
        ]);
        setRowExpanded((prev) => [...prev, false]);
    };

    const removeRow = (index: number) => {
        if (data.details.length <= 1) return;

        setData(
            'details',
            data.details.filter((_, i) => i !== index),
        );
        setFormattedDetailAmounts((prev) => prev.filter((_, i) => i !== index));
        setRowExpanded((prev) => prev.filter((_, i) => i !== index));
    };

    const updateDetail = (
        index: number,
        field: keyof ExpenseDetailForm,
        value: string,
    ) => {
        const updated = data.details.map((detail, i) =>
            i === index ? { ...detail, [field]: value } : detail,
        );
        setData('details', updated);
    };

    const toggleRow = (index: number) => {
        setRowExpanded((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    const errorBag = errors as unknown as Record<string, string>;
    const errorAt = (base: string, index: number, field: string) => {
        return (
            errorBag[`${base}.${index}.${field}`] ??
            errorBag[`${base}.${field}`] ??
            errorBag[base]
        );
    };

    const parseNumber = (value: string) => {
        if (!value) return 0;
        const n = parseFloat(value);
        return Number.isNaN(n) ? 0 : n;
    };

    const totalDetail = data.details.reduce(
        (sum, detail) => sum + parseNumber(detail.amount),
        0,
    );
    const headerAmount = parseNumber(data.amount);
    const difference = headerAmount - totalDetail;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(expense.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Pengeluaran berhasil dibuat.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat membuat pengeluaran.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat pengeluaran" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Pengeluaran"
                    description="Buat baru transaksi pengeluaran kas/bank"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Umum"
                                description="Masukkan informasi utama pengeluaran"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label htmlFor="date">Tanggal</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) =>
                                            setData('date', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.date} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label>Penerima</Label>
                                    <InputCombobox
                                        name="contact_id"
                                        items={contactItems}
                                        placeholder="Pilih kontak"
                                        value={data.contact_id}
                                        onValueChange={(value) =>
                                            setData('contact_id', value)
                                        }
                                    />
                                    <InputError message={errors.contact_id} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label htmlFor="reference_no">
                                        No. Referensi
                                    </Label>
                                    <Input
                                        id="reference_no"
                                        name="reference_no"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Nomor referensi"
                                        value={data.reference_no}
                                        onChange={(e) =>
                                            setData(
                                                'reference_no',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.reference_no} />
                                </div>
                            </div>
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-2/3">
                                    <Label>Akun Kas/Bank</Label>
                                    <InputCombobox
                                        name="coa_id"
                                        items={cashCoaItems}
                                        placeholder="Pilih kas/bank"
                                        value={data.coa_id}
                                        onValueChange={(value) =>
                                            setData('coa_id', value)
                                        }
                                    />
                                    <InputError message={errors.coa_id} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label>Jumlah</Label>
                                    <InputDecimal
                                        name="amount"
                                        value={formattedAmount}
                                        onValueChange={(formatted, numeric) => {
                                            setFormattedAmount(formatted);
                                            setData(
                                                'amount',
                                                numeric.toFixed(2),
                                            );
                                        }}
                                    />
                                    <InputError message={errors.amount} />
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    className="dark:bg-transparent"
                                    placeholder="Deskripsi singkat pengeluaran"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6">
                        <aside className="w-full">
                            <HeadingSmall
                                title="Detail Pengeluaran"
                                description="Atur pembagian akun biaya untuk pengeluaran ini"
                            />
                        </aside>
                        <Separator className="lg:hidden" />
                        <div className="flex-1 space-y-4">
                            <div className="overflow-hidden rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="w-[50px] px-4 py-2">
                                                #
                                            </th>
                                            <th className="min-w-[300px] px-4 py-2 text-left">
                                                Akun Biaya
                                            </th>
                                            <th className="w-[220px] px-4 py-2 text-right">
                                                Nilai
                                            </th>
                                            <th className="w-[50px] px-4 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.details.map((detail, index) => {
                                            const isExpanded =
                                                rowExpanded[index] ?? false;
                                            return (
                                                <Fragment key={index}>
                                                    <tr className="border-t">
                                                        <td className="py-2 text-center align-top">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    toggleRow(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                <ChevronDownCircle
                                                                    className={
                                                                        isExpanded
                                                                            ? 'rotate-180 transition-transform'
                                                                            : 'transition-transform'
                                                                    }
                                                                />
                                                            </Button>
                                                        </td>
                                                        <td className="px-4 py-2 align-top">
                                                            <InputCombobox
                                                                name={`details.${index}.coa_id`}
                                                                items={
                                                                    expenseCoaItems
                                                                }
                                                                placeholder="Pilih akun biaya"
                                                                value={
                                                                    detail.coa_id
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    updateDetail(
                                                                        index,
                                                                        'coa_id',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'coa_id',
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-2 align-top">
                                                            <InputDecimal
                                                                name={`details.${index}.amount`}
                                                                value={
                                                                    formattedDetailAmounts[
                                                                        index
                                                                    ] ?? ''
                                                                }
                                                                onValueChange={(
                                                                    formatted,
                                                                    numeric,
                                                                ) => {
                                                                    setFormattedDetailAmounts(
                                                                        (
                                                                            prev,
                                                                        ) => {
                                                                            const next =
                                                                                [
                                                                                    ...prev,
                                                                                ];
                                                                            next[
                                                                                index
                                                                            ] =
                                                                                formatted;
                                                                            return next;
                                                                        },
                                                                    );
                                                                    updateDetail(
                                                                        index,
                                                                        'amount',
                                                                        numeric.toFixed(
                                                                            2,
                                                                        ),
                                                                    );
                                                                }}
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'amount',
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 align-top">
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={() =>
                                                                    removeRow(
                                                                        index,
                                                                    )
                                                                }
                                                                disabled={
                                                                    data.details
                                                                        .length <=
                                                                    1
                                                                }
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr className="border-t bg-muted/40">
                                                            <td />
                                                            <td
                                                                colSpan={3}
                                                                className="px-4 py-3"
                                                            >
                                                                <div className="grid gap-4 align-baseline md:grid-cols-3">
                                                                    <div className="space-y-1">
                                                                        <Label>
                                                                            Catatan
                                                                        </Label>
                                                                        <Input
                                                                            name={`details.${index}.note`}
                                                                            value={
                                                                                detail.note
                                                                            }
                                                                            placeholder="Atur catatan"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    'note',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <InputError
                                                                            message={errorAt(
                                                                                'details',
                                                                                index,
                                                                                'note',
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label>
                                                                            Departemen
                                                                        </Label>
                                                                        <InputCombobox
                                                                            name={`details.${index}.department_id`}
                                                                            items={
                                                                                departmentItems
                                                                            }
                                                                            placeholder="Pilih departemen"
                                                                            value={
                                                                                detail.department_id
                                                                            }
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    'department_id',
                                                                                    value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <InputError
                                                                            message={errorAt(
                                                                                'details',
                                                                                index,
                                                                                'department_id',
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label>
                                                                            Proyek
                                                                        </Label>
                                                                        <InputCombobox
                                                                            name={`details.${index}.project_id`}
                                                                            items={
                                                                                projectItems
                                                                            }
                                                                            placeholder="Pilih proyek (opsional)"
                                                                            value={
                                                                                detail.project_id
                                                                            }
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    'project_id',
                                                                                    value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                        <tr className="border-t bg-muted/50 text-[15px] font-medium">
                                            <td
                                                colSpan={2}
                                                className="px-4 py-2 text-right"
                                            >
                                                Total Detail
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {formatCurrency(totalDetail)}
                                            </td>
                                            <td></td>
                                        </tr>
                                        <tr className="bg-muted/50 text-[15px] font-medium">
                                            <td
                                                colSpan={2}
                                                className="px-4 py-2 text-right"
                                            >
                                                Selisih (Header - Detail)
                                            </td>
                                            <td
                                                className={
                                                    'px-4 py-2 text-right font-bold' +
                                                    (difference !== 0
                                                        ? ' text-destructive'
                                                        : '')
                                                }
                                            >
                                                {formatCurrency(
                                                    Math.abs(difference),
                                                )}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addRow}
                                >
                                    <PlusCircle /> Tambah Baris
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="mr-3"
                        >
                            <Link href={expense.index().url}>Batal</Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Pengeluaran'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
