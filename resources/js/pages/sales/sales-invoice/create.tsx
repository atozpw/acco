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
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import sales from '@/routes/sales';
import salesInvoice from '@/routes/sales-invoice';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronDownCircle, PlusCircle, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ContactOption = { id: number; name: string };
type WarehouseOption = { id: number; name: string };
type CoaOption = { id: number; code: string; name: string };
type DepartmentOption = { id: number; code: string; name: string };
type ProjectOption = { id: number; code: string; name: string };

type ProductOption = {
    id: number;
    code: string;
    name: string;
    sales_price: string | number | null;
    sales_tax_id: number | null;
    sales_tax?: {
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

type DeliveryDetailOption = {
    id: number;
    product_id: number;
    qty: string | number;
    price: string | number;
    amount: string | number;
    tax_amount: string | number;
    discount_percent: string | number;
    discount_amount: string | number;
    total: string | number;
    note?: string | null;
    tax_id?: number | null;
    department_id?: number | null;
    project_id?: number | null;
};

type DeliveryOption = {
    id: number;
    reference_no: string;
    date: string;
    contact?: { id: number; name: string } | null;
    description?: string | null;
    total: string | number;
    details?: DeliveryDetailOption[];
};

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
    source_delivery_id?: string | null;
};

type DeliveryLinkForm = {
    sales_delivery_id: string;
    note: string;
};

type FormData = {
    contact_id: string;
    coa_id: string;
    warehouse_id: string;
    reference_no: string;
    date: string;
    description: string;
    amount: string;
    tax_amount: string;
    discount_percent: string;
    discount_amount: string;
    total: string;
    is_paid: boolean;
    is_delivery: boolean;
    details: DetailForm[];
    deliveries: DeliveryLinkForm[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Invoice Penjualan', href: salesInvoice.index().url },
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
    }

    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
};

const normalizeDecimal = (value: string | number | null | undefined) =>
    toNumber(value).toFixed(2);

const formatDateLocal = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID').format(date);
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

export default function SalesInvoiceCreateScreen({
    referenceNumber,
    referenceCoa,
    contacts,
    coas,
    warehouses,
    products,
    taxes,
    departments,
    projects,
    deliveries,
    today,
}: {
    referenceNumber: string;
    referenceCoa: number | null;
    contacts: ContactOption[];
    coas: CoaOption[];
    warehouses: WarehouseOption[];
    products: ProductOption[];
    taxes: TaxOption[];
    departments: DepartmentOption[];
    projects: ProjectOption[];
    deliveries: DeliveryOption[];
    today: string;
}) {
    const contactItems: ComboboxItem[] = contacts.map((c) => ({
        value: String(c.id),
        label: c.name,
    }));

    const coaItems: ComboboxItem[] = coas.map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.name}`,
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

    const departmentItems: ComboboxItem[] = departments.map((d) => ({
        value: String(d.id),
        label: d.name,
    }));

    const projectItems: ComboboxItem[] = projects.map((p) => ({
        value: String(p.id),
        label: p.name,
    }));

    const deliveryItems: ComboboxItem[] = deliveries.map((d) => ({
        value: String(d.id),
        label: d.reference_no,
    }));

    const deliveryMap = useMemo(() => {
        const map: Record<string, DeliveryOption> = {};
        deliveries.forEach((delivery) => {
            map[String(delivery.id)] = delivery;
        });
        return map;
    }, [deliveries]);

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
        source_delivery_id: null,
    };

    const initialDeliveryLink: DeliveryLinkForm = {
        sales_delivery_id: '',
        note: '',
    };

    const { data, setData, post, processing, errors, transform } =
        useForm<FormData>({
            contact_id: '',
            coa_id: referenceCoa ? String(referenceCoa) : '',
            warehouse_id: '',
            reference_no: referenceNumber,
            date: today,
            description: '',
            amount: '0.00',
            tax_amount: '0.00',
            discount_percent: '0.00',
            discount_amount: '0.00',
            total: '0.00',
            is_paid: false,
            is_delivery: false,
            details: [{ ...initialDetail }],
            deliveries: [{ ...initialDeliveryLink }],
        });

    const [formattedDetailQty, setFormattedDetailQty] = useState<string[]>([
        formatLocal('0.00'),
    ]);
    const [formattedDetailPrice, setFormattedDetailPrice] = useState<string[]>([
        formatLocal('0.00'),
    ]);
    const [formattedDetailDiscountPercent, setFormattedDetailDiscountPercent] =
        useState<string[]>([formatLocal('0.00')]);

    const [rowExpanded, setRowExpanded] = useState<boolean[]>(() =>
        data.details.map(() => false),
    );

    const syncDetailMeta = (details: DetailForm[]) => {
        setFormattedDetailQty(details.map((detail) => formatLocal(detail.qty)));
        setFormattedDetailPrice(
            details.map((detail) => formatLocal(detail.price)),
        );
        setFormattedDetailDiscountPercent(
            details.map((detail) => formatLocal(detail.discount_percent)),
        );
        setRowExpanded(details.map(() => false));
    };

    const pruneDetails = (details: DetailForm[]): DetailForm[] => {
        const filtered =
            details.length > 1
                ? details.filter(
                      (detail) =>
                          detail.product_id !== '' || detail.source_delivery_id,
                  )
                : details;

        return filtered.length ? filtered : [{ ...initialDetail }];
    };

    const buildDetailsFromDelivery = (
        delivery: DeliveryOption,
    ): DetailForm[] => {
        if (!delivery?.details?.length) return [];

        return delivery.details.map((detail) => ({
            product_id: detail.product_id ? String(detail.product_id) : '',
            qty: normalizeDecimal(detail.qty),
            price: normalizeDecimal(detail.price),
            amount: normalizeDecimal(detail.amount),
            tax_amount: normalizeDecimal(detail.tax_amount),
            discount_percent: normalizeDecimal(detail.discount_percent),
            discount_amount: normalizeDecimal(detail.discount_amount),
            total: normalizeDecimal(detail.total),
            note: detail.note ?? '',
            tax_id: detail.tax_id ? String(detail.tax_id) : '',
            department_id: detail.department_id
                ? String(detail.department_id)
                : departments[0]
                  ? String(departments[0].id)
                  : '',
            project_id: detail.project_id ? String(detail.project_id) : '',
            source_delivery_id: String(delivery.id),
        }));
    };

    const computeDetail = useCallback(
        (detail: DetailForm): DetailForm => {
            const qty = toNumber(detail.qty);
            const price = toNumber(detail.price);
            const amount = qty * price;
            const discountPercent = toNumber(detail.discount_percent);
            const discountAmount = amount * (discountPercent / 100);
            const net = amount - discountAmount;
            const taxRate = toNumber(taxMap[detail.tax_id] ?? 0);
            const taxAmount = net * (taxRate / 100);
            const total = net + taxAmount;

            return {
                ...detail,
                amount: amount.toFixed(2),
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
        setFormattedDetailQty((prev) => [...prev, formatLocal('0.00')]);
        setFormattedDetailPrice((prev) => [...prev, formatLocal('0.00')]);
        setFormattedDetailDiscountPercent((prev) => [
            ...prev,
            formatLocal('0.00'),
        ]);
        setRowExpanded((prev) => [...prev, false]);
    };

    const removeRow = (index: number) => {
        if (data.details.length <= 1) return;

        setData((prev) => {
            const nextDetails = prev.details.filter((_, i) => i !== index);
            return { ...prev, details: nextDetails };
        });
        setFormattedDetailQty((prev) => prev.filter((_, i) => i !== index));
        setFormattedDetailPrice((prev) => prev.filter((_, i) => i !== index));
        setFormattedDetailDiscountPercent((prev) =>
            prev.filter((_, i) => i !== index),
        );
        setRowExpanded((prev) => prev.filter((_, i) => i !== index));
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

    const onProductChange = (index: number, value: string) => {
        const product = productMap[value];

        setFormattedDetailQty((prev) => {
            const next = [...prev];
            next[index] = formatLocal('1.00');
            return next;
        });

        setFormattedDetailPrice((prev) => {
            const next = [...prev];
            next[index] = formatLocal(product?.sales_price ?? '0.00');
            return next;
        });

        updateDetail(index, (detail) => {
            const nextQty =
                toNumber(detail.qty) > 0
                    ? toNumber(detail.qty).toFixed(2)
                    : '1.00';
            const nextPrice =
                product?.sales_price !== null &&
                product?.sales_price !== undefined
                    ? toNumber(product.sales_price).toFixed(2)
                    : toNumber(detail.price ?? '0.00').toFixed(2);
            const nextTaxId = product?.sales_tax_id
                ? String(product.sales_tax_id)
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

        const discountPercent =
            amount > 0 ? (discountAmount / amount) * 100 : 0;

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

    const handleDeliverySelect = (index: number, deliveryId: string) => {
        const selectedDelivery = deliveryId
            ? deliveryMap[deliveryId]
            : undefined;
        const previousDeliveryId = data.deliveries[index]?.sales_delivery_id;

        const nextDeliveries = data.deliveries.map((dl, i) => {
            if (i !== index) return dl;
            return {
                ...dl,
                sales_delivery_id: deliveryId,
                note: deliveryId ? (selectedDelivery?.description ?? '') : '',
            };
        });

        let nextDetails = data.details.filter(
            (detail) => detail.source_delivery_id !== previousDeliveryId,
        );

        if (selectedDelivery) {
            const mappedDetails = buildDetailsFromDelivery(selectedDelivery);
            nextDetails = [...nextDetails, ...mappedDetails];
        }

        nextDetails = pruneDetails(nextDetails);

        setData((prev) => ({
            ...prev,
            deliveries: nextDeliveries,
            details: nextDetails,
        }));

        syncDetailMeta(nextDetails);
    };

    const addDeliveryLink = () => {
        setData((prev) => ({
            ...prev,
            deliveries: [...prev.deliveries, { ...initialDeliveryLink }],
        }));
    };

    const resetByDeliveryToggle = (checked: boolean) => {
        const baseDetails = [{ ...initialDetail }];
        const baseDeliveries = [{ ...initialDeliveryLink }];

        setData((prev) => ({
            ...prev,
            is_delivery: checked,
            deliveries: baseDeliveries,
            details: baseDetails,
        }));

        syncDetailMeta(baseDetails);
    };

    const removeDeliveryLink = (index: number) => {
        const targetDeliveryId = data.deliveries[index]?.sales_delivery_id;

        const nextDeliveries = data.deliveries.filter((_, i) => i !== index);

        let nextDetails = data.details;
        if (targetDeliveryId) {
            nextDetails = nextDetails.filter(
                (detail) => detail.source_delivery_id !== targetDeliveryId,
            );
        }

        nextDetails = pruneDetails(nextDetails);

        setData((prev) => ({
            ...prev,
            deliveries: nextDeliveries,
            details: nextDetails,
        }));

        syncDetailMeta(nextDetails);
    };

    const updateDeliveryLink = (
        index: number,
        field: keyof DeliveryLinkForm,
        value: string,
    ) => {
        setData((prev) => ({
            ...prev,
            deliveries: prev.deliveries.map((dl, i) =>
                i === index ? { ...dl, [field]: value } : dl,
            ),
        }));
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        transform((form) => {
            const detailPayload = form.details.map((detail) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { source_delivery_id: _source, ...detailWithoutSource } =
                    detail;
                const computed = computeDetail(
                    detailWithoutSource as DetailForm,
                );
                return {
                    ...computed,
                    product_id: Number(detail.product_id),
                    qty: toNumber(detail.qty).toFixed(2),
                    price: toNumber(detail.price).toFixed(2),
                    discount_percent: toNumber(detail.discount_percent).toFixed(
                        2,
                    ),
                    tax_id: detail.tax_id ? Number(detail.tax_id) : null,
                    department_id: Number(detail.department_id),
                    project_id: detail.project_id
                        ? Number(detail.project_id)
                        : null,
                };
            });

            const payloadAmount = detailPayload.reduce(
                (sum, item) => sum + toNumber(item.amount),
                0,
            );
            const payloadDiscountAmount = detailPayload.reduce(
                (sum, item) => sum + toNumber(item.discount_amount),
                0,
            );
            const payloadTaxAmount = detailPayload.reduce(
                (sum, item) => sum + toNumber(item.tax_amount),
                0,
            );
            const payloadTotal = detailPayload.reduce(
                (sum, item) => sum + toNumber(item.total),
                0,
            );
            const payloadDiscountPercent =
                payloadAmount > 0
                    ? (payloadDiscountAmount / payloadAmount) * 100
                    : 0;

            const deliveryPayload = form.is_delivery
                ? form.deliveries
                      .filter((d) => d.sales_delivery_id)
                      .map((d) => ({
                          sales_delivery_id: Number(d.sales_delivery_id),
                          note: d.note || null,
                      }))
                : [];

            return {
                ...form,
                contact_id: Number(form.contact_id),
                coa_id: Number(form.coa_id),
                warehouse_id: Number(form.warehouse_id),
                amount: payloadAmount.toFixed(2),
                tax_amount: payloadTaxAmount.toFixed(2),
                discount_amount: payloadDiscountAmount.toFixed(2),
                discount_percent: payloadDiscountPercent.toFixed(2),
                total: payloadTotal.toFixed(2),
                is_paid: Boolean(form.is_paid),
                is_delivery: Boolean(form.is_delivery),
                details: detailPayload,
                deliveries: deliveryPayload,
            } as unknown as FormData;
        });

        post(salesInvoice.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Invoice berhasil dibuat.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat membuat invoice.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Baru Invoice Penjualan" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Invoice Penjualan"
                    description="Buat baru transaksi invoice penjualan"
                />

                <Separator className="mb-8" />

                <form onSubmit={handleSubmit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[260px] xl:w-[320px]">
                            <HeadingSmall
                                title="Data Umum"
                                description="Lengkapi informasi utama invoice"
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
                            </div>

                            <div className="grid max-w-2xl items-baseline gap-6 lg:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label>Status Lunas</Label>
                                    <div className="flex items-center space-x-2 rounded-md border px-3 py-2">
                                        <Switch
                                            checked={data.is_paid}
                                            onCheckedChange={(checked) => {
                                                setData('is_paid', checked);
                                                if (!checked) {
                                                    setData(
                                                        'coa_id',
                                                        referenceCoa
                                                            ? String(
                                                                  referenceCoa,
                                                              )
                                                            : '',
                                                    );
                                                }
                                            }}
                                            id="is_paid"
                                        />
                                        <Label
                                            htmlFor="is_paid"
                                            className="cursor-pointer text-xs"
                                        >
                                            Tandai sebagai lunas
                                        </Label>
                                    </div>
                                    <InputError message={errors.is_paid} />
                                </div>
                                {data.is_paid && (
                                    <div className="col-span-2 grid gap-2">
                                        <Label>Pilih Akun</Label>
                                        <InputCombobox
                                            name="coa_id"
                                            items={coaItems}
                                            placeholder="Pilih akun"
                                            value={data.coa_id}
                                            onValueChange={(value) =>
                                                setData('coa_id', value)
                                            }
                                        />
                                        <InputError message={errors.coa_id} />
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label>Pelanggan</Label>
                                    <InputCombobox
                                        name="contact_id"
                                        items={contactItems}
                                        placeholder="Pilih pelanggan"
                                        value={data.contact_id}
                                        onValueChange={(value) =>
                                            setData('contact_id', value)
                                        }
                                    />
                                    <InputError message={errors.contact_id} />
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

                            <div className="grid max-w-2xl gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    className="dark:bg-transparent"
                                    placeholder="Deskripsi invoice"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid max-w-2xl gap-2">
                                <Label>Pengiriman Barang</Label>
                                <div className="flex items-center space-x-2 rounded-md border px-3 py-2">
                                    <Switch
                                        checked={data.is_delivery}
                                        onCheckedChange={(checked) =>
                                            resetByDeliveryToggle(checked)
                                        }
                                        id="is_delivery"
                                    />
                                    <Label
                                        htmlFor="is_delivery"
                                        className="cursor-pointer text-xs"
                                    >
                                        Invoice berasal dari pengiriman
                                    </Label>
                                </div>
                                <InputError message={errors.is_delivery} />
                            </div>
                        </div>
                    </div>

                    {data.is_delivery && (
                        <div className="flex flex-col space-y-4 rounded-md border p-4">
                            <HeadingSmall
                                title="Referensi Pengiriman"
                                description="Hubungkan invoice dengan pengiriman yang sudah ada"
                            />
                            <div className="space-y-3">
                                {data.deliveries.map((delivery, index) => {
                                    const selectedDelivery =
                                        delivery.sales_delivery_id
                                            ? deliveryMap[
                                                  delivery.sales_delivery_id
                                              ]
                                            : undefined;

                                    return (
                                        <div
                                            key={index}
                                            className="grid gap-3 md:grid-cols-2 md:items-start"
                                        >
                                            <div className="space-y-2">
                                                <Label>No. Pengiriman</Label>
                                                <InputCombobox
                                                    name={`deliveries.${index}.sales_delivery_id`}
                                                    items={deliveryItems}
                                                    placeholder="Pilih pengiriman"
                                                    value={
                                                        delivery.sales_delivery_id
                                                    }
                                                    onValueChange={(value) =>
                                                        handleDeliverySelect(
                                                            index,
                                                            value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errorAt(
                                                        'deliveries',
                                                        index,
                                                        'sales_delivery_id',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-start-2">
                                                <Label>Catatan</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        name={`deliveries.${index}.note`}
                                                        value={delivery.note}
                                                        placeholder="Catatan (opsional)"
                                                        onChange={(e) =>
                                                            updateDeliveryLink(
                                                                index,
                                                                'note',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeDeliveryLink(
                                                                index,
                                                            )
                                                        }
                                                        disabled={
                                                            data.deliveries
                                                                .length <= 1
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>
                                            {selectedDelivery && (
                                                <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground md:col-span-2 lg:grid-cols-3">
                                                    <div className="grid gap-1">
                                                        <span>Tanggal</span>
                                                        <span className="font-medium text-foreground">
                                                            {formatDateLocal(
                                                                selectedDelivery.date,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <span>Pelanggan</span>
                                                        <span className="font-medium text-foreground">
                                                            {selectedDelivery
                                                                .contact
                                                                ?.name ?? '-'}
                                                        </span>
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <span>Nilai</span>
                                                        <span className="font-semibold text-foreground">
                                                            {formatCurrency(
                                                                toNumber(
                                                                    selectedDelivery.total,
                                                                ),
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addDeliveryLink}
                            >
                                <PlusCircle /> Tambah Pengiriman
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-col space-y-6">
                        <aside className="w-full">
                            <HeadingSmall
                                title="Detail Barang"
                                description="Atur item yang termasuk dalam invoice"
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
                                                                disabled={
                                                                    data.is_delivery
                                                                }
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'product_id',
                                                                )}
                                                            />
                                                            {productDefault?.sales_tax && (
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Pajak
                                                                    default:{' '}
                                                                    {
                                                                        productDefault
                                                                            .sales_tax
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
                                                                            current,
                                                                        ) => ({
                                                                            ...current,
                                                                            qty: numeric.toFixed(
                                                                                2,
                                                                            ),
                                                                        }),
                                                                    );
                                                                }}
                                                                readOnly={
                                                                    data.is_delivery
                                                                }
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
                                                                            current,
                                                                        ) => ({
                                                                            ...current,
                                                                            price: numeric.toFixed(
                                                                                2,
                                                                            ),
                                                                        }),
                                                                    );
                                                                }}
                                                                readOnly={
                                                                    data.is_delivery
                                                                }
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
                                                            <div className="font-semibold">
                                                                {formatCurrency(
                                                                    toNumber(
                                                                        computedDetail.total,
                                                                    ),
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Subtotal:{' '}
                                                                {formatCurrency(
                                                                    toNumber(
                                                                        computedDetail.amount,
                                                                    ),
                                                                )}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-2 text-center align-top">
                                                            {!data.is_delivery && (
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
                                                                        data
                                                                            .details
                                                                            .length <=
                                                                        1
                                                                    }
                                                                >
                                                                    <Trash2 />
                                                                </Button>
                                                            )}
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
                                                                        <Label
                                                                            htmlFor={`details.${index}.discount_percent`}
                                                                        >
                                                                            Diskon
                                                                            %
                                                                        </Label>
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
                                                                                        current,
                                                                                    ) => ({
                                                                                        ...current,
                                                                                        discount_percent:
                                                                                            numeric.toFixed(
                                                                                                2,
                                                                                            ),
                                                                                    }),
                                                                                );
                                                                            }}
                                                                            readOnly={
                                                                                data.is_delivery
                                                                            }
                                                                        />
                                                                        <InputError
                                                                            message={errorAt(
                                                                                'details',
                                                                                index,
                                                                                'discount_percent',
                                                                            )}
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
                                                                                        current,
                                                                                    ) => ({
                                                                                        ...current,
                                                                                        tax_id: value,
                                                                                    }),
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                data.is_delivery
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
                                                                                        current,
                                                                                    ) => ({
                                                                                        ...current,
                                                                                        note: e
                                                                                            .target
                                                                                            .value,
                                                                                    }),
                                                                                )
                                                                            }
                                                                            readOnly={
                                                                                data.is_delivery
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
                                                                                        current,
                                                                                    ) => ({
                                                                                        ...current,
                                                                                        department_id:
                                                                                            value,
                                                                                    }),
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                data.is_delivery
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
                                                                                        current,
                                                                                    ) => ({
                                                                                        ...current,
                                                                                        project_id:
                                                                                            value,
                                                                                    }),
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                data.is_delivery
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
                                                colSpan={4}
                                                className="px-4 py-2 text-right"
                                            >
                                                Ringkasan
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {formatCurrency(totals.total)}
                                            </td>
                                            <td />
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {!data.is_delivery && (
                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addRow}
                                    >
                                        <PlusCircle /> Tambah Baris
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-md border p-4 md:ml-auto md:max-w-xl">
                        <div className="flex items-center justify-between text-sm">
                            <span>Subtotal</span>
                            <span className="font-semibold">
                                {formatCurrency(totals.amount)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>
                                Diskon ({totals.discountPercent.toFixed(2)}%)
                            </span>
                            <span className="font-semibold">
                                {formatCurrency(totals.discountAmount)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Pajak</span>
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

                    <div className="mt-6 flex items-center justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="mr-3"
                        >
                            <Link href={salesInvoice.index().url}>Batal</Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Invoice'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
