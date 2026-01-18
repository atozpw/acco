import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
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
import { CirclePlus } from 'lucide-react';

type InventoryProduct = {
    id: number;
    code: string;
    name: string;
};

type InventoryItem = {
    id: number;
    qty: string | number;
    price: string | number;
    total: string | number;
    product?: InventoryProduct | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: beginningBalance.index.url(),
    },
    {
        title: 'Saldo Awal',
        href: beginningBalance.inventory.index.url(),
    },
    {
        title: 'Persediaan',
        href: '',
    },
];

const quantityFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatQuantity = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return '-';
    const numeric =
        typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(numeric)) {
        return '-';
    }

    return quantityFormatter.format(numeric);
};

const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return '-';
    const numeric =
        typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(numeric)) {
        return '-';
    }

    return currencyFormatter.format(numeric);
};

export default function BeginningBalanceInventoryIndex({
    items,
}: {
    items: InventoryItem[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saldo Awal Persediaan" />

            <BeginningBalanceLayout>
                <div className="space-y-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <HeadingSmall
                            title="Saldo Awal Persediaan"
                            description="Mengisi saldo awal persediaan"
                        />
                        <Button asChild>
                            <Link
                                href={beginningBalance.inventory.create.url()}
                            >
                                <CirclePlus /> Buat Baru
                            </Link>
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[100px] ps-4">
                                        Kode
                                    </TableHead>
                                    <TableHead className="min-w-[180px]">
                                        Nama Item
                                    </TableHead>
                                    <TableHead className="min-w-[100px] text-right">
                                        Jumlah
                                    </TableHead>
                                    <TableHead className="min-w-[140px] text-right">
                                        Harga Beli
                                    </TableHead>
                                    <TableHead className="min-w-[160px] pe-4 text-right">
                                        Jumlah Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="ps-4 align-baseline">
                                                {item.product?.code ?? '-'}
                                            </TableCell>
                                            <TableCell className="align-baseline">
                                                <div className="line-clamp-2 whitespace-nowrap">
                                                    {item.product?.name ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatQuantity(item.qty)}
                                            </TableCell>
                                            <TableCell className="text-right align-baseline">
                                                {formatCurrency(item.price)}
                                            </TableCell>
                                            <TableCell className="pe-4 text-right align-baseline">
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </BeginningBalanceLayout>
        </AppLayout>
    );
}
