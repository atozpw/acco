import {
    JournalVoucherDetail,
    type JournalPayload,
} from '@/components/ledger/journal-voucher-detail';
import AppLayout from '@/layouts/app-layout';
import cashBank from '@/routes/cash-bank';
import income from '@/routes/income';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kas & Bank', href: cashBank.index().url },
    { title: 'Penerimaan', href: income.index().url },
    { title: 'Jurnal Voucher', href: '' },
];

export default function IncomeVoucherScreen({
    journal,
}: {
    journal: JournalPayload;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal Voucher" />
            <JournalVoucherDetail
                journal={journal}
                backUrl={income.index().url}
                showUpdateAction={true}
                updateUrl={income.edit(journal.id).url}
            />
        </AppLayout>
    );
}
