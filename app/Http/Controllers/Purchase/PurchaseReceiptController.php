<?php

namespace App\Http\Controllers\Purchase;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\StorePurchaseReceiptRequest;
use App\Http\Requests\Purchase\UpdatePurchaseReceiptRequest;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Journal;
use App\Models\Product;
use App\Models\Project;
use App\Models\PurchaseReceipt;
use App\Models\Tax;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class PurchaseReceiptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $receipts = PurchaseReceipt::query()
            ->where('is_beginning', 0)
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
            ->orderByDesc('date')
            ->simplePaginate($perPage)
            ->withQueryString();

        $receipts->getCollection()->transform(function ($receipt) {
            $receipt->formatted_date = $receipt->date
                ? Carbon::parse($receipt->date)->format('d/m/Y')
                : null;

            return $receipt;
        });

        return inertia('purchases/purchase-receipt/index', [
            'receipts' => $receipts,
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
        $referenceNumber = ReferenceNumber::getPurchaseReceipt();

        $contacts = Contact::query()
            ->active()
            ->where('is_vendor', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $warehouses = Warehouse::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::query()
            ->active()
            ->with(['purchaseTax:id,code,name,rate', 'stocks:id,warehouse_id,product_id,qty'])
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'purchase_price', 'purchase_tax_id']);

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

        return inertia('purchases/purchase-receipt/create', [
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
    public function store(StorePurchaseReceiptRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $receipt = PurchaseReceipt::create([
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
                $receipt->details()->create([
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

            ReferenceNumber::updatePurchaseReceipt();
        });

        return redirect()->route('purchase-receipt.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $receipt = PurchaseReceipt::query()
            ->with([
                'contact:id,name,address',
                'details' => function ($query) {
                    $query->orderBy('id')->with(['product:id,code,name']);
                },
            ])
            ->findOrFail($id);

        $details = $receipt->details->map(function ($detail) {
            return [
                'id' => $detail->id,
                'qty' => (float) $detail->qty,
                'note' => $detail->note ?? null,
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
            'id' => $receipt->id,
            'reference_no' => $receipt->reference_no,
            'date' => $receipt->date,
            'formatted_date' => $receipt->date
                ? Carbon::parse($receipt->date)->format('d/m/Y')
                : null,
            'contact' => $receipt->contact
                ? [
                    'id' => $receipt->contact->id,
                    'name' => $receipt->contact->name,
                    'address' => $receipt->contact->address ?? null,
                ]
                : null,
            'details' => $details,
        ];

        return inertia('purchases/purchase-receipt/show', [
            'receipt' => $payload,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $receipt = PurchaseReceipt::with(['details' => function ($query) {
            $query->orderBy('id');
        }])->findOrFail($id);

        $formatDecimal = function ($value) {
            return number_format((float) $value, 2, '.', '');
        };

        $receiptData = [
            'id' => $receipt->id,
            'contact_id' => (string) $receipt->contact_id,
            'warehouse_id' => (string) $receipt->warehouse_id,
            'reference_no' => $receipt->reference_no,
            'date' => $receipt->date
                ? Carbon::parse($receipt->date)->format('Y-m-d')
                : now()->format('Y-m-d'),
            'description' => $receipt->description,
            'amount' => $formatDecimal($receipt->amount),
            'tax_amount' => $formatDecimal($receipt->tax_amount),
            'discount_percent' => $formatDecimal($receipt->discount_percent),
            'discount_amount' => $formatDecimal($receipt->discount_amount),
            'total' => $formatDecimal($receipt->total),
            'is_closed' => (bool) $receipt->is_closed,
            'details' => $receipt->details->map(function ($detail) use ($formatDecimal) {
                $discountPercent = $formatDecimal($detail->discount_percent);
                $discountAmount = $formatDecimal($detail->discount_amount);

                $discountType = (float) $discountAmount > 0 && (float) $discountPercent == 0
                    ? 'amount'
                    : 'percent';

                return [
                    'id' => $detail->id,
                    'product_id' => (string) $detail->product_id,
                    'qty' => $formatDecimal($detail->qty),
                    'price' => $formatDecimal($detail->price),
                    'amount' => $formatDecimal($detail->amount),
                    'tax_amount' => $formatDecimal($detail->tax_amount),
                    'discount_percent' => $discountPercent,
                    'discount_amount' => $discountAmount,
                    'total' => $formatDecimal($detail->total),
                    'note' => $detail->note ?? '',
                    'tax_id' => $detail->tax_id ? (string) $detail->tax_id : '',
                    'department_id' => (string) $detail->department_id,
                    'project_id' => $detail->project_id ? (string) $detail->project_id : '',
                    'discount_type' => $discountType,
                ];
            }),
        ];

        $contacts = Contact::query()
            ->active()
            ->where('is_vendor', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $warehouses = Warehouse::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::query()
            ->active()
            ->with(['purchaseTax:id,code,name,rate', 'stocks:id,warehouse_id,product_id,qty'])
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'purchase_price', 'purchase_tax_id']);

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

        return inertia('purchases/purchase-receipt/edit', [
            'receipt' => $receiptData,
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
    public function update(UpdatePurchaseReceiptRequest $request, string $id): RedirectResponse
    {
        $receipt = PurchaseReceipt::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($receipt, $validated, $request) {
            $receipt->update([
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

            $receipt->details->each->delete();

            foreach ($validated['details'] as $detail) {
                $receipt->details()->create([
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

        return redirect()->route('purchase-receipt.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $receipt = PurchaseReceipt::query()->findOrFail($id);

        $receipt->details->each->delete();
        $receipt->delete();

        return redirect()->route('purchase-receipt.index');
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

        return inertia('purchases/purchase-receipt/voucher', [
            'journal' => $payload,
        ]);
    }
}
