import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import generalJournal from '@/routes/general-journal';
import ledger from '@/routes/ledger';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Akuntansi', href: ledger.index().url },
    { title: 'Jurnal Umum', href: generalJournal.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function GeneralJournalVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={generalJournal.index().url}
                showUpdateAction={true}
                updateUrl={generalJournal.edit(journal.id).url}
            />
        </AppLayout>
    );
}
