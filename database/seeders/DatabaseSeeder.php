<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            CompanySeeder::class,
            DepartmentSeeder::class,
            WarehouseSeeder::class,
            ContactSeeder::class,
            UnitMeasurementSeeder::class,
            TaxSeeder::class,
            JournalCategorySeeder::class,
            ReferenceNumberSeeder::class,
            CoaClassificationSeeder::class,
            CoaSeeder::class,
            ReferenceCoaSeeder::class,
            ProductCategorySeeder::class,
        ]);
    }
}
