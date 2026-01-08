import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import purchaseReceipt from '@/routes/purchase-receipt';
import purchases from '@/routes/purchases';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Printer, Settings2, Share2, Undo2 } from 'lucide-react';

interface ProductInfo {
    id: number;
    code: string;
    name: string;
}

interface ReceiptDetailPayload {
    id: number;
    qty: number | string;
    note: string | null;
    product: ProductInfo | null;
}

interface ContactInfo {
    id: number;
    name: string;
    address?: string | null;
}

interface PurchaseReceiptPayload {
    id: number;
    reference_no: string;
    formatted_date: string | null;
    contact: ContactInfo | null;
    details: ReceiptDetailPayload[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pembelian', href: purchases.index().url },
    { title: 'Penerimaan Barang', href: purchaseReceipt.index().url },
    { title: 'Detail', href: '' },
];

const parseNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const numeric = parseFloat(value);
    return Number.isNaN(numeric) ? 0 : numeric;
};

const formatQty = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

export default function PurchaseReceiptShowScreen({
    receipt,
}: {
    receipt: PurchaseReceiptPayload;
}) {
    const details = receipt.details ?? [];
    const contactName = receipt.contact?.name ?? '-';
    const contactAddress = receipt.contact?.address?.trim() || '-';
    const pageTitle = receipt.reference_no
        ? `Detail Penerimaan ${receipt.reference_no}`
        : 'Detail Penerimaan';

    const supplierInfo = [{ label: 'Alamat', value: contactAddress }];

    const generalInfo = [
        { label: 'Nomor Penerimaan', value: receipt.reference_no },
        { label: 'Tanggal Penerimaan', value: receipt.formatted_date ?? '-' },
    ];

    const totalQty = details.reduce(
        (acc, detail) => acc + parseNumber(detail.qty),
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title="Detail Penerimaan Barang"
                        description="Tinjau detail transaksi penerimaan barang"
                    />
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={purchaseReceipt.index().url}>
                                <Undo2 />
                                Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={purchaseReceipt.edit(receipt.id).url}>
                                <Settings2 />
                                Perbarui
                            </Link>
                        </Button>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button aria-label="Open menu">
                                    <Share2 />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Printer />
                                        Cetak
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Separator className="-mt-2 mb-6" />

                <div className="grid gap-1 text-sm">
                    <p>Dari:</p>
                    <p className="font-medium">{contactName}</p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                        {supplierInfo.map((item) => (
                            <div
                                key={item.label}
                                className="grid grid-cols-[160px_16px_1fr] gap-3 text-sm"
                            >
                                <p>{item.label}</p>
                                <p className="text-center">:</p>
                                <p>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {generalInfo.map((item) => (
                            <div
                                key={item.label}
                                className="grid grid-cols-[160px_16px_1fr] gap-3 text-sm"
                            >
                                <p>{item.label}</p>
                                <p className="text-center">:</p>
                                <p>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="min-w-[130px] ps-4">
                                    Kode Produk
                                </TableHead>
                                <TableHead className="min-w-[220px]">
                                    Nama Produk
                                </TableHead>
                                <TableHead className="min-w-[140px] text-right">
                                    Quantity
                                </TableHead>
                                <TableHead className="min-w-[200px] pe-4">
                                    Catatan
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {details.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-sm"
                                    >
                                        Tidak ada detail penerimaan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                details.map((detail) => {
                                    const qty = parseNumber(detail.qty);

                                    return (
                                        <TableRow key={detail.id}>
                                            <TableCell className="ps-4">
                                                {detail.product?.code ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="line-clamp-2 whitespace-normal">
                                                    {detail.product?.name ??
                                                        '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatQty(qty)}
                                            </TableCell>
                                            <TableCell className="pe-4">
                                                <div className="line-clamp-2 whitespace-normal">
                                                    {detail.note?.trim() || '-'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted/50 font-semibold">
                                <TableCell
                                    className="ps-4 text-end"
                                    colSpan={2}
                                >
                                    Total Quantity
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatQty(totalQty)}
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
