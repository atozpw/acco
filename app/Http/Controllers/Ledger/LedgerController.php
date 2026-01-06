<?php

namespace App\Http\Controllers\Ledger;

use App\Http\Controllers\Controller;
use App\Models\Coa;
use App\Models\Department;
use App\Models\Journal;
use App\Models\JournalDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class LedgerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $coas = Coa::query()
            ->active()
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Department::query()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);
        $coa_id = (int) $request->input('coa_id', $coas->first()?->id ?? 0);
        $department_id = (int) $request->input('department_id');
        $date_from = (string) $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $date_to = (string) $request->input('date_to', Carbon::now()->toDateString());

        $year_of_date_from = Carbon::parse($date_from)->year;

        $opening_balance = JournalDetail::query()
            ->whereHas('journal', function ($query) use ($date_from, $year_of_date_from) {
                $query->whereYear('date', '=', $year_of_date_from)
                    ->where('date', '<', $date_from);
            })
            ->when($coa_id, fn($query) => $query->where('coa_id', $coa_id))
            ->when($department_id, fn($query) => $query->where('department_id', $department_id))
            ->selectRaw('COALESCE(SUM(debit) - SUM(credit), 0) as balance')
            ->value('balance');

        $journals = JournalDetail::query()
            ->with([
                'journal:id,date,reference_no,description',
                'coa:id,code,name',
                'department:id,code,name',
                'project:id,code,name',
            ])
            ->whereHas('journal', fn($query) => $query->where('journal_category_id', '>', 1))
            ->when($coa_id, fn($query) => $query->where('coa_id', $coa_id))
            ->when($department_id, fn($query) => $query->where('department_id', $department_id))
            ->when($search, function ($query) use ($search) {
                $query->whereHas('journal', function ($journalQuery) use ($search) {
                    $journalQuery->where(function ($innerQuery) use ($search) {
                        $innerQuery->where('reference_no', 'like', '%' . $search . '%')
                            ->orWhere('description', 'like', '%' . $search . '%');
                    });
                });
            })
            ->when($date_from || $date_to, function ($query) use ($date_from, $date_to) {
                $query->whereHas('journal', function ($journalQuery) use ($date_from, $date_to) {
                    if ($date_from) {
                        $journalQuery->whereDate('date', '>=', $date_from);
                    }
                    if ($date_to) {
                        $journalQuery->whereDate('date', '<=', $date_to);
                    }
                });
            })
            ->orderBy(
                Journal::select('date')
                    ->whereColumn('journals.id', 'journal_details.journal_id')
            )
            ->orderBy('journal_details.id')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('ledger/index', [
            'journals' => $journals,
            'opening_balance' => $opening_balance,
            'coas' => $coas,
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'coa_id' => $coa_id,
                'department_id' => $department_id,
                'date_from' => $date_from,
                'date_to' => $date_to,
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): Response
    {
        $journal = Journal::query()
            ->with([
                'details.coa:id,code,name',
                'details.department:id,code,name',
                'details.project:id,code,name',
                'createdBy:id,name',
            ])
            ->findOrFail($id);

        $payload = [
            'id' => $journal->id,
            'reference_no' => $journal->reference_no,
            'date' => $journal->date,
            'formatted_date' => $journal->date
                ? Carbon::parse($journal->date)->format('d/m/Y')
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

        return inertia('ledger/show', [
            'journal' => $payload,
        ]);
    }
}
