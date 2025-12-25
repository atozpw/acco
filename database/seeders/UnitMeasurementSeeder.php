<?php

namespace Database\Seeders;

use App\Models\UnitMeasurement;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitMeasurementSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        UnitMeasurement::create([
            'code' => 'Pcs',
            'name' => 'Pieces',
        ]);

        UnitMeasurement::create([
            'code' => 'Pack',
            'name' => 'Pack',
        ]);

        UnitMeasurement::create([
            'code' => 'Box',
            'name' => 'Box',
        ]);

        UnitMeasurement::create([
            'code' => 'Kg',
            'name' => 'Kilogram',
        ]);

        UnitMeasurement::create([
            'code' => 'Gr',
            'name' => 'Gram',
        ]);
    }
}
