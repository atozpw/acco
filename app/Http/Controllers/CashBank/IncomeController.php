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
    public function show(string $id)
    {
        //
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
}
