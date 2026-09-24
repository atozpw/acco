<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Permission::updateOrCreate(['name' => 'users.index'], ['name' => 'users.index']);
        Permission::updateOrCreate(['name' => 'users.store'], ['name' => 'users.store']);
        Permission::updateOrCreate(['name' => 'users.update'], ['name' => 'users.update']);
        Permission::updateOrCreate(['name' => 'users.destroy'], ['name' => 'users.destroy']);

        Permission::updateOrCreate(['name' => 'roles.index'], ['name' => 'roles.index']);
        Permission::updateOrCreate(['name' => 'roles.store'], ['name' => 'roles.store']);
        Permission::updateOrCreate(['name' => 'roles.update'], ['name' => 'roles.update']);
        Permission::updateOrCreate(['name' => 'roles.destroy'], ['name' => 'roles.destroy']);

        Permission::updateOrCreate(['name' => 'permissions.index'], ['name' => 'permissions.index']);
        Permission::updateOrCreate(['name' => 'permissions.store'], ['name' => 'permissions.store']);
        Permission::updateOrCreate(['name' => 'permissions.update'], ['name' => 'permissions.update']);
        Permission::updateOrCreate(['name' => 'permissions.destroy'], ['name' => 'permissions.destroy']);

        Permission::updateOrCreate(['name' => 'companies.index'], ['name' => 'companies.index']);
        Permission::updateOrCreate(['name' => 'companies.update'], ['name' => 'companies.update']);

        Permission::updateOrCreate(['name' => 'departments.index'], ['name' => 'departments.index']);
        Permission::updateOrCreate(['name' => 'departments.store'], ['name' => 'departments.store']);
        Permission::updateOrCreate(['name' => 'departments.update'], ['name' => 'departments.update']);
        Permission::updateOrCreate(['name' => 'departments.destroy'], ['name' => 'departments.destroy']);

        Permission::updateOrCreate(['name' => 'banks.index'], ['name' => 'banks.index']);
        Permission::updateOrCreate(['name' => 'banks.store'], ['name' => 'banks.store']);
        Permission::updateOrCreate(['name' => 'banks.update'], ['name' => 'banks.update']);
        Permission::updateOrCreate(['name' => 'banks.destroy'], ['name' => 'banks.destroy']);

        Permission::updateOrCreate(['name' => 'warehouses.index'], ['name' => 'warehouses.index']);
        Permission::updateOrCreate(['name' => 'warehouses.store'], ['name' => 'warehouses.store']);
        Permission::updateOrCreate(['name' => 'warehouses.update'], ['name' => 'warehouses.update']);
        Permission::updateOrCreate(['name' => 'warehouses.destroy'], ['name' => 'warehouses.destroy']);

        Permission::updateOrCreate(['name' => 'projects.index'], ['name' => 'projects.index']);
        Permission::updateOrCreate(['name' => 'projects.store'], ['name' => 'projects.store']);
        Permission::updateOrCreate(['name' => 'projects.update'], ['name' => 'projects.update']);
        Permission::updateOrCreate(['name' => 'projects.destroy'], ['name' => 'projects.destroy']);

        Permission::updateOrCreate(['name' => 'payroll-categories.index'], ['name' => 'payroll-categories.index']);
        Permission::updateOrCreate(['name' => 'payroll-categories.store'], ['name' => 'payroll-categories.store']);
        Permission::updateOrCreate(['name' => 'payroll-categories.update'], ['name' => 'payroll-categories.update']);
        Permission::updateOrCreate(['name' => 'payroll-categories.destroy'], ['name' => 'payroll-categories.destroy']);

        Permission::updateOrCreate(['name' => 'payroll-components.index'], ['name' => 'payroll-components.index']);
        Permission::updateOrCreate(['name' => 'payroll-components.store'], ['name' => 'payroll-components.store']);
        Permission::updateOrCreate(['name' => 'payroll-components.update'], ['name' => 'payroll-components.update']);
        Permission::updateOrCreate(['name' => 'payroll-components.destroy'], ['name' => 'payroll-components.destroy']);

        Permission::updateOrCreate(['name' => 'asset-categories.index'], ['name' => 'asset-categories.index']);
        Permission::updateOrCreate(['name' => 'asset-categories.store'], ['name' => 'asset-categories.store']);
        Permission::updateOrCreate(['name' => 'asset-categories.update'], ['name' => 'asset-categories.update']);
        Permission::updateOrCreate(['name' => 'asset-categories.destroy'], ['name' => 'asset-categories.destroy']);

        Permission::updateOrCreate(['name' => 'coas.index'], ['name' => 'coas.index']);
        Permission::updateOrCreate(['name' => 'coas.store'], ['name' => 'coas.store']);
        Permission::updateOrCreate(['name' => 'coas.update'], ['name' => 'coas.update']);
        Permission::updateOrCreate(['name' => 'coas.destroy'], ['name' => 'coas.destroy']);

        Permission::updateOrCreate(['name' => 'contacts.index'], ['name' => 'contacts.index']);
        Permission::updateOrCreate(['name' => 'contacts.store'], ['name' => 'contacts.store']);
        Permission::updateOrCreate(['name' => 'contacts.update'], ['name' => 'contacts.update']);
        Permission::updateOrCreate(['name' => 'contacts.destroy'], ['name' => 'contacts.destroy']);

        Permission::updateOrCreate(['name' => 'product-categories.index'], ['name' => 'product-categories.index']);
        Permission::updateOrCreate(['name' => 'product-categories.store'], ['name' => 'product-categories.store']);
        Permission::updateOrCreate(['name' => 'product-categories.update'], ['name' => 'product-categories.update']);
        Permission::updateOrCreate(['name' => 'product-categories.destroy'], ['name' => 'product-categories.destroy']);

        Permission::updateOrCreate(['name' => 'products.index'], ['name' => 'products.index']);
        Permission::updateOrCreate(['name' => 'products.store'], ['name' => 'products.store']);
        Permission::updateOrCreate(['name' => 'products.update'], ['name' => 'products.update']);
        Permission::updateOrCreate(['name' => 'products.destroy'], ['name' => 'products.destroy']);

        Permission::updateOrCreate(['name' => 'taxes.index'], ['name' => 'taxes.index']);
        Permission::updateOrCreate(['name' => 'taxes.store'], ['name' => 'taxes.store']);
        Permission::updateOrCreate(['name' => 'taxes.update'], ['name' => 'taxes.update']);
        Permission::updateOrCreate(['name' => 'taxes.destroy'], ['name' => 'taxes.destroy']);

        Permission::updateOrCreate(['name' => 'unit-measurements.index'], ['name' => 'unit-measurements.index']);
        Permission::updateOrCreate(['name' => 'unit-measurements.store'], ['name' => 'unit-measurements.store']);
        Permission::updateOrCreate(['name' => 'unit-measurements.update'], ['name' => 'unit-measurements.update']);
        Permission::updateOrCreate(['name' => 'unit-measurements.destroy'], ['name' => 'unit-measurements.destroy']);

        Permission::updateOrCreate(['name' => 'general-journal.index'], ['name' => 'general-journal.index']);
        Permission::updateOrCreate(['name' => 'general-journal.store'], ['name' => 'general-journal.store']);
        Permission::updateOrCreate(['name' => 'general-journal.update'], ['name' => 'general-journal.update']);
        Permission::updateOrCreate(['name' => 'general-journal.destroy'], ['name' => 'general-journal.destroy']);

        Permission::updateOrCreate(['name' => 'ledgers.index'], ['name' => 'ledgers.index']);
        Permission::updateOrCreate(['name' => 'ledgers.store'], ['name' => 'ledgers.store']);
        Permission::updateOrCreate(['name' => 'ledgers.update'], ['name' => 'ledgers.update']);
        Permission::updateOrCreate(['name' => 'ledgers.destroy'], ['name' => 'ledgers.destroy']);

        Permission::updateOrCreate(['name' => 'incomes.index'], ['name' => 'incomes.index']);
        Permission::updateOrCreate(['name' => 'incomes.store'], ['name' => 'incomes.store']);
        Permission::updateOrCreate(['name' => 'incomes.update'], ['name' => 'incomes.update']);
        Permission::updateOrCreate(['name' => 'incomes.destroy'], ['name' => 'incomes.destroy']);

        Permission::updateOrCreate(['name' => 'expenses.index'], ['name' => 'expenses.index']);
        Permission::updateOrCreate(['name' => 'expenses.store'], ['name' => 'expenses.store']);
        Permission::updateOrCreate(['name' => 'expenses.update'], ['name' => 'expenses.update']);
        Permission::updateOrCreate(['name' => 'expenses.destroy'], ['name' => 'expenses.destroy']);

        Permission::updateOrCreate(['name' => 'cash-transfers.index'], ['name' => 'cash-transfers.index']);
        Permission::updateOrCreate(['name' => 'cash-transfers.store'], ['name' => 'cash-transfers.store']);
        Permission::updateOrCreate(['name' => 'cash-transfers.update'], ['name' => 'cash-transfers.update']);
        Permission::updateOrCreate(['name' => 'cash-transfers.destroy'], ['name' => 'cash-transfers.destroy']);

        Permission::updateOrCreate(['name' => 'giro-ins.index'], ['name' => 'giro-ins.index']);
        Permission::updateOrCreate(['name' => 'giro-ins.store'], ['name' => 'giro-ins.store']);
        Permission::updateOrCreate(['name' => 'giro-ins.update'], ['name' => 'giro-ins.update']);
        Permission::updateOrCreate(['name' => 'giro-ins.destroy'], ['name' => 'giro-ins.destroy']);

        Permission::updateOrCreate(['name' => 'giro-outs.index'], ['name' => 'giro-outs.index']);
        Permission::updateOrCreate(['name' => 'giro-outs.store'], ['name' => 'giro-outs.store']);
        Permission::updateOrCreate(['name' => 'giro-outs.update'], ['name' => 'giro-outs.update']);
        Permission::updateOrCreate(['name' => 'giro-outs.destroy'], ['name' => 'giro-outs.destroy']);

        Permission::updateOrCreate(['name' => 'sales-deliveries.index'], ['name' => 'sales-deliveries.index']);
        Permission::updateOrCreate(['name' => 'sales-deliveries.store'], ['name' => 'sales-deliveries.store']);
        Permission::updateOrCreate(['name' => 'sales-deliveries.update'], ['name' => 'sales-deliveries.update']);
        Permission::updateOrCreate(['name' => 'sales-deliveries.destroy'], ['name' => 'sales-deliveries.destroy']);

        Permission::updateOrCreate(['name' => 'sales-invoices.index'], ['name' => 'sales-invoices.index']);
        Permission::updateOrCreate(['name' => 'sales-invoices.store'], ['name' => 'sales-invoices.store']);
        Permission::updateOrCreate(['name' => 'sales-invoices.update'], ['name' => 'sales-invoices.update']);
        Permission::updateOrCreate(['name' => 'sales-invoices.destroy'], ['name' => 'sales-invoices.destroy']);

        Permission::updateOrCreate(['name' => 'account-receivables.index'], ['name' => 'account-receivables.index']);
        Permission::updateOrCreate(['name' => 'account-receivables.show'], ['name' => 'account-receivables.show']);

        Permission::updateOrCreate(['name' => 'receivable-payments.index'], ['name' => 'receivable-payments.index']);
        Permission::updateOrCreate(['name' => 'receivable-payments.store'], ['name' => 'receivable-payments.store']);
        Permission::updateOrCreate(['name' => 'receivable-payments.update'], ['name' => 'receivable-payments.update']);
        Permission::updateOrCreate(['name' => 'receivable-payments.destroy'], ['name' => 'receivable-payments.destroy']);

        Permission::updateOrCreate(['name' => 'purchase-receipts.index'], ['name' => 'purchase-receipts.index']);
        Permission::updateOrCreate(['name' => 'purchase-receipts.store'], ['name' => 'purchase-receipts.store']);
        Permission::updateOrCreate(['name' => 'purchase-receipts.update'], ['name' => 'purchase-receipts.update']);
        Permission::updateOrCreate(['name' => 'purchase-receipts.destroy'], ['name' => 'purchase-receipts.destroy']);

        Permission::updateOrCreate(['name' => 'purchase-invoices.index'], ['name' => 'purchase-invoices.index']);
        Permission::updateOrCreate(['name' => 'purchase-invoices.store'], ['name' => 'purchase-invoices.store']);
        Permission::updateOrCreate(['name' => 'purchase-invoices.update'], ['name' => 'purchase-invoices.update']);
        Permission::updateOrCreate(['name' => 'purchase-invoices.destroy'], ['name' => 'purchase-invoices.destroy']);

        Permission::updateOrCreate(['name' => 'account-payables.index'], ['name' => 'account-payables.index']);
        Permission::updateOrCreate(['name' => 'account-payables.show'], ['name' => 'account-payables.show']);

        Permission::updateOrCreate(['name' => 'payable-payments.index'], ['name' => 'payable-payments.index']);
        Permission::updateOrCreate(['name' => 'payable-payments.store'], ['name' => 'payable-payments.store']);
        Permission::updateOrCreate(['name' => 'payable-payments.update'], ['name' => 'payable-payments.update']);
        Permission::updateOrCreate(['name' => 'payable-payments.destroy'], ['name' => 'payable-payments.destroy']);

        Permission::updateOrCreate(['name' => 'product-transfers.index'], ['name' => 'product-transfers.index']);
        Permission::updateOrCreate(['name' => 'product-transfers.store'], ['name' => 'product-transfers.store']);
        Permission::updateOrCreate(['name' => 'product-transfers.update'], ['name' => 'product-transfers.update']);
        Permission::updateOrCreate(['name' => 'product-transfers.destroy'], ['name' => 'product-transfers.destroy']);

        Permission::updateOrCreate(['name' => 'payroll-formulas.index'], ['name' => 'payroll-formulas.index']);
        Permission::updateOrCreate(['name' => 'payroll-formulas.store'], ['name' => 'payroll-formulas.store']);
        Permission::updateOrCreate(['name' => 'payroll-formulas.update'], ['name' => 'payroll-formulas.update']);
        Permission::updateOrCreate(['name' => 'payroll-formulas.destroy'], ['name' => 'payroll-formulas.destroy']);

        Permission::updateOrCreate(['name' => 'payroll-periods.index'], ['name' => 'payroll-periods.index']);
        Permission::updateOrCreate(['name' => 'payroll-periods.store'], ['name' => 'payroll-periods.store']);
        Permission::updateOrCreate(['name' => 'payroll-periods.update'], ['name' => 'payroll-periods.update']);
        Permission::updateOrCreate(['name' => 'payroll-periods.destroy'], ['name' => 'payroll-periods.destroy']);

        Permission::updateOrCreate(['name' => 'reports.index'], ['name' => 'reports.index']);
        Permission::updateOrCreate(['name' => 'financial-statement.index'], ['name' => 'financial-statement.index']);
        Permission::updateOrCreate(['name' => 'financial-statement.profit-loss'], ['name' => 'financial-statement.profit-loss']);
        Permission::updateOrCreate(['name' => 'financial-statement.balance-sheet'], ['name' => 'financial-statement.balance-sheet']);
        Permission::updateOrCreate(['name' => 'financial-statement.cash-flow'], ['name' => 'financial-statement.cash-flow']);

        Permission::updateOrCreate(['name' => 'account-beginning-balance.index'], ['name' => 'account-beginning-balance.index']);
        Permission::updateOrCreate(['name' => 'account-beginning-balance.update'], ['name' => 'account-beginning-balance.update']);
        Permission::updateOrCreate(['name' => 'receivable-beginning-balance.index'], ['name' => 'receivable-beginning-balance.index']);
        Permission::updateOrCreate(['name' => 'receivable-beginning-balance.store'], ['name' => 'receivable-beginning-balance.store']);
        Permission::updateOrCreate(['name' => 'payable-beginning-balance.index'], ['name' => 'payable-beginning-balance.index']);
        Permission::updateOrCreate(['name' => 'payable-beginning-balance.store'], ['name' => 'payable-beginning-balance.store']);
        Permission::updateOrCreate(['name' => 'inventory-beginning-balance.index'], ['name' => 'inventory-beginning-balance.index']);
        Permission::updateOrCreate(['name' => 'inventory-beginning-balance.store'], ['name' => 'inventory-beginning-balance.store']);
    }
}
