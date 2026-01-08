import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import payablePayment from '@/routes/payable-payment';
import purchases from '@/routes/purchases';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pembelian', href: purchases.index().url },
    { title: 'Pembayaran Utang', href: payablePayment.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function PayablePaymentVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={payablePayment.index().url}
                showUpdateAction={false}
            />
        </AppLayout>
    );
}
