<?php

namespace App\Http\Controllers\Sales;

use App\Helpers\ReferenceCoa;
use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Models\Coa;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Product;
use App\Models\Project;
use App\Models\SalesDelivery;
use App\Models\SalesInvoice;
use App\Models\Tax;
use App\Models\Warehouse;
use Carbon\Carbon;
use App\Http\Requests\Sales\StoreSalesInvoiceRequest;
use App\Http\Requests\Sales\UpdateSalesInvoiceRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Response;

class SalesInvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $invoices = SalesInvoice::query()
            ->with(['contact:id,name'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_no', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%')
                        ->orWhereHas('contact', function ($cq) use ($search) {
                            $cq->where('name', 'like', '%' . $search . '%');
                        });
                });
            })
            ->orderByDesc('created_at')
            ->simplePaginate($perPage)
            ->withQueryString();

        $invoices->getCollection()->transform(function ($invoice) {
            $invoice->formatted_date = $invoice->date
                ? Carbon::parse($invoice->date)->format('d/m/Y')
                : null;

            return $invoice;
        });

        return inertia('sales/sales-invoice/index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $referenceNumber = ReferenceNumber::getSalesInvoice();
        $referenceCoa = ReferenceCoa::getAccountReceivable();

        $contacts = Contact::query()
            ->active()
            ->where('is_customer', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $coas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $warehouses = Warehouse::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::query()
            ->active()
            ->with(['salesTax:id,code,name,rate'])
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'sales_price', 'sales_tax_id']);

        $taxes = Tax::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'rate']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $deliveries = SalesDelivery::query()
            ->with(['details', 'contact:id,name'])
            ->whereDoesntHave('invoiceDeliveries')
            ->orderByDesc('date')
            ->get();

        return inertia('sales/sales-invoice/create', [
            'referenceNumber' => $referenceNumber,
            'referenceCoa' => $referenceCoa,
            'contacts' => $contacts,
            'coas' => $coas,
            'warehouses' => $warehouses,
            'products' => $products,
            'taxes' => $taxes,
            'departments' => $departments,
            'projects' => $projects,
            'deliveries' => $deliveries,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSalesInvoiceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $invoice = SalesInvoice::create([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'tax_amount' => $validated['tax_amount'],
                'discount_percent' => $validated['discount_percent'],
                'discount_amount' => $validated['discount_amount'],
                'total' => $validated['total'],
                'is_paid' => $validated['is_paid'],
                'is_delivery' => $validated['is_delivery'],
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['details'] as $detail) {
                $invoice->details()->create([
                    'product_id' => $detail['product_id'],
                    'qty' => $detail['qty'],
                    'price' => $detail['price'],
                    'amount' => $detail['amount'],
                    'tax_amount' => $detail['tax_amount'],
                    'discount_percent' => $detail['discount_percent'],
                    'discount_amount' => $detail['discount_amount'],
                    'total' => $detail['total'],
                    'note' => $detail['note'] ?? null,
                    'tax_id' => $detail['tax_id'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }

            $deliveries = $validated['deliveries'] ?? [];

            if ($validated['is_delivery'] && !empty($deliveries)) {
                foreach ($deliveries as $delivery) {
                    $invoice->deliveries()->create([
                        'sales_delivery_id' => $delivery['sales_delivery_id'],
                        'note' => $delivery['note'] ?? null,
                        'created_by' => $request->user()?->id,
                    ]);
                }
            }
        });

        return redirect()->route('sales-invoice.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $invoice = SalesInvoice::with([
            'details' => function ($q) {
                $q->orderBy('id');
            },
            'deliveries',
        ])->findOrFail($id);

        $invoice->date = $invoice->date
            ? Carbon::parse($invoice->date)->format('Y-m-d')
            : null;

        $invoice->details->transform(function ($detail) {
            return [
                'id' => $detail->id,
                'product_id' => $detail->product_id,
                'qty' => number_format((float) $detail->qty, 2, '.', ''),
                'price' => number_format((float) $detail->price, 2, '.', ''),
                'amount' => number_format((float) $detail->amount, 2, '.', ''),
                'tax_amount' => number_format((float) $detail->tax_amount, 2, '.', ''),
                'discount_percent' => number_format((float) $detail->discount_percent, 2, '.', ''),
                'discount_amount' => number_format((float) $detail->discount_amount, 2, '.', ''),
                'total' => number_format((float) $detail->total, 2, '.', ''),
                'note' => $detail->note,
                'tax_id' => $detail->tax_id,
                'department_id' => $detail->department_id,
                'project_id' => $detail->project_id,
            ];
        });

        $invoice->amount = number_format((float) $invoice->amount, 2, '.', '');
        $invoice->tax_amount = number_format((float) $invoice->tax_amount, 2, '.', '');
        $invoice->discount_percent = number_format((float) $invoice->discount_percent, 2, '.', '');
        $invoice->discount_amount = number_format((float) $invoice->discount_amount, 2, '.', '');
        $invoice->total = number_format((float) $invoice->total, 2, '.', '');

        $invoice->deliveries->transform(function ($delivery) {
            return [
                'id' => $delivery->id,
                'sales_delivery_id' => $delivery->sales_delivery_id,
                'note' => $delivery->note,
            ];
        });

        $referenceCoa = ReferenceCoa::getAccountReceivable();

        $contacts = Contact::query()
            ->active()
            ->where('is_customer', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $coas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $warehouses = Warehouse::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::query()
            ->active()
            ->with(['salesTax:id,code,name,rate'])
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'sales_price', 'sales_tax_id']);

        $taxes = Tax::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'rate']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $availableDeliveries = SalesDelivery::query()
            ->with(['details', 'contact:id,name'])
            ->where(function ($q) use ($invoice) {
                $q->whereDoesntHave('invoiceDeliveries')
                    ->orWhereHas('invoiceDeliveries', function ($sub) use ($invoice) {
                        $sub->where('sales_invoice_id', $invoice->id);
                    });
            })
            ->orderByDesc('date')
            ->get();

        return inertia('sales/sales-invoice/edit', [
            'invoice' => $invoice,
            'referenceCoa' => $referenceCoa,
            'contacts' => $contacts,
            'coas' => $coas,
            'warehouses' => $warehouses,
            'products' => $products,
            'taxes' => $taxes,
            'departments' => $departments,
            'projects' => $projects,
            'deliveries' => $availableDeliveries,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSalesInvoiceRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        $invoice = SalesInvoice::findOrFail($id);

        DB::transaction(function () use ($invoice, $validated, $request) {
            $invoice->update([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'tax_amount' => $validated['tax_amount'],
                'discount_percent' => $validated['discount_percent'],
                'discount_amount' => $validated['discount_amount'],
                'total' => $validated['total'],
                'is_paid' => $validated['is_paid'],
                'is_delivery' => $validated['is_delivery'],
            ]);

            $invoice->details()->delete();

            foreach ($validated['details'] as $detail) {
                $invoice->details()->create([
                    'product_id' => $detail['product_id'],
                    'qty' => $detail['qty'],
                    'price' => $detail['price'],
                    'amount' => $detail['amount'],
                    'tax_amount' => $detail['tax_amount'],
                    'discount_percent' => $detail['discount_percent'],
                    'discount_amount' => $detail['discount_amount'],
                    'total' => $detail['total'],
                    'note' => $detail['note'] ?? null,
                    'tax_id' => $detail['tax_id'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }

            $invoice->deliveries()->delete();

            $deliveries = $validated['deliveries'] ?? [];

            if ($validated['is_delivery'] && !empty($deliveries)) {
                foreach ($deliveries as $delivery) {
                    $invoice->deliveries()->create([
                        'sales_delivery_id' => $delivery['sales_delivery_id'],
                        'note' => $delivery['note'] ?? null,
                        'created_by' => $request->user()?->id,
                    ]);
                }
            }
        });

        return redirect()->route('sales-invoice.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $invoice = SalesInvoice::findOrFail($id);
        
        $invoice->details()->delete();
        $invoice->deliveries()->delete();
        $invoice->delete();

        return redirect()->route('sales-invoice.index');
    }
}
