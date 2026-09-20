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
import payrollComponentData from '@/routes/payroll-component-data';
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
        title: 'Komponen Gaji',
        href: '',
    },
];

type PayrollComponentProps = {
    id: number;
    code: string;
    name: string;
    type: string;
    is_active: boolean;
    payable_coa?: { id: number; code: string; name: string } | null;
    expense_coa?: { id: number; code: string; name: string } | null;
};

const formatCoa = (
    coa?: { id: number; code: string; name: string } | null,
): string => {
    if (!coa) return 'Belum diatur';
    return `${coa.code} - ${coa.name}`;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="grid gap-1">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div>{value}</div>
    </div>
);

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '15', value: '15' },
    { item: '20', value: '20' },
    { item: '25', value: '25' },
];

export default function PayrollComponentIndexScreen({
    components,
    filters,
}: {
    components: CursorPagination<PayrollComponentProps>;
    filters: { search: string; perPage: number };
}) {
    const { hasPermission } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const searchBounce = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(
        String(filters.perPage ?? 15),
    );
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] =
        useState<PayrollComponentProps | null>(null);
    const [deleteTarget, setDeleteTarget] =
        useState<PayrollComponentProps | null>(null);

    useEffect(() => {
        if (
            searchBounce !== filters.search ||
            Number(itemsPage) !== filters.perPage
        ) {
            router.get(
                payrollComponentData.index(),
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
            <Head title="Komponen Gaji" />

            <div className="px-5 py-6">
                <Heading
                    title="Komponen Gaji"
                    description="Mengelola komponen gaji"
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
                            {hasPermission(['payroll-components.store']) && (
                                <Button asChild>
                                    <Link
                                        href={payrollComponentData.create().url}
                                    >
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
                                    <TableHead className="min-w-[150px]">
                                        Tipe
                                    </TableHead>
                                    <TableHead className="min-w-[100px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {components.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-muted-foreground text-center"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    components.data.map((item) => (
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
                                                    {item.type === 'earning'
                                                        ? 'Penghasilan'
                                                        : 'Potongan'}
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
                                                                    setSelectedComponent(
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
                                                                'payroll-components.update',
                                                            ]) && (
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={payrollComponentData.edit(
                                                                                item.id,
                                                                            )}
                                                                        >
                                                                            <Settings2Icon />
                                                                            Perbarui
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                            {hasPermission([
                                                                'payroll-components.destroy',
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
                                    Hapus Komponen
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus komponen
                                    gaji <strong>{deleteTarget?.name}</strong>?
                                    Tindakan ini tidak dapat dibatalkan.
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
                                            payrollComponentData.destroy(
                                                deleteTarget.id,
                                            ).url,
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
                                setSelectedComponent(null);
                            }
                        }}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Detail Komponen</DialogTitle>
                                <DialogDescription>
                                    Informasi lengkap komponen gaji
                                </DialogDescription>
                            </DialogHeader>
                            {selectedComponent && (
                                <div className="space-y-6 text-sm">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-1">
                                            <div className="text-muted-foreground text-xs">
                                                Kode
                                            </div>
                                            <div>{selectedComponent.code}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <div className="text-muted-foreground text-xs">
                                                Nama
                                            </div>
                                            <div>{selectedComponent.name}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <div className="text-muted-foreground text-xs">
                                                Tipe
                                            </div>
                                            <div>
                                                {selectedComponent.type ===
                                                    'earning'
                                                    ? 'Penerimaan'
                                                    : 'Potongan'}
                                            </div>
                                        </div>
                                        <div className="grid gap-1">
                                            <div className="text-muted-foreground text-xs">
                                                Status
                                            </div>
                                            <div>
                                                {selectedComponent.is_active
                                                    ? 'Aktif'
                                                    : 'Tidak Aktif'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-muted-foreground text-xs font-semibold">
                                            Akun Akuntansi
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <DetailRow
                                                label="Akun Utang (Payable)"
                                                value={formatCoa(
                                                    selectedComponent.payable_coa,
                                                )}
                                            />
                                            <DetailRow
                                                label="Akun Biaya (Expense)"
                                                value={formatCoa(
                                                    selectedComponent.expense_coa,
                                                )}
                                            />
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
                                prevHref={components.prev_page_url}
                                nextHref={components.next_page_url}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
