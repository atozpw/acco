import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import purchaseInvoice from '@/routes/purchase-invoice';
import purchases from '@/routes/purchases';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pembelian', href: purchases.index().url },
    { title: 'Invoice Pembelian', href: purchaseInvoice.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function PurchaseInvoiceVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={purchaseInvoice.index().url}
                showUpdateAction={false}
            />
        </AppLayout>
    );
}
