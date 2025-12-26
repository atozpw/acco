import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import contactData from '@/routes/contact-data';
import dataStore from '@/routes/data-store';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ContactFormData = {
    code: string;
    name: string;
    address: string;
    email: string;
    phone: string;
    avatar: File | null;
    is_customer: boolean;
    is_vendor: boolean;
    is_employee: boolean;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Data Kontak',
        href: contactData.index().url,
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

export default function KontakCreateScreen() {
    const { data, setData, post, processing, errors, reset } =
        useForm<ContactFormData>({
            code: '',
            name: '',
            address: '',
            email: '',
            phone: '',
            avatar: null,
            is_customer: false,
            is_vendor: false,
            is_employee: false,
            is_active: true,
        });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!data.avatar) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAvatarPreview(null);
            return;
        }

        const url = URL.createObjectURL(data.avatar);
        setAvatarPreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [data.avatar]);

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(contactData.store().url, {
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Kontak berhasil dibuat.',
                });
                reset();
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat membuat kontak.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat baru data kontak" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Kontak"
                    description="Buat baru data kontak"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Umum"
                                description="Masukkan nama, email dan data umum"
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
                                        placeholder="Kode kontak"
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
                                        placeholder="Masukkan nama kontak"
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Masukkan alamat email"
                                        className="h-10"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/2">
                                    <Label htmlFor="phone">Telepon</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Masukkan nomor telepon"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    autoComplete="off"
                                    placeholder="Masukkan alamat"
                                    className="dark:bg-transparent"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                />
                                <InputError message={errors.address} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Detail Kontak"
                                description="Atur avatar dan detail kontak"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-2/3">
                                    <Label htmlFor="avatar">Avatar</Label>
                                    <Input
                                        id="avatar"
                                        name="avatar"
                                        type="file"
                                        placeholder="Unggah Avatar"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setData(
                                                'avatar',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    <InputError message={errors.avatar} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label>Preview</Label>
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage
                                            src={
                                                avatarPreview ??
                                                'https://github.com/shadcn.png'
                                            }
                                            alt={data.name || 'Avatar kontak'}
                                        />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-2">
                                <Label>Jenis Kontak</Label>
                                <div className="flex max-w-2xl gap-6">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is_customer"
                                            name="is_customer"
                                            checked={data.is_customer}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_customer',
                                                    Boolean(checked),
                                                )
                                            }
                                        />
                                        <Label htmlFor="is_customer">
                                            Pelanggan
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is_vendor"
                                            name="is_vendor"
                                            checked={data.is_vendor}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_vendor',
                                                    Boolean(checked),
                                                )
                                            }
                                        />
                                        <Label htmlFor="is_vendor">
                                            Pemasok
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is_employee"
                                            name="is_employee"
                                            checked={data.is_employee}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_employee',
                                                    Boolean(checked),
                                                )
                                            }
                                        />
                                        <Label htmlFor="is_employee">
                                            Karyawan
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <div className="grid max-w-2xl gap-2">
                                <Label>Status Kontak</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        name="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_active',
                                                Boolean(checked),
                                            )
                                        }
                                    />
                                    <Label htmlFor="is_active">
                                        {data.is_active
                                            ? 'Aktif'
                                            : 'Tidak Aktif'}
                                    </Label>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mr-3"
                                    asChild
                                >
                                    <Link href={contactData.index()}>
                                        Batal
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Spinner /> Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Kontak'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
