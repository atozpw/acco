import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import InputDatepicker from '@/components/form/input-datepicker';
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
import payrollPayments from '@/routes/payroll-payments';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Fragment, useMemo, useState } from 'react';
import { toast } from 'sonner';
import PayrollDetailDialog, {
    type PayrollDetailPayload,
} from './partials/payroll-detail-dialog';

type CoaOption = { id: number; code: string; name: string };
type DepartmentOption = { id: number; code: string; name: string };
type ProjectOption = { id: number; code: string; name: string };

type PayrollOption = {
    id: number;
    contact?: { id: number; name: string } | null;
    department?: { id: number; code: string; name: string } | null;
    project?: { id: number; code: string; name: string } | null;
    earning_amount: string | number;
    deduction_amount: string | number;
    total_amount: string | number;
};

type PeriodOption = {
    id: number;
    payroll_category_id: number;
    reference_no: string;
    date: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
    category?: { id: number; name: string } | null;
    total_amount: number;
    total_earning: number;
    total_deduction: number;
    payrolls_count?: number;
    payrolls?: PayrollOption[];
};

type FormData = {
    payroll_periode_id: string;
    coa_id: string;
    department_id: string;
    project_id: string;
    reference_no: string;
    date: string;
    description: string;
    amount: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penggajian', href: payrollPayments.index().url },
    { title: 'Pembayaran', href: payrollPayments.index().url },
    { title: 'Buat Baru', href: '' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

export default function PayrollPaymentCreateScreen({
    referenceNumber,
    periodes,
    coas,
    departments,
    projects,
    today,
}: {
    referenceNumber: string;
    periodes: PeriodOption[];
    coas: CoaOption[];
    departments: DepartmentOption[];
    projects: ProjectOption[];
    today: string;
}) {
    const periodItems: ComboboxItem[] = periodes.map((period) => ({
        value: String(period.id),
        label: `${period.reference_no} - ${period.description}`,
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

    const { data, setData, post, processing, errors, transform } =
        useForm<FormData>({
            payroll_periode_id: '',
            coa_id: coas[0] ? String(coas[0].id) : '',
            department_id: defaultDepartmentId,
            project_id: '',
            reference_no: referenceNumber,
            date: today,
            description: '',
            amount: 0,
        });

    const periodMap = useMemo(() => {
        const map: Record<string, PeriodOption> = {};
        periodes.forEach((period) => {
            map[String(period.id)] = period;
        });
        return map;
    }, [periodes]);

    const selectedPeriod = useMemo(() => {
        return data.payroll_periode_id
            ? periodMap[data.payroll_periode_id]
            : null;
    }, [data.payroll_periode_id, periodMap]);

    const handlePeriodChange = (value: string) => {
        const period = periodMap[value];
        setData((prev) => {
            const nextAmount = period ? period.total_amount : 0;

            const nextDescription =
                !prev.description.trim() ||
                prev.description.startsWith('Pembayaran gaji periode')
                    ? period
                        ? `Pembayaran gaji periode ${period.reference_no}`
                        : ''
                    : prev.description;

            return {
                ...prev,
                payroll_periode_id: value,
                amount: nextAmount,
                description: nextDescription,
            };
        });
    };

    const [loadingPayrollId, setLoadingPayrollId] = useState<number | null>(
        null,
    );
    const [selectedPayrollDetail, setSelectedPayrollDetail] =
        useState<PayrollDetailPayload | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] =
        useState<boolean>(false);

    const handleOpenPayrollDetail = async (payrollId: number) => {
        setLoadingPayrollId(payrollId);
        try {
            const response = await fetch(
                payrollPayments.payroll(payrollId).url,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil data rincian gaji');
            }

            const detailData: PayrollDetailPayload = await response.json();
            setSelectedPayrollDetail(detailData);
            setIsDetailDialogOpen(true);
        } catch {
            toast.error('Gagal', {
                description: 'Terjadi kesalahan saat mengambil rincian gaji.',
            });
        } finally {
            setLoadingPayrollId(null);
        }
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        transform(
            (form) =>
                ({
                    ...form,
                    payroll_periode_id: Number(form.payroll_periode_id),
                    coa_id: Number(form.coa_id),
                    department_id: Number(form.department_id),
                    project_id: form.project_id
                        ? Number(form.project_id)
                        : null,
                    amount: form.amount,
                }) as unknown as FormData,
        );

        post(payrollPayments.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Pembayaran gaji berhasil dibuat.',
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
            <Head title="Buat Baru Pembayaran Gaji" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Pembayaran Gaji"
                    description="Catat pengeluaran untuk pembayaran gaji karyawan"
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
                                    <Label>Periode Gaji</Label>
                                    <InputCombobox
                                        name="payroll_periode_id"
                                        items={periodItems}
                                        placeholder="Pilih periode gaji"
                                        value={data.payroll_periode_id}
                                        onValueChange={handlePeriodChange}
                                    />
                                    <InputError
                                        message={errors.payroll_periode_id}
                                    />
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
                            <div className="grid items-baseline gap-6 md:grid-cols-2">
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
                                    <InputError
                                        message={errors.department_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Proyek</Label>
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
                                description="Hubungkan periode gaji dan periksa rincian pembayaran"
                            />
                        </aside>
                        <Separator className="lg:hidden" />
                        <div className="flex-1 space-y-6">
                            <div className="overflow-hidden rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="w-[50px] px-4 py-2 text-center">
                                                #
                                            </th>
                                            <th className="min-w-[170px] px-4 py-2 text-left">
                                                Nama Karyawan
                                            </th>
                                            <th className="px-4 py-2 text-left">
                                                Departemen
                                            </th>
                                            <th className="px-4 py-2 text-left">
                                                Proyek
                                            </th>
                                            <th className="px-4 py-2 text-right">
                                                Penghasilan (Rp)
                                            </th>
                                            <th className="px-4 py-2 text-right">
                                                Potongan (Rp)
                                            </th>
                                            <th className="px-4 py-2 text-right">
                                                Total (Rp)
                                            </th>
                                            <th className="w-[60px] px-4 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!selectedPeriod ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    Silakan pilih periode gaji
                                                    pada Data Umum untuk melihat
                                                    rincian pembayaran.
                                                </td>
                                            </tr>
                                        ) : (
                                            <Fragment>
                                                {selectedPeriod.payrolls &&
                                                selectedPeriod.payrolls.length >
                                                    0 ? (
                                                    selectedPeriod.payrolls.map(
                                                        (payroll, index) => (
                                                            <tr
                                                                key={index}
                                                                className="border-t"
                                                            >
                                                                <td className="px-4 py-2 text-center">
                                                                    {index + 1}
                                                                </td>
                                                                <td className="px-4 py-2 text-left">
                                                                    {
                                                                        payroll
                                                                            .contact
                                                                            ?.name
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2 text-left">
                                                                    {payroll
                                                                        .department
                                                                        ?.name ??
                                                                        '-'}
                                                                </td>
                                                                <td className="px-4 py-2 text-left">
                                                                    {payroll
                                                                        .project
                                                                        ?.name ??
                                                                        '-'}
                                                                </td>
                                                                <td className="px-4 py-2 text-right">
                                                                    {formatCurrency(
                                                                        Number(
                                                                            payroll.earning_amount,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-right">
                                                                    {formatCurrency(
                                                                        Number(
                                                                            payroll.deduction_amount,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-right">
                                                                    {formatCurrency(
                                                                        Number(
                                                                            payroll.total_amount,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        title="Buka rincian gaji"
                                                                        disabled={
                                                                            loadingPayrollId ===
                                                                            payroll.id
                                                                        }
                                                                        onClick={() =>
                                                                            handleOpenPayrollDetail(
                                                                                payroll.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        {loadingPayrollId ===
                                                                        payroll.id ? (
                                                                            <Spinner className="h-4 w-4" />
                                                                        ) : (
                                                                            <Search className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={8}
                                                            className="py-8 text-center text-muted-foreground"
                                                        >
                                                            Daftar gaji tidak
                                                            tercatat pada
                                                            periode ini.
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid gap-6 lg:grid-cols-3 lg:items-baseline">
                                <div className="text-xs text-muted-foreground">
                                    * Nominal pembayaran otomatis terisi sesuai
                                    dengan{' '}
                                    <span className="font-semibold">
                                        Total Pembayaran
                                    </span>{' '}
                                    periode yang dipilih.
                                </div>
                                <div className="grid gap-4 rounded-md border p-4 lg:col-span-2 lg:ml-auto lg:w-full lg:max-w-lg">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Jumlah Karyawan</span>
                                        <span className="font-semibold">
                                            {selectedPeriod
                                                ? (selectedPeriod.payrolls
                                                      ?.length ??
                                                  selectedPeriod.payrolls_count ??
                                                  0)
                                                : 0}{' '}
                                            Orang
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Total Penghasilan</span>
                                        <span className="font-semibold">
                                            {formatCurrency(
                                                Number(
                                                    selectedPeriod?.total_earning ??
                                                        0,
                                                ),
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Total Potongan</span>
                                        <span className="font-semibold text-destructive">
                                            -{' '}
                                            {formatCurrency(
                                                Number(
                                                    selectedPeriod?.total_deduction ??
                                                        0,
                                                ),
                                            )}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between text-base">
                                        <span>Total Pembayaran</span>
                                        <span className="font-semibold">
                                            {formatCurrency(
                                                Number(data.amount),
                                            )}
                                        </span>
                                    </div>
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
                            <Link href={payrollPayments.index().url}>
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
                                'Simpan Pembayaran'
                            )}
                        </Button>
                    </div>
                </form>

                <PayrollDetailDialog
                    open={isDetailDialogOpen}
                    onOpenChange={setIsDetailDialogOpen}
                    payroll={selectedPayrollDetail}
                />
            </div>
        </AppLayout>
    );
}
