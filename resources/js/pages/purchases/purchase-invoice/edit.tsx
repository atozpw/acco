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
import purchaseInvoice from '@/routes/purchase-invoice';
import purchases from '@/routes/purchases';
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
    purchase_price: string | number | null;
    purchase_tax_id: number | null;
    purchase_tax?: {
        id: number;
        code: string;
        name: string;
        rate: string | number;
    } | null;
    stocks?: {
        id: number;
        warehouse_id: number;
        product_id: number;
        qty: string | number;
    }[];
};

type TaxOption = {
    id: number;
    code: string;
    name: string;
    rate: string | number;
};

type DiscountType = 'percent' | 'amount';

type ReceiptDetailOption = {
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

type ReceiptOption = {
    id: number;
    reference_no: string;
    date: string;
    contact?: { id: number; name: string } | null;
    description?: string | null;
    total: string | number;
    details?: ReceiptDetailOption[];
};

type InvoiceDetailPayload = {
    id: number;
    product_id: number;
    qty: string | number;
    price: string | number;
    amount: string | number;
    tax_amount: string | number;
    discount_percent: string | number;
    discount_amount: string | number;
    total: string | number;
    note: string | null;
    tax_id: number | null;
    department_id: number;
    project_id: number | null;
};

type InvoiceReceiptLink = {
    id: number;
    sales_delivery_id: number;
    note: string | null;
};

type InvoicePayload = {
    id: number;
    contact_id: number;
    coa_id: number | null;
    warehouse_id: number;
    reference_no: string;
    date: string;
    description: string;
    amount: string | number;
    tax_amount: string | number;
    discount_percent: string | number;
    discount_amount: string | number;
    total: string | number;
    is_paid: boolean | number;
    is_receipt: boolean | number;
    details: InvoiceDetailPayload[];
    receipts: InvoiceReceiptLink[];
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
    discount_type: DiscountType;
    source_receipt_id?: string | null;
};

type ReceiptLinkForm = {
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
    is_receipt: boolean;
    details: DetailForm[];
    receipts: ReceiptLinkForm[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pembelian', href: purchases.index().url },
    { title: 'Invoice Pembelian', href: purchaseInvoice.index().url },
    { title: 'Perbarui', href: '' },
];

const formatLocal = (value: string | number) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

const toNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return 0;
    const raw = String(value).trim();
    if (!raw) return 0;

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

export default function PurchaseInvoiceEditScreen({
    invoice,
    referenceCoa,
    contacts,
    coas,
    warehouses,
    products,
    taxes,
    departments,
    projects,
    receipts,
}: {
    invoice: InvoicePayload;
    referenceCoa: number | null;
    contacts: ContactOption[];
    coas: CoaOption[];
    warehouses: WarehouseOption[];
    products: ProductOption[];
    taxes: TaxOption[];
    departments: DepartmentOption[];
    projects: ProjectOption[];
    receipts: ReceiptOption[];
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

    const discountTypeItems: ComboboxItem[] = [
        { value: 'percent', label: '%' },
        { value: 'amount', label: 'Rp' },
    ];

    const receiptItems: ComboboxItem[] = receipts.map((r) => ({
        value: String(r.id),
        label: `${r.reference_no} - ${r.contact?.name ?? '-'}`,
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

    const receiptMap = useMemo(() => {
        const map: Record<string, ReceiptOption> = {};
        receipts.forEach((receipt) => {
            map[String(receipt.id)] = receipt;
        });
        return map;
    }, [receipts]);

    const getProductStockLabel = useCallback(
        (productId: string, warehouseId: string) => {
            if (!warehouseId) return 'Pilih gudang';
            if (!productId) return 'N/A';

            const product = productMap[productId];
            if (!product?.stocks?.length) return 'N/A';

            const stock = product.stocks.find(
                (item) => String(item.warehouse_id) === warehouseId,
            );

            if (!stock) return 'N/A';

            return formatLocal(toNumber(stock.qty ?? 0));
        },
        [productMap],
    );

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
        source_receipt_id: null,
    };

    const initialReceiptLink: ReceiptLinkForm = {
        sales_delivery_id: '',
        note: '',
    };
    const initialDetailsFromInvoice: DetailForm[] = useMemo(() => {
        if (!invoice.details?.length) return [];

        return invoice.details.map((detail) => {
            const fallbackDepartment = departments[0]
                ? String(departments[0].id)
                : '';
            const normalizedDepartment = detail.department_id
                ? String(detail.department_id)
                : fallbackDepartment;
            const normalizedProject = detail.project_id
                ? String(detail.project_id)
                : '';
            const inferredDiscountType: DiscountType =
                Number(detail.discount_percent) <= 0 ? 'amount' : 'percent';

            return {
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
                department_id: normalizedDepartment,
                project_id: normalizedProject,
                discount_type: inferredDiscountType,
                source_receipt_id: null,
            };
        });
    }, [invoice.details, departments]);

    const initialReceiptLinks = useMemo(() => {
        if (!invoice.receipts?.length) return [];
        return invoice.receipts.map((receipt) => ({
            sales_delivery_id: receipt.sales_delivery_id
                ? String(receipt.sales_delivery_id)
                : '',
            note: receipt.note ?? '',
        }));
    }, [invoice.receipts]);

    const detailDefaults =
        initialDetailsFromInvoice.length > 0
            ? initialDetailsFromInvoice
            : [{ ...initialDetail }];

    const receiptDefaults =
        initialReceiptLinks.length > 0
            ? initialReceiptLinks
            : [{ ...initialReceiptLink }];

    const { data, setData, put, processing, errors, transform } =
        useForm<FormData>({
            contact_id: String(invoice.contact_id),
            coa_id:
                invoice.coa_id !== null && invoice.coa_id !== undefined
                    ? String(invoice.coa_id)
                    : referenceCoa
                      ? String(referenceCoa)
                      : '',
            warehouse_id: String(invoice.warehouse_id),
            reference_no: invoice.reference_no,
            date: invoice.date,
            description: invoice.description ?? '',
            amount: normalizeDecimal(invoice.amount),
            tax_amount: normalizeDecimal(invoice.tax_amount),
            discount_percent: normalizeDecimal(invoice.discount_percent),
            discount_amount: normalizeDecimal(invoice.discount_amount),
            total: normalizeDecimal(invoice.total),
            is_paid: Boolean(invoice.is_paid),
            is_receipt: Boolean(invoice.is_receipt),
            details: detailDefaults,
            receipts: receiptDefaults,
        });

    const [formattedDetailQty, setFormattedDetailQty] = useState<string[]>(
        detailDefaults.map((detail) => formatLocal(detail.qty)),
    );
    const [formattedDetailPrice, setFormattedDetailPrice] = useState<string[]>(
        detailDefaults.map((detail) => formatLocal(detail.price)),
    );
    const [formattedDetailDiscountPercent, setFormattedDetailDiscountPercent] =
        useState<string[]>(
            detailDefaults.map((detail) =>
                formatLocal(detail.discount_percent),
            ),
        );
    const [formattedDetailDiscountAmount, setFormattedDetailDiscountAmount] =
        useState<string[]>(
            detailDefaults.map((detail) => formatLocal(detail.discount_amount)),
        );

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
        setFormattedDetailDiscountAmount(
            details.map((detail) => formatLocal(detail.discount_amount)),
        );
        setRowExpanded(details.map(() => false));
    };

    const pruneDetails = (details: DetailForm[]): DetailForm[] => {
        const filtered =
            details.length > 1
                ? details.filter(
                      (detail) =>
                          detail.product_id !== '' || detail.source_receipt_id,
                  )
                : details;

        return filtered.length ? filtered : [{ ...initialDetail }];
    };

    const buildDetailsFromReceipt = (receipt: ReceiptOption): DetailForm[] => {
        if (!receipt?.details?.length) return [];

        return receipt.details.map((detail) => ({
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
            discount_type:
                Number(detail.discount_percent) <= 0 ? 'amount' : 'percent',
            source_receipt_id: String(receipt.id),
        }));
    };

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
        if (data.is_receipt) return;
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
        setFormattedDetailDiscountAmount((prev) => [
            ...prev,
            formatLocal('0.00'),
        ]);
        setRowExpanded((prev) => [...prev, false]);
    };

    const removeRow = (index: number) => {
        if (data.is_receipt || data.details.length <= 1) return;

        setData((prev) => {
            const nextDetails = prev.details.filter((_, i) => i !== index);
            return { ...prev, details: nextDetails };
        });
        setFormattedDetailQty((prev) => prev.filter((_, i) => i !== index));
        setFormattedDetailPrice((prev) => prev.filter((_, i) => i !== index));
        setFormattedDetailDiscountPercent((prev) =>
            prev.filter((_, i) => i !== index),
        );
        setFormattedDetailDiscountAmount((prev) =>
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
        if (data.is_receipt) return;
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
                qty: '1.00',
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

    const handleReceiptSelect = (index: number, receiptId: string) => {
        const selectedReceipt = receiptId ? receiptMap[receiptId] : undefined;
        const previousReceiptId = data.receipts[index]?.sales_delivery_id;

        const nextReceipts = data.receipts.map((receipt, i) => {
            if (i !== index) return receipt;
            return {
                ...receipt,
                sales_delivery_id: receiptId,
                note: receiptId ? (selectedReceipt?.description ?? '') : '',
            };
        });

        let nextDetails = data.details.filter(
            (detail) => detail.source_receipt_id !== previousReceiptId,
        );

        if (selectedReceipt) {
            const mappedDetails = buildDetailsFromReceipt(selectedReceipt);
            nextDetails = [...nextDetails, ...mappedDetails];
        }

        nextDetails = pruneDetails(nextDetails);

        setData((prev) => ({
            ...prev,
            receipts: nextReceipts,
            details: nextDetails,
        }));

        syncDetailMeta(nextDetails);
    };

    const addReceiptLink = () => {
        setData((prev) => ({
            ...prev,
            receipts: [...prev.receipts, { ...initialReceiptLink }],
        }));
    };

    const resetByReceiptToggle = (checked: boolean) => {
        const baseDetails = [{ ...initialDetail }];
        const baseReceipts = [{ ...initialReceiptLink }];

        setData((prev) => ({
            ...prev,
            is_receipt: checked,
            receipts: baseReceipts,
            details: baseDetails,
        }));

        syncDetailMeta(baseDetails);
    };

    const removeReceiptLink = (index: number) => {
        const targetReceiptId = data.receipts[index]?.sales_delivery_id;
        const nextReceipts = data.receipts.filter((_, i) => i !== index);

        let nextDetails = data.details;
        if (targetReceiptId) {
            nextDetails = nextDetails.filter(
                (detail) => detail.source_receipt_id !== targetReceiptId,
            );
        }

        nextDetails = pruneDetails(nextDetails);

        setData((prev) => ({
            ...prev,
            receipts: nextReceipts.length
                ? nextReceipts
                : [{ ...initialReceiptLink }],
            details: nextDetails,
        }));

        syncDetailMeta(nextDetails);
    };

    const updateReceiptLink = (
        index: number,
        field: keyof ReceiptLinkForm,
        value: string,
    ) => {
        setData((prev) => ({
            ...prev,
            receipts: prev.receipts.map((receipt, i) =>
                i === index ? { ...receipt, [field]: value } : receipt,
            ),
        }));
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        transform((form) => {
            const detailPayload = form.details.map((detail) => {
                const computed = computeDetail(detail);
                const {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    source_receipt_id: _source,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    discount_type: _discountType,
                    ...detailWithoutMeta
                } = computed;

                return {
                    ...detailWithoutMeta,
                    product_id: Number(detail.product_id),
                    qty: toNumber(detailWithoutMeta.qty).toFixed(2),
                    price: toNumber(detailWithoutMeta.price).toFixed(2),
                    discount_percent: toNumber(
                        detailWithoutMeta.discount_percent,
                    ).toFixed(2),
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

            const receiptPayload = form.is_receipt
                ? form.receipts
                      .filter((receipt) => receipt.sales_delivery_id)
                      .map((receipt) => ({
                          sales_delivery_id: Number(receipt.sales_delivery_id),
                          note: receipt.note || null,
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
                is_receipt: Boolean(form.is_receipt),
                details: detailPayload,
                receipts: receiptPayload,
            } as unknown as FormData;
        });

        put(purchaseInvoice.update(invoice.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Invoice pembelian berhasil diperbarui.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat memperbarui invoice.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui Invoice Pembelian" />

            <div className="px-5 py-6">
                <Heading
                    title="Ubah Invoice Pembelian"
                    description="Perbarui transaksi invoice pembelian"
                />

                <Separator className="mb-8" />

                <form onSubmit={handleSubmit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[260px] xl:w-[320px]">
                            <HeadingSmall
                                title="Data Umum"
                                description="Perbarui informasi utama invoice"
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
                                <Label>Penerimaan Barang</Label>
                                <div className="flex items-center space-x-2 rounded-md border px-3 py-2">
                                    <Switch
                                        checked={data.is_receipt}
                                        onCheckedChange={(checked) =>
                                            resetByReceiptToggle(checked)
                                        }
                                        id="is_receipt"
                                    />
                                    <Label
                                        htmlFor="is_receipt"
                                        className="cursor-pointer text-xs"
                                    >
                                        Invoice berasal dari penerimaan
                                    </Label>
                                </div>
                                <InputError message={errors.is_receipt} />
                            </div>
                        </div>
                    </div>

                    {data.is_receipt && (
                        <div className="flex flex-col space-y-4 rounded-md border p-4">
                            <HeadingSmall
                                title="Referensi Penerimaan"
                                description="Hubungkan invoice dengan penerimaan yang sudah ada"
                            />
                            <div className="space-y-3">
                                {data.receipts.map((receiptLink, index) => {
                                    const selectedReceipt =
                                        receiptLink.sales_delivery_id
                                            ? receiptMap[
                                                  receiptLink.sales_delivery_id
                                              ]
                                            : undefined;

                                    return (
                                        <div
                                            key={index}
                                            className="grid gap-3 md:grid-cols-2 md:items-start"
                                        >
                                            <div className="space-y-2">
                                                <Label>Penerimaan</Label>
                                                <InputCombobox
                                                    name={`receipts.${index}.sales_delivery_id`}
                                                    items={receiptItems}
                                                    placeholder="Pilih penerimaan"
                                                    value={
                                                        receiptLink.sales_delivery_id
                                                    }
                                                    onValueChange={(value) =>
                                                        handleReceiptSelect(
                                                            index,
                                                            value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errorAt(
                                                        'receipts',
                                                        index,
                                                        'sales_delivery_id',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-start-2">
                                                <Label>Catatan</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        name={`receipts.${index}.note`}
                                                        value={receiptLink.note}
                                                        placeholder="Catatan (opsional)"
                                                        onChange={(e) =>
                                                            updateReceiptLink(
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
                                                            removeReceiptLink(
                                                                index,
                                                            )
                                                        }
                                                        disabled={
                                                            data.receipts
                                                                .length <= 1
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>
                                            {selectedReceipt && (
                                                <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground md:col-span-2 lg:grid-cols-3">
                                                    <div className="grid gap-1">
                                                        <span>Tanggal</span>
                                                        <span className="font-medium text-foreground">
                                                            {formatDateLocal(
                                                                selectedReceipt.date,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <span>Pemasok</span>
                                                        <span className="font-medium text-foreground">
                                                            {selectedReceipt
                                                                .contact
                                                                ?.name ?? '-'}
                                                        </span>
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <span>Nilai</span>
                                                        <span className="font-semibold text-foreground">
                                                            {formatCurrency(
                                                                toNumber(
                                                                    selectedReceipt.total,
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
                                onClick={addReceiptLink}
                            >
                                <PlusCircle /> Tambah Penerimaan
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
                                                                disabled={
                                                                    data.is_receipt
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
                                                                    data.is_receipt
                                                                }
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'qty',
                                                                )}
                                                            />
                                                            {productDefault && (
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Stok:{' '}
                                                                    {getProductStockLabel(
                                                                        detail.product_id,
                                                                        data.warehouse_id,
                                                                    )}
                                                                </p>
                                                            )}
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
                                                                    data.is_receipt
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
                                                            <div className="mt-2 font-semibold">
                                                                {formatCurrency(
                                                                    lineNet,
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-center align-top">
                                                            {!data.is_receipt && (
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
                                                                                                current,
                                                                                            ) => ({
                                                                                                ...current,
                                                                                                discount_amount:
                                                                                                    numeric.toFixed(
                                                                                                        2,
                                                                                                    ),
                                                                                            }),
                                                                                        );
                                                                                    }}
                                                                                    readOnly={
                                                                                        data.is_receipt
                                                                                    }
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
                                                                                        data.is_receipt
                                                                                    }
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
                                                                                disabled={
                                                                                    data.is_receipt
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
                                                                                        ) => (
                                                                                            <SelectItem
                                                                                                key={
                                                                                                    item.value
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
                                                                        <Label>
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
                                                                                data.is_receipt
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
                                                                                data.is_receipt
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
                                                                                data.is_receipt
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
                                                                                data.is_receipt
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
                                {!data.is_receipt ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addRow}
                                    >
                                        <PlusCircle /> Tambah Baris
                                    </Button>
                                ) : (
                                    <div
                                        className="hidden lg:block"
                                        aria-hidden="true"
                                    />
                                )}

                                <div
                                    className={`grid gap-4 rounded-md border p-4 ${
                                        data.is_receipt
                                            ? 'lg:col-span-3'
                                            : 'lg:col-span-2'
                                    } lg:ml-auto lg:w-full lg:max-w-lg`}
                                >
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
                            <Link href={purchaseInvoice.index().url}>
                                Batal
                            </Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner />
                                    Memperbarui...
                                </>
                            ) : (
                                'Perbarui Invoice'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
