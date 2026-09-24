import type { ComboboxItem } from '@/components/form/input-combobox';
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
import payrollPeriods from '@/routes/payroll-periods';
import { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    MoreHorizontalIcon,
    RotateCcw,
    Search,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import GeneratePeriodDialog from '../payroll-formulas/partials/generate-period-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penggajian',
        href: payrollPeriods.index().url,
    },
    {
        title: 'Daftar Gaji & Tunjangan',
        href: payrollPeriods.index().url,
    },
];

type PeriodCategory = {
    id: number;
    code: string;
    name: string;
};

type PayrollPeriodProps = {
    id: number;
    payroll_category_id: number;
    reference_no: string;
    date: string;
    formatted_date?: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string;
    total_amount?: string | number;
    created_at: string;
    category?: PeriodCategory | null;
};

type PayrollPeriodFilters = {
    search?: string;
    perPage?: number;
};

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '25', value: '25' },
    { item: '50', value: '50' },
    { item: '100', value: '100' },
];

export default function Index({
    periods,
    filters,
    payrollCategories = [],
    referenceNo,
    today,
}: {
    periods: CursorPagination<PayrollPeriodProps>;
    filters: PayrollPeriodFilters;
    payrollCategories?: PeriodCategory[];
    referenceNo?: string;
    today?: string;
}) {
    const { hasPermission } = usePermission();

    const filtersSearch = filters?.search || '';
    const filtersPerPage = filters?.perPage || 25;

    const [search, setSearch] = useState<string>(filtersSearch);
    const searchBounce = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(String(filtersPerPage));
    const [deleteTarget, setDeleteTarget] = useState<PayrollPeriodProps | null>(
        null,
    );
    const [generateDialogOpen, setGenerateDialogOpen] =
        useState<boolean>(false);

    const payrollCategoryItems: ComboboxItem[] = useMemo(
        () =>
            payrollCategories.map((c) => ({
                value: String(c.id),
                label: `${c.code} - ${c.name}`,
            })),
        [payrollCategories],
    );

    const queryHasChanged = useMemo(() => {
        return (
            searchBounce !== filtersSearch ||
            Number(itemsPage) !== filtersPerPage
        );
    }, [searchBounce, filtersSearch, itemsPage, filtersPerPage]);

    useEffect(() => {
        if (!queryHasChanged) return;

        const query: Record<string, string | number> = {
            search: searchBounce,
            perPage: Number(itemsPage),
        };

        router.get(payrollPeriods.index().url, query, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [queryHasChanged, searchBounce, itemsPage]);

    const formatCurrency = (value: string | number | null | undefined) => {
        if (value === null || value === undefined) return '-';
        const numeric =
            typeof value === 'string' ? parseFloat(value) : Number(value);
        if (Number.isNaN(numeric)) return '-';

        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numeric);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Gaji & Tunjangan" />

            <div className="px-5 py-6">
                <Heading
                    title="Daftar Gaji dan Tunjangan"
                    description="Kelola dan pantau seluruh periode dan daftar gaji karyawan"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-sm lg:w-[280px]"
                                placeholder="Cari nomor atau keterangan..."
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            {search && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearch('')}
                                >
                                    <RotateCcw className="size-4" /> Reset
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {hasPermission(['payroll-periods.store']) && (
                                <Button
                                    variant="outline"
                                    onClick={() => setGenerateDialogOpen(true)}
                                >
                                    <Sparkles />
                                    Buat Daftar Gaji
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[180px]">
                                        Nomor
                                    </TableHead>
                                    <TableHead className="w-[140px]">
                                        Tanggal
                                    </TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="w-[180px] text-right">
                                        Nilai (Rp)
                                    </TableHead>
                                    <TableHead className="w-[80px]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {periods.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            Belum ada data periode penggajian.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    periods.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-foreground">
                                                {item.reference_no}
                                            </TableCell>
                                            <TableCell>
                                                {item.formatted_date ||
                                                    item.date ||
                                                    '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="line-clamp-1 max-w-[400px]">
                                                    {item.description || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(
                                                    item.total_amount,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontalIcon />
                                                            <span className="sr-only">
                                                                Aksi
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        className="w-36"
                                                        align="end"
                                                    >
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={
                                                                        payrollPeriods.show(
                                                                            item.id,
                                                                        ).url
                                                                    }
                                                                >
                                                                    <Search />
                                                                    Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {hasPermission([
                                                                'payroll-periods.destroy',
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
                                prevHref={periods.prev_page_url}
                                nextHref={periods.next_page_url}
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
                            <AlertDialogTitle>
                                Hapus Periode Penggajian
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini akan menghapus data periode
                                penggajian{' '}
                                <span className="font-semibold text-foreground">
                                    {deleteTarget?.reference_no}
                                </span>{' '}
                                beserta seluruh rincian daftar gaji di dalamnya.
                                Anda yakin ingin melanjutkan?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (!deleteTarget) return;

                                    router.delete(
                                        payrollPeriods.destroy(deleteTarget.id)
                                            .url,
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                toast.success('Berhasil', {
                                                    description:
                                                        'Periode penggajian berhasil dihapus.',
                                                });
                                                setDeleteTarget(null);
                                            },
                                            onError: () => {
                                                toast.error('Gagal', {
                                                    description:
                                                        'Terjadi kesalahan saat menghapus data periode penggajian.',
                                                });
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

                <GeneratePeriodDialog
                    open={generateDialogOpen}
                    onOpenChange={setGenerateDialogOpen}
                    payrollCategoryItems={payrollCategoryItems}
                    referenceNo={referenceNo}
                    today={today}
                />
            </div>
        </AppLayout>
    );
}
