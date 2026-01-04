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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import payablePayment from '@/routes/payable-payment';
import purchases from '@/routes/purchases';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronDownCircle, PlusCircle, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Fragment, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ContactOption = { id: number; name: string };
type CoaOption = { id: number; code: string; name: string };
type DepartmentOption = { id: number; code: string; name: string };
type ProjectOption = { id: number; code: string; name: string };
type InvoiceOption = {
    id: number;
    contact_id: number;
    reference_no: string;
    date: string | null;
    description: string | null;
    total: string;
    paid_amount: string;
    outstanding_amount: string;
    contact?: { id: number; name: string } | null;
};

type DetailForm = {
    purchase_invoice_id: string;
    amount: string;
    note: string;
    department_id: string;
    project_id: string;
};

type FormData = {
    contact_id: string;
    coa_id: string;
    reference_no: string;
    date: string;
    description: string;
    amount: string;
    details: DetailForm[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pembelian', href: purchases.index().url },
    { title: 'Pembayaran Utang', href: payablePayment.index().url },
    { title: 'Buat Baru', href: '' },
];

const parseLocalNumber = (
    value: string | number | null | undefined,
): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    const raw = value.trim();
    if (!raw) return 0;
    const normalized = raw.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatLocalNumber = (value: number | string | null | undefined) => {
    const numeric =
        typeof value === 'string'
            ? parseLocalNumber(value)
            : Number(value ?? 0);
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(numeric) ? numeric : 0);
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

export default function PayablePaymentCreateScreen({
    referenceNumber,
    contacts,
    coas,
    departments,
    projects,
    invoices,
    today,
}: {
    referenceNumber: string;
    contacts: ContactOption[];
    coas: CoaOption[];
    departments: DepartmentOption[];
    projects: ProjectOption[];
    invoices: InvoiceOption[];
    today: string;
}) {
    const contactItems: ComboboxItem[] = contacts.map((contact) => ({
        value: String(contact.id),
        label: contact.name,
    }));

    const coaItems: ComboboxItem[] = coas.map((coa) => ({
        value: String(coa.id),
        label: `${coa.code} - ${coa.name}`,
    }));

    const departmentItems: ComboboxItem[] = departments.map((dept) => ({
        value: String(dept.id),
        label: dept.name,
    }));

    const projectItems: ComboboxItem[] = projects.map((project) => ({
        value: String(project.id),
        label: project.name,
    }));

    const defaultDepartmentId = departments[0] ? String(departments[0].id) : '';

    const initialDetail: DetailForm = {
        purchase_invoice_id: '',
        amount: formatLocalNumber(0),
        note: '',
        department_id: defaultDepartmentId,
        project_id: '',
    };

    const { data, setData, post, processing, errors, transform } =
        useForm<FormData>({
            contact_id: '',
            coa_id: coas[0] ? String(coas[0].id) : '',
            reference_no: referenceNumber,
            date: today,
            description: '',
            amount: '0.00',
            details: [{ ...initialDetail }],
        });

    const [rowExpanded, setRowExpanded] = useState<boolean[]>(() =>
        data.details.map(() => false),
    );

    const invoiceMap = useMemo(() => {
        const map: Record<string, InvoiceOption> = {};
        invoices.forEach((invoice) => {
            map[String(invoice.id)] = invoice;
        });
        return map;
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
        if (!data.contact_id) return invoices;
        return invoices.filter(
            (invoice) => String(invoice.contact_id) === data.contact_id,
        );
    }, [invoices, data.contact_id]);

    const invoiceItems: ComboboxItem[] = filteredInvoices.map((invoice) => ({
        value: String(invoice.id),
        label: invoice.reference_no,
    }));

    const totalPayment = useMemo(
        () =>
            data.details.reduce(
                (sum, detail) => sum + parseLocalNumber(detail.amount),
                0,
            ),
        [data.details],
    );

    const errorBag = errors as unknown as Record<string, string>;
    const errorAt = (base: string, index: number, field: string) => {
        return (
            errorBag[`${base}.${index}.${field}`] ??
            errorBag[`${base}.${field}`] ??
            errorBag[base]
        );
    };

    const handleContactChange = (value: string) => {
        setData((prev) => {
            const allowedInvoices = new Set(
                invoices
                    .filter(
                        (invoice) =>
                            value && String(invoice.contact_id) === value,
                    )
                    .map((invoice) => String(invoice.id)),
            );

            const nextDetails = prev.details.map((detail) => {
                if (!detail.purchase_invoice_id) return detail;
                if (!allowedInvoices.has(detail.purchase_invoice_id)) {
                    return {
                        ...detail,
                        purchase_invoice_id: '',
                        amount: formatLocalNumber(0),
                    };
                }
                return detail;
            });

            return {
                ...prev,
                contact_id: value,
                details: nextDetails.length
                    ? nextDetails
                    : [{ ...initialDetail }],
            };
        });
    };

    const handleInvoiceChange = (index: number, invoiceId: string) => {
        setData((prev) => {
            const nextDetails = prev.details.map((detail, idx) => {
                if (idx !== index) return detail;
                const invoice = invoiceMap[invoiceId];
                return {
                    ...detail,
                    purchase_invoice_id: invoiceId,
                    amount: formatLocalNumber(
                        invoice
                            ? parseFloat(invoice.outstanding_amount ?? '0') || 0
                            : 0,
                    ),
                };
            });

            return { ...prev, details: nextDetails };
        });
    };

    const updateDetail = (
        index: number,
        field: keyof DetailForm,
        value: string,
    ) => {
        setData((prev) => ({
            ...prev,
            details: prev.details.map((detail, idx) =>
                idx === index ? { ...detail, [field]: value } : detail,
            ),
        }));
    };

    const addDetailRow = () => {
        setData((prev) => ({
            ...prev,
            details: [...prev.details, { ...initialDetail }],
        }));
        setRowExpanded((prev) => [...prev, false]);
    };

    const removeDetailRow = (index: number) => {
        if (data.details.length === 1) return;
        setData((prev) => ({
            ...prev,
            details: prev.details.filter((_, idx) => idx !== index),
        }));
        setRowExpanded((prev) => prev.filter((_, idx) => idx !== index));
    };

    const toggleRow = (index: number) => {
        setRowExpanded((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        transform((form) => {
            const detailPayload = form.details
                .filter((detail) => detail.purchase_invoice_id)
                .map((detail) => ({
                    purchase_invoice_id: Number(detail.purchase_invoice_id),
                    amount: parseLocalNumber(detail.amount).toFixed(2),
                    note: detail.note || null,
                    department_id: Number(detail.department_id),
                    project_id: detail.project_id
                        ? Number(detail.project_id)
                        : null,
                }));

            const payloadAmount = detailPayload.reduce(
                (sum, detail) => sum + parseFloat(detail.amount),
                0,
            );

            return {
                ...form,
                contact_id: Number(form.contact_id),
                coa_id: Number(form.coa_id),
                amount: payloadAmount.toFixed(2),
                details: detailPayload,
            } as unknown as FormData;
        });

        post(payablePayment.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Pembayaran utang berhasil dibuat.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat menyimpan data.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Baru Pembayaran Utang" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Pembayaran Utang"
                    description="Catat pengeluaran untuk pelunasan utang usaha"
                />

                <Separator className="mb-8" />

                <form onSubmit={handleSubmit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[260px] xl:w-[320px]">
                            <HeadingSmall
                                title="Data Umum"
                                description="Lengkapi informasi utama pembayaran"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="grid items-baseline gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="reference_no">
                                        No. Referensi
                                    </Label>
                                    <Input
                                        id="reference_no"
                                        name="reference_no"
                                        value={data.reference_no}
                                        autoComplete="off"
                                        onChange={(e) =>
                                            setData(
                                                'reference_no',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.reference_no} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Tanggal</Label>
                                    <InputDatepicker
                                        id="date"
                                        defaultValue={data.date}
                                        onChange={(_, iso) =>
                                            setData('date', iso)
                                        }
                                    />
                                    <InputError message={errors.date} />
                                </div>
                            </div>
                            <div className="grid items-baseline gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Pemasok</Label>
                                    <InputCombobox
                                        name="contact_id"
                                        items={contactItems}
                                        placeholder="Pilih pemasok"
                                        value={data.contact_id}
                                        onValueChange={handleContactChange}
                                    />
                                    <InputError message={errors.contact_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Akun</Label>
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
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Tuliskan keterangan pembayaran"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="dark:bg-transparent"
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6">
                        <aside className="w-full">
                            <HeadingSmall
                                title="Detail Pembayaran"
                                description="Hubungkan faktur pembelian dan alokasikan nominalnya"
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
                                            <th className="min-w-[170px] px-4 py-2 text-left">
                                                No. Faktur
                                            </th>
                                            <th className="w-[150px] px-4 py-2 text-left">
                                                Tanggal
                                            </th>
                                            <th className="w-[200px] px-4 py-2 text-right">
                                                Jumlah/Sisa
                                            </th>
                                            <th className="w-[200px] px-4 py-2 text-right">
                                                Pembayaran
                                            </th>
                                            <th className="w-[60px] px-4 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.details.map((detail, index) => {
                                            const isExpanded =
                                                rowExpanded[index] ?? false;
                                            const selectedInvoice =
                                                detail.purchase_invoice_id
                                                    ? invoiceMap[
                                                          detail
                                                              .purchase_invoice_id
                                                      ]
                                                    : null;
                                            const outstandingValue =
                                                selectedInvoice
                                                    ? parseFloat(
                                                          selectedInvoice.outstanding_amount ??
                                                              '0',
                                                      ) || 0
                                                    : 0;

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
                                                                name={`details.${index}.purchase_invoice_id`}
                                                                items={
                                                                    invoiceItems
                                                                }
                                                                placeholder={
                                                                    data.contact_id
                                                                        ? 'Pilih faktur'
                                                                        : 'Pilih pemasok...'
                                                                }
                                                                value={
                                                                    detail.purchase_invoice_id
                                                                }
                                                                disabled={
                                                                    !data.contact_id
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    handleInvoiceChange(
                                                                        index,
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'purchase_invoice_id',
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 align-top">
                                                            <Input
                                                                name={`details.${index}.date`}
                                                                value={
                                                                    selectedInvoice?.date ??
                                                                    '-'
                                                                }
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 align-top">
                                                            <Input
                                                                name={`details.${index}.sisa`}
                                                                value={formatLocalNumber(
                                                                    selectedInvoice
                                                                        ? outstandingValue
                                                                        : 0,
                                                                )}
                                                                readOnly
                                                                className="text-right"
                                                            />
                                                            {selectedInvoice && (
                                                                <div className="mt-1 text-xs text-muted-foreground">
                                                                    <p>
                                                                        Nilai
                                                                        faktur:{' '}
                                                                    </p>
                                                                    <p className="font-semibold text-foreground">
                                                                        {formatCurrency(
                                                                            parseFloat(
                                                                                selectedInvoice?.total ??
                                                                                    '0',
                                                                            ) ||
                                                                                0,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-top">
                                                            <InputDecimal
                                                                name={`details.${index}.amount`}
                                                                value={
                                                                    detail.amount
                                                                }
                                                                onValueChange={(
                                                                    formatted,
                                                                ) =>
                                                                    updateDetail(
                                                                        index,
                                                                        'amount',
                                                                        formatted,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={errorAt(
                                                                    'details',
                                                                    index,
                                                                    'amount',
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-center align-top">
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={() =>
                                                                    removeDetailRow(
                                                                        index,
                                                                    )
                                                                }
                                                                aria-label="Hapus baris"
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
                                                                                    'note',
                                                                                    e
                                                                                        .target
                                                                                        .value,
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
                                                                            value={
                                                                                detail.department_id
                                                                            }
                                                                            placeholder="Pilih departemen"
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    'department_id',
                                                                                    value,
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
                                                                            value={
                                                                                detail.project_id
                                                                            }
                                                                            placeholder="Pilih proyek (Opsional)"
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    'project_id',
                                                                                    value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <InputError
                                                                            message={errorAt(
                                                                                'details',
                                                                                index,
                                                                                'project_id',
                                                                            )}
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
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addDetailRow}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Baris
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-md border p-4 md:ml-auto md:max-w-xl">
                        <div className="flex items-center justify-between text-sm">
                            <span>Jumlah Faktur</span>
                            <span className="font-semibold">
                                {data.details.length}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-base">
                            <span>Total Pembayaran</span>
                            <span className="font-bold">
                                {formatCurrency(totalPayment)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="mr-3"
                        >
                            <Link href={payablePayment.index().url}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Pembayaran'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
