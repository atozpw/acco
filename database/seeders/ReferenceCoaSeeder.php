<?php

namespace Database\Seeders;

use App\Models\ReferenceCoa;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReferenceCoaSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ReferenceCoa::create([
            'code' => 'account-receivable',
            'name' => 'Akun Piutang Usaha',
        ]);

        ReferenceCoa::create([
            'code' => 'account-payable',
            'name' => 'Akun Utang Usaha',
        ]);

        ReferenceCoa::create([
            'code' => 'sales-delivery',
            'name' => 'Akun Pengiriman Barang',
        ]);

        ReferenceCoa::create([
            'code' => 'purchase-receipt',
            'name' => 'Akun Penerimaan Barang',
        ]);

        ReferenceCoa::create([
            'code' => 'sales-discount',
            'name' => 'Akun Diskon Penjualan',
        ]);

        ReferenceCoa::create([
            'code' => 'purchase-discount',
            'name' => 'Akun Diskon Pembelian',
        ]);

        ReferenceCoa::create([
            'code' => 'current-year-earnings',
            'name' => 'Akun Laba Tahun Berjalan',
        ]);

        ReferenceCoa::create([
            'code' => 'retained-earnings',
            'name' => 'Akun Laba Ditahan',
        ]);
    }
}
