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
import cashAdvanceClassification from '@/routes/cash-advance-classification';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';

type CoaOption = {
    id: number;
    code: string;
    name: string;
};

type CashAdvanceClassificationFormData = {
    code: string;
    name: string;
    cash_advance_income_coa_id: string;
    cash_advance_expense_coa_id: string;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Kategori Uang Muka',
        href: cashAdvanceClassification.index().url,
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

export default function CashAdvanceClassificationCreateScreen({
    coas,
}: {
    coas: CoaOption[];
}) {
    const coaItems: ComboboxItem[] = coas.map((coa) => ({
        value: String(coa.id),
        label: `${coa.code} - ${coa.name}`,
    }));

    const { data, setData, post, processing, errors } =
        useForm<CashAdvanceClassificationFormData>({
            code: '',
            name: '',
            cash_advance_income_coa_id: '',
            cash_advance_expense_coa_id: '',
            is_active: true,
        });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(cashAdvanceClassification.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Kategori uang muka berhasil dibuat.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description:
                        'Terjadi kesalahan saat membuat kategori uang muka.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat kategori uang muka" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Kategori Uang Muka"
                    description="Buat baru kategori uang muka"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="2xl:w-md w-full max-w-xl lg:w-[250px] xl:w-[350px]">
                            <HeadingSmall
                                title="Data Umum"
                                description="Masukkan nama dan status"
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
                                        placeholder="Kode kategori"
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
                                        placeholder="Masukkan nama kategori"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="cash_advance_income_coa_id">
                                        Akun Penerimaan
                                    </Label>
                                    <InputCombobox
                                        name="cash_advance_income_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun penerimaan"
                                        value={data.cash_advance_income_coa_id}
                                        onValueChange={(value) =>
                                            setData('cash_advance_income_coa_id', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.cash_advance_income_coa_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cash_advance_expense_coa_id">
                                        Akun Pengeluaran
                                    </Label>
                                    <InputCombobox
                                        name="cash_advance_expense_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun pengeluaran"
                                        value={data.cash_advance_expense_coa_id}
                                        onValueChange={(value) =>
                                            setData('cash_advance_expense_coa_id', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.cash_advance_expense_coa_id}
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
                                            Tentukan apakah kategori aktif digunakan.
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
                            <Link href={cashAdvanceClassification.index().url}>
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
                                'Simpan Kategori'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
