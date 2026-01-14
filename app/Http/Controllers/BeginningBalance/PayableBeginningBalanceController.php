<?php

namespace App\Http\Controllers\BeginningBalance;

use App\Helpers\ReferenceCoa;
use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\BeginningBalance\StorePayableRequest;
use App\Models\Contact;
use App\Models\PurchaseInvoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class PayableBeginningBalanceController extends Controller
{
    public function index(): Response
    {
        $invoices = PurchaseInvoice::query()
            ->with('contact:id,name')
            ->where('is_beginning', 1)
            ->orderByDesc('date')
            ->get(['id', 'contact_id', 'reference_no', 'date', 'amount']);

        return inertia('settings/beginning-balance/payable-index', [
            'invoices' => $invoices,
        ]);
    }

    public function create(): Response
    {
        $referenceNumber = ReferenceNumber::getPurchaseInvoice();
        $referenceCoa = ReferenceCoa::getAccountPayable();

        $contacts = Contact::query()
            ->active()
            ->where('is_vendor', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        return inertia('settings/beginning-balance/payable-create', [
            'referenceNumber' => $referenceNumber,
            'referenceCoa' => $referenceCoa,
            'contacts' => $contacts,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    public function store(StorePayableRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $amount = (float) $validated['amount'];

        DB::transaction(function () use ($validated, $request, $amount) {
            PurchaseInvoice::create([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'warehouse_id' => 1,
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => 'Saldo awal utang #' . $validated['reference_no'],
                'amount' => $amount,
                'total' => $amount,
                'is_beginning' => 1,
                'created_by' => $request->user()?->id,
            ]);
        });

        return redirect()
            ->route('beginning-balance.payable.index')
            ->with('success', 'Saldo awal utang berhasil dibuat.');
    }
}
