<?php

namespace App\Http\Controllers\Sales;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\StoreSalesDeliveryRequest;
use App\Http\Requests\Sales\UpdateSalesDeliveryRequest;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Journal;
use App\Models\Product;
use App\Models\Project;
use App\Models\SalesDelivery;
use App\Models\Tax;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Response;

class SalesDeliveryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $deliveries = SalesDelivery::query()
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

        $deliveries->getCollection()->transform(function ($delivery) {
            $delivery->formatted_date = $delivery->date
                ? Carbon::parse($delivery->date)->format('d/m/Y')
                : null;

            return $delivery;
        });

        return inertia('sales/sales-delivery/index', [
            'deliveries' => $deliveries,
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
        $referenceNumber = ReferenceNumber::getSalesDelivery();

        $contacts = Contact::query()
            ->active()
            ->where('is_customer', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

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

        return inertia('sales/sales-delivery/create', [
            'referenceNumber' => $referenceNumber,
            'contacts' => $contacts,
            'warehouses' => $warehouses,
            'products' => $products,
            'taxes' => $taxes,
            'departments' => $departments,
            'projects' => $projects,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSalesDeliveryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $delivery = SalesDelivery::create([
                'contact_id' => $validated['contact_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'tax_amount' => $validated['tax_amount'],
                'discount_percent' => $validated['discount_percent'],
                'discount_amount' => $validated['discount_amount'],
                'total' => $validated['total'],
                'is_closed' => $validated['is_closed'],
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['details'] as $detail) {
                $delivery->details()->create([
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

            ReferenceNumber::updateSalesDelivery();
        });

        return redirect()->route('sales-delivery.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $delivery = SalesDelivery::query()
            ->with([
                'contact:id,name,address',
                'details' => function ($query) {
                    $query->orderBy('id')->with(['product:id,code,name']);
                },
            ])
            ->findOrFail($id);

        $details = $delivery->details->map(function ($detail) {
            return [
                'id' => $detail->id,
                'qty' => (float) $detail->qty,
                'note' => $detail->note,
                'product' => $detail->product
                    ? [
                        'id' => $detail->product->id,
                        'code' => $detail->product->code,
                        'name' => $detail->product->name,
                    ]
                    : null,
            ];
        });

        $payload = [
            'id' => $delivery->id,
            'reference_no' => $delivery->reference_no,
            'date' => $delivery->date,
            'formatted_date' => $delivery->date
                ? Carbon::parse($delivery->date)->format('d/m/Y')
                : null,
            'contact' => $delivery->contact
                ? [
                    'id' => $delivery->contact->id,
                    'name' => $delivery->contact->name,
                    'address' => $delivery->contact->address ?? null,
                ]
                : null,
            'details' => $details,
        ];

        return inertia('sales/sales-delivery/show', [
            'delivery' => $payload,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $delivery = SalesDelivery::with(['details' => function ($q) {
            $q->orderBy('id');
        }])->findOrFail($id);

        $delivery->date = $delivery->date
            ? Carbon::parse($delivery->date)->format('Y-m-d')
            : null;

        $delivery->details->transform(function ($detail) {
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

        $delivery->amount = number_format((float) $delivery->amount, 2, '.', '');
        $delivery->tax_amount = number_format((float) $delivery->tax_amount, 2, '.', '');
        $delivery->discount_percent = number_format((float) $delivery->discount_percent, 2, '.', '');
        $delivery->discount_amount = number_format((float) $delivery->discount_amount, 2, '.', '');
        $delivery->total = number_format((float) $delivery->total, 2, '.', '');

        $contacts = Contact::query()
            ->active()
            ->where('is_customer', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

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

        return inertia('sales/sales-delivery/edit', [
            'delivery' => $delivery,
            'contacts' => $contacts,
            'warehouses' => $warehouses,
            'products' => $products,
            'taxes' => $taxes,
            'departments' => $departments,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSalesDeliveryRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        $delivery = SalesDelivery::findOrFail($id);

        DB::transaction(function () use ($delivery, $validated, $request) {
            $delivery->update([
                'contact_id' => $validated['contact_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'tax_amount' => $validated['tax_amount'],
                'discount_percent' => $validated['discount_percent'],
                'discount_amount' => $validated['discount_amount'],
                'total' => $validated['total'],
                'is_closed' => $validated['is_closed'],
            ]);

            $delivery->details->each->delete();

            foreach ($validated['details'] as $detail) {
                $delivery->details()->create([
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
        });

        return redirect()->route('sales-delivery.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $delivery = SalesDelivery::findOrFail($id);

        $delivery->details->each->delete();
        $delivery->delete();

        return redirect()->route('sales-delivery.index');
    }

    /**
     * Generate journal voucher for the specified resource.
     */
    public function voucher(string $nomor): Response
    {
        $journal = Journal::query()
            ->with([
                'details.coa:id,code,name',
                'details.department:id,code,name',
                'details.project:id,code,name',
                'createdBy:id,name',
            ])
            ->where('reference_no', $nomor)
            ->firstOrFail();

        $payload = [
            'id' => $journal->id,
            'reference_no' => $journal->reference_no,
            'date' => $journal->date,
            'formatted_date' => $journal->date
                ? \Carbon\Carbon::parse($journal->date)->format('d/m/Y')
                : null,
            'description' => $journal->description,
            'details' => $journal->details->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'coa' => $detail->coa
                        ? [
                            'id' => $detail->coa->id,
                            'code' => $detail->coa->code,
                            'name' => $detail->coa->name,
                        ]
                        : null,
                    'debit' => number_format((float) $detail->debit, 2, '.', ''),
                    'credit' => number_format((float) $detail->credit, 2, '.', ''),
                    'department' => $detail->department
                        ? [
                            'id' => $detail->department->id,
                            'code' => $detail->department->code,
                            'name' => $detail->department->name,
                        ]
                        : null,
                    'project' => $detail->project
                        ? [
                            'id' => $detail->project->id,
                            'code' => $detail->project->code,
                            'name' => $detail->project->name,
                        ]
                        : null,
                ];
            }),
            'created_by' => $journal->createdBy
                ? [
                    'id' => $journal->createdBy->id,
                    'name' => $journal->createdBy->name,
                ]
                : null,
        ];

        return inertia('sales/sales-delivery/voucher', [
            'journal' => $payload,
        ]);
    }
}
