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
import { usePermission } from '@/hooks/use-permission';
import AppLayout from '@/layouts/app-layout';
import dataStore from '@/routes/data-store';
import taxRoute from '@/routes/tax-data';
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
        title: 'Data Pajak',
        href: '',
    },
];

type TaxProps = {
    id: number;
    code: string;
    name: string;
    rate: string | number;
    is_active: boolean;
    sales_coa?: {
        id: number;
        code: string;
        name: string;
    } | null;
    purchase_coa?: {
        id: number;
        code: string;
        name: string;
    } | null;
};

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '15', value: '15' },
    { item: '20', value: '20' },
    { item: '25', value: '25' },
];

const formatRate = (rate: string | number) => {
    const value = typeof rate === 'string' ? parseFloat(rate) : rate;
    if (Number.isNaN(value)) return '-';
    return `${value.toFixed(2)} %`;
};

export default function TaxIndexScreen({
    taxes,
    filters,
}: {
    taxes: CursorPagination<TaxProps>;
    filters: { search: string; perPage: number };
}) {
    const { hasPermission } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const searchBounce = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 15),
    );
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTax, setSelectedTax] = useState<TaxProps | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TaxProps | null>(null);

    useEffect(() => {
        if (
            searchBounce !== filters.search ||
            Number(itemsPage) !== filters.perPage
        ) {
            router.get(
                taxRoute.index(),
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
            <Head title="Data Pajak" />

            <div className="px-5 py-6">
                <Heading
                    title="Data Pajak"
                    description="Mengelola data pajak"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <Input
                            className="text-sm lg:w-[250px]"
                            placeholder="Cari kode atau nama..."
                            autoComplete="off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="flex items-center gap-3">
                            {hasPermission(['taxes.store']) && (
                                <Button asChild>
                                    <Link href={taxRoute.create().url}>
                                        <CirclePlusIcon /> Buat Baru
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[100px] ps-4">
                                        Kode
                                    </TableHead>
                                    <TableHead className="min-w-[200px]">
                                        Nama
                                    </TableHead>
                                    <TableHead className="min-w-[120px]">
                                        Persentase Pajak
                                    </TableHead>
                                    <TableHead className="min-w-[100px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taxes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    taxes.data.map((item) => (
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
                                                {formatRate(item.rate)}
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
                                                        className="w-44"
                                                        align="end"
                                                    >
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem
                                                                onSelect={(
                                                                    event,
                                                                ) => {
                                                                    event.preventDefault();
                                                                    setSelectedTax(
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
                                                            {hasPermission([
                                                                'taxes.update',
                                                            ]) && (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={taxRoute.edit(
                                                                            item.id,
                                                                        )}
                                                                    >
                                                                        <Settings2Icon />
                                                                        Perbarui
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {hasPermission([
                                                                'taxes.destroy',
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
                                prevHref={taxes.prev_page_url}
                                nextHref={taxes.next_page_url}
                            />
                        </div>
                    </div>
                </div>

                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Detail Pajak</DialogTitle>
                            <DialogDescription>
                                Informasi pajak yang dipilih.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedTax && (
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Kode
                                    </span>
                                    <span className="font-medium">
                                        {selectedTax.code}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Nama
                                    </span>
                                    <span className="font-medium">
                                        {selectedTax.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Persentase Pajak
                                    </span>
                                    <span className="font-medium">
                                        {formatRate(selectedTax.rate)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        COA Penjualan
                                    </span>
                                    <span className="max-w-[220px] text-right font-medium">
                                        {selectedTax.sales_coa
                                            ? `${selectedTax.sales_coa.code} - ${selectedTax.sales_coa.name}`
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        COA Pembelian
                                    </span>
                                    <span className="max-w-[220px] text-right font-medium">
                                        {selectedTax.purchase_coa
                                            ? `${selectedTax.purchase_coa.code} - ${selectedTax.purchase_coa.name}`
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <span className="font-medium">
                                        {selectedTax.is_active
                                            ? 'Aktif'
                                            : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

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
                            <AlertDialogTitle>
                                Hapus data pajak?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini akan menghapus pajak dari daftar.
                                Anda yakin ingin melanjutkan?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (!deleteTarget) return;

                                    router.delete(
                                        taxRoute.destroy(deleteTarget.id),
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                setDeleteTarget(null);
                                            },
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
