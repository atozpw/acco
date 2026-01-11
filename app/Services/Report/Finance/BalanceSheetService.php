<?php

namespace App\Services\Report\Finance;

use App\Models\CoaClassification;
use App\Models\JournalDetail;

class BalanceSheetService
{
    public static function get(): array
    {
        $classifications = CoaClassification::query()
            ->with(['coas' => function ($query) {
                $query->where('is_active', 1);
            }])
            ->where('type', 'balance-sheet')
            ->where('is_active', 1)
            ->get();

        $journalSums = JournalDetail::selectRaw('coa_id, sum(debit - credit) as saldo')
            ->groupBy('coa_id')
            ->pluck('saldo', 'coa_id');

//        return $classifications->map(function ($classification) use ($journalSums) {
//            return [
//                'classification_name' => $classification->name,
//                'accounts' => self::buildCoaTreeLeafOnly(
//                    $classification->coas,
//                    $journalSums
//                ),
//            ];
//        })->toArray();

        return $classifications->map(function ($classification) use ($journalSums) {
            return [
                'classification_name' => $classification->name,
                'accounts' => self::buildCoaTreeWithAmount(
                    $classification->coas,
                    $journalSums
                ),
            ];
        })->toArray();
    }

    private static function buildCoaTreeLeafOnly($coas, $journalSums)
    {
        $grouped = $coas->groupBy('parent_id');

        $build = function ($parentId) use (&$build, $grouped, $journalSums) {

            return ($grouped[$parentId] ?? collect())->map(function ($coa) use ($build, $journalSums) {

                $children = $build($coa->id);

                return [
                    'id'       => $coa->id,
                    'name'     => $coa->name,
                    'amount'   => $children->isEmpty()
                        ? ($journalSums[$coa->id] ?? 0)
                        : 0,
                    'children' => $children,
                ];
            })->values();

        };

        return $build(null);
    }

    private static function buildCoaTreeWithAmount($coas, $journalSums)
    {
        $grouped = $coas->groupBy('parent_id');

        $build = function ($parentId) use (&$build, $grouped, $journalSums) {

            return ($grouped[$parentId] ?? collect())->map(function ($coa) use ($build, $journalSums) {

                $children = $build($coa->id);

                $childrenTotal = $children->sum('amount');

                $selfAmount = $journalSums[$coa->id] ?? 0;

                return [
                    'id'       => $coa->id,
                    'name'     => $coa->name,
                    'amount'   => $selfAmount + $childrenTotal,
                    'children' => $children,
                ];
            })->values();

        };

        return $build(null);
    }
}
