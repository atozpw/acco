<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProductCategory::create([
            'code' => '01',
            'name' => 'Material',
            'inventory_coa_id' => 11,
            'purchase_coa_id' => 38,
            'purchase_receipt_coa_id' => 23,
            'sales_coa_id' => 36,
            'sales_delivery_coa_id' => 9,
        ]);

        ProductCategory::create([
            'code' => '02',
            'name' => 'Jasa',
        ]);
    }
}
