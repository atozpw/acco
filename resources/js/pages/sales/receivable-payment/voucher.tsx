import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import receivablePayment from '@/routes/receivable-payment';
import sales from '@/routes/sales';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Pembayaran Piutang', href: receivablePayment.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function ReceivablePaymentVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    const [hasHistory, setHasHistory] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasHistory(window.history.length > 1);
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={receivablePayment.index().url}
                showUpdateAction={false}
                hasHistory={hasHistory}
            />
        </AppLayout>
    );
}
