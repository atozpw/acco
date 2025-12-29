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
import userManagementRoute from '@/routes/user-management';
import userRoute from '@/routes/users';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

type RoleOption = {
    id: number;
    name: string;
};

type UserFormData = {
    name: string;
    username: string;
    email: string;
    password: string;
    is_active: boolean;
    roles: number[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: userManagementRoute.index().url,
    },
    {
        title: 'User',
        href: userRoute.index().url,
    },
    {
        title: 'Buat Baru',
        href: '',
    },
];

export default function UserCreateScreen({ roles }: { roles: RoleOption[] }) {
    const { data, setData, post, processing, errors, reset } =
        useForm<UserFormData>({
            name: '',
            username: '',
            email: '',
            password: '',
            is_active: true,
            roles: [],
        });

    const toggleRole = (roleId: number, checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setData('roles', Array.from(new Set([...data.roles, roleId])));
        } else {
            setData(
                'roles',
                data.roles.filter((id) => id !== roleId),
            );
        }
    };

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(userRoute.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'User berhasil dibuat.',
                });
                reset('password');
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat membuat user.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat user" />

            <div className="px-5 py-6">
                <Heading
                    title="Tambah User"
                    description="Buat akun pengguna dan atur perannya"
                />

                <Separator className="mb-8" />
                <form onSubmit={submit} className="space-y-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-[250px] xl:w-[350px] 2xl:w-md">
                            <HeadingSmall
                                title="Data User"
                                description="Isi identitas, kredensial, dan status user"
                            />
                        </aside>
                        <Separator className="my-6 lg:hidden" />
                        <div className="flex-1 space-y-6 md:max-w-2xl">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoFocus
                                        autoComplete="off"
                                        placeholder="Nama pengguna"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="username"
                                        value={data.username}
                                        onChange={(e) =>
                                            setData('username', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.username} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="off"
                                        placeholder="email@contoh.com"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Minimal 8 karakter"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                                    <div>
                                        <Label htmlFor="is_active">
                                            Status
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Nonaktifkan untuk mencegah user
                                            login.
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
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Pilih Roles</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Berikan role untuk mengatur akses.
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {roles.length} tersedia
                                    </span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {roles.length === 0 && (
                                        <p className="col-span-2 text-sm text-muted-foreground">
                                            Belum ada role yang tersedia.
                                        </p>
                                    )}
                                    {roles.map((role) => (
                                        <label
                                            key={role.id}
                                            className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/60"
                                        >
                                            <Checkbox
                                                checked={data.roles.includes(
                                                    role.id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    toggleRole(role.id, checked)
                                                }
                                            />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    {role.name}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.roles} />
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
                            <Link href={userRoute.index().url}>Batal</Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan User'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
