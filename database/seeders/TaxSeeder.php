<?php

namespace Database\Seeders;

use App\Models\Tax;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaxSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tax::create([
            'code' => 'PPN',
            'name' => 'Pajak Pertambahan Nilai',
            'rate' => 11
        ]);

        Tax::create([
            'code' => 'PPh-21',
            'name' => 'Pajak Penghasilan Pasal 21',
            'rate' => 0
        ]);

        Tax::create([
            'code' => 'PPh-23',
            'name' => 'Pajak Penghasilan Pasal 23',
            'rate' => 0
        ]);
    }
}
