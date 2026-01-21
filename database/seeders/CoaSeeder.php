<?php

namespace Database\Seeders;

use App\Models\Coa;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CoaSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coa = Coa::create([
            'parent_id' => null,
            'code' => '100',
            'name' => 'Kas & Bank',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 1,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '101',
            'name' => 'Kas',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 1,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '102',
            'name' => 'Bank',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 1,
        ]);

        $coa = Coa::create([
            'parent_id' => null,
            'code' => '110',
            'name' => 'Piutang',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '111',
            'name' => 'Piutang Usaha',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '112',
            'name' => 'Piutang Retensi',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '113',
            'name' => 'Piutang Prestasi',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '114',
            'name' => 'Piutang Sewa',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '115',
            'name' => 'Piutang Belum Dikwitansikan',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        $coa = Coa::create([
            'parent_id' => null,
            'code' => '120',
            'name' => 'Persediaan',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '121',
            'name' => 'Persediaan Material',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '122',
            'name' => 'Persediaan Barang Jadi',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '130',
            'name' => 'Piutang PPN Masukan',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        $coa = Coa::create([
            'parent_id' => null,
            'code' => '140',
            'name' => 'Aset Tetap',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '141',
            'name' => 'Akumulasi Penyusutan',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '142',
            'name' => 'Peralatan Sewa',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '150',
            'name' => 'Aset Lain-Lain',
            'coa_classification_id' => 1,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        $coa = Coa::create([
            'parent_id' => null,
            'code' => '200',
            'name' => 'Utang Usaha',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '201',
            'name' => 'Utang Upah',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '202',
            'name' => 'Utang Bahan',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '203',
            'name' => 'Utang Alat',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '204',
            'name' => 'Utang Subkontraktor',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '205',
            'name' => 'Utang Belum Dikwitansikan',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        $coa = Coa::create([
            'parent_id' => null,
            'code' => '210',
            'name' => 'Utang Pajak',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '211',
            'name' => 'Utang PPN',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '212',
            'name' => 'Utang PPh Pasal 21',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '213',
            'name' => 'Utang PPh Pasal 23',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '214',
            'name' => 'Utang PPh Final Wapu',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '220',
            'name' => 'Pendapatan Diterima Dimuka',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '230',
            'name' => 'Utang Retensi',
            'coa_classification_id' => 2,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '300',
            'name' => 'Modal Disetor',
            'coa_classification_id' => 3,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '310',
            'name' => 'Laba Ditahan',
            'coa_classification_id' => 3,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '320',
            'name' => 'Laba Berjalan',
            'coa_classification_id' => 3,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '330',
            'name' => 'Prive / Dividen',
            'coa_classification_id' => 3,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '400',
            'name' => 'Pendapatan Jasa Konstruksi',
            'coa_classification_id' => 4,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '410',
            'name' => 'Pendapatan Lain-Lain',
            'coa_classification_id' => 4,
            'is_debit' => 0,
            'is_cash_bank' => 0,
        ]);

        $coa = Coa::create([
            'parent_id' => null,
            'code' => '500',
            'name' => 'Beban Pokok Penjualan',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '501',
            'name' => 'Material Proyek',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '502',
            'name' => 'Upah Tenaga Kerja',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '503',
            'name' => 'Biaya Sewa Alat Berat',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '504',
            'name' => 'Biaya Subkontraktor',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        $coa = Coa::create([
            'parent_id' => null,
            'code' => '510',
            'name' => 'Beban Operasional',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '511',
            'name' => 'Beban Gaji & Tunjangan',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '512',
            'name' => 'Beban Sewa',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '513',
            'name' => 'Beban Pemasaran',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '514',
            'name' => 'Beban Administrasi & Umum',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => $coa->id,
            'code' => '515',
            'name' => 'Beban Penyusutan',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);

        Coa::create([
            'parent_id' => null,
            'code' => '520',
            'name' => 'Beban Lain-Lain',
            'coa_classification_id' => 5,
            'is_debit' => 1,
            'is_cash_bank' => 0,
        ]);
    }
}
