<?php

namespace App\Http\Controllers\BeginningBalance;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\BeginningBalance\UpdateAccountBeginningBalanceRequest;
use App\Models\Coa;
use App\Models\Journal;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class AccountBeginningBalanceController extends Controller
{
    public function index(): Response
    {
        $journalDate = Carbon::create(now()->year, 1, 1)->format('Y-m-d');

        $journal = Journal::query()
            ->with(['details' => function ($query) {
                $query->orderBy('id');
            }])
            ->where('journal_category_id', 1)
            ->whereDate('date', $journalDate)
            ->first();

        $detailsByCoa = $journal
            ? $journal->details
            ->map(fn($detail) => [
                'coa_id' => $detail->coa_id,
                'debit' => number_format((float) $detail->debit, 2, '.', ''),
                'credit' => number_format((float) $detail->credit, 2, '.', ''),
            ])
            ->keyBy('coa_id')
            : collect();

        $accounts = Coa::query()
            ->active()
            ->doesntHave('children')
            ->whereHas('classification', function ($query) {
                $query->where('type', 'balance-sheet');
            })
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $accountPayload = $accounts->map(function ($coa) use ($detailsByCoa) {
            $detail = $detailsByCoa->get($coa->id);

            return [
                'id' => $coa->id,
                'code' => $coa->code,
                'name' => $coa->name,
                'debit' => $detail['debit'] ?? '',
                'credit' => $detail['credit'] ?? '',
            ];
        });

        return inertia('settings/beginning-balance/account-index', [
            'accounts' => $accountPayload,
        ]);
    }

    public function update(UpdateAccountBeginningBalanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $journalDate = Carbon::create(now()->year, 1, 1)->format('Y-m-d');

        DB::transaction(function () use ($validated, $request, $journalDate) {
            $journal = Journal::query()
                ->where('journal_category_id', 1)
                ->whereDate('date', $journalDate)
                ->first();

            if (!$journal) {
                $referenceNo = ReferenceNumber::getAccountBeginningBalance();

                $journal = Journal::create([
                    'journal_category_id' => 1,
                    'reference_no' => $referenceNo,
                    'date' => $journalDate,
                    'description' => 'Saldo Awal Akun ' . $referenceNo,
                    'created_by' => $request->user()?->id,
                ]);

                ReferenceNumber::updateAccountBeginningBalance();
            }

            $journal->details()->delete();

            $entries = collect($validated['entries'])
                ->map(function ($entry) {
                    $debit = isset($entry['debit']) ? (float) $entry['debit'] : 0;
                    $credit = isset($entry['credit']) ? (float) $entry['credit'] : 0;

                    return [
                        'coa_id' => $entry['coa_id'],
                        'debit' => $debit,
                        'credit' => $credit,
                    ];
                })
                ->filter(fn($entry) => $entry['debit'] > 0 || $entry['credit'] > 0);

            foreach ($entries as $detail) {
                $journal->details()->create([
                    'coa_id' => $detail['coa_id'],
                    'debit' => $detail['debit'],
                    'credit' => $detail['credit'],
                    'department_id' => 1, // Default department
                    'project_id' => null,
                    'note' => null,
                    'created_by' => $request->user()?->id,
                ]);
            }
        });

        return redirect()
            ->route('beginning-balance.account.index')
            ->with('success', 'Saldo awal akun berhasil diperbarui.');
    }
}
