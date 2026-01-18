import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import InputDecimal from '@/components/form/input-decimal';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import BeginningBalanceLayout from '@/layouts/settings/beginning-balance-layout';
import beginningBalance from '@/routes/beginning-balance';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';
import { toast } from 'sonner';

const decimalFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatDecimal = (value: number): string => {
    if (Number.isNaN(value)) return '';
    return decimalFormatter.format(value);
};

const formatCurrency = (value: number): string => {
    if (Number.isNaN(value)) return currencyFormatter.format(0);
    return currencyFormatter.format(value);
};

type InventoryProduct = {
    id: number;
    code: string;
    name: string;
    purchase_price: string | number | null;
};

type InventoryWarehouse = {
    id: number;
    name: string;
};

type InventoryDepartment = {
    id: number;
    code: string;
    name: string;
};

type InventoryProject = {
    id: number;
    code: string;
    name: string;
};

type InventoryFormData = {
    product_id: string;
    warehouse_id: string;
    department_id: string;
    project_id: string;
    qty: string;
    price: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: beginningBalance.index.url(),
    },
    {
        title: 'Saldo Awal',
        href: beginningBalance.inventory.index.url(),
    },
    {
        title: 'Persediaan',
        href: beginningBalance.inventory.index.url(),
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

export default function BeginningBalanceInventoryCreate({
    products,
    warehouses,
    departments,
    projects,
}: {
    products: InventoryProduct[];
    warehouses: InventoryWarehouse[];
    departments: InventoryDepartment[];
    projects: InventoryProject[];
}) {
    const productItems = useMemo<ComboboxItem[]>(
        () =>
            products.map((product) => ({
                value: String(product.id),
                label: product.code
                    ? `${product.code} - ${product.name}`
                    : product.name,
            })),
        [products],
    );

    const warehouseItems = useMemo<ComboboxItem[]>(
        () =>
            warehouses.map((warehouse) => ({
                value: String(warehouse.id),
                label: warehouse.name,
            })),
        [warehouses],
    );

    const departmentItems = useMemo<ComboboxItem[]>(
        () =>
            departments.map((department) => ({
                value: String(department.id),
                label: department.name,
            })),
        [departments],
    );

    const projectItems = useMemo<ComboboxItem[]>(
        () =>
            projects.map((project) => ({
                value: String(project.id),
                label: project.name,
            })),
        [projects],
    );

    const { data, setData, post, processing, errors } =
        useForm<InventoryFormData>({
            product_id: '',
            warehouse_id: '',
            department_id: '',
            project_id: '',
            qty: '',
            price: '',
        });

    const [formattedQty, setFormattedQty] = useState('');
    const [formattedPrice, setFormattedPrice] = useState('');

    const totalAmount = useMemo(() => {
        const qty = data.qty ? parseFloat(data.qty) : 0;
        const price = data.price ? parseFloat(data.price) : 0;
        const total = qty * price;
        return Number.isNaN(total) ? 0 : total;
    }, [data.qty, data.price]);

    const handleProductChange = (value: string) => {
        setData('product_id', value);

        if (!value) return;

        const selectedProduct = products.find(
            (product) => String(product.id) === value,
        );

        if (
            selectedProduct &&
            selectedProduct.purchase_price !== null &&
            selectedProduct.purchase_price !== undefined
        ) {
            const numericPrice =
                typeof selectedProduct.purchase_price === 'string'
                    ? parseFloat(selectedProduct.purchase_price)
                    : Number(selectedProduct.purchase_price);

            if (!Number.isNaN(numericPrice)) {
                setFormattedPrice(formatDecimal(numericPrice));
                setData('price', numericPrice.toFixed(2));
            }
        }
    };

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        post(beginningBalance.inventory.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Saldo awal persediaan berhasil disimpan.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description:
                        'Terjadi kesalahan saat menyimpan saldo awal persediaan.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Saldo Awal Persediaan" />

            <BeginningBalanceLayout>
                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <HeadingSmall
                        title="Tambah Saldo Awal Persediaan"
                        description="Buat baru saldo awal persediaan per item"
                    />

                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Produk</Label>
                                <InputCombobox
                                    name="product_id"
                                    items={productItems}
                                    placeholder="Pilih produk"
                                    value={data.product_id}
                                    onValueChange={handleProductChange}
                                />
                                <InputError message={errors.product_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Gudang</Label>
                                <InputCombobox
                                    name="warehouse_id"
                                    items={warehouseItems}
                                    placeholder="Pilih gudang"
                                    value={data.warehouse_id}
                                    onValueChange={(value) =>
                                        setData('warehouse_id', value)
                                    }
                                />
                                <InputError message={errors.warehouse_id} />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
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
                                <InputError message={errors.department_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Proyek (opsional)</Label>
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

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="qty">Jumlah</Label>
                                <InputDecimal
                                    name="qty"
                                    value={formattedQty}
                                    onValueChange={(formatted, numeric) => {
                                        setFormattedQty(formatted);
                                        setData('qty', numeric.toFixed(2));
                                    }}
                                />
                                <InputError message={errors.qty} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Harga Beli</Label>
                                <InputDecimal
                                    name="price"
                                    value={formattedPrice}
                                    onValueChange={(formatted, numeric) => {
                                        setFormattedPrice(formatted);
                                        setData('price', numeric.toFixed(2));
                                    }}
                                />
                                <InputError message={errors.price} />
                            </div>
                        </div>

                        <div className="rounded-md border p-4 text-sm text-muted-foreground">
                            <div className="flex items-center justify-between">
                                <span>Total Nilai</span>
                                <span className="font-semibold text-foreground">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="sm:w-auto"
                        >
                            <Link href={beginningBalance.inventory.index.url()}>
                                Batal
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Persediaan'
                            )}
                        </Button>
                    </div>
                </form>
            </BeginningBalanceLayout>
        </AppLayout>
    );
}
