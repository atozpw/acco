import { dashboard } from '@/routes';
import cashTransfer from '@/routes/cash-transfer';
import coa from '@/routes/coa';
import contactData from '@/routes/contact-data';
import departmentData from '@/routes/department-data';
import expense from '@/routes/expense';
import generalJournal from '@/routes/general-journal';
import income from '@/routes/income';
import ledgerData from '@/routes/ledger-data';
import permissions from '@/routes/permissions';
import productCategory from '@/routes/product-category';
import productData from '@/routes/product-data';
import roles from '@/routes/roles';
import taxData from '@/routes/tax-data';
import unitMeasurement from '@/routes/unit-measurement';
import users from '@/routes/users';
import type { NavItem } from '@/types';
import {
    Airplay,
    HardDrive,
    Landmark,
    LayoutGrid,
    NotebookText,
    Settings2,
} from 'lucide-react';

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
    {
        title: 'Kas & Bank',
        href: '#',
        icon: Landmark,
        children: [
            {
                title: 'Pengeluaran',
                href: expense.index(),
            },
            {
                title: 'Penerimaan',
                href: income.index(),
            },
            {
                title: 'Transfer Kas',
                href: cashTransfer.index(),
            },
        ],
    },
    {
        title: 'User Management',
        href: '#',
        icon: Settings2,
        children: [
            {
                title: 'Daftar User',
                href: users.index(),
            },
            {
                title: 'Role',
                href: roles.index(),
            },
            {
                title: 'Permission',
                href: permissions.index(),
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
