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
import AppLayout from '@/layouts/app-layout';
import permissionRoute from '@/routes/permissions';
import userManagementRoute from '@/routes/user-management';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';
import { toast } from 'sonner';

type PermissionFormData = {
    name: string;
    guard_name: string;
};

const buildBreadcrumbs = (indexHref: string): BreadcrumbItem[] => [
    {
        title: 'User Management',
        href: userManagementRoute.index().url,
    },
    {
        title: 'Permission',
        href: indexHref,
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

export default function PermissionCreateScreen({
    guard,
    availableGuards,
}: {
    guard: string;
    availableGuards: string[];
}) {
    const defaultGuard = useMemo(
        () => guard || availableGuards[0] || 'web',
        [guard, availableGuards],
    );

    const { data, setData, post, processing, errors } =
        useForm<PermissionFormData>({
            name: '',
            guard_name: defaultGuard,
        });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(permissionRoute.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Permission berhasil dibuat.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat membuat permission.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={buildBreadcrumbs(permissionRoute.index().url)}>
            <Head title="Buat permission" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Permission"
                    description="Buat permission baru untuk aplikasi"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Permission"
                                description="Masukkan nama dan guard permission"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-2/3">
                                    <Label htmlFor="name">
                                        Nama Permission
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoFocus
                                        autoComplete="off"
                                        placeholder="Contoh: view reports"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2 lg:basis-1/3">
                                    <Label htmlFor="guard">Guard</Label>
                                    <Select
                                        value={data.guard_name}
                                        onValueChange={(value) =>
                                            setData('guard_name', value)
                                        }
                                    >
                                        <SelectTrigger id="guard">
                                            <SelectValue placeholder="Pilih guard" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableGuards.map((g) => (
                                                <SelectItem key={g} value={g}>
                                                    {g}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.guard_name} />
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
                            <Link href={permissionRoute.index().url}>
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
                                'Simpan Permission'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
