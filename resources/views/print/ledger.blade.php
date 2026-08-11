<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Cetak Buku Besar</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <style type="text/css">
        .main-content {
            width: 800px;
            font-size: 14px;
            font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
            min-height: calc(100vh - 55px);
        }

        @media (max-width: 992px) {
            .main-content {
                width: 100% !important;
            }
        }

        .cetak-footer {
            position: fixed;
            bottom: 0px;
        }
    </style>
    <style type="text/css">
        @media print {
            body {
                font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
            }

            .main-content {
                min-height: 100vh;
            }

            .hide {
                display: none;
            }

            .new-page {
                page-break-before: always;
            }
        }
    </style>
</head>

<body>
    <nav class="hide">
        <div class="container-fluid px-0">
            <div class="shadow-sm d-flex justify-content-end pe-4 py-2">
                <button type="button" onclick="libPrint()" class="btn btn-success btn-sm"
                    style="padding: 0.5rem 1rem !important; border-radius: 0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-printer" viewBox="0 0 16 16">
                        <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                        <path
                            d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1" />
                    </svg> Cetak
                </button>
            </div>
        </div>
    </nav>
    <div class="container-fluid px-0">
        <div class="main-content d-flex flex-column mx-auto py-2 px-3">
            {{-- Kop Surat --}}
            <div class="d-flex align-items-center mb-3 pb-3" style="border-bottom: 1px solid #ccc;">
                <div>
                    <img src="{{ asset('logo.png') }}" alt="Logo" style="max-height: 70px; max-width: 150px; object-fit: contain;">
                </div>
                <div class="flex-grow-1 ps-3">
                    <h2 class="mb-1" style="font-weight: bold; font-size: 16px;">PT. ARDANA BALAKOSA PRATAMA</h2>
                    <p class="mb-0" style="font-size: 12px;">Jl. Raya Hankam No. 10A RT. 005 RW.008, Kel. Jatimurni, Kec. Pondok Melati, Kota Bekasi</p>
                    <p class="mb-0" style="font-size: 12px;">Phone: 0851 2116 9627 | Email: info@ardanabalakosapratama.co.id <br> Website: https://ardanabalakosapratama.co.id</p>
                </div>
                <div style="width: 70px;"></div>
            </div>

            {{-- Header --}}
            <div class="text-center my-4">
                <h3 class="mb-0" style="font-weight: 600; font-size: 18px;">BUKU BESAR</h3>
                <p class="text-muted mb-0" style="font-size: 14px;">Periode: {{ $payload['period'] }}</p>
            </div>

            {{-- General Information --}}
            <div class="row mb-4">
                <div class="col-md-6">
                    <table class="table table-borderless table-sm"
                        style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 0;">
                        <tr>
                            <td style="width: 150px;">Akun</td>
                            <td style="width: 16px;">:</td>
                            <td>{{ $payload['coa'] }}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <table class="table table-borderless table-sm"
                        style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 0;">
                        <tr>
                            <td style="width: 150px;">Departemen</td>
                            <td style="width: 16px;">:</td>
                            <td>{{ $payload['department'] }}</td>
                        </tr>
                    </table>
                </div>
            </div>

            {{-- Details Table --}}
            <div class="mb-4">
                <table class="table table-bordered table-sm" style="margin-bottom: 0;">
                    <thead class="table-light">
                        <tr>
                            <th class="text-start" style="width: 90px;">Tanggal</th>
                            <th class="text-start" style="width: 90px;">Nomor</th>
                            <th class="text-start">Keterangan</th>
                            <th class="text-end" style="width: 110px;">Debit</th>
                            <th class="text-end" style="width: 110px;">Kredit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="table-light">
                            <td colspan="3" class="text-start fw-bold">Saldo Awal</td>
                            <td colspan="2" class="text-end fw-bold">
                                {{ number_format((float) $payload['opening_balance'], 2, ',', '.') }}
                            </td>
                        </tr>
                        @php
                            $totalDebit = 0;
                            $totalCredit = 0;
                        @endphp
                        @forelse($payload['journals'] as $item)
                            @php
                                $totalDebit += (float) $item->debit;
                                $totalCredit += (float) $item->credit;
                            @endphp
                            <tr>
                                <td class="text-start">
                                    {{ $item->journal?->date ? \Carbon\Carbon::parse($item->journal->date)->format('d/m/Y') : '-' }}
                                </td>
                                <td class="text-start">{{ $item->journal?->reference_no ?? '-' }}</td>
                                <td class="text-start">
                                    {{ $item->description ?: ($item->journal?->description ?? '-') }}
                                </td>
                                <td class="text-end">
                                    {{ number_format((float) $item->debit, 2, ',', '.') }}
                                </td>
                                <td class="text-end">
                                    {{ number_format((float) $item->credit, 2, ',', '.') }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center text-muted py-4">Tidak ada data untuk periode dan filter yang dipilih.</td>
                            </tr>
                        @endforelse
                        @php
                            $totalMutation = $totalDebit - $totalCredit;
                            $closingBalance = (float) $payload['opening_balance'] + $totalMutation;
                        @endphp
                    </tbody>
                    <tfoot>
                        <tr class="table-light">
                            <td colspan="3" class="text-end fw-bold pe-3">Mutasi</td>
                            <td class="text-end fw-bold">
                                {{ number_format($totalDebit, 2, ',', '.') }}
                            </td>
                            <td class="text-end fw-bold">
                                {{ number_format($totalCredit, 2, ',', '.') }}
                            </td>
                        </tr>
                        <tr class="table-light">
                            <td colspan="3" class="text-end fw-bold pe-3">Saldo Akhir</td>
                            <td colspan="2" class="text-end fw-bold">
                                {{ number_format($closingBalance, 2, ',', '.') }}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {{-- Footer --}}
            <div class="mt-3">
                <div class="mb-3">
                    <p class="mb-0">Dibuat oleh:</p>
                    <p class="mb-0">{{ $payload['created_by']['name'] ?? '-' }}</p>
                </div>
            </div>
        </div>
    </div>
    <script>
        function libPrint() { window.print(); }
    </script>
</body>

</html>
