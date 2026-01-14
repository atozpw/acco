import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import BeginningBalanceLayout from '@/layouts/settings/beginning-balance-layout';
import beginningBalance from '@/routes/beginning-balance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: beginningBalance.index.url(),
    },
    {
        title: 'Saldo Awal',
        href: beginningBalance.account.index.url(),
    },
    {
        title: 'Akun',
        href: '',
    },
];

export default function BeginningBalanceAccountIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saldo Awal Akun" />

            <BeginningBalanceLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Saldo Awal Akun"
                        description="Mengisi saldo awal akun"
                    />
                </div>
            </BeginningBalanceLayout>
        </AppLayout>
    );
}
