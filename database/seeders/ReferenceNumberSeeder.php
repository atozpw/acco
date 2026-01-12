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
            'name' => 'Saldo Awal Piutang',
            'module' => 'receivable-beginning-balance',
            'code' => 'RB',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Saldo Awal Utang',
            'module' => 'payable-beginning-balance',
            'code' => 'PB',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Saldo Awal Persediaan',
            'module' => 'receivable-beginning-balance',
            'code' => 'IB',
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

        ReferenceNumber::create([
            'name' => 'Pengiriman Barang',
            'module' => 'sales-delivery',
            'code' => 'SD',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Faktur Penjualan',
            'module' => 'sales-invoice',
            'code' => 'SI',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Pembayaran Piutang',
            'module' => 'receivable-payment',
            'code' => 'SP',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Penerimaan Barang',
            'module' => 'purchase-receipt',
            'code' => 'PR',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Faktur Pembelian',
            'module' => 'purchase-invoice',
            'code' => 'PI',
            'value' => '000001',
        ]);

        ReferenceNumber::create([
            'name' => 'Pembayaran Utang',
            'module' => 'payable-payment',
            'code' => 'PP',
            'value' => '000001',
        ]);
    }
}
