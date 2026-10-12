import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import payrollFormulas from '@/routes/payroll-formulas';
import { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CirclePlusIcon,
    ListFilterPlus,
    MoreHorizontalIcon,
    RotateCcw,
    Search,
    Settings2,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import GeneratePeriodDialog from './partials/generate-period-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penggajian',
        href: payrollFormulas.index().url,
    },
    {
        title: 'Perhitungan',
        href: '',
    },
];

type OptionItem = {
    id: number;
    code?: string;
    name: string;
};

type FormulaCategory = {
    id: number;
    code: string;
    name: string;
};

type FormulaContact = {
    id: number;
    name: string;
};

type FormulaDepartment = {
    id: number;
    code: string;
    name: string;
};

type FormulaProject = {
    id: number;
    code: string;
    name: string;
};

type PayrollFormulaProps = {
    id: number;
    payroll_category_id: number;
    contact_id: number;
    department_id: number;
    project_id: number | null;
    earning_amount: string | number;
    deduction_amount: string | number;
    total_amount: string | number;
    created_at: string;
    category?: FormulaCategory | null;
    contact?: FormulaContact | null;
    department?: FormulaDepartment | null;
    project?: FormulaProject | null;
};

type PayrollFormulaFilters = {
    search?: string;
    perPage?: number;
    payroll_category_id?: number | string | null;
    department_id?: number | string | null;
    project_id?: number | string | null;
};

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '25', value: '25' },
    { item: '50', value: '50' },
    { item: '100', value: '100' },
];

