import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import generalJournal from '@/routes/general-journal';
import ledger from '@/routes/ledger';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
                backUrl={generalJournal.index().url}
                showUpdateAction={true}
                updateUrl={generalJournal.edit(journal.id).url}
                hasHistory={hasHistory}
            />
        </AppLayout>
    );
}
