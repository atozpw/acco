import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import ledger from '@/routes/ledger';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Akuntansi',
        href: ledger.index().url,
    },
    {
        title: 'Buku Besar',
        href: '',
    },
];

export default function LedgerIndexScreen() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buku Besar" />

            <div className="px-5 py-6">
                <Heading
                    title="Buku Besar"
                    description="Ikhtisar jurnal dan perubahannya"
                />
            </div>
        </AppLayout>
    );
}
