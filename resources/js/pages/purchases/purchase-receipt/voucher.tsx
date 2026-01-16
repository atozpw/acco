import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import purchaseReceipt from '@/routes/purchase-receipt';
import purchases from '@/routes/purchases';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
                backUrl={purchaseReceipt.index().url}
                showUpdateAction={false}
                hasHistory={hasHistory}
            />
        </AppLayout>
    );
}
