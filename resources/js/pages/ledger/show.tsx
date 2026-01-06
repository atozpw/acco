import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import ledger from '@/routes/ledger';
import ledgerData from '@/routes/ledger-data';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Akuntansi', href: ledger.index().url },
    { title: 'Buku Besar', href: ledgerData.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function LedgerShowScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={ledgerData.index().url}
                showUpdateAction={false}
            />
        </AppLayout>
    );
}
