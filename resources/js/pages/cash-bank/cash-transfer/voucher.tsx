import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import cashBank from '@/routes/cash-bank';
import cashTransfer from '@/routes/cash-transfer';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kas & Bank', href: cashBank.index().url },
    { title: 'Transfer Kas', href: cashTransfer.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function CashTransferVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={cashTransfer.index().url}
                showUpdateAction={false}
            />
        </AppLayout>
    );
}
