import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import dataStore from '@/routes/data-store';
import payrollComponentData from '@/routes/payroll-component-data';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';

type CoaOption = {
    id: number;
    code: string;
    name: string;
};

type PayrollComponentProps = {
    id: number;
    code: string;
    name: string;
    type: string;
    payable_coa_id: number | null;
    expense_coa_id: number | null;
    is_active: number;
};

type PayrollComponentFormData = {
    code: string;
    name: string;
    type: string;
    payable_coa_id: string;
    expense_coa_id: string;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Komponen Gaji',
        href: payrollComponentData.index().url,
    },
    {
        title: 'Perbarui',
        href: '',
    },
];

export default function PayrollComponentEditScreen({
    component,
    coas,
}: {
    component: PayrollComponentProps;
    coas: CoaOption[];
}) {
    const coaItems: ComboboxItem[] = coas.map((coa) => ({
        value: String(coa.id),
        label: `${coa.code} - ${coa.name}`,
    }));

    const { data, setData, put, processing, errors } =
        useForm<PayrollComponentFormData>({
            code: component.code ?? '',
            name: component.name ?? '',
            type: component.type ?? '',
            payable_coa_id: component.payable_coa_id
                ? String(component.payable_coa_id)
                : '',
            expense_coa_id: component.expense_coa_id
                ? String(component.expense_coa_id)
                : '',
            is_active: Boolean(component.is_active),
        });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        put(payrollComponentData.update(component.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Komponen gaji berhasil diperbarui.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description:
                        'Terjadi kesalahan saat memperbarui komponen gaji.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui komponen gaji" />

            <div className="px-5 py-6">
                <Heading
                    title="Perbarui Komponen Gaji"
                    description="Perbarui data komponen gaji"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="2xl:w-md w-full max-w-xl lg:w-[250px] xl:w-[350px]">
                            <HeadingSmall
                                title="Data Umum"
                                description="Masukkan kode, nama, tipe, dan status"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-x-6 lg:space-y-0">
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label htmlFor="code">Kode</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        type="text"
                                        autoFocus
                                        autoComplete="off"
                                        placeholder="Kode komponen"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.code} />
                                </div>
                                <div className="grid gap-2 lg:basis-2/3">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Masukkan nama komponen"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>
                            <div className="grid max-w-md gap-2">
                                <Label htmlFor="type">Tipe</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) =>
                                        setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="earning">
                                            Penghasilan
                                        </SelectItem>
                                        <SelectItem value="deduction">
                                            Potongan
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>
                            <div className="grid max-w-2xl gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="payable_coa_id">
                                        Akun Utang
                                    </Label>
                                    <InputCombobox
                                        name="payable_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun utang"
                                        value={data.payable_coa_id}
                                        onValueChange={(value) =>
                                            setData('payable_coa_id', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.payable_coa_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expense_coa_id">
                                        Akun Beban / Biaya
                                    </Label>
                                    <InputCombobox
                                        name="expense_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun beban / biaya"
                                        value={data.expense_coa_id}
                                        onValueChange={(value) =>
                                            setData('expense_coa_id', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.expense_coa_id}
                                    />
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active">
                                            Status
                                        </Label>
                                        <p className="text-muted-foreground text-xs">
                                            Tentukan apakah komponen aktif digunakan.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-muted-foreground text-xs">
                                            Nonaktif
                                        </span>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_active',
                                                    Boolean(checked),
                                                )
                                            }
                                        />
                                        <span className="text-muted-foreground text-xs">
                                            Aktif
                                        </span>
                                    </div>
                                    <InputError
                                        message={errors.is_active}
                                    />
                                </div>
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
                            <Link href={payrollComponentData.index().url}>
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
                                'Simpan Komponen'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
