import { dashboard } from '@/routes';
import accountPayable from '@/routes/account-payable';
import accountReceivable from '@/routes/account-receivable';
import { edit as editAppearance } from '@/routes/appearance';
import assetCategoryData from '@/routes/asset-category-data';
import beginningBalance from '@/routes/beginning-balance';
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
import cashAdvanceClassification from '@/routes/cash-advance-classification';
import bankData from '@/routes/bank-data';
import payrollComponentData from '@/routes/payroll-component-data';
import payrollFormulas from '@/routes/payroll-formulas';
import permissions from '@/routes/permissions';
import productCategory from '@/routes/product-category';
import productData from '@/routes/product-data';
import projectData from '@/routes/project-data';
import purchaseInvoice from '@/routes/purchase-invoice';
import purchaseReceipt from '@/routes/purchase-receipt';
import receivablePayment from '@/routes/receivable-payment';
import roles from '@/routes/roles';
import payrollCategoryData from '@/routes/payroll-category-data';
import salesDelivery from '@/routes/sales-delivery';
import salesInvoice from '@/routes/sales-invoice';
import taxData from '@/routes/tax-data';
import unitMeasurement from '@/routes/unit-measurement';
import users from '@/routes/users';
import warehouseData from '@/routes/warehouse-data';
import type { NavItem } from '@/types';
import {
    Files,
    HardDrive,
    Landmark,
    LayoutGrid,
    NotebookText,
    Package,
    Settings2,
    ShoppingBag,
    ShoppingCart,
    UserCog2,
    Wallet,
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
            'asset-categories.index',
            'taxes.index',
            'departments.index',
            'warehouses.index',
            'projects.index',
            'payroll-categories.index',
            'payroll-components.index',
            'cash-advance-classifications.index',
            'banks.index',
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
                title: 'Kategori Aset',
                href: assetCategoryData.index(),
                permissions: ['asset-categories.index'],
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
            {
                title: 'Data Proyek',
                href: projectData.index(),
                permissions: ['projects.index'],
            },
            {
                title: 'Kategori Gaji',
                href: payrollCategoryData.index(),
                permissions: ['payroll-categories.index'],
            },
            {
                title: 'Komponen Gaji',
                href: payrollComponentData.index(),
                permissions: ['payroll-components.index'],
            },
            {
                title: 'Kategori Uang Muka',
                href: cashAdvanceClassification.index(),
                permissions: ['cash-advance-classifications.index'],
            },
            {
                title: 'Data Bank',
                href: bankData.index(),
                permissions: ['banks.index'],
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
            'account-receivables.index',
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
                title: 'Daftar Piutang Usaha',
                href: accountReceivable.index(),
                permissions: ['account-receivables.index'],
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
            'account-payables.index',
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
                title: 'Daftar Utang Usaha',
                href: accountPayable.index(),
                permissions: ['account-payables.index'],
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
        title: 'Penggajian',
        href: '#',
        icon: Wallet,
        permissions: [
            'payroll-formulas.index',
            'payrolls.index',
        ],
        children: [
            {
                title: 'Perhitungan',
                href: payrollFormulas.index(),
                permissions: ['payroll-formulas.index'],
            },
            {
                title: 'Daftar Gaji / Tunjangan',
                href: '#',
                permissions: ['payrolls.index'],
            },
            {
                title: 'Pembayaran',
                href: '#',
                permissions: ['payrolls.index'],
            },
        ],
    },
    {
        title: 'Persediaan',
        href: '#',
        icon: Package,
        permissions: [
            'inventories.index',
        ],
        children: [
            {
                title: 'Stok Opname',
                href: '#',
                permissions: ['inventories.index'],
            },
            {
                title: 'Pindah Gudang',
                href: '#',
                permissions: ['inventories.index'],
            },
        ],
    },
    {
        title: 'Laporan',
        href: '#',
        icon: Files,
        permissions: ['reports.index', 'financial-statement.index'],
        children: [
            {
                title: 'Laporan Keuangan',
                href: financialStatement.index(),
                permissions: ['financial-statement.index'],
            },
        ],
    },
];

export const platformNavItems: NavItem[] = [
    {
        title: 'Manajemen Akses',
        href: '#',
        icon: UserCog2,
        permissions: ['users.index', 'roles.index', 'permissions.index'],
        children: [
            {
                title: 'Pengguna',
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
    {
        title: 'Pengaturan',
        href: '#',
        icon: Settings2,
        children: [
            {
                title: 'Saldo Awal',
                href: beginningBalance.index(),
                permissions: [
                    'receivable-beginning-balance.index',
                    'account-beginning-balance.index',
                    'payable-beginning-balance.index',
                    'inventory-beginning-balance.index',
                ],
            },
            {
                title: 'Appearance',
                href: editAppearance(),
            },
        ],
    },
];

export const footerNavItems: NavItem[] = [];
