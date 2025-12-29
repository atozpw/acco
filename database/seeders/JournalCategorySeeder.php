<?php

namespace Database\Seeders;

use App\Models\JournalCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JournalCategorySeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        JournalCategory::create([
            'code' => 'AB',
            'name' => 'Beginning Balance',
        ]);

        JournalCategory::create([
            'code' => 'GJ',
            'name' => 'General Journal',
        ]);

        JournalCategory::create([
            'code' => 'CI',
            'name' => 'Cash In',
        ]);

        JournalCategory::create([
            'code' => 'CO',
            'name' => 'Cash Out',
        ]);

        JournalCategory::create([
            'code' => 'CT',
            'name' => 'Cash Transfer',
        ]);

        JournalCategory::create([
            'code' => 'CT',
            'name' => 'Cash Transfer',
        ]);

        JournalCategory::create([
            'code' => 'SD',
            'name' => 'Sales Delivery',
        ]);

        JournalCategory::create([
            'code' => 'SI',
            'name' => 'Sales Invoice',
        ]);

        JournalCategory::create([
            'code' => 'SP',
            'name' => 'Receivable Payment',
        ]);

        JournalCategory::create([
            'code' => 'PR',
            'name' => 'Purchase Receipt',
        ]);

        JournalCategory::create([
            'code' => 'PI',
            'name' => 'Purchase Invoice',
        ]);

        JournalCategory::create([
            'code' => 'PP',
            'name' => 'Payable Payment',
        ]);
    }
}
