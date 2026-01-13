import Heading from '@/components/heading';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import AppLayout from '@/layouts/app-layout';
import financialStatement from '@/routes/financial-statement';
import report from '@/routes/report';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laporan',
        href: report.index.url(),
    },
    {
        title: 'Laporan Keuangan',
        href: '',
    },
];

export default function FinancialStatementPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Keuangan" />

            <div className="px-5 py-6">
                <Heading
                    title="Laporan Keuangan"
                    description="Daftar laporan keuangan"
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <Accordion
                        type="single"
                        collapsible
                        className="rounded-md border px-4"
                        defaultValue="finance-reports"
                    >
                        <AccordionItem value="finance-reports">
                            <AccordionTrigger>
                                Laporan Keuangan
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-3 px-3">
                                <Link
                                    href={financialStatement.profitLoss.url()}
                                    className="hover:underline"
                                >
                                    Laba Rugi
                                </Link>
                                <Link
                                    href={financialStatement.balanceSheet.url()}
                                    className="hover:underline"
                                >
                                    Neraca
                                </Link>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </AppLayout>
    );
}
