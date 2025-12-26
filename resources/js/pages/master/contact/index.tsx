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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import contactData from '@/routes/contact-data';
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
        title: 'Data Kontak',
        href: '',
    },
];

type ContactProps = {
    id: number;
    code: string;
    name: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    is_customer: boolean;
    is_vendor: boolean;
    is_employee: boolean;
    is_active: boolean;
};

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '15', value: '15' },
    { item: '20', value: '20' },
    { item: '25', value: '25' },
];

export default function KontakIndexScreen({
    contacts,
    filters,
}: {
    contacts: CursorPagination<ContactProps>;
    filters: { search: string; perPage: number };
}) {
    const [search, setSearch] = useState(filters.search || '');
    const searchBounce = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(String(filters.perPage));
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<ContactProps | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<ContactProps | null>(null);

    useEffect(() => {
        if (
            searchBounce !== filters.search ||
            Number(itemsPage) !== filters.perPage
        ) {
            router.get(
                contactData.index(),
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
            <Head title="Data Kontak" />

            <div className="px-5 py-6">
                <Heading
                    title="Data Kontak"
                    description="Mengelola data kontak"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-sm lg:w-[250px]"
                                placeholder="Cari..."
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button asChild>
                            <Link href={contactData.create().url}>
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
                                    <TableHead className="min-w-[175px]">
                                        Tipe
                                    </TableHead>
                                    <TableHead className="min-w-[125px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contacts.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    contacts.data.map((item) => (
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
                                                    {[
                                                        item.is_customer &&
                                                            'Pelanggan',
                                                        item.is_vendor &&
                                                            'Pemasok',
                                                        item.is_employee &&
                                                            'Karyawan',
                                                    ]
                                                        .filter(Boolean)
                                                        .join(', ')}
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
                                                                    setSelectedContact(
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
                                                                    href={contactData.edit(
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
                                <AlertDialogTitle>
                                    Hapus kontak?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini akan menghapus data kontak
                                    secara soft delete. Anda masih dapat
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
                                            contactData.destroy(deleteTarget.id)
                                                .url,
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
                                setSelectedContact(null);
                            }
                        }}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Detail Kontak</DialogTitle>
                                <DialogDescription>
                                    Data kontak lengkap
                                </DialogDescription>
                            </DialogHeader>
                            {selectedContact && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-14 w-14">
                                            <AvatarImage
                                                src={
                                                    selectedContact.avatar ??
                                                    undefined
                                                }
                                                alt={
                                                    selectedContact.name ??
                                                    'Avatar kontak'
                                                }
                                            />
                                            <AvatarFallback>
                                                {selectedContact.name
                                                    ?.charAt(0)
                                                    .toUpperCase() ?? 'C'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">
                                                {selectedContact.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Kode: {selectedContact.code}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                Email
                                            </div>
                                            <div>
                                                {selectedContact.email || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                Telepon
                                            </div>
                                            <div>
                                                {selectedContact.phone || '-'}
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <div className="text-xs text-muted-foreground">
                                                Alamat
                                            </div>
                                            <div>
                                                {selectedContact.address || '-'}
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <div className="text-xs text-muted-foreground">
                                                Tipe Kontak
                                            </div>
                                            <div>
                                                {[
                                                    selectedContact.is_customer &&
                                                        'Pelanggan',
                                                    selectedContact.is_vendor &&
                                                        'Pemasok',
                                                    selectedContact.is_employee &&
                                                        'Karyawan',
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ') || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                Status
                                            </div>
                                            <div>
                                                {selectedContact.is_active
                                                    ? 'Aktif'
                                                    : 'Tidak Aktif'}
                                            </div>
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
                                prevHref={contacts.prev_page_url}
                                nextHref={contacts.next_page_url}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
