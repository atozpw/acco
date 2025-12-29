<?php

namespace App\Http\Controllers\CashBank;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\CashBank\StoreExpenseRequest;
use App\Http\Requests\CashBank\UpdateExpenseRequest;
use App\Models\Contact;
use App\Models\Coa;
use App\Models\Department;
use App\Models\Expense;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $expenses = Expense::query()
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

        $expenses->getCollection()->transform(function ($expense) {
            $expense->formatted_date = $expense->date
                ? \Carbon\Carbon::parse($expense->date)->format('d/m/Y')
                : null;

            return $expense;
        });

        return inertia('cash-bank/expense/index', [
            'expenses' => $expenses,
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
        $referenceNumber = ReferenceNumber::getExpense();

        $contacts = Contact::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $cashCoas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $coas = Coa::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return inertia('cash-bank/expense/create', [
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
    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $expense = Expense::create([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['details'] as $detail) {
                $expense->details()->create([
                    'coa_id' => $detail['coa_id'],
                    'amount' => $detail['amount'],
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }
        });

        return redirect()->route('expense.index');
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
    public function edit(string $id): Response
    {
        $expense = Expense::query()
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
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $coas = Coa::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return inertia('cash-bank/expense/edit', [
            'expense' => $expense,
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
    public function update(UpdateExpenseRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $id) {
            $expense = Expense::query()->findOrFail($id);

            $expense->update([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
            ]);

            $expense->details()->delete();

            foreach ($validated['details'] as $detail) {
                $expense->details()->create([
                    'coa_id' => $detail['coa_id'],
                    'amount' => $detail['amount'],
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }
        });

        return redirect()->route('expense.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        DB::transaction(function () use ($id) {
            $expense = Expense::query()->findOrFail($id);

            $expense->details()->delete();
            $expense->delete();
        });

        return redirect()->route('expense.index');
    }
}
