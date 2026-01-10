import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import Heading from '@/components/heading';
import SimplePaginate from '@/components/simple-pagination';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDebounceValue } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';
import ledger from '@/routes/ledger';
import ledgerData from '@/routes/ledger-data';
import { BreadcrumbItem, CursorPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    ListFilterPlus,
    ReceiptText,
    RotateCcw,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { type DateRange } from 'react-day-picker';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Akuntansi',
        href: ledger.index().url,
    },
    {
        title: 'Buku Besar',
        href: '',
    },
];

const listPerPage: { item: string; value: string }[] = [
    { item: '5', value: '5' },
    { item: '10', value: '10' },
    { item: '25', value: '25' },
    { item: '50', value: '50' },
    { item: '100', value: '100' },
];

type LedgerEntry = {
    id: number;
    description: string | null;
    debit: string | number | null;
    credit: string | number | null;
    journal: {
        id: number;
        reference_no: string;
        date: string;
        description: string | null;
    } | null;
    coa: {
        id: number;
        code: string;
        name: string;
    } | null;
    department: {
        id: number;
        code: string;
        name: string;
    } | null;
};

type OptionItem = {
    id: number;
    code: string;
    name: string;
};

type LedgerFilters = {
    search?: string;
    perPage?: number;
    coa_id?: number | null;
    department_id?: number | null;
    date_from?: string | null;
    date_to?: string | null;
};

