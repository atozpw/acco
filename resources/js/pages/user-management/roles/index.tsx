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
import AppLayout from '@/layouts/app-layout';
import roleRoute from '@/routes/roles';
import userManagementRoute from '@/routes/user-management';
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
        title: 'Role',
        href: roleRoute.index().url,
    },
];

const perPageOptions: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '15', value: '15' },
    { item: '20', value: '20' },
    { item: '25', value: '25' },
];

type RoleItem = {
    id: number;
    name: string;
    guard_name: string;
    permissions_count?: number;
};

type Filters = {
    search: string;
    perPage: number;
    guard: string;
};

export default function RoleIndexScreen({
    roles,
    filters,
    availableGuards,
}: {
    roles: CursorPagination<RoleItem>;
    filters: Filters;
    availableGuards: string[];
}) {
    const [search, setSearch] = useState(filters.search || '');
    const debouncedSearch = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 15),
    );
    const [guard, setGuard] = useState<string>(
        filters.guard || availableGuards[0] || 'web',
    );
    const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);

    useEffect(() => {
        if (
            debouncedSearch !== filters.search ||
            Number(itemsPage) !== filters.perPage ||
            guard !== filters.guard
        ) {
            router.get(
                roleRoute.index(),
                {
                    search: debouncedSearch,
                    perPage: Number(itemsPage),
                    guard,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    }, [
        debouncedSearch,
        filters.search,
        itemsPage,
        filters.perPage,
        guard,
        filters.guard,
    ]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role" />

            <div className="px-5 py-6">
                <Heading
                    title="Daftar Role"
                    description="Kelola role dan jumlah permission yang dimiliki"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                className="text-sm lg:w-[240px]"
                                placeholder="Cari nama role..."
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Select
                                value={guard}
                                onValueChange={(value) => setGuard(value)}
                            >
                                <SelectTrigger className="w-[160px]">
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
                        </div>
                        <Button asChild>
                            <Link href={roleRoute.create().url}>
                                <CirclePlusIcon /> Tambah Role
                            </Link>
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[220px] ps-4">
                                        Nama Role
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        Guard
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        Jumlah Permission
                                    </TableHead>
                                    <TableHead className="text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                {item.guard_name}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                {item.permissions_count ?? 0}
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
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={roleRoute.edit(
                                                                        item.id,
                                                                    )}
                                                                >
                                                                    <Settings2Icon />
                                                                    Perbarui
                                                                </Link>
                                                            </DropdownMenuItem>
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
                                prevHref={roles.prev_page_url}
                                nextHref={roles.next_page_url}
                            />
                        </div>
                    </div>
                </div>

                <AlertDialog
                    open={Boolean(deleteTarget)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleteTarget(null);
                        }
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus role</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini akan menghapus role dari sistem.
                                Anda yakin ingin melanjutkan?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (!deleteTarget) return;

                                    router.delete(
                                        roleRoute.destroy(deleteTarget.id),
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
