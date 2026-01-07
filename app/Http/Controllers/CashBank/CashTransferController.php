<?php

namespace App\Http\Controllers\CashBank;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\CashBank\StoreCashTransferRequest;
use App\Http\Requests\CashBank\UpdateCashTransferRequest;
use App\Models\Coa;
use App\Models\Department;
use App\Models\CashTransfer;
use App\Models\Journal;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class CashTransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $cashTransfers = CashTransfer::query()
            ->with(['department:id,code,name'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_no', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%')
                        ->orWhereHas('department', function ($dq) use ($search) {
                            $dq->where('name', 'like', '%' . $search . '%')
                                ->orWhere('code', 'like', '%' . $search . '%');
                        });
                });
            })
            ->orderByDesc('created_at')
            ->simplePaginate($perPage)
            ->withQueryString();

        $cashTransfers->getCollection()->transform(function ($transfer) {
            $transfer->formatted_date = $transfer->date
                ? \Carbon\Carbon::parse($transfer->date)->format('d/m/Y')
                : null;

            return $transfer;
        });

        return inertia('cash-bank/cash-transfer/index', [
            'cashTransfers' => $cashTransfers,
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
        $referenceNumber = ReferenceNumber::getCashTransfer();

        $cashCoas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return inertia('cash-bank/cash-transfer/create', [
            'referenceNumber' => $referenceNumber,
            'cashCoas' => $cashCoas,
            'departments' => $departments,
            'projects' => $projects,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCashTransferRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            CashTransfer::create([
                'from_coa_id' => $validated['from_coa_id'],
                'to_coa_id' => $validated['to_coa_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'department_id' => $validated['department_id'],
                'project_id' => $validated['project_id'] ?? null,
                'created_by' => $request->user()?->id,
            ]);
        });

        return redirect()->route('cash-transfer.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $cashTransfer = CashTransfer::query()
            ->with([
                'fromCoa:id,code,name',
                'toCoa:id,code,name',
                'department:id,code,name',
                'project:id,code,name',
                'createdBy:id,name',
            ])
            ->findOrFail($id);

        $payload = [
            'id' => $cashTransfer->id,
            'reference_no' => $cashTransfer->reference_no,
            'date' => $cashTransfer->date,
            'formatted_date' => $cashTransfer->date
                ? Carbon::parse($cashTransfer->date)->format('d/m/Y')
                : null,
            'description' => $cashTransfer->description,
            'amount' => number_format((float) $cashTransfer->amount, 2, '.', ''),
            'department' => $cashTransfer->department
                ? [
                    'id' => $cashTransfer->department->id,
                    'code' => $cashTransfer->department->code,
                    'name' => $cashTransfer->department->name,
                ]
                : null,
            'project' => $cashTransfer->project
                ? [
                    'id' => $cashTransfer->project->id,
                    'code' => $cashTransfer->project->code,
                    'name' => $cashTransfer->project->name,
                ]
                : null,
            'from_coa' => $cashTransfer->fromCoa
                ? [
                    'id' => $cashTransfer->fromCoa->id,
                    'code' => $cashTransfer->fromCoa->code,
                    'name' => $cashTransfer->fromCoa->name,
                ]
                : null,
            'to_coa' => $cashTransfer->toCoa
                ? [
                    'id' => $cashTransfer->toCoa->id,
                    'code' => $cashTransfer->toCoa->code,
                    'name' => $cashTransfer->toCoa->name,
                ]
                : null,
            'created_by' => $cashTransfer->createdBy
                ? [
                    'id' => $cashTransfer->createdBy->id,
                    'name' => $cashTransfer->createdBy->name,
                ]
                : null,
        ];

        return inertia('cash-bank/cash-transfer/show', [
            'cashTransfer' => $payload,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $cashTransfer = CashTransfer::query()
            ->with(['department:id,code,name', 'project:id,code,name'])
            ->findOrFail($id);

        $cashCoas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return inertia('cash-bank/cash-transfer/edit', [
            'cashTransfer' => $cashTransfer,
            'cashCoas' => $cashCoas,
            'departments' => $departments,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCashTransferRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $id) {
            $cashTransfer = CashTransfer::query()->findOrFail($id);

            $cashTransfer->from_coa_id = $validated['from_coa_id'];
            $cashTransfer->to_coa_id = $validated['to_coa_id'];
            $cashTransfer->reference_no = $validated['reference_no'];
            $cashTransfer->date = $validated['date'];
            $cashTransfer->description = $validated['description'];
            $cashTransfer->amount = $validated['amount'];
            $cashTransfer->department_id = $validated['department_id'];
            $cashTransfer->project_id = $validated['project_id'] ?? null;
            $cashTransfer->save();
        });

        return redirect()->route('cash-transfer.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        DB::transaction(function () use ($id) {
            $cashTransfer = CashTransfer::query()->findOrFail($id);

            $cashTransfer->delete();
        });

        return redirect()->route('cash-transfer.index');
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

        return inertia('cash-bank/cash-transfer/voucher', [
            'journal' => $payload,
        ]);
    }
}
