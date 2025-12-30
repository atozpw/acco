import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import coa from '@/routes/coa';
import dataStore from '@/routes/data-store';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';
import type { CoaClassificationProps, CoaParentProps } from './create';

type CoaProps = {
    id: number;
    parent_id: number | null;
    code: string;
    name: string;
    coa_classification_id: number;
    is_debit: boolean;
    is_cash_bank: boolean;
    is_active: boolean;
};

type CoaFormData = {
    parent_id: string;
    code: string;
    name: string;
    coa_classification_id: string;
    is_debit: boolean;
    is_cash_bank: boolean;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Daftar Akun',
        href: coa.index().url,
    },
    {
        title: 'Perbarui',
        href: '',
    },
];

export default function CoaEditScreen({
    account,
    parents,
    classifications,
}: {
    account: CoaProps;
    parents: CoaParentProps[];
    classifications: CoaClassificationProps[];
}) {
    const parentItems: ComboboxItem[] = parents.map((p) => ({
        value: String(p.id),
        label: `${p.code} - ${p.name}`,
    }));

    const classificationItems: ComboboxItem[] = classifications.map((c) => ({
        value: String(c.id),
        label: c.name,
    }));

    const { data, setData, put, processing, errors } = useForm<CoaFormData>({
        parent_id: account.parent_id ? String(account.parent_id) : '',
        code: account.code ?? '',
        name: account.name ?? '',
        coa_classification_id: String(account.coa_classification_id),
        is_debit: Boolean(account.is_debit),
        is_cash_bank: Boolean(account.is_cash_bank),
        is_active: Boolean(account.is_active),
    });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        put(coa.update(account.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Akun berhasil diperbarui.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat memperbarui akun.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui data akun" />

            <div className="px-5 py-6">
                <Heading
                    title="Perbarui Akun"
                    description="Memperbarui data akun"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Umum"
                                description="Perbarui kode, nama, dan klasifikasi akun"
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
                                        placeholder="Kode akun"
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
                                        placeholder="Masukkan nama akun"
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
                                    <Label htmlFor="parent_id">
                                        Akun Induk (opsional)
                                    </Label>
                                    <InputCombobox
                                        name="parent_id"
                                        items={parentItems}
                                        placeholder="Pilih akun induk"
                                        value={data.parent_id}
                                        onValueChange={(value) =>
                                            setData('parent_id', value)
                                        }
                                    />
                                    <InputError message={errors.parent_id} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label htmlFor="coa_classification_id">
                                        Klasifikasi
                                    </Label>
                                    <InputCombobox
                                        name="coa_classification_id"
                                        items={classificationItems}
                                        placeholder="Pilih klasifikasi"
                                        value={data.coa_classification_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'coa_classification_id',
                                                value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.coa_classification_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Pengaturan"
                                description="Atur posisi debit/kredit, kas bank dan status aktif"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="grid max-w-2xl gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_debit">
                                            Posisi Saldo
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Aktifkan untuk akun saldo debit,
                                            nonaktifkan untuk saldo kredit.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            Kredit
                                        </span>
                                        <Switch
                                            id="is_debit"
                                            checked={data.is_debit}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_debit',
                                                    Boolean(checked),
                                                )
                                            }
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            Debit
                                        </span>
                                    </div>
                                    <InputError message={errors.is_debit} />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_cash_bank">
                                            Akun Kas / Bank
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Tandai jika akun ini merupakan kas
                                            atau bank.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is_cash_bank"
                                            checked={data.is_cash_bank}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_cash_bank',
                                                    Boolean(checked),
                                                )
                                            }
                                        />
                                    </div>
                                    <InputError message={errors.is_cash_bank} />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active">
                                            Status
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Tentukan apakah akun ini aktif
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
                            type="button"
                            variant="outline"
                            className="mr-3"
                            asChild
                        >
                            <Link href={coa.index()}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner /> Menyimpan...
                                </>
                            ) : (
                                'Perbarui Akun'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