const formatDateForQuery = (date?: Date): string => {
    if (!date || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function LedgerIndexScreen({
    journals,
    opening_balance,
    coas,
    departments,
    filters,
}: {
    journals: CursorPagination<LedgerEntry>;
    opening_balance: string | number;
    coas: OptionItem[];
    departments: OptionItem[];
    filters: LedgerFilters;
}) {
    const coaItems: ComboboxItem[] = coas.map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.name}`,
    }));

    const departmentItems: ComboboxItem[] = departments.map((d) => ({
        value: String(d.id),
        label: d.name,
    }));

    const filtersSearch = filters.search ?? '';
    const filtersPerPage = filters.perPage ?? 25;
    const filtersCoa = filters.coa_id ? String(filters.coa_id) : '';
    const filtersDepartment = filters.department_id
        ? String(filters.department_id)
        : '';
    const filtersDateFrom = filters.date_from ?? '';
    const filtersDateTo = filters.date_to ?? '';

    const [search, setSearch] = useState(filtersSearch);
    const [itemsPage, setItemsPage] = useState<string>(String(filtersPerPage));
    const searchBounce = useDebounceValue(search, 300);
    const [coaId, setCoaId] = useState<string>(filtersCoa);
    const [departmentId, setDepartmentId] = useState<string>(filtersDepartment);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [filtersDialogOpen, setFiltersDialogOpen] = useState<boolean>(false);
    const [openDate, setOpenDate] = useState<boolean>(false);

    const selectedDateFrom = formatDateForQuery(dateRange?.from);
    const selectedDateTo = formatDateForQuery(dateRange?.to);

    const queryHasChanged = useMemo(() => {
        return (
            searchBounce !== filtersSearch ||
            Number(itemsPage) !== filtersPerPage ||
            coaId !== filtersCoa ||
            departmentId !== filtersDepartment ||
            (!!dateRange && selectedDateFrom !== filtersDateFrom) ||
            (!!dateRange && selectedDateTo !== filtersDateTo)
        );
    }, [
        searchBounce,
        filtersSearch,
        itemsPage,
        filtersPerPage,
        coaId,
        filtersCoa,
        departmentId,
        filtersDepartment,
        dateRange,
        selectedDateFrom,
        filtersDateFrom,
        selectedDateTo,
        filtersDateTo,
    ]);

    useEffect(() => {
        if (!queryHasChanged) return;

        const perPageValue = Math.min(
            100,
            Math.max(5, Number(itemsPage) || filtersPerPage || 25),
        );

        const query: Record<string, string | number> = {
            search: searchBounce,
            perPage: perPageValue,
        };

        if (coaId) {
            query.coa_id = Number(coaId);
        }
        if (departmentId) {
            query.department_id = Number(departmentId);
        }
        if (selectedDateFrom) {
            query.date_from = selectedDateFrom;
        }
        if (selectedDateTo) {
            query.date_to = selectedDateTo;
        }

        router.get(ledgerData.index(), query, {
            preserveScroll: true,
            preserveState: true,
        });
    }, [
        queryHasChanged,
        searchBounce,
        itemsPage,
        coaId,
        departmentId,
        selectedDateFrom,
        selectedDateTo,
        filtersPerPage,
    ]);

    const resetFilters = () => {
        setFiltersDialogOpen(false);
        setSearch('');
        setItemsPage('25');
        setCoaId(filtersCoa);
        setDepartmentId('');
        setDateRange(undefined);

        router.get(
            ledgerData.index(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const formatCurrency = (value: string | number | null | undefined) => {
        if (value === null || value === undefined) return '-';
        const numeric =
            typeof value === 'string' ? parseFloat(value) : Number(value);
        if (Number.isNaN(numeric)) return '-';

        const hasFraction = !Number.isInteger(numeric);

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: hasFraction ? 2 : 0,
            maximumFractionDigits: hasFraction ? 2 : 0,
        }).format(numeric);
    };

    const formatDate = (value: string | null | undefined) => {
        if (!value) return '-';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const totalDebit = journals.data.reduce((sum, item) => {
        const debit = item.debit
            ? typeof item.debit === 'string'
                ? parseFloat(item.debit)
                : Number(item.debit)
            : 0;
        return sum + (Number.isNaN(debit) ? 0 : debit);
    }, 0);

    const totalCredit = journals.data.reduce((sum, item) => {
        const credit = item.credit
            ? typeof item.credit === 'string'
                ? parseFloat(item.credit)
                : Number(item.credit)
            : 0;
        return sum + (Number.isNaN(credit) ? 0 : credit);
    }, 0);

    const totalMutation = totalDebit - totalCredit;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buku Besar" />

            <div className="px-5 py-6">
                <Heading
                    title="Buku Besar"
                    description="Ikhtisar jurnal dan perubahannya"
                />

                <div className="space-y-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <Input
                            className="text-sm lg:w-[250px]"
                            placeholder="Cari ..."
                            autoComplete="off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="flex items-center gap-3">
                            <InputCombobox
                                name="coa_selected"
                                placeholder="Silahkan pilih akun"
                                value={coaId}
                                onValueChange={(value) => setCoaId(value)}
                                items={coaItems}
                                className="w-100 lg:w-[250px]"
                            />
                            <Dialog
                                open={filtersDialogOpen}
                                onOpenChange={setFiltersDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        aria-label="Filters"
                                        variant={
                                            filtersDialogOpen
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
                                            Filter Buku Besar
                                        </DialogTitle>
                                        <DialogDescription>
                                            Gunakan filter untuk mempersempit
                                            hasil pencarian.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
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
                                            <Label>Rentang Tanggal</Label>
                                            <Popover
                                                open={openDate}
                                                onOpenChange={setOpenDate}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`justify-between bg-transparent font-normal`}
                                                    >
                                                        {dateRange ? (
                                                            `${dateRange.from?.toLocaleDateString(
                                                                'id-ID',
                                                            )} - ${dateRange.to?.toLocaleDateString(
                                                                'id-ID',
                                                            )}`
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                Pilih rentang
                                                                tanggal
                                                            </span>
                                                        )}
                                                        <CalendarDays className="opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto overflow-hidden p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="range"
                                                        defaultMonth={
                                                            dateRange?.from ??
                                                            new Date()
                                                        }
                                                        selected={dateRange}
                                                        onSelect={setDateRange}
                                                        numberOfMonths={1}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <DialogFooter className="flex items-center justify-between">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                resetFilters();
                                            }}
                                        >
                                            <RotateCcw className="me-2 size-4" />{' '}
                                            Reset Filter
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[120px] ps-4">
                                        Nomor
                                    </TableHead>
                                    <TableHead className="min-w-[120px]">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="min-w-[180px]">
                                        Akun
                                    </TableHead>
                                    <TableHead className="min-w-[220px]">
                                        Keterangan
                                    </TableHead>
                                    <TableHead className="min-w-[165px] text-right">
                                        Debit
                                    </TableHead>
                                    <TableHead className="min-w-[165px] text-right">
                                        Kredit
                                    </TableHead>
                                    <TableHead className="w-[50px] text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.data.map((item) => {
                                        const reference =
                                            item.journal?.reference_no ?? '-';
                                        const detailDescription =
                                            item.description ||
                                            item.journal?.description ||
                                            '-';

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="ps-4 align-baseline font-medium">
                                                    {reference}
                                                </TableCell>
                                                <TableCell className="align-baseline">
                                                    {formatDate(
                                                        item.journal?.date,
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-baseline">
                                                    <div className="line-clamp-2 whitespace-normal">
                                                        {item.coa?.code ?? '-'}{' '}
                                                        -{' '}
                                                        {item.coa?.name ?? '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-baseline">
                                                    <div className="line-clamp-2 whitespace-normal">
                                                        {detailDescription}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right align-baseline">
                                                    {formatCurrency(item.debit)}
                                                </TableCell>
                                                <TableCell className="text-right align-baseline">
                                                    {formatCurrency(
                                                        item.credit,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right align-baseline">
                                                    {item.journal && (
                                                        <Button
                                                            variant="secondary"
                                                            aria-label="Buka menu"
                                                            className="size-8"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    ledgerData.show(
                                                                        item
                                                                            .journal
                                                                            ?.id,
                                                                    ).url
                                                                }
                                                            >
                                                                <ReceiptText />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-muted/50">
                                    <TableCell
                                        colSpan={2}
                                        className="ps-4 align-baseline"
                                    >
                                        <span className="text-xs">
                                            Saldo Awal
                                        </span>
                                        <p>{formatCurrency(opening_balance)}</p>
                                    </TableCell>
                                    <TableCell
                                        colSpan={2}
                                        className="align-baseline"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs">
                                                    Mutasi
                                                </span>
                                                <p>
                                                    {formatCurrency(
                                                        totalMutation,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs">
                                                    Saldo Akhir
                                                </span>
                                                <p>
                                                    {formatCurrency(
                                                        Number(
                                                            opening_balance,
                                                        ) +
                                                            Number(
                                                                totalMutation,
                                                            ),
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right align-baseline">
                                        <span className="text-xs">
                                            Total Debit
                                        </span>
                                        <p>{formatCurrency(totalDebit)}</p>
                                    </TableCell>
                                    <TableCell className="text-right align-baseline">
                                        <span className="text-xs">
                                            Total Kredit
                                        </span>
                                        <p>{formatCurrency(totalCredit)}</p>
                                    </TableCell>
                                    <TableCell className="pe-4"></TableCell>
                                </TableRow>
                            </TableFooter>
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
            </div>
        </AppLayout>
    );
}
