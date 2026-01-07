import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import sales from '@/routes/sales';
import salesDelivery from '@/routes/sales-delivery';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Pengiriman Barang', href: salesDelivery.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function SalesDeliveryVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={salesDelivery.index().url}
                showUpdateAction={false}
            />
        </AppLayout>
    );
}
