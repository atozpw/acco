<?php

namespace App\Http\Controllers\CashBank;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\CashBank\StoreIncomeRequest;
use App\Http\Requests\CashBank\UpdateIncomeRequest;
use App\Models\Contact;
use App\Models\Coa;
use App\Models\Department;
use App\Models\Income;
use App\Models\Journal;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class IncomeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $incomes = Income::query()
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

        $incomes->getCollection()->transform(function ($income) {
            $income->formatted_date = $income->date
                ? \Carbon\Carbon::parse($income->date)->format('d/m/Y')
                : null;

            return $income;
        });

        return inertia('cash-bank/income/index', [
            'incomes' => $incomes,
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
        $referenceNumber = ReferenceNumber::getIncome();

        $contacts = Contact::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $cashCoas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $coas = Coa::query()
            ->active()
            ->whereIn('coa_classification_id', [4, 8])
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

        return inertia('cash-bank/income/create', [
            'referenceNumber' => $referenceNumber,
            'contacts' => $contacts,
            'cashCoas' => $cashCoas,
            'coas' => $coas,
            'departments' => $departments,
            'projects' => $projects,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIncomeRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $income = Income::create([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['details'] as $detail) {
                $income->details()->create([
                    'coa_id' => $detail['coa_id'],
                    'amount' => $detail['amount'],
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }
        });

        return redirect()->route('income.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $income = Income::query()
            ->with([
                'contact:id,name',
                'createdBy:id,name',
                'details.coa:id,code,name',
                'details.department:id,code,name',
                'details.project:id,code,name',
            ])
            ->findOrFail($id);

        $payload = [
            'id' => $income->id,
            'reference_no' => $income->reference_no,
            'date' => $income->date,
            'formatted_date' => $income->date
                ? now()->parse($income->date)->format('d/m/Y')
                : null,
            'description' => $income->description,
            'amount' => number_format((float) $income->amount, 2, '.', ''),
            'contact' => $income->contact
                ? [
                    'id' => $income->contact->id,
                    'name' => $income->contact->name,
                ]
                : null,
            'created_by' => $income->createdBy
                ? [
                    'id' => $income->createdBy->id,
                    'name' => $income->createdBy->name,
                ]
                : null,
            'details' => $income->details
                ->map(function ($detail) {
                    return [
                        'coa' => $detail->coa
                            ? [
                                'id' => $detail->coa->id,
                                'code' => $detail->coa->code,
                                'name' => $detail->coa->name,
                            ]
                            : null,
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
                        'amount' => number_format((float) $detail->amount, 2, '.', ''),
                        'note' => $detail->note,
                    ];
                })
                ->values(),
        ];

        return inertia('cash-bank/income/show', [
            'income' => $payload,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $income = Income::query()
            ->with(['details' => function ($query) {
                $query->orderBy('id');
            }])
            ->findOrFail($id);

        $contacts = Contact::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $cashCoas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $coas = Coa::query()
            ->active()
            ->whereIn('coa_classification_id', [4, 8])
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

        return inertia('cash-bank/income/edit', [
            'income' => $income,
            'contacts' => $contacts,
            'cashCoas' => $cashCoas,
            'coas' => $coas,
            'departments' => $departments,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateIncomeRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $id) {
            $income = Income::query()->findOrFail($id);

            $income->contact_id = $validated['contact_id'];
            $income->coa_id = $validated['coa_id'];
            $income->reference_no = $validated['reference_no'];
            $income->date = $validated['date'];
            $income->description = $validated['description'];
            $income->amount = $validated['amount'];
            $income->save();

            $income->details()->delete();

            foreach ($validated['details'] as $detail) {
                $income->details()->create([
                    'coa_id' => $detail['coa_id'],
                    'amount' => $detail['amount'],
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }
        });

        return redirect()->route('income.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        DB::transaction(function () use ($id) {
            $income = Income::query()->findOrFail($id);

            $income->details()->delete();
            $income->delete();
        });

        return redirect()->route('income.index');
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

        return inertia('cash-bank/income/voucher', [
            'journal' => $payload,
        ]);
    }
}
