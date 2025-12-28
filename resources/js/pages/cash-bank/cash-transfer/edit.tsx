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
import cashTransferRoutes from '@/routes/cash-transfer';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { CoaOption, DepartmentOption, ProjectOption } from './create';

type CashTransferFormData = {
    from_coa_id: string;
    to_coa_id: string;
    reference_no: string;
    date: string;
    description: string;
    amount: string;
    department_id: string;
    project_id: string;
};

type CashTransferProps = {
    id: number;
    from_coa_id: number;
    to_coa_id: number;
    reference_no: string;
    date: string;
    description: string;
    amount: string;
    department_id: number;
    project_id: number | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kas & Bank',
        href: cashBank.index().url,
    },
    {
        title: 'Transfer Kas',
        href: cashTransferRoutes.index().url,
    },
    {
        title: 'Perbarui',
        href: '',
    },
];

const formatLocal = (value: string | number) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

export default function CashTransferEditScreen({
    cashTransfer,
    cashCoas,
    departments,
    projects,
}: {
    cashTransfer: CashTransferProps;
    cashCoas: CoaOption[];
    departments: DepartmentOption[];
    projects: ProjectOption[];
}) {
    const cashCoaItems: ComboboxItem[] = cashCoas.map((c) => ({
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

    const { data, setData, put, processing, errors } =
        useForm<CashTransferFormData>({
            from_coa_id: String(cashTransfer.from_coa_id),
            to_coa_id: String(cashTransfer.to_coa_id),
            reference_no: cashTransfer.reference_no ?? '',
            date: cashTransfer.date ?? '',
            description: cashTransfer.description ?? '',
            amount: cashTransfer.amount ?? '0.00',
            department_id: cashTransfer.department_id
                ? String(cashTransfer.department_id)
                : '1',
            project_id: cashTransfer.project_id
                ? String(cashTransfer.project_id)
                : '',
        });

    const [formattedAmount, setFormattedAmount] = useState<string>(
        formatLocal(cashTransfer.amount),
    );

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        put(cashTransferRoutes.update(cashTransfer.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Transfer kas berhasil diperbarui.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description:
                        'Terjadi kesalahan saat memperbarui transfer kas.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui transfer kas" />

            <div className="px-5 py-6">
                <Heading
                    title="Perbarui Transfer Kas"
                    description="Perbarui transaksi transfer antar kas/bank"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Umum"
                                description="Perbarui informasi utama"
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
                                    <Label>Proyek</Label>
                                    <InputCombobox
                                        name="project_id"
                                        items={projectItems}
                                        placeholder="Pilih proyek (opsional)"
                                        value={data.project_id}
                                        onValueChange={(value) =>
                                            setData('project_id', value)
                                        }
                                    />
                                    <InputError message={errors.project_id} />
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    className="dark:bg-transparent"
                                    placeholder="Deskripsi singkat transfer kas"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Detail Transfer"
                                description="Perbarui akun dan jumlah transfer"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label>Dari Akun Kas/Bank</Label>
                                    <InputCombobox
                                        name="from_coa_id"
                                        items={cashCoaItems}
                                        placeholder="Pilih akun asal"
                                        value={data.from_coa_id}
                                        onValueChange={(value) =>
                                            setData('from_coa_id', value)
                                        }
                                    />
                                    <InputError message={errors.from_coa_id} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label>Ke Akun Kas/Bank</Label>
                                    <InputCombobox
                                        name="to_coa_id"
                                        items={cashCoaItems}
                                        placeholder="Pilih akun tujuan"
                                        value={data.to_coa_id}
                                        onValueChange={(value) =>
                                            setData('to_coa_id', value)
                                        }
                                    />
                                    <InputError message={errors.to_coa_id} />
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-2">
                                <Label>Jumlah</Label>
                                <InputDecimal
                                    name="amount"
                                    value={formattedAmount}
                                    onValueChange={(formatted, numeric) => {
                                        setFormattedAmount(formatted);
                                        setData('amount', numeric.toFixed(2));
                                    }}
                                />
                                <InputError message={errors.amount} />
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
                            <Link href={cashTransferRoutes.index().url}>
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
                                'Simpan Perubahan'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
