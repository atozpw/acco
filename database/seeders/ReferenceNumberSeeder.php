<?php

namespace Database\Seeders;

use App\Models\ReferenceNumber;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReferenceNumberSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ReferenceNumber::create([
            'name' => 'Saldo Awal Akun',
            'module' => 'account-beginning-balance',
            'code' => 'AB',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Jurnal Umum',
            'module' => 'general-journal',
            'code' => 'GJ',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Kas Masuk',
            'module' => 'cash-in',
            'code' => 'CI',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Kas Keluar',
            'module' => 'cash-out',
            'code' => 'CO',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Transfer Kas',
            'module' => 'cash-transfer',
            'code' => 'CT',
            'value' => '000001',
        ]);
    }
}
