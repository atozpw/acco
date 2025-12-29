import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import roleRoute from '@/routes/roles';
import userManagementRoute from '@/routes/user-management';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type PermissionOption = {
    id: number;
    name: string;
    guard_name: string;
};

type RoleFormData = {
    name: string;
    guard_name: string;
    permissions: number[];
};

const buildBreadcrumbs = (indexHref: string): BreadcrumbItem[] => [
    {
        title: 'User Management',
        href: userManagementRoute.index().url,
    },
    {
        title: 'Role',
        href: indexHref,
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

export default function RoleCreateScreen({
    guard,
    availableGuards,
    permissions,
}: {
    guard: string;
    availableGuards: string[];
    permissions: PermissionOption[];
}) {
    const defaultGuard = useMemo(
        () => guard || availableGuards[0] || 'web',
        [guard, availableGuards],
    );

    const { data, setData, post, processing, errors } = useForm<RoleFormData>({
        name: '',
        guard_name: defaultGuard,
        permissions: [],
    });

    const [permissionSearch, setPermissionSearch] = useState('');

    const filteredPermissions = useMemo(
        () => permissions.filter((item) => item.guard_name === data.guard_name),
        [permissions, data.guard_name],
    );

    const visiblePermissions = useMemo(() => {
        const keyword = permissionSearch.trim().toLowerCase();

        if (!keyword) return filteredPermissions;

        return filteredPermissions.filter((item) =>
            item.name.toLowerCase().includes(keyword),
        );
    }, [filteredPermissions, permissionSearch]);

    const allVisibleSelected = useMemo(() => {
        if (visiblePermissions.length === 0) return false;

        return visiblePermissions.every((item) =>
            data.permissions.includes(item.id),
        );
    }, [visiblePermissions, data.permissions]);

    useEffect(() => {
        // Reset pilihan permission jika guard diubah.
        if (data.guard_name !== defaultGuard) {
            setData('permissions', []);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPermissionSearch('');
        }
    }, [data.guard_name, defaultGuard, setData]);

    const togglePermission = (
        permissionId: number,
        checked: boolean | 'indeterminate',
    ) => {
        if (checked === true) {
            setData(
                'permissions',
                Array.from(new Set([...data.permissions, permissionId])),
            );
        } else {
            setData(
                'permissions',
                data.permissions.filter((id) => id !== permissionId),
            );
        }
    };

    const toggleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            const merged = new Set([
                ...data.permissions,
                ...visiblePermissions.map((item) => item.id),
            ]);
            setData('permissions', Array.from(merged));
        } else {
            const toRemove = new Set(visiblePermissions.map((item) => item.id));
            setData(
                'permissions',
                data.permissions.filter((id) => !toRemove.has(id)),
            );
        }
    };

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(roleRoute.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Role berhasil dibuat.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat membuat role.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={buildBreadcrumbs(roleRoute.index().url)}>
            <Head title="Buat role" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah Role"
                    description="Buat role baru dan atur permissions"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data Role"
                                description="Masukkan nama role dan pilih guard"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="max-w-2xl items-baseline space-y-6 lg:flex lg:flex-auto lg:space-y-0 lg:space-x-6">
                                <div className="grid gap-2 lg:basis-2/3">
                                    <Label htmlFor="name">Nama Role</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoFocus
                                        autoComplete="off"
                                        placeholder="Contoh: admin, manager"
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
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <HeadingSmall
                                title="Pilih Permissions"
                                description="Centang permission yang ingin diberikan ke role ini"
                            />
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>
                                    {visiblePermissions.length} Filtered
                                </span>
                                <span className="hidden sm:inline">·</span>
                                <span>{filteredPermissions.length} Total</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Input
                                className="text-sm sm:w-[350px]"
                                placeholder="Cari permission..."
                                value={permissionSearch}
                                onChange={(e) =>
                                    setPermissionSearch(e.target.value)
                                }
                            />
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                                <Checkbox
                                    checked={allVisibleSelected}
                                    onCheckedChange={toggleSelectAll}
                                />
                                Pilih semua
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {visiblePermissions.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    Tidak ada permission sesuai pencarian atau
                                    guard ini.
                                </p>
                            ) : (
                                visiblePermissions.map((permission) => (
                                    <div key={permission.id}>
                                        <Label
                                            htmlFor={`permission-${permission.id}`}
                                            className="flex cursor-pointer items-start gap-3 rounded-lg border p-2"
                                        >
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={data.permissions.includes(
                                                    permission.id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    togglePermission(
                                                        permission.id,
                                                        checked,
                                                    )
                                                }
                                            />
                                            <div className="grid gap-1.5 font-normal">
                                                <p className="text-sm leading-none font-medium">
                                                    {permission.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Guard:{' '}
                                                    {permission.guard_name}
                                                </p>
                                            </div>
                                        </Label>
                                    </div>
                                ))
                            )}
                        </div>
                        <InputError message={errors.permissions} />
                    </div>

                    <div className="mt-8 flex items-center justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="mr-3"
                        >
                            <Link href={roleRoute.index().url}>Batal</Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Role'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