export default function PayrollFormulaIndexScreen({
    formulas,
    payrollCategories = [],
    departments = [],
    projects = [],
    referenceNo = '',
    today = '',
    filters,
}: {
    formulas: CursorPagination<PayrollFormulaProps>;
    payrollCategories?: OptionItem[];
    departments?: OptionItem[];
    projects?: OptionItem[];
    referenceNo?: string;
    today?: string;
    filters: PayrollFormulaFilters;
}) {
    const { hasPermission } = usePermission();

    const payrollCategoryItems: ComboboxItem[] = useMemo(
        () =>
            payrollCategories.map((c) => ({
                value: String(c.id),
                label: c.code ? `${c.code} - ${c.name}` : c.name,
            })),
        [payrollCategories],
    );

    const departmentItems: ComboboxItem[] = useMemo(
        () =>
            departments.map((d) => ({
                value: String(d.id),
                label: d.code ? `${d.code} - ${d.name}` : d.name,
            })),
        [departments],
    );

    const projectItems: ComboboxItem[] = useMemo(
        () =>
            projects.map((p) => ({
                value: String(p.id),
                label: p.code ? `${p.code} - ${p.name}` : p.name,
            })),
        [projects],
    );

    const filtersSearch = filters.search ?? '';
    const filtersPerPage = filters.perPage ?? 25;
    const filtersPayrollCategory = filters.payroll_category_id
        ? String(filters.payroll_category_id)
        : '';
    const filtersDepartment = filters.department_id
        ? String(filters.department_id)
        : '';
    const filtersProject = filters.project_id ? String(filters.project_id) : '';

    const [search, setSearch] = useState<string>(filtersSearch);
    const searchBounce = useDebounceValue(search, 300);
    const [itemsPage, setItemsPage] = useState<string>(String(filtersPerPage));
    const [payrollCategoryId, setPayrollCategoryId] = useState<string>(
        filtersPayrollCategory,
    );
    const [departmentId, setDepartmentId] = useState<string>(filtersDepartment);
    const [projectId, setProjectId] = useState<string>(filtersProject);
    const [filtersDialogOpen, setFiltersDialogOpen] = useState<boolean>(false);
    const [generateDialogOpen, setGenerateDialogOpen] =
        useState<boolean>(false);

    const [deleteTarget, setDeleteTarget] =
        useState<PayrollFormulaProps | null>(null);

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

    const isFiltered = Boolean(payrollCategoryId || departmentId || projectId);

    const queryHasChanged = useMemo(() => {
        return (
            searchBounce !== filtersSearch ||
            Number(itemsPage) !== filtersPerPage ||
            payrollCategoryId !== filtersPayrollCategory ||
            departmentId !== filtersDepartment ||
            projectId !== filtersProject
        );
    }, [
        searchBounce,
        filtersSearch,
        itemsPage,
        filtersPerPage,
        payrollCategoryId,
        filtersPayrollCategory,
        departmentId,
        filtersDepartment,
        projectId,
        filtersProject,
    ]);

    useEffect(() => {
        if (!queryHasChanged) return;

        const query: Record<string, string | number> = {
            search: searchBounce,
            perPage: Number(itemsPage),
        };

        if (payrollCategoryId) {
            query.payroll_category_id = Number(payrollCategoryId);
        }
        if (departmentId) {
            query.department_id = Number(departmentId);
        }
        if (projectId) {
            query.project_id = Number(projectId);
        }

        router.get(payrollFormulas.index(), query, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [
        queryHasChanged,
        searchBounce,
        itemsPage,
        payrollCategoryId,
        departmentId,
        projectId,
    ]);

    const resetFilters = () => {
        setFiltersDialogOpen(false);
        setSearch('');
        setItemsPage('25');
        setPayrollCategoryId('');
        setDepartmentId('');
        setProjectId('');

        router.get(
            payrollFormulas.index(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perhitungan" />

            <div className="px-5 py-6">
                <Heading
                    title="Perhitungan"
                    description="Mengelola data perhitungan gaji karyawan"
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

                            <Dialog
                                open={filtersDialogOpen}
                                onOpenChange={setFiltersDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        aria-label="Filters"
                                        variant={
                                            filtersDialogOpen || isFiltered
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        <ListFilterPlus />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[350px]">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Filter Perhitungan
                                        </DialogTitle>
                                        <DialogDescription>
                                            Gunakan filter untuk mempersempit
                                            hasil pencarian.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>Kategori Gaji</Label>
                                            <InputCombobox
                                                name="payroll_category_selected"
                                                placeholder="Pilih kategori gaji"
                                                value={payrollCategoryId}
                                                onValueChange={(value) =>
                                                    setPayrollCategoryId(value)
                                                }
                                                items={payrollCategoryItems}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Departemen</Label>
                                            <InputCombobox
                                                name="department_selected"
                                                placeholder="Pilih departemen"
                                                value={departmentId}
                                                onValueChange={(value) =>
                                                    setDepartmentId(value)
                                                }
                                                items={departmentItems}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Proyek</Label>
                                            <InputCombobox
                                                name="project_selected"
                                                placeholder="Pilih proyek"
                                                value={projectId}
                                                onValueChange={(value) =>
                                                    setProjectId(value)
                                                }
                                                items={projectItems}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="flex items-center justify-between">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={resetFilters}
                                        >
                                            <RotateCcw className="me-2 size-4" />{' '}
                                            Reset Filter
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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

                            {hasPermission(['payroll-formulas.store']) && (
                                <Button asChild>
                                    <Link href={payrollFormulas.create().url}>
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
                                    <TableHead className="min-w-[180px] ps-4">
                                        Kategori
                                    </TableHead>
                                    <TableHead className="min-w-[220px]">
                                        Nama Karyawan
                                    </TableHead>
                                    <TableHead className="min-w-[160px] text-right">
                                        Penghasilan (Rp)
                                    </TableHead>
                                    <TableHead className="min-w-[160px] text-right">
                                        Potongan (Rp)
                                    </TableHead>
                                    <TableHead className="min-w-[160px] text-right">
                                        Total (Rp)
                                    </TableHead>
                                    <TableHead className="w-[80px] text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formulas.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    formulas.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                <div className="whitespace-normal">
                                                    {item.category?.name ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="whitespace-normal">
                                                    {item.contact?.name ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(
                                                    item.earning_amount,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(
                                                    item.deduction_amount,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(
                                                    item.total_amount,
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
                                                                    href={payrollFormulas.show(
                                                                        item.id,
                                                                    )}
                                                                >
                                                                    <Search />
                                                                    Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {hasPermission([
                                                                'payroll-formulas.update',
                                                            ]) && (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={payrollFormulas.edit(
                                                                            item.id,
                                                                        )}
                                                                    >
                                                                        <Settings2 />
                                                                        Perbarui
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {hasPermission([
                                                                'payroll-formulas.destroy',
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
                                prevHref={formulas.prev_page_url}
                                nextHref={formulas.next_page_url}
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
                                Hapus Perhitungan Gaji
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini akan menghapus data perhitungan
                                gaji. Anda yakin ingin melanjutkan?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (!deleteTarget) return;

                                    router.delete(
                                        payrollFormulas.destroy(deleteTarget.id)
                                            .url,
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                toast.success('Berhasil', {
                                                    description:
                                                        'Perhitungan gaji berhasil dihapus.',
                                                });
                                                setDeleteTarget(null);
                                            },
                                            onError: () => {
                                                toast.error('Gagal', {
                                                    description:
                                                        'Terjadi kesalahan saat menghapus data perhitungan gaji.',
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
                    defaultPayrollCategoryId={payrollCategoryId}
                    referenceNo={referenceNo}
                    today={today}
                />
            </div>
        </AppLayout>
    );
}
