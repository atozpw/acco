import { dashboard } from '@/routes';
import coa from '@/routes/coa';
import contactData from '@/routes/contact-data';
import departmentData from '@/routes/department-data';
import productCategory from '@/routes/product-category';
import productData from '@/routes/product-data';
import taxData from '@/routes/tax-data';
import unitMeasurement from '@/routes/unit-measurement';
import type { NavItem } from '@/types';
import { BookOpen, Folder, HardDrive, LayoutGrid } from 'lucide-react';

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
];

export const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];
