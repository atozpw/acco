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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import coa from '@/routes/coa';
import dataStore from '@/routes/data-store';
import { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CirclePlusIcon,
    MoreHorizontalIcon,
    Search,
    Settings2Icon,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: dataStore.index().url,
    },
    {
        title: 'Daftar Akun',
        href: '',
    },
];

type CoaClassificationProps = {
    id: number;
    name: string;
    type: string;
};

type CoaProps = {
    id: number;
    code: string;
    name: string;
    is_debit: boolean;
    is_cash_bank: boolean;
    is_active: boolean;
    classification?: CoaClassificationProps | null;
};

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '15', value: '15' },
    { item: '20', value: '20' },
    { item: '25', value: '25' },
];

export default function CoaIndexScreen({
    accounts,
    filters,
}: {
    accounts: CursorPagination<CoaProps>;
    filters: { search: string; perPage: number };
}) {
    const [search, setSearch] = useState(filters.search || '');
    const searchBounce = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 15),
    );
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<CoaProps | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<CoaProps | null>(null);

    useEffect(() => {
        if (
            searchBounce !== filters.search ||
            Number(itemsPage) !== filters.perPage
        ) {
            router.get(
                coa.index(),
                {
                    search: searchBounce,
                    perPage: Number(itemsPage),
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    }, [searchBounce, filters.search, itemsPage, filters.perPage]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Akun" />

            <div className="px-5 py-6">
                <Heading
                    title="Daftar Akun"
                    description="Mengelola daftar akun (Chart of Accounts)"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-sm lg:w-[250px]"
                                placeholder="Cari kode atau nama..."
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button asChild>
                            <Link href={coa.create()}>
                                <CirclePlusIcon /> Buat Baru
                            </Link>
                        </Button>
                    </div>
                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[125px] ps-4">
                                        Kode
                                    </TableHead>
                                    <TableHead className="min-w-[250px]">
                                        Nama
                                    </TableHead>
                                    <TableHead className="min-w-[200px]">
                                        Klasifikasi
                                    </TableHead>
                                    <TableHead className="min-w-[125px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    accounts.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                {item.code}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="whitespace-normal">
                                                    {item.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="whitespace-normal">
                                                    {item.classification
                                                        ?.name ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="flex items-center gap-2">
                                                    {item.is_active ? (
                                                        <>
                                                            <span className="block h-2 w-2 rounded-full bg-green-500" />
                                                            <span>Aktif</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="block h-2 w-2 rounded-full bg-red-500" />
                                                            <span>
                                                                Nonaktif
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
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
                                                                onSelect={(
                                                                    event,
                                                                ) => {
                                                                    event.preventDefault();
                                                                    setSelectedAccount(
                                                                        item,
                                                                    );
                                                                    setDetailOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <Search />
                                                                Detail
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={coa.edit(
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
                    <AlertDialog
                        open={!!deleteTarget}
                        onOpenChange={(open) => {
                            if (!open) {
                                setDeleteTarget(null);
                            }
                        }}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus akun?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini akan menghapus data akun secara
                                    soft delete. Anda masih dapat
                                    mengembalikannya dari data yang terhapus.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    onClick={() => setDeleteTarget(null)}
                                >
                                    Batal
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (!deleteTarget) return;

                                        router.delete(
                                            coa.destroy(deleteTarget.id).url,
                                            {
                                                preserveScroll: true,
                                            },
                                        );
                                        setDeleteTarget(null);
                                    }}
                                >
                                    Ya, hapus
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Dialog
                        open={detailOpen}
                        onOpenChange={(open) => {
                            setDetailOpen(open);
                            if (!open) {
                                setSelectedAccount(null);
                            }
                        }}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Detail Akun</DialogTitle>
                                <DialogDescription>
                                    Informasi lengkap akun
                                </DialogDescription>
                            </DialogHeader>
                            {selectedAccount && (
                                <div className="space-y-4 text-sm">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-1">
                                            <div className="text-xs text-muted-foreground">
                                                Kode
                                            </div>
                                            <div>{selectedAccount.code}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <div className="text-xs text-muted-foreground">
                                                Nama
                                            </div>
                                            <div>{selectedAccount.name}</div>
                                        </div>
                                    </div>
                                    <div className="grid gap-1">
                                        <div className="text-xs text-muted-foreground">
                                            Subklasifikasi
                                        </div>
                                        <div>
                                            {selectedAccount.classification
                                                ?.name ?? '-'}
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-1">
                                            <div className="text-xs text-muted-foreground">
                                                Posisi Saldo
                                            </div>
                                            <div>
                                                {selectedAccount.is_debit
                                                    ? 'Debit'
                                                    : 'Kredit'}
                                            </div>
                                        </div>
                                        <div className="grid gap-1">
                                            <div className="text-xs text-muted-foreground">
                                                Akun Kas / Bank
                                            </div>
                                            <div>
                                                {selectedAccount.is_cash_bank
                                                    ? 'Ya'
                                                    : 'Tidak'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-1">
                                        <div className="text-xs text-muted-foreground">
                                            Status
                                        </div>
                                        <div>
                                            {selectedAccount.is_active
                                                ? 'Aktif'
                                                : 'Tidak Aktif'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

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
                                    <SelectTrigger className="w-[65px]">
                                        <SelectValue
                                            aria-label={String(itemsPage)}
                                        >
                                            {itemsPage}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listPerPage.map((item, index) => (
                                            <SelectItem
                                                key={index}
                                                value={String(item.value)}
                                            >
                                                {item.item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <SimplePaginate
                                prevHref={accounts.prev_page_url}
                                nextHref={accounts.next_page_url}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
