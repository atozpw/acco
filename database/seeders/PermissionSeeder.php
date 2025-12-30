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
        Permission::create(['name' => 'users.index']);
        Permission::create(['name' => 'users.store']);
        Permission::create(['name' => 'users.update']);
        Permission::create(['name' => 'users.destroy']);

        Permission::create(['name' => 'roles.index']);
        Permission::create(['name' => 'roles.store']);
        Permission::create(['name' => 'roles.update']);
        Permission::create(['name' => 'roles.destroy']);

        Permission::create(['name' => 'permissions.index']);
        Permission::create(['name' => 'permissions.store']);
        Permission::create(['name' => 'permissions.update']);
        Permission::create(['name' => 'permissions.destroy']);

        Permission::create(['name' => 'companies.index']);
        Permission::create(['name' => 'companies.update']);

        Permission::create(['name' => 'departments.index']);
        Permission::create(['name' => 'departments.store']);
        Permission::create(['name' => 'departments.update']);
        Permission::create(['name' => 'departments.destroy']);

        Permission::create(['name' => 'warehouses.index']);
        Permission::create(['name' => 'warehouses.store']);
        Permission::create(['name' => 'warehouses.update']);
        Permission::create(['name' => 'warehouses.destroy']);

        Permission::create(['name' => 'projects.index']);
        Permission::create(['name' => 'projects.store']);
        Permission::create(['name' => 'projects.update']);
        Permission::create(['name' => 'projects.destroy']);

        Permission::create(['name' => 'coas.index']);
        Permission::create(['name' => 'coas.store']);
        Permission::create(['name' => 'coas.update']);
        Permission::create(['name' => 'coas.destroy']);

        Permission::create(['name' => 'contacts.index']);
        Permission::create(['name' => 'contacts.store']);
        Permission::create(['name' => 'contacts.update']);
        Permission::create(['name' => 'contacts.destroy']);

        Permission::create(['name' => 'product-categories.index']);
        Permission::create(['name' => 'product-categories.store']);
        Permission::create(['name' => 'product-categories.update']);
        Permission::create(['name' => 'product-categories.destroy']);

        Permission::create(['name' => 'products.index']);
        Permission::create(['name' => 'products.store']);
        Permission::create(['name' => 'products.update']);
        Permission::create(['name' => 'products.destroy']);

        Permission::create(['name' => 'taxes.index']);
        Permission::create(['name' => 'taxes.store']);
        Permission::create(['name' => 'taxes.update']);
        Permission::create(['name' => 'taxes.destroy']);

        Permission::create(['name' => 'unit-measurements.index']);
        Permission::create(['name' => 'unit-measurements.store']);
        Permission::create(['name' => 'unit-measurements.update']);
        Permission::create(['name' => 'unit-measurements.destroy']);

        Permission::create(['name' => 'general-journal.index']);
        Permission::create(['name' => 'general-journal.store']);
        Permission::create(['name' => 'general-journal.update']);
        Permission::create(['name' => 'general-journal.destroy']);

        Permission::create(['name' => 'ledgers.index']);
        Permission::create(['name' => 'ledgers.store']);
        Permission::create(['name' => 'ledgers.update']);
        Permission::create(['name' => 'ledgers.destroy']);

        Permission::create(['name' => 'incomes.index']);
        Permission::create(['name' => 'incomes.store']);
        Permission::create(['name' => 'incomes.update']);
        Permission::create(['name' => 'incomes.destroy']);

        Permission::create(['name' => 'expenses.index']);
        Permission::create(['name' => 'expenses.store']);
        Permission::create(['name' => 'expenses.update']);
        Permission::create(['name' => 'expenses.destroy']);

        Permission::create(['name' => 'cash-transfers.index']);
        Permission::create(['name' => 'cash-transfers.store']);
        Permission::create(['name' => 'cash-transfers.update']);
        Permission::create(['name' => 'cash-transfers.destroy']);

        Permission::create(['name' => 'sales-deliveries.index']);
        Permission::create(['name' => 'sales-deliveries.store']);
        Permission::create(['name' => 'sales-deliveries.update']);
        Permission::create(['name' => 'sales-deliveries.destroy']);

        Permission::create(['name' => 'sales-invoices.index']);
        Permission::create(['name' => 'sales-invoices.store']);
        Permission::create(['name' => 'sales-invoices.update']);
        Permission::create(['name' => 'sales-invoices.destroy']);

        Permission::create(['name' => 'receivable-payments.index']);
        Permission::create(['name' => 'receivable-payments.store']);
        Permission::create(['name' => 'receivable-payments.update']);
        Permission::create(['name' => 'receivable-payments.destroy']);

        Permission::create(['name' => 'purchase-receipts.index']);
        Permission::create(['name' => 'purchase-receipts.store']);
        Permission::create(['name' => 'purchase-receipts.update']);
        Permission::create(['name' => 'purchase-receipts.destroy']);

        Permission::create(['name' => 'purchase-invoices.index']);
        Permission::create(['name' => 'purchase-invoices.store']);
        Permission::create(['name' => 'purchase-invoices.update']);
        Permission::create(['name' => 'purchase-invoices.destroy']);

        Permission::create(['name' => 'payable-payments.index']);
        Permission::create(['name' => 'payable-payments.store']);
        Permission::create(['name' => 'payable-payments.update']);
        Permission::create(['name' => 'payable-payments.destroy']);

        Permission::create(['name' => 'product-transfers.index']);
        Permission::create(['name' => 'product-transfers.store']);
        Permission::create(['name' => 'product-transfers.update']);
        Permission::create(['name' => 'product-transfers.destroy']);
    }
}
