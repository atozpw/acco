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
            UserSeeder::class,
            CompanySeeder::class,
            DepartmentSeeder::class,
            WarehouseSeeder::class,
            ContactSeeder::class,
            UnitMeasurementSeeder::class,
            TaxSeeder::class,
            JournalCategorySeeder::class,
            ProductCategorySeeder::class,
            ReferenceNumberSeeder::class,
            CoaClassificationSeeder::class,
        ]);
    }
}
