import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ProductProps } from '../index';

type ProductDetailDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: ProductProps | null;
    formatNumber: (value: string | number | null | undefined) => string;
};

export default function ProductDetailDialog({
    open,
    onOpenChange,
    product,
    formatNumber,
}: ProductDetailDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
            }}
        >
            <DialogContent className="max-w-lg sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detail Produk</DialogTitle>
                    <DialogDescription>
                        Informasi lengkap produk
                    </DialogDescription>
                </DialogHeader>
                {product && (
                    <div className="space-y-4 text-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start">
                            <div className="grid flex-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-1">
                                    <div className="text-xs text-muted-foreground">
                                        Kode
                                    </div>
                                    <div>{product.code}</div>
                                </div>
                                <div className="grid gap-1">
                                    <div className="text-xs text-muted-foreground">
                                        Nama
                                    </div>
                                    <div>{product.name}</div>
                                </div>
                                <div className="grid gap-1">
                                    <div className="text-xs text-muted-foreground">
                                        Kategori
                                    </div>
                                    <div>{product.category?.name ?? '-'}</div>
                                </div>
                                <div className="grid gap-1">
                                    <div className="text-xs text-muted-foreground">
                                        Satuan
                                    </div>
                                    <div>{product.unit_measurement?.name ?? '-'}</div>
                                </div>
                            </div>
                            <div className="flex justify-center md:w-32">
                                <div className="flex h-35 w-35 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="p-2 text-center">
                                            <span className="text-xs text-muted-foreground">
                                                Tidak ada gambar
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-1">
                                <div className="text-xs text-muted-foreground">
                                    Harga Jual
                                </div>
                                <div>{formatNumber(product.sales_price)}</div>
                            </div>
                            <div className="grid gap-1">
                                <div className="text-xs text-muted-foreground">
                                    Harga Beli
                                </div>
                                <div>
                                    {formatNumber(
                                        product.purchase_price ?? '0',
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-1">
                                <div className="text-xs text-muted-foreground">
                                    Pajak Penjualan
                                </div>
                                <div>{product.sales_tax?.name ?? '-'}</div>
                            </div>
                            <div className="grid gap-1">
                                <div className="text-xs text-muted-foreground">
                                    Pajak Pembelian
                                </div>
                                <div>{product.purchase_tax?.name ?? '-'}</div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-1">
                                <div className="text-xs text-muted-foreground">
                                    Available Qty
                                </div>
                                <div>{product.available_qty ?? 0}</div>
                            </div>
                            <div className="grid gap-1">
                                <div className="text-xs text-muted-foreground">
                                    Minimum Stok
                                </div>
                                <div>{product.minimum_stock ?? '-'}</div>
                            </div>
                            <div className="grid gap-1">
                                <div className="text-xs text-muted-foreground">
                                    Lacak persediaan/ kontrol stok
                                </div>
                                <div>{product.is_stock_tracking ? 'Aktif' : 'Tidak Aktif'}</div>
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <div className="text-xs text-muted-foreground">
                                Deskripsi
                            </div>
                            <div>{product.description || '-'}</div>
                        </div>

                        <div className="grid gap-1">
                            <div className="text-xs text-muted-foreground">
                                Status
                            </div>
                            <div>
                                {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
