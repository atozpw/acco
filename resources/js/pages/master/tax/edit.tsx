import InputCombobox from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import dataStore from '@/routes/data-store';
import taxRoute from '@/routes/tax-data';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';
import type { CoaOption } from './create';

type TaxProps = {
    id: number;
    code: string;
    name: string;
    rate: string | number;
    sales_coa_id: number | null;
    purchase_coa_id: number | null;
    is_active: boolean;
};

type TaxFormData = {
    code: string;
    name: string;
    rate: string;
    sales_coa_id: number | null;
    purchase_coa_id: number | null;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Data Pajak',
        href: taxRoute.index().url,
    },
    {
        title: 'Perbarui',
        href: '',
    },
];

export default function TaxEditScreen({
    tax,
    accounts,
}: {
    tax: TaxProps;
    accounts: CoaOption[];
}) {
    const { data, setData, put, processing, errors } = useForm<TaxFormData>({
        code: tax.code ?? '',
        name: tax.name ?? '',
        rate:
            typeof tax.rate === 'number'
                ? tax.rate.toFixed(2)
                : (tax.rate ?? ''),
        sales_coa_id: tax.sales_coa_id ?? null,
        purchase_coa_id: tax.purchase_coa_id ?? null,
        is_active: Boolean(tax.is_active),
    });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        put(taxRoute.update(tax.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Data pajak berhasil diperbarui.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description:
                        'Terjadi kesalahan saat memperbarui data pajak.',
                });
            },
        });
    };

    const accountOptions = accounts.map((acc) => ({
        label: `${acc.code} - ${acc.name}`,
        value: String(acc.id),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui data pajak" />

            <div className="px-5 py-6">
                <Heading
                    title="Perbarui Data Pajak"
                    description="Memperbarui data pajak"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Umum"
                                description="Perbarui kode, nama, dan persentase pajak"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label htmlFor="code">Kode</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        type="text"
                                        autoFocus
                                        autoComplete="off"
                                        placeholder="Kode pajak"
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
                                        placeholder="Masukkan nama pajak"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>
                            <div className="grid max-w-md gap-2">
                                <Label htmlFor="rate">
                                    Persentase Pajak (%)
                                </Label>
                                <Input
                                    id="rate"
                                    name="rate"
                                    type="number"
                                    step="0.01"
                                    autoComplete="off"
                                    placeholder="Contoh: 11.00"
                                    value={data.rate}
                                    onChange={(e) =>
                                        setData('rate', e.target.value)
                                    }
                                />
                                <InputError message={errors.rate} />
                            </div>

                            <div className="grid gap-6 md:max-w-2xl md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>COA Penjualan</Label>
                                    <InputCombobox
                                        name="sales_coa_id"
                                        items={accountOptions}
                                        value={
                                            data.sales_coa_id
                                                ? String(data.sales_coa_id)
                                                : ''
                                        }
                                        placeholder="Pilih akun penjualan"
                                        onValueChange={(value) => {
                                            setData(
                                                'sales_coa_id',
                                                value ? Number(value) : null,
                                            );
                                        }}
                                    />
                                    <InputError
                                        message={errors.sales_coa_id as string}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>COA Pembelian</Label>
                                    <InputCombobox
                                        name="purchase_coa_id"
                                        items={accountOptions}
                                        value={
                                            data.purchase_coa_id
                                                ? String(data.purchase_coa_id)
                                                : ''
                                        }
                                        placeholder="Pilih akun pembelian"
                                        onValueChange={(value) => {
                                            setData(
                                                'purchase_coa_id',
                                                value ? Number(value) : null,
                                            );
                                        }}
                                    />
                                    <InputError
                                        message={
                                            errors.purchase_coa_id as string
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid max-w-2xl gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active">
                                            Status
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Tentukan apakah pajak ini aktif
                                            digunakan.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
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
                                        <span className="text-xs text-muted-foreground">
                                            Aktif
                                        </span>
                                    </div>
                                    <InputError
                                        message={errors.is_active as string}
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
                            <Link href={taxRoute.index().url}>Batal</Link>
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
