import { dashboard } from '@/routes';
import coa from '@/routes/coa';
import contactData from '@/routes/contact-data';
import departmentData from '@/routes/department-data';
import generalJournal from '@/routes/general-journal';
import ledgerData from '@/routes/ledger-data';
import productCategory from '@/routes/product-category';
import productData from '@/routes/product-data';
import taxData from '@/routes/tax-data';
import unitMeasurement from '@/routes/unit-measurement';
import type { NavItem } from '@/types';
import { Airplay, HardDrive, LayoutGrid, NotebookText } from 'lucide-react';

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Data Master',
        href: '#',
        icon: HardDrive,
        children: [
            {
                title: 'Data Kontak',
                href: contactData.index(),
            },
            {
                title: 'Daftar Akun',
                href: coa.index(),
            },
            {
                title: 'Data Produk',
                href: productData.index(),
            },
            {
                title: 'Kategori Produk',
                href: productCategory.index(),
            },
            {
                title: 'Satuan Pengukuran',
                href: unitMeasurement.index(),
            },
            {
                title: 'Data Pajak',
                href: taxData.index(),
            },
            {
                title: 'Data Departemen',
                href: departmentData.index(),
            },
        ],
    },
    {
        title: 'Buku Besar',
        href: '#',
        icon: NotebookText,
        children: [
            {
                title: 'Buku Besar',
                href: ledgerData.index(),
            },
            {
                title: 'Jurnal Umum',
                href: generalJournal.index(),
            },
        ],
    },
];

export const footerNavItems: NavItem[] = [
    {
        title: 'Saldo Awal',
        href: '#',
        icon: Airplay,
        children: [
            {
                title: 'Akun',
                href: '#',
            },
            {
                title: 'Piutang',
                href: '#',
            },
            {
                title: 'Utang',
                href: '#',
            },
            {
                title: 'Persediaan',
                href: '#',
            },
        ],
    },
];
