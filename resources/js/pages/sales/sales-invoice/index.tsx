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
import sales from '@/routes/sales';
import salesInvoice from '@/routes/sales-invoice';
import { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CirclePlusIcon,
    MoreHorizontalIcon,
    Search,
    Settings2,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type InvoiceContact = {
    id: number;
    name: string;
};

type InvoiceProps = {
    id: number;
    reference_no: string;
    date: string;
    formatted_date: string | null;
    description: string;
    total: string | number;
    contact?: InvoiceContact | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Invoice Penjualan', href: '' },
];

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '25', value: '25' },
    { item: '50', value: '50' },
    { item: '100', value: '100' },
];

const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    const numeric =
        typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(numeric)) return '-';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numeric);
};

export default function SalesInvoiceIndexScreen({
    invoices,
    filters,
}: {
    invoices: CursorPagination<InvoiceProps>;
    filters: { search: string; perPage: number };
}) {
    const [search, setSearch] = useState(filters.search || '');
    const searchBounce = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 25),
    );
    const [deleteTarget, setDeleteTarget] = useState<InvoiceProps | null>(null);

    useEffect(() => {
        if (
            searchBounce !== filters.search ||
            Number(itemsPage) !== filters.perPage
        ) {
            router.get(
                salesInvoice.index(),
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

    const handleDelete = () => {
        if (!deleteTarget) return;

        router.delete(salesInvoice.destroy(deleteTarget.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Invoice berhasil dihapus.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Terjadi kesalahan saat menghapus invoice.',
                });
            },
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoice Penjualan" />

            <div className="px-5 py-6">
                <Heading
                    title="Invoice Penjualan"
                    description="Mengelola data invoice penjualan"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-sm lg:w-[250px]"
                                placeholder="Cari ..."
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button asChild>
                            <Link href={salesInvoice.create().url}>
                                <CirclePlusIcon /> Buat Baru
                            </Link>
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[120px] ps-4">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="min-w-[160px]">
                                        No. Invoice
                                    </TableHead>
                                    <TableHead className="min-w-[200px]">
                                        Nama Pelanggan
                                    </TableHead>
                                    <TableHead className="min-w-[240px]">
                                        Deskripsi
                                    </TableHead>
                                    <TableHead className="min-w-[140px] text-right">
                                        Nilai
                                    </TableHead>
                                    <TableHead className="w-[80px] text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                {item.formatted_date ?? '-'}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                {item.reference_no}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="whitespace-normal">
                                                    {item.contact?.name ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="line-clamp-2 whitespace-normal">
                                                    {item.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(item.total)}
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
                                                                    href={
                                                                        salesInvoice.show(
                                                                            item.id,
                                                                        ).url
                                                                    }
                                                                >
                                                                    <Search />
                                                                    Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={
                                                                        salesInvoice.edit(
                                                                            item.id,
                                                                        ).url
                                                                    }
                                                                >
                                                                    <Settings2 />
                                                                    Perbarui
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
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
                                prevHref={invoices.prev_page_url}
                                nextHref={invoices.next_page_url}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Hapus Invoice Penjualan
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus data invoice penjualan.
                            Anda yakin ingin melanjutkan?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
