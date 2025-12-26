<?php

namespace Database\Seeders;

use App\Models\CoaClassification;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CoaClassificationSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CoaClassification::create([
            'name' => 'Harta',
            'type' => 'balance-sheet',
        ]);

        CoaClassification::create([
            'name' => 'Kewajiban',
            'type' => 'balance-sheet',
        ]);

        CoaClassification::create([
            'name' => 'Modal',
            'type' => 'balance-sheet',
        ]);

        CoaClassification::create([
            'name' => 'Pendapatan Usaha',
            'type' => 'profit-loss',
        ]);

        CoaClassification::create([
            'name' => 'Beban Atas Pendapatan',
            'type' => 'profit-loss',
        ]);

        CoaClassification::create([
            'name' => 'Beban Operasional',
            'type' => 'profit-loss',
        ]);

        CoaClassification::create([
            'name' => 'Beban Non Operasional',
            'type' => 'profit-loss',
        ]);

        CoaClassification::create([
            'name' => 'Pendapatan Lain',
            'type' => 'profit-loss',
        ]);

        CoaClassification::create([
            'name' => 'Beban Lain',
            'type' => 'profit-loss',
        ]);
    }
}
