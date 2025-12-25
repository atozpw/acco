<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Contact::create([
            'code' => 'CU-0001',
            'name' => 'Pelanggan Umum',
            'is_customer' => 1,
        ]);

        Contact::create([
            'code' => 'VN-0001',
            'name' => 'Vendor Umum',
            'is_vendor' => 1,
        ]);

        Contact::create([
            'code' => 'EM-0001',
            'name' => 'Karyawan Umum',
            'is_employee' => 1,
        ]);
    }
}
