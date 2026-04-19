<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Cetak Jurnal Voucher</title>
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
            {{-- Header --}}
            <div class="text-center mb-4">
                <h3 class="mb-0" style="font-weight: 600; font-size: 18px;">JURNAL VOUCHER</h3>
            </div>

            {{-- General Information --}}
            <div class="row mb-4">
                <div class="col-md-6">
                    <table class="table table-borderless table-sm"
                        style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 0;">
                        <tr>
                            <td style="width: 150px;">Nomor Referensi</td>
                            <td style="width: 16px;">:</td>
                            <td>{{ $payload['reference_no'] }}</td>
                        </tr>
                        <tr>
                            <td style="width: 150px;">Tanggal</td>
                            <td style="width: 16px;">:</td>
                            <td>{{ $payload['formatted_date'] ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td style="width: 150px;">Deskripsi</td>
                            <td style="width: 16px;">:</td>
                            <td>
                                {{ $payload['description'] && trim($payload['description']) ? $payload['description'] : '-' }}
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <table class="table table-borderless table-sm"
                        style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 0;">
                        <tr>
                            <td style="width: 150px;">Departemen</td>
                            <td style="width: 16px;">:</td>
                            <td>
                                @php
                                    $departments = collect($payload['details'])
                                        ->map(fn($d) => $d['department']['name'] ?? 'N/A')
                                        ->unique()
                                        ->join(', ');
                                @endphp
                                {{ $departments ?: 'N/A' }}
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 150px;">Proyek</td>
                            <td style="width: 16px;">:</td>
                            <td>
                                @php
                                    $projects = collect($payload['details'])
                                        ->map(fn($d) => $d['project']['name'] ?? 'N/A')
                                        ->unique()
                                        ->join(', ');
                                @endphp
                                {{ $projects ?: 'N/A' }}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            {{-- Details Table --}}
            <div class="mb-4">
                <table class="table table-bordered table-sm" style="margin-bottom: 0;">
                    <thead class="table-light">
                        <tr>
                            <th class="text-start">Kode Akun</th>
                            <th class="text-start">Nama Akun</th>
                            <th class="text-start">Departemen</th>
                            <th class="text-end">Debit</th>
                            <th class="text-end">Kredit</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($payload['details'] as $detail)
                            <tr>
                                <td class="text-start">{{ $detail['coa']['code'] ?? '-' }}</td>
                                <td class="text-start">{{ $detail['coa']['name'] ?? '-' }}</td>
                                <td class="text-start">{{ $detail['department']['name'] ?? 'N/A' }}</td>
                                <td class="text-end">
                                    {{ $detail['debit'] > 0 ? 'Rp ' . number_format((float) $detail['debit'], 2, ',', '.') : 'Rp 0,00' }}
                                </td>
                                <td class="text-end">
                                    {{ $detail['credit'] > 0 ? 'Rp ' . number_format((float) $detail['credit'], 2, ',', '.') : 'Rp 0,00' }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="text-center text-muted">Tidak ada detail jurnal.</td>
                            </tr>
                        @endforelse
                    </tbody>
                    <tfoot class="table-light">
                        <tr class="fw-bold">
                            <td colspan="3" class="text-start">Total</td>
                            <td class="text-end">
                                @php
                                    $totalDebit = collect($payload['details'])
                                        ->sum(fn($d) => (float) $d['debit']);
                                @endphp
                                Rp {{ number_format($totalDebit, 2, ',', '.') }}
                            </td>
                            <td class="text-end">
                                @php
                                    $totalCredit = collect($payload['details'])
                                        ->sum(fn($d) => (float) $d['credit']);
                                @endphp
                                Rp {{ number_format($totalCredit, 2, ',', '.') }}
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