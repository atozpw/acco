import Heading from '@/components/heading';
import SimplePaginate from '@/components/simple-pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDebounceValue } from '@/hooks/use-debounce';
import { usePermission } from '@/hooks/use-permission';
import AppLayout from '@/layouts/app-layout';
import userManagementRoute from '@/routes/user-management';
import userRoute from '@/routes/users';
import { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CirclePlusIcon,
    MoreHorizontalIcon,
    Settings2Icon,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: userManagementRoute.index().url,
    },
    {
        title: 'User',
        href: userRoute.index().url,
    },
];

const perPageOptions: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '15', value: '15' },
    { item: '20', value: '20' },
    { item: '25', value: '25' },
];

type UserItem = {
    id: number;
    name: string;
    username: string;
    email: string | null;
    is_active: boolean;
    roles: { id: number; name: string }[];
};

type Filters = {
    search: string;
    perPage: number;
};

export default function UserIndexScreen({
    users,
    filters,
}: {
    users: CursorPagination<UserItem>;
    filters: Filters;
}) {
    const { hasPermission } = usePermission();
    const [search, setSearch] = useState(filters.search || '');
    const debouncedSearch = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 15),
    );
    const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

    useEffect(() => {
        if (
            debouncedSearch !== filters.search ||
            Number(itemsPage) !== filters.perPage
        ) {
            router.get(
                userRoute.index(),
                {
                    search: debouncedSearch,
                    perPage: Number(itemsPage),
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    }, [debouncedSearch, filters.search, itemsPage, filters.perPage]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User" />

            <div className="px-5 py-6">
                <Heading
                    title="Daftar User"
                    description="Kelola akun pengguna dan status aktif"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-sm lg:w-[280px]"
                                placeholder="Cari nama, atau username..."
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {hasPermission(['users.store']) && (
                            <Button asChild>
                                <Link href={userRoute.create().url}>
                                    <CirclePlusIcon /> Tambah User
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[180px] ps-4">
                                        Nama
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        Username
                                    </TableHead>
                                    <TableHead className="min-w-[160px]">
                                        Role
                                    </TableHead>
                                    <TableHead className="min-w-[100px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                <div className="font-medium">
                                                    {item.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                {item.username}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                {item.roles.length === 0 ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        -
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.roles.map(
                                                            (role) => (
                                                                <Badge
                                                                    key={
                                                                        role.id
                                                                    }
                                                                    variant="secondary"
                                                                >
                                                                    {role.name}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                {item.is_active ? (
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-700">
                                                        Aktif
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-gray-200 text-gray-700 hover:bg-gray-200"
                                                    >
                                                        Nonaktif
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                <DropdownMenu modal={false}>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            aria-label="Open menu"
                                                            className="size-8"
                                                        >
                                                            <MoreHorizontalIcon />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        className="w-40"
                                                        align="end"
                                                    >
                                                        <DropdownMenuGroup>
                                                            {hasPermission([
                                                                'users.update',
                                                            ]) && (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={userRoute.edit(
                                                                            item.id,
                                                                        )}
                                                                    >
                                                                        <Settings2Icon />
                                                                        Perbarui
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {hasPermission([
                                                                'users.destroy',
                                                            ]) && (
                                                                <DropdownMenuItem
                                                                    onSelect={(
                                                                        event,
                                                                    ) => {
                                                                        event.preventDefault();
                                                                        setDeleteTarget(
                                                                            item,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Trash2 />
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end px-2">
                        <div className="flex items-center space-x-6 lg:space-x-8">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium">
                                    Rows per page
                                </p>
                                <Select
                                    value={itemsPage}
                                    onValueChange={setItemsPage}
                                >
                                    <SelectTrigger className="w-[70px]">
                                        <SelectValue
                                            aria-label={String(itemsPage)}
                                        >
                                            {itemsPage}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((item) => (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <SimplePaginate
                                prevHref={users.prev_page_url}
                                nextHref={users.next_page_url}
                            />
                        </div>
                    </div>
                </div>

                <AlertDialog
                    open={Boolean(deleteTarget)}
                    onOpenChange={(open) => {
                        if (!open) setDeleteTarget(null);
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus user</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini akan menghapus user dari sistem.
                                Anda yakin ingin melanjutkan?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (!deleteTarget) return;

                                    router.delete(
                                        userRoute.destroy(deleteTarget.id),
                                        {
                                            preserveScroll: true,
                                            onSuccess: () =>
                                                setDeleteTarget(null),
                                        },
                                    );
                                }}
                            >
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
