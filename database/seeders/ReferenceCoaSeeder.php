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
            'coa_id' => 5,
        ]);

        ReferenceCoa::create([
            'code' => 'account-payable',
            'name' => 'Akun Utang Usaha',
            'coa_id' => 20,
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
            'coa_id' => 33,
        ]);

        ReferenceCoa::create([
            'code' => 'retained-earnings',
            'name' => 'Akun Laba Ditahan',
            'coa_id' => 32,
        ]);
    }
}
