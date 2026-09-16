<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Cetak Laporan Arus Kas</title>
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
                <h3 class="mb-0" style="font-weight: 600; font-size: 18px;">LAPORAN ARUS KAS</h3>
                <p class="text-muted mb-0" style="font-size: 14px;">Periode: {{ $payload['period'] }}</p>
            </div>

            {{-- General Information --}}
            <div class="row mb-4">
                <div class="col-md-6">
                    <table class="table table-borderless table-sm"
                        style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 0;">
                        <tr>
                            <td style="width: 150px;">Periode</td>
                            <td style="width: 16px;">:</td>
                            <td>{{ $payload['period'] }}</td>
                        </tr>
                        <tr>
                            <td style="width: 150px;">Departemen</td>
                            <td style="width: 16px;">:</td>
                            <td>{{ $payload['department'] }}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <table class="table table-borderless table-sm"
                        style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 0;">
                        <tr>
                            <td style="width: 150px;">Proyek</td>
                            <td style="width: 16px;">:</td>
                            <td>{{ $payload['project'] }}</td>
                        </tr>
                    </table>
                </div>
            </div>

            {{-- Details Table --}}
            <div class="mb-4">
                @php
                    $renderAccounts = function($accounts, $depth = 0) use (&$renderAccounts) {
                        foreach ($accounts as $account) {
                            $padding = $depth * 24 + 16;
                            $code = !empty($account['coa_code']) ? $account['coa_code'] . ' - ' : '';
                            $name = $code . $account['coa_name'];
                            $amount = number_format((float) $account['amount'], 2, ',', '.');
                            echo '<tr>';
                            echo '<td class="text-start" style="padding-left: ' . $padding . 'px !important;">' . htmlspecialchars($name) . '</td>';
                            echo '<td class="text-start" style="width: 50px;">Rp</td>';
                            echo '<td class="text-end" style="width: 200px;">' . $amount . '</td>';
                            echo '</tr>';
                            if (!empty($account['children']) && count($account['children']) > 0) {
                                $renderAccounts($account['children'], $depth + 1);
                            }
                        }
                    };
                @endphp
                <table class="table table-bordered table-sm" style="margin-bottom: 0;">
                    <tbody>
                        @forelse($payload['report']['sections'] as $section)
                            <tr class="table-light fw-bold" style="background-color: #f8f9fa;">
                                <td class="text-start ps-2">{{ $section['name'] }}</td>
                                <td class="text-start" style="width: 50px;"></td>
                                <td class="text-end" style="width: 200px;"></td>
                            </tr>
                            @if(!empty($section['accounts']) && count($section['accounts']) > 0)
                                @php $renderAccounts($section['accounts'], 0); @endphp
                            @endif
                            <tr class="fw-bold">
                                <td class="text-start ps-2">Total {{ $section['name'] }}</td>
                                <td class="text-start" style="width: 50px;">Rp</td>
                                <td class="text-end" style="width: 200px;">
                                    {{ number_format((float) $section['total'], 2, ',', '.') }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="3" class="text-center text-muted py-4">Tidak ada data untuk periode dan filter yang dipilih.</td>
                            </tr>
                        @endforelse
                        @if(!empty($payload['report']['sections']) && count($payload['report']['sections']) > 0)
                            <tr class="table-light fw-bold" style="background-color: #e9ecef;">
                                <td class="text-start ps-2">Saldo Kas Awal</td>
                                <td class="text-start" style="width: 50px;">Rp</td>
                                <td class="text-end" style="width: 200px;">
                                    {{ number_format((float) ($payload['report']['balances']['opening'] ?? 0), 2, ',', '.') }}
                                </td>
                            </tr>
                            <tr class="table-light fw-bold" style="background-color: #e9ecef;">
                                <td class="text-start ps-2">Kenaikan (Penurunan) Kas Bersih</td>
                                <td class="text-start" style="width: 50px;">Rp</td>
                                <td class="text-end" style="width: 200px;">
                                    {{ number_format((float) ($payload['report']['balances']['net_change'] ?? 0), 2, ',', '.') }}
                                </td>
                            </tr>
                            <tr class="table-light fw-bold" style="background-color: #e9ecef;">
                                <td class="text-start ps-2">Saldo Kas Akhir</td>
                                <td class="text-start" style="width: 50px;">Rp</td>
                                <td class="text-end" style="width: 200px;">
                                    {{ number_format((float) ($payload['report']['balances']['closing'] ?? 0), 2, ',', '.') }}
                                </td>
                            </tr>
                        @endif
                    </tbody>
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
