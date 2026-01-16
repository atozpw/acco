import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import cashBank from '@/routes/cash-bank';
import expense from '@/routes/expense';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kas & Bank', href: cashBank.index().url },
    { title: 'Pengeluaran', href: expense.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function ExpenseVoucherScreen({
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
                backUrl={expense.index().url}
                showUpdateAction={false}
                hasHistory={hasHistory}
            />
        </AppLayout>
    );
}
