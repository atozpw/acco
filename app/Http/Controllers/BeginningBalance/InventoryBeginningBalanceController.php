<?php

namespace App\Http\Controllers\BeginningBalance;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\BeginningBalance\StoreInventoryRequest;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Product;
use App\Models\Project;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseReceiptDetail;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class InventoryBeginningBalanceController extends Controller
{
    public function index(): Response
    {
        $items = PurchaseReceiptDetail::query()
            ->select(['id', 'product_id', 'qty', 'price', 'total'])
            ->with(['product:id,code,name'])
            ->whereHas('purchaseReceipt', function ($query) {
                $query->where('is_beginning', 1);
            })
            ->orderBy('product_id')
            ->orderBy('id')
            ->get()
            ->map(function (PurchaseReceiptDetail $detail) {
                $product = $detail->product;

                return [
                    'id' => $detail->id,
                    'qty' => $detail->qty,
                    'price' => $detail->price,
                    'total' => $detail->total,
                    'product' => $product
                        ? [
                            'id' => $product->id,
                            'code' => $product->code,
                            'name' => $product->name,
                        ]
                        : null,
                ];
            })
            ->values();

        return inertia('settings/beginning-balance/inventory-index', [
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        $products = Product::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'purchase_price']);

        $warehouses = Warehouse::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return inertia('settings/beginning-balance/inventory-create', [
            'products' => $products,
            'warehouses' => $warehouses,
            'departments' => $departments,
            'projects' => $projects,
        ]);
    }

    public function store(StoreInventoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $defaultVendorId = Contact::query()
            ->active()
            ->where('is_vendor', 1)
            ->orderBy('id')
            ->value('id');

        if (!$defaultVendorId) {
            throw ValidationException::withMessages([
                'contact_id' => 'Vendor default belum tersedia. Tambahkan data pemasok aktif terlebih dahulu.',
            ]);
        }

        $referenceNo = ReferenceNumber::getInventoryBeginningBalance();
        $entryDate = Carbon::create(now()->year, 1, 1)->format('Y-m-d');

        $qty = (float) $validated['qty'];
        $price = (float) $validated['price'];
        $amount = round($qty * $price, 2);

        DB::transaction(function () use ($validated, $request, $defaultVendorId, $referenceNo, $entryDate, $qty, $price, $amount) {
            $receipt = PurchaseReceipt::create([
                'contact_id' => $defaultVendorId,
                'warehouse_id' => $validated['warehouse_id'],
                'reference_no' => $referenceNo,
                'date' => $entryDate,
                'description' => 'Saldo Awal Persediaan',
                'amount' => $amount,
                'tax_amount' => 0,
                'discount_percent' => 0,
                'discount_amount' => 0,
                'total' => $amount,
                'is_closed' => 1,
                'is_beginning' => 1,
                'created_by' => $request->user()?->id,
            ]);

            $receipt->details()->create([
                'product_id' => $validated['product_id'],
                'qty' => $qty,
                'price' => $price,
                'amount' => $amount,
                'tax_amount' => 0,
                'discount_percent' => 0,
                'discount_amount' => 0,
                'total' => $amount,
                'note' => null,
                'tax_id' => null,
                'department_id' => $validated['department_id'],
                'project_id' => $validated['project_id'] ?? null,
                'created_by' => $request->user()?->id,
            ]);

            ReferenceNumber::updateInventoryBeginningBalance();
        });

        return redirect()
            ->route('beginning-balance.inventory.index')
            ->with('success', 'Saldo awal persediaan berhasil disimpan.');
    }
}
