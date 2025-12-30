<?php

namespace App\Http\Controllers\Ledger;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Ledger\StoreGeneralJournalRequest;
use App\Http\Requests\Ledger\UpdateGeneralJournalRequest;
use App\Models\Coa;
use App\Models\Department;
use App\Models\Journal;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class GeneralJournalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $journals = Journal::query()
            ->where('journal_category_id', 2)
            ->withSum('details as total_debit', 'debit')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_no', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%');
                });
            })
            ->orderByDesc('created_at')
            ->simplePaginate($perPage)
            ->withQueryString();

        $journals->getCollection()->transform(function ($journal) {
            $journal->formatted_date = $journal->date
                ? \Carbon\Carbon::parse($journal->date)->format('d/m/Y')
                : null;

            return $journal;
        });

        return inertia('ledger/general-journal/index', [
            'journals' => $journals,
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
        $referenceNumber = ReferenceNumber::getGeneralJournal();

        $coas = Coa::query()
            ->active()
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

        return inertia('ledger/general-journal/create', [
            'referenceNumber' => $referenceNumber,
            'coas' => $coas,
            'departments' => $departments,
            'projects' => $projects,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGeneralJournalRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $journal = Journal::create([
                'journal_category_id' => 2,
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['details'] as $detail) {
                $journal->details()->create([
                    'coa_id' => $detail['coa_id'],
                    'debit' => $detail['debit'],
                    'credit' => $detail['credit'],
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }

            ReferenceNumber::updateGeneralJournal();
        });

        return redirect()->route('general-journal.index');
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
        $journal = Journal::query()
            ->with(['details' => function ($query) {
                $query->orderBy('id');
            }])
            ->findOrFail($id);

        $coas = Coa::query()
            ->active()
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

        return inertia('ledger/general-journal/edit', [
            'journal' => $journal,
            'coas' => $coas,
            'departments' => $departments,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGeneralJournalRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $id) {
            $journal = Journal::query()->findOrFail($id);

            $journal->update([
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
            ]);

            $journal->details()->delete();

            foreach ($validated['details'] as $detail) {
                $journal->details()->create([
                    'coa_id' => $detail['coa_id'],
                    'debit' => $detail['debit'],
                    'credit' => $detail['credit'],
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }
        });

        return redirect()->route('general-journal.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        DB::transaction(function () use ($id) {
            $journal = Journal::query()->findOrFail($id);

            $journal->details()->delete();
            $journal->delete();
        });

        return redirect()->route('general-journal.index');
    }
}
