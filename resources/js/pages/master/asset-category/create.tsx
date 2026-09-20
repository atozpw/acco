import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
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
import assetCategoryData from '@/routes/asset-category-data';
import dataStore from '@/routes/data-store';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';

type CoaOption = {
    id: number;
    code: string;
    name: string;
};

type AssetCategoryFormData = {
    code: string;
    name: string;
    useful_life_in_years: number | string;
    useful_life_in_months: number | string;
    asset_coa_id: string;
    accumulation_coa_id: string;
    depreciation_coa_id: string;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Kategori Aset',
        href: assetCategoryData.index().url,
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

export default function AssetCategoryCreateScreen({
    coas,
}: {
    coas: CoaOption[];
}) {
    const coaItems: ComboboxItem[] = coas.map((coa) => ({
        value: String(coa.id),
        label: `${coa.code} - ${coa.name}`,
    }));

    const { data, setData, post, processing, errors } =
        useForm<AssetCategoryFormData>({
            code: '',
            name: '',
            useful_life_in_years: 0,
            useful_life_in_months: 0,
            asset_coa_id: '',
            accumulation_coa_id: '',
            depreciation_coa_id: '',
            is_active: true,
        });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(assetCategoryData.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Kategori aset berhasil dibuat.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description:
                        'Terjadi kesalahan saat membuat kategori aset.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat kategori aset" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Kategori Aset"
                    description="Buat baru kategori aset"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="2xl:w-md w-full max-w-xl lg:w-[250px] xl:w-[350px]">
                            <HeadingSmall
                                title="Data Umum"
                                description="Masukkan kode, nama, masa manfaat, dan status"
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
                                    <Label htmlFor="useful_life_in_years">
                                        Masa Pakai (Tahun)
                                    </Label>
                                    <Input
                                        id="useful_life_in_years"
                                        name="useful_life_in_years"
                                        type="number"
                                        min="0"
                                        value={data.useful_life_in_years}
                                        onChange={(e) => {
                                            const years = e.target.value;
                                            setData((prev) => ({
                                                ...prev,
                                                useful_life_in_years: years,
                                                useful_life_in_months: years
                                                    ? Number(years) * 12
                                                    : 0,
                                            }));
                                        }}
                                    />
                                    <InputError
                                        message={errors.useful_life_in_years}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="useful_life_in_months">
                                        Masa Pakai (Bulan)
                                    </Label>
                                    <Input
                                        id="useful_life_in_months"
                                        name="useful_life_in_months"
                                        type="number"
                                        readOnly
                                        className="bg-muted"
                                        value={data.useful_life_in_months}
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
                                            Tentukan apakah kategori aktif
                                            digunakan.
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
                                    <InputError message={errors.is_active} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="2xl:w-md w-full max-w-xl lg:w-[250px] xl:w-[350px]">
                            <HeadingSmall
                                title="Akun Akuntansi"
                                description="Pilih akun-akun yang digunakan untuk jurnal aset tetap"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="grid max-w-2xl items-baseline gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="asset_coa_id">
                                        Akun Aset
                                    </Label>
                                    <InputCombobox
                                        name="asset_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun aset"
                                        value={data.asset_coa_id}
                                        onValueChange={(value) =>
                                            setData('asset_coa_id', value)
                                        }
                                    />
                                    <InputError message={errors.asset_coa_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="accumulation_coa_id">
                                        Akun Akumulasi Penyusutan
                                    </Label>
                                    <InputCombobox
                                        name="accumulation_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun akumulasi"
                                        value={data.accumulation_coa_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'accumulation_coa_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.accumulation_coa_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="depreciation_coa_id">
                                        Akun Beban Penyusutan
                                    </Label>
                                    <InputCombobox
                                        name="depreciation_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun beban penyusutan"
                                        value={data.depreciation_coa_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'depreciation_coa_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.depreciation_coa_id}
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
                            <Link href={assetCategoryData.index().url}>
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
