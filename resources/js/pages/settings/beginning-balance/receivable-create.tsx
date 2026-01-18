import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import InputDatepicker from '@/components/form/input-datepicker';
import InputDecimal from '@/components/form/input-decimal';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import BeginningBalanceLayout from '@/layouts/settings/beginning-balance-layout';
import beginningBalance from '@/routes/beginning-balance';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

type ContactOption = {
    id: number;
    name: string;
};

type ReceivableFormData = {
    contact_id: string;
    coa_id: string;
    reference_no: string;
    date: string;
    amount: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: beginningBalance.index.url(),
    },
    {
        title: 'Saldo Awal',
        href: beginningBalance.receivable.index.url(),
    },
    {
        title: 'Piutang Usaha',
        href: beginningBalance.receivable.index.url(),
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

export default function BeginningBalanceReceivableCreate({
    referenceNumber,
    referenceCoa,
    contacts,
    today,
}: {
    referenceNumber: string;
    referenceCoa: number;
    contacts: ContactOption[];
    today: string;
}) {
    const contactItems: ComboboxItem[] = contacts.map((c) => ({
        value: String(c.id),
        label: c.name,
    }));

    const [formattedAmount, setFormattedAmount] = useState<string>('');

    const { data, setData, post, processing, errors } =
        useForm<ReceivableFormData>({
            contact_id: '',
            coa_id: referenceCoa ? String(referenceCoa) : '',
            reference_no: referenceNumber,
            date: today,
            amount: '',
        });

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        post(beginningBalance.receivable.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Saldo awal piutang berhasil disimpan.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat menyimpan saldo awal.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Baru Saldo Awal Piutang" />

            <BeginningBalanceLayout>
                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <HeadingSmall
                        title="Tambah Saldo Awal Piutang"
                        description="Buat baru saldo awal piutang usaha"
                    />

                    <div className="items-baseline space-y-6 lg:flex lg:space-y-0 lg:space-x-6">
                        <div className="grid gap-2 lg:basis-1/2">
                            <Label htmlFor="reference_no">No. Referensi</Label>
                            <Input
                                id="reference_no"
                                name="reference_no"
                                type="text"
                                autoComplete="off"
                                value={data.reference_no}
                                onChange={(e) =>
                                    setData('reference_no', e.target.value)
                                }
                            />
                            <InputError message={errors.reference_no} />
                        </div>
                        <div className="grid gap-2 lg:basis-1/2">
                            <Label htmlFor="date">Tanggal</Label>
                            <InputDatepicker
                                id="date"
                                defaultValue={data.date}
                                onChange={(date, iso) => setData('date', iso)}
                            />
                            <InputError message={errors.date} />
                        </div>
                    </div>

                    <div className="items-baseline space-y-6 lg:flex lg:space-y-0 lg:space-x-6">
                        <div className="grid gap-2 lg:basis-1/2">
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
                        <div className="grid gap-2 lg:basis-1/2">
                            <Label htmlFor="amount">Nilai Piutang</Label>
                            <InputDecimal
                                name="amount"
                                value={formattedAmount}
                                onValueChange={(formatted, numeric) => {
                                    setFormattedAmount(formatted);
                                    setData('amount', numeric.toFixed(2));
                                }}
                            />
                            <InputError message={errors.amount} />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="sm:w-auto"
                        >
                            <Link
                                href={beginningBalance.receivable.index.url()}
                            >
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
                                'Simpan Piutang'
                            )}
                        </Button>
                    </div>
                </form>
            </BeginningBalanceLayout>
        </AppLayout>
    );
}
