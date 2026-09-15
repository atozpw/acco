<?php

namespace Database\Seeders;

use App\Models\Bank;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BankSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Bank::create([
            'code' => 'BCA',
            'name' => 'Bank Central Asia',
        ]);

        Bank::create([
            'code' => 'MANDIRI',
            'name' => 'Bank Mandiri',
        ]);

        Bank::create([
            'code' => 'BNI',
            'name' => 'Bank Negara Indonesia',
        ]);

        Bank::create([
            'code' => 'BRI',
            'name' => 'Bank Rakyat Indonesia',
        ]);

        Bank::create([
            'code' => 'BSI',
            'name' => 'Bank Syariah Indonesia',
        ]);

        Bank::create([
            'code' => 'CIMB',
            'name' => 'Bank CIMB Niaga',
        ]);

        Bank::create([
            'code' => 'BTN',
            'name' => 'Bank Tabungan Negara',
        ]);
    }
}
