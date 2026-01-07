import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import sales from '@/routes/sales';
import salesInvoice from '@/routes/sales-invoice';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: sales.index().url },
    { title: 'Invoice Penjualan', href: salesInvoice.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function SalesInvoiceVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={salesInvoice.index().url}
                showUpdateAction={false}
            />
        </AppLayout>
    );
}
