import { dashboard } from '@/routes';
import cashTransfer from '@/routes/cash-transfer';
import coa from '@/routes/coa';
import contactData from '@/routes/contact-data';
import departmentData from '@/routes/department-data';
import expense from '@/routes/expense';
import financialStatement from '@/routes/financial-statement';
import generalJournal from '@/routes/general-journal';
import income from '@/routes/income';
import ledgerData from '@/routes/ledger-data';
import payablePayment from '@/routes/payable-payment';
import permissions from '@/routes/permissions';
import productCategory from '@/routes/product-category';
import productData from '@/routes/product-data';
import purchaseInvoice from '@/routes/purchase-invoice';
import purchaseReceipt from '@/routes/purchase-receipt';
import receivablePayment from '@/routes/receivable-payment';
import roles from '@/routes/roles';
import salesDelivery from '@/routes/sales-delivery';
import salesInvoice from '@/routes/sales-invoice';
import taxData from '@/routes/tax-data';
import unitMeasurement from '@/routes/unit-measurement';
import users from '@/routes/users';
import warehouseData from '@/routes/warehouse-data';
import type { NavItem } from '@/types';
import {
    Airplay,
    Files,
    HardDrive,
    Landmark,
    LayoutGrid,
    NotebookText,
    Settings2,
    ShoppingBag,
    ShoppingCart,
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
        permissions: [
            'contacts.index',
            'coas.index',
            'products.index',
            'product-categories.index',
            'unit-measurements.index',
            'taxes.index',
            'departments.index',
        ],
        children: [
            {
                title: 'Data Kontak',
                href: contactData.index(),
                permissions: ['contacts.index'],
            },
            {
                title: 'Daftar Akun',
                href: coa.index(),
                permissions: ['coas.index'],
            },
            {
                title: 'Data Produk',
                href: productData.index(),
                permissions: ['products.index'],
            },
            {
                title: 'Kategori Produk',
                href: productCategory.index(),
                permissions: ['product-categories.index'],
            },
            {
                title: 'Satuan Pengukuran',
                href: unitMeasurement.index(),
                permissions: ['unit-measurements.index'],
            },
            {
                title: 'Data Pajak',
                href: taxData.index(),
                permissions: ['taxes.index'],
            },
            {
                title: 'Data Departemen',
                href: departmentData.index(),
                permissions: ['departments.index'],
            },
            {
                title: 'Data Gudang',
                href: warehouseData.index(),
                permissions: ['warehouses.index'],
            },
        ],
    },
    {
        title: 'Akuntansi',
        href: '#',
        icon: NotebookText,
        permissions: ['ledgers.index', 'general-journal.index'],
        children: [
            {
                title: 'Buku Besar',
                href: ledgerData.index(),
                permissions: ['ledgers.index'],
            },
            {
                title: 'Jurnal Umum',
                href: generalJournal.index(),
                permissions: ['general-journal.index'],
            },
        ],
    },
    {
        title: 'Penjualan',
        href: '#',
        icon: ShoppingBag,
        permissions: [
            'sales-deliveries.index',
            'sales-invoices.index',
            'receivable-payments.index',
        ],
        children: [
            {
                title: 'Pengiriman Barang',
                href: salesDelivery.index(),
                permissions: ['sales-deliveries.index'],
            },
            {
                title: 'Invoice Penjualan',
                href: salesInvoice.index(),
                permissions: ['sales-invoices.index'],
            },
            {
                title: 'Pembayaran Piutang',
                href: receivablePayment.index(),
                permissions: ['receivable-payments.index'],
            },
        ],
    },
    {
        title: 'Pembelian',
        href: '#',
        icon: ShoppingCart,
        permissions: [
            'purchase-receipts.index',
            'purchase-invoices.index',
            'payable-payments.index',
        ],
        children: [
            {
                title: 'Penerimaan Barang',
                href: purchaseReceipt.index(),
                permissions: ['purchase-receipts.index'],
            },
            {
                title: 'Invoice Pembelian',
                href: purchaseInvoice.index(),
                permissions: ['purchase-invoices.index'],
            },
            {
                title: 'Pembayaran Utang',
                href: payablePayment.index(),
                permissions: ['payable-payments.index'],
            },
        ],
    },
    {
        title: 'Kas & Bank',
        href: '#',
        icon: Landmark,
        permissions: [
            'expenses.index',
            'incomes.index',
            'cash-transfers.index',
        ],
        children: [
            {
                title: 'Pengeluaran',
                href: expense.index(),
                permissions: ['expenses.index'],
            },
            {
                title: 'Penerimaan',
                href: income.index(),
                permissions: ['incomes.index'],
            },
            {
                title: 'Transfer Kas',
                href: cashTransfer.index(),
                permissions: ['cash-transfers.index'],
            },
        ],
    },
    {
        title: 'Laporan',
        href: '#',
        icon: Files,
        children: [
            {
                title: 'Laporan Keuangan',
                href: financialStatement.index(),
            },
        ],
    },
    {
        title: 'User Management',
        href: '#',
        icon: Settings2,
        permissions: ['users.index', 'roles.index', 'permissions.index'],
        children: [
            {
                title: 'Daftar User',
                href: users.index(),
                permissions: ['users.index'],
            },
            {
                title: 'Role',
                href: roles.index(),
                permissions: ['roles.index'],
            },
            {
                title: 'Permission',
                href: permissions.index(),
                permissions: ['permissions.index'],
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
