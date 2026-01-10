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
import { usePermission } from '@/hooks/use-permission';
import AppLayout from '@/layouts/app-layout';
import generalJournal from '@/routes/general-journal';
import ledger from '@/routes/ledger';
import { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CirclePlusIcon,
    MoreHorizontalIcon,
    ReceiptText,
    Search,
    Settings2,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Akuntansi',
        href: ledger.index().url,
    },
    {
        title: 'Jurnal Umum',
        href: '',
    },
];

type GeneralJournalProps = {
    id: number;
    reference_no: string;
    date: string;
    formatted_date: string | null;
    description: string;
    total_debit: string | number | null;
};

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '25', value: '25' },
    { item: '50', value: '50' },
    { item: '100', value: '100' },
];

export default function GeneralJournalIndexScreen({
    journals,
    filters,
}: {
    journals: CursorPagination<GeneralJournalProps>;
    filters: { search: string; perPage: number };
}) {
    const { hasPermission } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const searchBounce = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 15),
    );
    const [deleteTarget, setDeleteTarget] =
        useState<GeneralJournalProps | null>(null);

    const formatCurrency = (value: string | number | null) => {
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

    useEffect(() => {
        if (
            searchBounce !== filters.search ||
            Number(itemsPage) !== filters.perPage
        ) {
            router.get(
                generalJournal.index(),
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
            <Head title="Jurnal Umum" />

            <div className="px-5 py-6">
                <Heading
                    title="Jurnal Umum"
                    description="Mengelola transaksi jurnal umum"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <Input
                            className="text-sm lg:w-[250px]"
                            placeholder="Cari nomor atau deskripsi..."
                            autoComplete="off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="flex items-center gap-3">
                            {hasPermission(['general-journal.store']) && (
                                <Button asChild>
                                    <Link href={generalJournal.create().url}>
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
                                    <TableHead className="min-w-[120px] ps-4">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        No. Referensi
                                    </TableHead>
                                    <TableHead className="min-w-[220px]">
                                        Deskripsi
                                    </TableHead>
                                    <TableHead className="min-w-[140px] text-right">
                                        Nilai
                                    </TableHead>
                                    <TableHead className="w-[80px] text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                {item.formatted_date ?? '-'}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                {item.reference_no}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="line-clamp-2 whitespace-normal">
                                                    {item.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(
                                                    item.total_debit,
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
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={generalJournal.show(
                                                                        item.id,
                                                                    )}
                                                                >
                                                                    <Search />
                                                                    Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={generalJournal.voucher(
                                                                        item.id,
                                                                    )}
                                                                >
                                                                    <ReceiptText />
                                                                    Jurnal
                                                                    Voucher
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {hasPermission([
                                                                'general-journal.update',
                                                            ]) && (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={generalJournal.edit(
                                                                            item.id,
                                                                        )}
                                                                    >
                                                                        <Settings2 />
                                                                        Perbarui
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {hasPermission([
                                                                'general-journal.destroy',
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
                                prevHref={journals.prev_page_url}
                                nextHref={journals.next_page_url}
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
                            <AlertDialogTitle>
                                Hapus Jurnal Umum
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini akan menghapus jurnal umum dengan
                                nomor referensi {deleteTarget?.reference_no}{' '}
                                dari daftar. Anda yakin ingin melanjutkan?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (!deleteTarget) return;

                                    router.delete(
                                        generalJournal.destroy(deleteTarget.id),
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                toast.success('Berhasil', {
                                                    description:
                                                        'Jurnal umum berhasil dihapus.',
                                                });
                                                setDeleteTarget(null);
                                            },
                                            onError: () => {
                                                toast.error('Gagal', {
                                                    description:
                                                        'Terjadi kesalahan saat menghapus jurnal umum.',
                                                });
                                            },
                                        },
                                    );
                                }}
                            >
                                Ya, Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
