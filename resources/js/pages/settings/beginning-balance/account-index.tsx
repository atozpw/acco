import InputDecimal from '@/components/form/input-decimal';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import BeginningBalanceLayout from '@/layouts/settings/beginning-balance-layout';
import beginningBalance from '@/routes/beginning-balance';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type AccountItem = {
    id: number;
    code: string;
    name: string;
    debit: string;
    credit: string;
};

type AccountFormEntry = {
    coa_id: number;
    debit: string | null;
    credit: string | null;
};

type FormattedEntry = {
    debit: string;
    credit: string;
};

type FormData = {
    entries: AccountFormEntry[];
};

type BeginningBalanceAccountIndexProps = {
    accounts: AccountItem[];
    totals: {
        debit: string;
        credit: string;
    };
};

const decimalFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatDecimalDisplay = (
    value: string | number | null | undefined,
): string => {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    const numeric =
        typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(numeric)) {
        return '';
    }

    return decimalFormatter.format(numeric);
};

const normalizeDecimalValue = (
    value: string | number | null | undefined,
): string | null => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const numeric =
        typeof value === 'string' ? parseFloat(value) : Number(value);
    return Number.isNaN(numeric) ? null : numeric.toFixed(2);
};

const buildFormattedMap = (
    accounts: AccountItem[],
): Record<number, FormattedEntry> => {
    return accounts.reduce<Record<number, FormattedEntry>>((acc, account) => {
        acc[account.id] = {
            debit: formatDecimalDisplay(account.debit),
            credit: formatDecimalDisplay(account.credit),
        };
        return acc;
    }, {});
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: beginningBalance.index.url(),
    },
    {
        title: 'Saldo Awal',
        href: beginningBalance.account.index.url(),
    },
    {
        title: 'Akun',
        href: '',
    },
];

