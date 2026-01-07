import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import cashBank from '@/routes/cash-bank';
import expense from '@/routes/expense';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={expense.index().url}
                showUpdateAction={true}
                updateUrl={expense.edit(journal.id).url}
            />
        </AppLayout>
    );
}
