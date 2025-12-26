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
            'name' => 'Barang',
        ]);

        ProductCategory::create([
            'code' => '02',
            'name' => 'Jasa',
        ]);
    }
}