export default function BeginningBalanceAccountIndex({
    accounts,
}: BeginningBalanceAccountIndexProps) {
    const initialEntries = useMemo<AccountFormEntry[]>(() => {
        return accounts.map((account) => ({
            coa_id: account.id,
            debit: normalizeDecimalValue(account.debit),
            credit: normalizeDecimalValue(account.credit),
        }));
    }, [accounts]);

    const { data, setData, put, processing, errors } = useForm<FormData>({
        entries: initialEntries,
    });

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            entries: initialEntries,
        }));
    }, [initialEntries, setData]);

    const initialFormattedValues = useMemo(
        () => buildFormattedMap(accounts),
        [accounts],
    );
    const [formattedValues, setFormattedValues] = useState<
        Record<number, FormattedEntry>
    >(initialFormattedValues);

    useEffect(() => {
        setFormattedValues(initialFormattedValues);
    }, [initialFormattedValues]);

    const entryMap = useMemo(() => {
        const map = new Map<
            number,
            { entry: AccountFormEntry; index: number }
        >();
        data.entries.forEach((entry, index) => {
            map.set(entry.coa_id, { entry, index });
        });
        return map;
    }, [data.entries]);

    const totals = useMemo(() => {
        return data.entries.reduce(
            (result, entry) => {
                const debitValue = entry.debit ? parseFloat(entry.debit) : 0;
                const creditValue = entry.credit ? parseFloat(entry.credit) : 0;

                return {
                    debit:
                        result.debit +
                        (Number.isNaN(debitValue) ? 0 : debitValue),
                    credit:
                        result.credit +
                        (Number.isNaN(creditValue) ? 0 : creditValue),
                };
            },
            { debit: 0, credit: 0 },
        );
    }, [data.entries]);

    const difference = totals.debit - totals.credit;
    const isBalanced = Math.abs(difference) < 0.005;
    const differenceLabel = currencyFormatter.format(Math.abs(difference));

    const getEntryError = (index: number, field: 'debit' | 'credit') => {
        const key = `entries.${index}.${field}`;
        return (errors as Record<string, string | undefined>)[key];
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        put(beginningBalance.account.update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Saldo awal akun berhasil diperbarui.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description:
                        'Terjadi kesalahan saat menyimpan saldo awal akun.',
                });
            },
        });
    };

    const updateEntryValue = (
        coaId: number,
        field: 'debit' | 'credit',
        formatted: string,
        numeric: number,
    ) => {
        setFormattedValues((prev) => {
            const current = prev[coaId] ?? { debit: '', credit: '' };
            return {
                ...prev,
                [coaId]: {
                    ...current,
                    [field]: formatted,
                },
            };
        });

        setData((prev) => ({
            ...prev,
            entries: prev.entries.map((entry) =>
                entry.coa_id === coaId
                    ? {
                          ...entry,
                          [field]:
                              formatted.trim() === ''
                                  ? null
                                  : numeric.toFixed(2),
                      }
                    : entry,
            ),
        }));
    };

    const StatusIcon = isBalanced ? CheckCircle2 : AlertCircle;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saldo Awal Akun" />

            <BeginningBalanceLayout>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <HeadingSmall
                        title="Saldo Awal Akun"
                        description="Mengisi saldo awal akun"
                    />

                    <div className="space-y-3">
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="min-w-[110px] ps-4">
                                            Kode
                                        </TableHead>
                                        <TableHead className="min-w-[220px]">
                                            Nama Akun
                                        </TableHead>
                                        <TableHead className="w-[180px] text-right">
                                            Debit
                                        </TableHead>
                                        <TableHead className="w-[180px] pe-4 text-right">
                                            Kredit
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accounts.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                Tidak ada akun neraca aktif.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        accounts.map((account, index) => {
                                            const entryInfo = entryMap.get(
                                                account.id,
                                            );
                                            const entryIndex =
                                                entryInfo?.index ?? index;
                                            const formatted = formattedValues[
                                                account.id
                                            ] ?? {
                                                debit: '',
                                                credit: '',
                                            };

                                            return (
                                                <TableRow key={account.id}>
                                                    <TableCell className="ps-4 align-baseline">
                                                        {account.code}
                                                    </TableCell>
                                                    <TableCell className="align-baseline">
                                                        {account.name}
                                                    </TableCell>
                                                    <TableCell className="align-baseline">
                                                        <InputDecimal
                                                            id={`debit-${account.id}`}
                                                            name={`entries[${entryIndex}][debit]`}
                                                            value={
                                                                formatted.debit
                                                            }
                                                            onValueChange={(
                                                                formattedValue,
                                                                numeric,
                                                            ) =>
                                                                updateEntryValue(
                                                                    account.id,
                                                                    'debit',
                                                                    formattedValue,
                                                                    numeric,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={getEntryError(
                                                                entryIndex,
                                                                'debit',
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="pe-4 align-baseline">
                                                        <InputDecimal
                                                            id={`credit-${account.id}`}
                                                            name={`entries[${entryIndex}][credit]`}
                                                            value={
                                                                formatted.credit
                                                            }
                                                            onValueChange={(
                                                                formattedValue,
                                                                numeric,
                                                            ) =>
                                                                updateEntryValue(
                                                                    account.id,
                                                                    'credit',
                                                                    formattedValue,
                                                                    numeric,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={getEntryError(
                                                                entryIndex,
                                                                'credit',
                                                            )}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                    {accounts.length > 0 && (
                                        <TableRow className="bg-muted/40 font-semibold">
                                            <TableCell
                                                className="ps-4"
                                                colSpan={2}
                                            >
                                                Total
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {currencyFormatter.format(
                                                    totals.debit,
                                                )}
                                            </TableCell>
                                            <TableCell className="pe-4 text-right">
                                                {currencyFormatter.format(
                                                    totals.credit,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <InputError
                            message={
                                (errors as Record<string, string | undefined>)
                                    .entries
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-3 rounded-md border px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <Label>Status Penyeimbangan</Label>
                        <div className="grid gap-2">
                            <Badge
                                variant={isBalanced ? 'default' : 'destructive'}
                            >
                                <StatusIcon className="size-4" />
                                {isBalanced ? 'Balance' : 'Not Balanced'}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                                Selisih: {differenceLabel}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="submit"
                            disabled={processing || !isBalanced}
                        >
                            {processing ? (
                                <>
                                    <Spinner /> Menyimpan...
                                </>
                            ) : (
                                'Simpan Saldo Awal'
                            )}
                        </Button>
                    </div>
                </form>
            </BeginningBalanceLayout>
        </AppLayout>
    );
}
