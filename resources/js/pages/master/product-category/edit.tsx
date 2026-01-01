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
import dataStore from '@/routes/data-store';
import productCategory from '@/routes/product-category';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';

type CoaOption = {
    id: number;
    code: string;
    name: string;
};

type ProductCategoryProps = {
    id: number;
    code: string;
    name: string;
    inventory_coa_id: number | null;
    purchase_coa_id: number | null;
    purchase_receipt_coa_id: number | null;
    purchase_return_coa_id: number | null;
    sales_coa_id: number | null;
    sales_delivery_coa_id: number | null;
    sales_return_coa_id: number | null;
    is_active: boolean;
};

type ProductCategoryFormData = {
    code: string;
    name: string;
    inventory_coa_id: string;
    purchase_coa_id: string;
    purchase_receipt_coa_id: string;
    purchase_return_coa_id: string;
    sales_coa_id: string;
    sales_delivery_coa_id: string;
    sales_return_coa_id: string;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Kategori Produk',
        href: productCategory.index().url,
    },
    {
        title: 'Perbarui',
        href: '',
    },
];

export default function ProductCategoryEditScreen({
    category,
    coas,
}: {
    category: ProductCategoryProps;
    coas: CoaOption[];
}) {
    const coaItems: ComboboxItem[] = coas.map((coa) => ({
        value: String(coa.id),
        label: `${coa.code} - ${coa.name}`,
    }));

    const { data, setData, put, processing, errors } =
        useForm<ProductCategoryFormData>({
            code: category.code ?? '',
            name: category.name ?? '',
            inventory_coa_id: category.inventory_coa_id
                ? String(category.inventory_coa_id)
                : '',
            purchase_coa_id: category.purchase_coa_id
                ? String(category.purchase_coa_id)
                : '',
            purchase_receipt_coa_id: category.purchase_receipt_coa_id
                ? String(category.purchase_receipt_coa_id)
                : '',
            purchase_return_coa_id: category.purchase_return_coa_id
                ? String(category.purchase_return_coa_id)
                : '',
            sales_coa_id: category.sales_coa_id
                ? String(category.sales_coa_id)
                : '',
            sales_delivery_coa_id: category.sales_delivery_coa_id
                ? String(category.sales_delivery_coa_id)
                : '',
            sales_return_coa_id: category.sales_return_coa_id
                ? String(category.sales_return_coa_id)
                : '',
            is_active: Boolean(category.is_active),
        });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        put(productCategory.update(category.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Kategori produk berhasil diperbarui.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description:
                        'Terjadi kesalahan saat memperbarui kategori produk.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui kategori produk" />

            <div className="px-5 py-6">
                <Heading
                    title="Perbarui Kategori Produk"
                    description="Memperbarui kategori produk"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Umum"
                                description="Perbarui kode, nama, dan status kategori"
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
                            <div className="grid max-w-2xl gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active">
                                            Status
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Tentukan apakah kategori ini aktif
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
                                    <InputError message={errors.is_active} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Kontrol Stok Produk"
                                description="Atur akun-akun yang digunakan untuk pergerakan stok"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="grid max-w-2xl items-baseline gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="inventory_coa_id">
                                        Akun Persediaan
                                    </Label>
                                    <InputCombobox
                                        name="inventory_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun persediaan"
                                        value={data.inventory_coa_id}
                                        onValueChange={(value) =>
                                            setData('inventory_coa_id', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.inventory_coa_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sales_delivery_coa_id">
                                        Akun Pengiriman Barang
                                    </Label>
                                    <InputCombobox
                                        name="sales_delivery_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun pengiriman"
                                        value={data.sales_delivery_coa_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'sales_delivery_coa_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.sales_delivery_coa_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="purchase_receipt_coa_id">
                                        Akun Penerimaan Barang
                                    </Label>
                                    <InputCombobox
                                        name="purchase_receipt_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun penerimaan"
                                        value={data.purchase_receipt_coa_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'purchase_receipt_coa_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.purchase_receipt_coa_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Kategori Pembelian"
                                description="Pilih akun-akun untuk transaksi pembelian"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="grid max-w-2xl items-baseline gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="purchase_coa_id">
                                        Akun Pembelian
                                    </Label>
                                    <InputCombobox
                                        name="purchase_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun pembelian"
                                        value={data.purchase_coa_id}
                                        onValueChange={(value) =>
                                            setData('purchase_coa_id', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.purchase_coa_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="purchase_return_coa_id">
                                        Akun Retur Pembelian
                                    </Label>
                                    <InputCombobox
                                        name="purchase_return_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun retur pembelian"
                                        value={data.purchase_return_coa_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'purchase_return_coa_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.purchase_return_coa_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Kategori Penjualan"
                                description="Pilih akun-akun untuk transaksi penjualan"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="grid max-w-2xl items-baseline gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="sales_coa_id">
                                        Akun Penjualan
                                    </Label>
                                    <InputCombobox
                                        name="sales_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun penjualan"
                                        value={data.sales_coa_id}
                                        onValueChange={(value) =>
                                            setData('sales_coa_id', value)
                                        }
                                    />
                                    <InputError message={errors.sales_coa_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sales_return_coa_id">
                                        Akun Retur Penjualan
                                    </Label>
                                    <InputCombobox
                                        name="sales_return_coa_id"
                                        items={coaItems}
                                        placeholder="Pilih akun retur penjualan"
                                        value={data.sales_return_coa_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'sales_return_coa_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.sales_return_coa_id}
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
                            <Link href={productCategory.index().url}>
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
