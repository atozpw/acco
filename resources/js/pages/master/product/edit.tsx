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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import dataStore from '@/routes/data-store';
import productData from '@/routes/product-data';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEventHandler } from 'react';
import { toast } from 'sonner';
import type { ProductCategoryProps, TaxProps, UnitProps } from './create';

type ProductProps = {
    id: number;
    product_category_id: number;
    code: string;
    name: string;
    unit_measurement_id: number;
    sales_price: string;
    purchase_price: string;
    sales_tax_id: number | null;
    purchase_tax_id: number | null;
    minimum_stock: string | null;
    description: string | null;
    image: string | null;
    is_active: boolean;
};

type ProductFormData = {
    product_category_id: string;
    code: string;
    name: string;
    unit_measurement_id: string;
    sales_price: string;
    purchase_price: string;
    sales_tax_id: string;
    purchase_tax_id: string;
    minimum_stock: string;
    description: string;
    image: File | null;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Data Produk',
        href: productData.index().url,
    },
    {
        title: 'Perbarui',
        href: '',
    },
];

const formatCurrency = (
    value: string | number | null | undefined,
): string | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return null;
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

export default function ProductEditScreen({
    product,
    categories,
    units,
    taxes,
}: {
    product: ProductProps;
    categories: ProductCategoryProps[];
    units: UnitProps[];
    taxes: TaxProps[];
}) {
    const categoryItems: ComboboxItem[] = categories.map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.name}`,
    }));

    const unitItems: ComboboxItem[] = units.map((u) => ({
        value: String(u.id),
        label: `${u.code} - ${u.name}`,
    }));

    const taxItems: ComboboxItem[] = taxes.map((t) => ({
        value: String(t.id),
        label: `${t.code} - ${t.name}`,
    }));

    const { data, setData, put, processing, errors, reset } =
        useForm<ProductFormData>({
            product_category_id: String(product.product_category_id),
            code: product.code ?? '',
            name: product.name ?? '',
            unit_measurement_id: String(product.unit_measurement_id),
            sales_price: product.sales_price ?? '',
            purchase_price: product.purchase_price ?? '',
            sales_tax_id: product.sales_tax_id
                ? String(product.sales_tax_id)
                : '',
            purchase_tax_id: product.purchase_tax_id
                ? String(product.purchase_tax_id)
                : '',
            minimum_stock: product.minimum_stock ?? '',
            description: product.description ?? '',
            image: null,
            is_active: Boolean(product.is_active),
        });

    const [salesPriceFormatted, setSalesPriceFormatted] = useState<
        string | null
    >(formatCurrency(product.sales_price));
    const [purchasePriceFormatted, setPurchasePriceFormatted] = useState<
        string | null
    >(formatCurrency(product.purchase_price));

    const [imagePreview, setImagePreview] = useState<string | null>(
        product.image ?? null,
    );

    useEffect(() => {
        if (!data.image) {
            setImagePreview(product.image ?? null);
            return;
        }

        const url = URL.createObjectURL(data.image);
        setImagePreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.image]);

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        put(productData.update(product.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Produk berhasil diperbarui.',
                });
                reset('image');
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat memperbarui produk.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui data produk" />

            <div className="px-5 py-6">
                <Heading
                    title="Perbarui Produk"
                    description="Memperbarui data produk"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Umum"
                                description="Perbarui kode, nama, kategori dan satuan"
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
                                        placeholder="Kode produk"
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
                                        placeholder="Masukkan nama produk"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label htmlFor="product_category_id">
                                        Kategori
                                    </Label>
                                    <InputCombobox
                                        name="product_category_id"
                                        items={categoryItems}
                                        placeholder="Pilih kategori"
                                        value={data.product_category_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'product_category_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.product_category_id}
                                    />
                                </div>
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label htmlFor="unit_measurement_id">
                                        Satuan
                                    </Label>
                                    <InputCombobox
                                        name="unit_measurement_id"
                                        items={unitItems}
                                        placeholder="Pilih satuan"
                                        value={data.unit_measurement_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'unit_measurement_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.unit_measurement_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Harga & Stok"
                                description="Atur harga jual/beli, pajak dan minimum stok"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label htmlFor="sales_price">
                                        Harga Jual
                                    </Label>
                                    <InputDecimal
                                        id="sales_price"
                                        name="sales_price"
                                        placeholder="0,00"
                                        value={salesPriceFormatted}
                                        onValueChange={(formatted, numeric) => {
                                            setSalesPriceFormatted(formatted);
                                            setData(
                                                'sales_price',
                                                numeric.toFixed(2),
                                            );
                                        }}
                                    />
                                    <InputError message={errors.sales_price} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label htmlFor="purchase_price">
                                        Harga Beli
                                    </Label>
                                    <InputDecimal
                                        id="purchase_price"
                                        name="purchase_price"
                                        placeholder="0,00"
                                        value={purchasePriceFormatted}
                                        onValueChange={(formatted, numeric) => {
                                            setPurchasePriceFormatted(
                                                formatted,
                                            );
                                            setData(
                                                'purchase_price',
                                                numeric.toFixed(2),
                                            );
                                        }}
                                    />
                                    <InputError
                                        message={errors.purchase_price}
                                    />
                                </div>
                            </div>
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label htmlFor="sales_tax_id">
                                        Pajak Penjualan
                                    </Label>
                                    <InputCombobox
                                        name="sales_tax_id"
                                        items={taxItems}
                                        placeholder="Pilih pajak penjualan"
                                        value={data.sales_tax_id}
                                        onValueChange={(value) =>
                                            setData('sales_tax_id', value)
                                        }
                                    />
                                    <InputError message={errors.sales_tax_id} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label htmlFor="purchase_tax_id">
                                        Pajak Pembelian
                                    </Label>
                                    <InputCombobox
                                        name="purchase_tax_id"
                                        items={taxItems}
                                        placeholder="Pilih pajak pembelian"
                                        value={data.purchase_tax_id}
                                        onValueChange={(value) =>
                                            setData('purchase_tax_id', value)
                                        }
                                    />
                                    <InputError
                                        message={errors.purchase_tax_id}
                                    />
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-2">
                                <Label htmlFor="minimum_stock">
                                    Minimum Stok
                                </Label>
                                <Input
                                    id="minimum_stock"
                                    name="minimum_stock"
                                    type="number"
                                    step="0.01"
                                    autoComplete="off"
                                    placeholder="0.00"
                                    value={data.minimum_stock}
                                    onChange={(e) =>
                                        setData('minimum_stock', e.target.value)
                                    }
                                />
                                <InputError message={errors.minimum_stock} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Detail Produk"
                                description="Atur deskripsi, gambar dan status"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="grid max-w-2xl gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    autoComplete="off"
                                    placeholder="Masukkan deskripsi produk"
                                    className="dark:bg-transparent"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-2/3">
                                    <Label htmlFor="image">Gambar</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setData(
                                                'image',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    <InputError message={errors.image} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label>Preview</Label>
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt={
                                                    data.name || 'Gambar produk'
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                Tidak ada gambar
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active">
                                            Status
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Tentukan apakah produk ini aktif
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

                    <div className="mt-8 flex items-center justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="mr-3"
                        >
                            <Link href={productData.index().url}>Batal</Link>
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
