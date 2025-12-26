import { dashboard } from '@/routes';
import contactData from '@/routes/contact-data';
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
