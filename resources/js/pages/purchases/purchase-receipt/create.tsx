import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import InputDatepicker from '@/components/form/input-datepicker';
import InputDecimal from '@/components/form/input-decimal';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import purchaseReceipt from '@/routes/purchase-receipt';
import purchases from '@/routes/purchases';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronDownCircle, PlusCircle, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ContactOption = { id: number; name: string };
type WarehouseOption = { id: number; name: string };
type DepartmentOption = { id: number; code: string; name: string };
type ProjectOption = { id: number; code: string; name: string };

type ProductOption = {
    id: number;
    code: string;
    name: string;
    purchase_price: string | number | null;
    purchase_tax_id: number | null;
    purchase_tax?: {
        id: number;
        code: string;
        name: string;
        rate: string | number;
    } | null;
};

type TaxOption = {
    id: number;
    code: string;
    name: string;
    rate: string | number;
};

type DiscountType = 'percent' | 'amount';

type DetailForm = {
    product_id: string;
    qty: string;
    price: string;
    amount: string;
    tax_amount: string;
    discount_percent: string;
    discount_amount: string;
    total: string;
    note: string;
    tax_id: string;
    department_id: string;
    project_id: string;
    discount_type: DiscountType;
};

type FormData = {
    contact_id: string;
    warehouse_id: string;
    reference_no: string;
    date: string;
    description: string;
    amount: string;
    tax_amount: string;
    discount_percent: string;
    discount_amount: string;
    total: string;
    is_closed: boolean;
    details: DetailForm[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pembelian', href: purchases.index().url },
    { title: 'Penerimaan Barang', href: purchaseReceipt.index().url },
    { title: 'Buat Baru', href: '' },
];

const formatLocal = (value: string | number) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

const toNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return 0;
    const raw = String(value).trim();

    const hasComma = raw.includes(',');
    const hasDot = raw.includes('.');

    let normalized = raw;

    if (hasComma && hasDot) {
        normalized = raw.replace(/\./g, '').replace(',', '.');
    } else if (hasComma && !hasDot) {
        normalized = raw.replace(',', '.');
    } else if (!hasComma && hasDot) {
        normalized = raw.replace(/,/g, '');
    } else {
        normalized = raw;
    }

    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

export default function PurchaseReceiptCreateScreen({
    referenceNumber,
    contacts,
    warehouses,
    products,
    taxes,
    departments,
    projects,
    today,
}: {
    referenceNumber: string;
    contacts: ContactOption[];
    warehouses: WarehouseOption[];
    products: ProductOption[];
    taxes: TaxOption[];
    departments: DepartmentOption[];
    projects: ProjectOption[];
    today: string;
}) {
    const contactItems: ComboboxItem[] = contacts.map((c) => ({
        value: String(c.id),
        label: c.name,
    }));

    const warehouseItems: ComboboxItem[] = warehouses.map((w) => ({
        value: String(w.id),
        label: w.name,
    }));

    const productItems: ComboboxItem[] = products.map((p) => ({
        value: String(p.id),
        label: `${p.code} - ${p.name}`,
    }));

    const taxItems: ComboboxItem[] = [
        { value: '', label: 'Tidak ada pajak' },
        ...taxes.map((t) => ({
            value: String(t.id),
            label: `${t.code} - ${t.name}`,
        })),
    ];

    const discountTypeItems: ComboboxItem[] = [
        { value: 'percent', label: '%' },
        { value: 'amount', label: 'Rp' },
    ];

    const departmentItems: ComboboxItem[] = departments.map((d) => ({
        value: String(d.id),
        label: d.name,
    }));

    const projectItems: ComboboxItem[] = projects.map((p) => ({
        value: String(p.id),
        label: p.name,
    }));

    const productMap = useMemo(() => {
        const map: Record<string, ProductOption> = {};
        products.forEach((p) => {
            map[String(p.id)] = p;
        });
        return map;
    }, [products]);

    const taxMap = useMemo(() => {
        const map: Record<string, number> = {};
        taxes.forEach((t) => {
            map[String(t.id)] = Number(t.rate ?? 0);
        });
        return map;
    }, [taxes]);

    const initialDetail: DetailForm = {
        product_id: '',
        qty: '0.00',
        price: '0.00',
        amount: '0.00',
        tax_amount: '0.00',
        discount_percent: '0.00',
        discount_amount: '0.00',
        total: '0.00',
        note: '',
        tax_id: '',
        department_id: departments[0] ? String(departments[0].id) : '',
        project_id: '',
        discount_type: 'percent',
    };

    const { data, setData, post, processing, errors } = useForm<FormData>({
        contact_id: '',
        warehouse_id: '',
        reference_no: referenceNumber,
        date: today,
        description: '',
        amount: '0.00',
        tax_amount: '0.00',
        discount_percent: '0.00',
        discount_amount: '0.00',
        total: '0.00',
        is_closed: false,
        details: [{ ...initialDetail }],
    });

    const [formattedDetailQty, setFormattedDetailQty] = useState<string[]>([
        '',
    ]);
    const [formattedDetailPrice, setFormattedDetailPrice] = useState<string[]>([
        '',
    ]);
    const [formattedDetailDiscountPercent, setFormattedDetailDiscountPercent] =
        useState<string[]>(['']);
    const [formattedDetailDiscountAmount, setFormattedDetailDiscountAmount] =
        useState<string[]>(['']);

    const [rowExpanded, setRowExpanded] = useState<boolean[]>(() =>
        data.details.map(() => false),
    );

    const computeDetail = useCallback(
        (detail: DetailForm): DetailForm => {
            const qty = toNumber(detail.qty);
            const price = toNumber(detail.price);
            const amount = qty * price;
            let discountPercent = toNumber(detail.discount_percent);
            let discountAmount = toNumber(detail.discount_amount);

            if (detail.discount_type === 'amount') {
                discountAmount = Math.min(Math.max(discountAmount, 0), amount);
                discountPercent = 0;
            } else {
                discountPercent = Math.min(Math.max(discountPercent, 0), 100);
                discountAmount = amount * (discountPercent / 100);
            }

            const net = amount - discountAmount;
            const taxRate = toNumber(taxMap[detail.tax_id] ?? 0);
            const taxAmount = net * (taxRate / 100);
            const total = net + taxAmount;

            return {
                ...detail,
                amount: amount.toFixed(2),
                discount_percent: discountPercent.toFixed(2),
                discount_amount: discountAmount.toFixed(2),
                tax_amount: taxAmount.toFixed(2),
                total: total.toFixed(2),
            };
        },
        [taxMap],
    );

    const addRow = () => {
        setData((prev) => {
            const nextDetails = [...prev.details, { ...initialDetail }];
            return { ...prev, details: nextDetails };
        });
        setRowExpanded((prev) => [...prev, false]);
        setFormattedDetailQty((prev) => [...prev, '']);
        setFormattedDetailPrice((prev) => [...prev, '']);
        setFormattedDetailDiscountPercent((prev) => [...prev, '']);
        setFormattedDetailDiscountAmount((prev) => [...prev, '']);
    };

    const removeRow = (index: number) => {
        if (data.details.length <= 1) return;

        setData((prev) => {
            const nextDetails = prev.details.filter((_, i) => i !== index);
            return { ...prev, details: nextDetails };
        });
        setRowExpanded((prev) => prev.filter((_, i) => i !== index));
        setFormattedDetailQty((prev) => prev.filter((_, i) => i !== index));
        setFormattedDetailPrice((prev) => prev.filter((_, i) => i !== index));
        setFormattedDetailDiscountPercent((prev) =>
            prev.filter((_, i) => i !== index),
        );
        setFormattedDetailDiscountAmount((prev) =>
            prev.filter((_, i) => i !== index),
        );
    };

    const updateDetail = (
        index: number,
        updater: (detail: DetailForm) => DetailForm,
    ) => {
        setData((prev) => {
            const nextDetails = prev.details.map((detail, i) => {
                if (i !== index) return detail;
                const next = updater(detail);
                return computeDetail(next);
            });

            return { ...prev, details: nextDetails };
        });
    };

    const toggleRow = (index: number) => {
        setRowExpanded((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    const handleDiscountTypeChange = (index: number, type: DiscountType) => {
        const currentDetail = data.details[index];

        setFormattedDetailDiscountPercent((prev) => {
            const next = [...prev];
            if (type === 'percent') {
                next[index] = formatLocal(
                    currentDetail?.discount_percent ?? '0.00',
                );
            }
            return next;
        });

        setFormattedDetailDiscountAmount((prev) => {
            const next = [...prev];
            if (type === 'amount') {
                next[index] = formatLocal(
                    currentDetail?.discount_amount ?? '0.00',
                );
            }
            return next;
        });

        updateDetail(index, (detail) => ({
            ...detail,
            discount_type: type,
        }));
    };

    const onProductChange = (index: number, value: string) => {
        const product = productMap[value];

        setFormattedDetailQty((prev) => {
            const next = [...prev];
            next[index] = formatLocal('1.00');
            return next;
        });

        setFormattedDetailPrice((prev) => {
            const next = [...prev];
            next[index] = formatLocal(product?.purchase_price ?? '0.00');
            return next;
        });

        updateDetail(index, (detail) => {
            const nextQty =
                toNumber(detail.qty) > 0
                    ? toNumber(detail.qty).toFixed(2)
                    : '1.00';

            const nextPrice =
                product?.purchase_price !== null &&
                product?.purchase_price !== undefined
                    ? toNumber(product.purchase_price).toFixed(2)
                    : toNumber(detail.price ?? '0.00').toFixed(2);

            const nextTaxId = product?.purchase_tax_id
                ? String(product.purchase_tax_id)
                : '';

            return {
                ...detail,
                product_id: value,
                qty: nextQty,
                price: nextPrice,
                tax_id: nextTaxId,
            };
        });
    };

    const totals = useMemo(() => {
        const detailTotals = data.details.map((d) => computeDetail(d));
        const amount = detailTotals.reduce(
            (sum, item) => sum + toNumber(item.amount),
            0,
        );
        const discountAmount = detailTotals.reduce(
            (sum, item) => sum + toNumber(item.discount_amount),
            0,
        );
        const taxAmount = detailTotals.reduce(
            (sum, item) => sum + toNumber(item.tax_amount),
            0,
        );
        const total = detailTotals.reduce(
            (sum, item) => sum + toNumber(item.total),
            0,
        );

        const discountPercent = 0;

        return {
            amount,
            discountAmount,
            discountPercent,
            taxAmount,
            total,
            detailTotals,
        };
    }, [computeDetail, data.details]);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            amount: totals.amount.toFixed(2),
            discount_amount: totals.discountAmount.toFixed(2),
            discount_percent: totals.discountPercent.toFixed(2),
            tax_amount: totals.taxAmount.toFixed(2),
            total: totals.total.toFixed(2),
        }));
    }, [
        setData,
        totals.amount,
        totals.discountAmount,
        totals.discountPercent,
        totals.taxAmount,
        totals.total,
    ]);

    const errorBag = errors as unknown as Record<string, string>;
    const errorAt = (base: string, index: number, field: string) => {
        return (
            errorBag[`${base}.${index}.${field}`] ??
            errorBag[`${base}.${field}`] ??
            errorBag[base]
        );
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(purchaseReceipt.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Penerimaan berhasil dibuat.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat membuat penerimaan.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Baru Penerimaan Barang" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Penerimaan Barang"
                    description="Buat baru transaksi penerimaan barang"
                />

                <Separator className="mb-8" />

                <form onSubmit={handleSubmit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[260px] xl:w-[320px]">
                            <HeadingSmall
                                title="Data Umum"
                                description="Lengkapi informasi utama penerimaan"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label htmlFor="reference_no">
                                        No. Referensi
                                    </Label>
                                    <Input
                                        id="reference_no"
                                        name="reference_no"
                                        type="text"
                                        autoComplete="off"
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
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label htmlFor="date">Tanggal</Label>
                                    <InputDatepicker
                                        id="date"
                                        defaultValue={data.date}
                                        onChange={(date, iso) =>
                                            setData('date', iso)
                                        }
                                    />
                                    <InputError message={errors.date} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label>Status Ditutup</Label>
                                    <div className="flex items-center space-x-2 rounded-md border px-3 py-2">
                                        <Switch
                                            checked={data.is_closed}
                                            onCheckedChange={(checked) =>
                                                setData('is_closed', checked)
                                            }
                                            id="is_closed"
                                        />
                                        <Label
                                            htmlFor="is_closed"
                                            className="cursor-pointer"
                                        >
                                            Tandai sebagai selesai
                                        </Label>
                                    </div>
                                    <InputError message={errors.is_closed} />
                                </div>
                            </div>

                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label>Pemasok</Label>
                                    <InputCombobox
                                        name="contact_id"
                                        items={contactItems}
                                        placeholder="Pilih pemasok"
                                        value={data.contact_id}
                                        onValueChange={(value) =>
                                            setData('contact_id', value)
                                        }
                                    />
                                    <InputError message={errors.contact_id} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/2">
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

                            <div className="grid max-w-2xl gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    className="dark:bg-transparent"
                                    placeholder="Deskripsi penerimaan"
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
                                title="Detail Barang"
                                description="Atur barang yang diterima"
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
                                            <th className="min-w-[260px] px-4 py-2 text-left">
                                                Produk
                                            </th>
                                            <th className="w-[120px] px-4 py-2 text-right">
                                                Qty
                                            </th>
                                            <th className="w-[185px] px-4 py-2 text-right">
                                                Harga Satuan
                                            </th>
                                            <th className="w-[170px] px-4 py-2 text-right">
                                                Total
                                            </th>
                                            <th className="w-[60px] px-4 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.details.map((detail, index) => {
                                            const isExpanded =
                                                rowExpanded[index] ?? false;
                                            const productDefault =
                                                productMap[detail.product_id];
                                            const computedDetail =
                                                totals.detailTotals[index] ??
                                                computeDetail(detail);
                                            const lineNet = Math.max(
                                                0,
                                                toNumber(
                                                    computedDetail.amount,
                                                ) -
                                                    toNumber(
                                                        computedDetail.discount_amount,
                                                    ),
                                            );

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
                                                                name={`details.${index}.product_id`}
                                                                items={
                                                                    productItems
                                                                }
                                                                placeholder="Pilih produk"
                                                                value={
                                                                    detail.product_id
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    onProductChange(
                                                                        index,
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'product_id',
                                                                )}
                                                            />
                                                            {productDefault?.purchase_tax && (
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Pajak
                                                                    default:{' '}
                                                                    {
                                                                        productDefault
                                                                            .purchase_tax
                                                                            .name
                                                                    }
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-top">
                                                            <InputDecimal
                                                                name={`details.${index}.qty`}
                                                                value={
                                                                    formattedDetailQty[
                                                                        index
                                                                    ] ?? ''
                                                                }
                                                                onValueChange={(
                                                                    formatted,
                                                                    numeric,
                                                                ) => {
                                                                    setFormattedDetailQty(
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
                                                                        (
                                                                            detail,
                                                                        ) => ({
                                                                            ...detail,
                                                                            qty: numeric.toFixed(
                                                                                2,
                                                                            ),
                                                                        }),
                                                                    );
                                                                }}
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'qty',
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 align-top">
                                                            <InputDecimal
                                                                name={`details.${index}.price`}
                                                                value={
                                                                    formattedDetailPrice[
                                                                        index
                                                                    ] ?? ''
                                                                }
                                                                onValueChange={(
                                                                    formatted,
                                                                    numeric,
                                                                ) => {
                                                                    setFormattedDetailPrice(
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
                                                                        (
                                                                            detail,
                                                                        ) => ({
                                                                            ...detail,
                                                                            price: numeric.toFixed(
                                                                                2,
                                                                            ),
                                                                        }),
                                                                    );
                                                                }}
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'price',
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-right align-top">
                                                            <div className="mt-2 font-semibold">
                                                                {formatCurrency(
                                                                    lineNet,
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-center align-top">
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
                                                                colSpan={5}
                                                                className="space-y-4 px-4 py-3"
                                                            >
                                                                <div className="grid gap-4 md:grid-cols-3">
                                                                    <div className="space-y-1">
                                                                        <Label>
                                                                            Diskon
                                                                        </Label>
                                                                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                                                            {detail.discount_type ===
                                                                            'amount' ? (
                                                                                <InputDecimal
                                                                                    name={`details.${index}.discount_amount`}
                                                                                    value={
                                                                                        formattedDetailDiscountAmount[
                                                                                            index
                                                                                        ] ??
                                                                                        ''
                                                                                    }
                                                                                    onValueChange={(
                                                                                        formatted,
                                                                                        numeric,
                                                                                    ) => {
                                                                                        setFormattedDetailDiscountAmount(
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
                                                                                            (
                                                                                                detail,
                                                                                            ) => ({
                                                                                                ...detail,
                                                                                                discount_amount:
                                                                                                    numeric.toFixed(
                                                                                                        2,
                                                                                                    ),
                                                                                            }),
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <InputDecimal
                                                                                    id={`details.${index}.discount_percent`}
                                                                                    name={`details.${index}.discount_percent`}
                                                                                    value={
                                                                                        formattedDetailDiscountPercent[
                                                                                            index
                                                                                        ] ??
                                                                                        ''
                                                                                    }
                                                                                    onValueChange={(
                                                                                        formatted,
                                                                                        numeric,
                                                                                    ) => {
                                                                                        setFormattedDetailDiscountPercent(
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
                                                                                            (
                                                                                                detail,
                                                                                            ) => ({
                                                                                                ...detail,
                                                                                                discount_percent:
                                                                                                    numeric.toFixed(
                                                                                                        2,
                                                                                                    ),
                                                                                            }),
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            )}
                                                                            <Select
                                                                                value={
                                                                                    detail.discount_type
                                                                                }
                                                                                onValueChange={(
                                                                                    value,
                                                                                ) =>
                                                                                    handleDiscountTypeChange(
                                                                                        index,
                                                                                        value as DiscountType,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <SelectTrigger className="w-[80px]">
                                                                                    <SelectValue
                                                                                        aria-label={String(
                                                                                            detail.discount_type,
                                                                                        )}
                                                                                    >
                                                                                        {discountTypeItems.find(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.value ===
                                                                                                detail.discount_type,
                                                                                        )
                                                                                            ?.label ??
                                                                                            '%'}
                                                                                    </SelectValue>
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {discountTypeItems.map(
                                                                                        (
                                                                                            item,
                                                                                            idx,
                                                                                        ) => (
                                                                                            <SelectItem
                                                                                                key={
                                                                                                    idx
                                                                                                }
                                                                                                value={String(
                                                                                                    item.value,
                                                                                                )}
                                                                                            >
                                                                                                {
                                                                                                    item.label
                                                                                                }
                                                                                            </SelectItem>
                                                                                        ),
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        <InputError
                                                                            message={
                                                                                detail.discount_type ===
                                                                                'amount'
                                                                                    ? errorAt(
                                                                                          'details',
                                                                                          index,
                                                                                          'discount_amount',
                                                                                      )
                                                                                    : errorAt(
                                                                                          'details',
                                                                                          index,
                                                                                          'discount_percent',
                                                                                      )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label
                                                                            htmlFor={`details.${index}.tax_id`}
                                                                        >
                                                                            Pajak
                                                                        </Label>
                                                                        <InputCombobox
                                                                            name={`details.${index}.tax_id`}
                                                                            items={
                                                                                taxItems
                                                                            }
                                                                            placeholder="Pilih pajak"
                                                                            value={
                                                                                detail.tax_id
                                                                            }
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    (
                                                                                        detail,
                                                                                    ) => ({
                                                                                        ...detail,
                                                                                        tax_id: value,
                                                                                    }),
                                                                                )
                                                                            }
                                                                        />
                                                                        <InputError
                                                                            message={errorAt(
                                                                                'details',
                                                                                index,
                                                                                'tax_id',
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="grid gap-4 md:grid-cols-3">
                                                                    <div className="space-y-1">
                                                                        <Label>
                                                                            Catatan
                                                                        </Label>
                                                                        <Input
                                                                            name={`details.${index}.note`}
                                                                            value={
                                                                                detail.note
                                                                            }
                                                                            placeholder="Catatan detail"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    (
                                                                                        detail,
                                                                                    ) => ({
                                                                                        ...detail,
                                                                                        note: e
                                                                                            .target
                                                                                            .value,
                                                                                    }),
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
                                                                                    (
                                                                                        detail,
                                                                                    ) => ({
                                                                                        ...detail,
                                                                                        department_id:
                                                                                            value,
                                                                                    }),
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
                                                                                    (
                                                                                        detail,
                                                                                    ) => ({
                                                                                        ...detail,
                                                                                        project_id:
                                                                                            value,
                                                                                    }),
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
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid gap-6 lg:grid-cols-3 lg:items-baseline">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addRow}
                                >
                                    <PlusCircle /> Tambah Baris
                                </Button>

                                <div className="grid gap-4 rounded-md border p-4 lg:col-span-2 lg:ml-auto lg:w-full lg:max-w-lg">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Total Produk</span>
                                        <span className="font-semibold">
                                            {formatCurrency(totals.amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Diskon</span>
                                        <span className="font-semibold">
                                            {formatCurrency(
                                                totals.discountAmount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Total Pajak</span>
                                        <span className="font-semibold">
                                            {formatCurrency(totals.taxAmount)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between text-base">
                                        <span>Total</span>
                                        <span className="font-bold">
                                            {formatCurrency(totals.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="mr-3"
                        >
                            <Link href={purchaseReceipt.index().url}>
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
                                'Simpan Penerimaan'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
