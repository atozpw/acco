import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import purchaseReceipt from '@/routes/purchase-receipt';
import purchases from '@/routes/purchases';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pembelian', href: purchases.index().url },
    { title: 'Penerimaan Barang', href: purchaseReceipt.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function PurchaseReceiptVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={purchaseReceipt.index().url}
                showUpdateAction={false}
            />
        </AppLayout>
    );
}
