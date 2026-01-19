<?php

namespace App\Http\Controllers\BeginningBalance;

use App\Helpers\ReferenceCoa;
use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\BeginningBalance\StoreReceivableRequest;
use App\Models\Contact;
use App\Models\SalesInvoice;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class ReceivableBeginningBalanceController extends Controller
{
    public function index(): Response
    {
        $invoices = SalesInvoice::query()
            ->with('contact:id,name')
            ->where('is_beginning', 1)
            ->orderByDesc('date')
            ->get(['id', 'contact_id', 'reference_no', 'date', 'amount']);

        return inertia('settings/beginning-balance/receivable-index', [
            'invoices' => $invoices,
        ]);
    }

    public function create(): Response
    {
        $referenceNumber = ReferenceNumber::getReceivableBeginningBalance();
        $referenceCoa = ReferenceCoa::getAccountReceivable();

        $contacts = Contact::query()
            ->active()
            ->where('is_customer', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        return inertia('settings/beginning-balance/receivable-create', [
            'referenceNumber' => $referenceNumber,
            'referenceCoa' => $referenceCoa,
            'contacts' => $contacts,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    public function store(StoreReceivableRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $amount = (float) $validated['amount'];

        DB::transaction(function () use ($validated, $request, $amount) {
            SalesInvoice::create([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'warehouse_id' => 1, // Default warehouse
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => 'Saldo Awal Piutang Usaha',
                'amount' => $amount,
                'total' => $amount,
                'is_beginning' => 1,
                'created_by' => $request->user()?->id,
            ]);

            ReferenceNumber::updateReceivableBeginningBalance();
        });

        return redirect()
            ->route('beginning-balance.receivable.index')
            ->with('success', 'Saldo awal piutang berhasil dibuat.');
    }
}
