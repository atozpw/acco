<?php

namespace App\Helpers;

use App\Models\ReferenceCoa as ReferenceCoaModel;

class ReferenceCoa
{
    public static function getAccountReceivable(): int | null
    {
        $referenceCoa = ReferenceCoaModel::query()
            ->where('code', 'account-receivable')
            ->select('coa_id')
            ->first();

        return $referenceCoa->coa_id;
    }

    public static function getAccountPayable(): int | null
    {
        $referenceCoa = ReferenceCoaModel::query()
            ->where('code', 'account-payable')
            ->select('coa_id')
            ->first();

        return $referenceCoa->coa_id;
    }

    public static function getSalesDelivery(): int | null
    {
        $referenceCoa = ReferenceCoaModel::query()
            ->where('code', 'sales-delivery')
            ->select('coa_id')
            ->first();

        return $referenceCoa->coa_id;
    }

    public static function getPurchaseReceipt(): int | null
    {
        $referenceCoa = ReferenceCoaModel::query()
            ->where('code', 'purchase-receipt')
            ->select('coa_id')
            ->first();

        return $referenceCoa->coa_id;
    }

    public static function getSalesDiscount(): int | null
    {
        $referenceCoa = ReferenceCoaModel::query()
            ->where('code', 'sales-discount')
            ->select('coa_id')
            ->first();

        return $referenceCoa->coa_id;
    }

    public static function getPurchaseDiscount(): int | null
    {
        $referenceCoa = ReferenceCoaModel::query()
            ->where('code', 'purchase-discount')
            ->select('coa_id')
            ->first();

        return $referenceCoa->coa_id;
    }

    public static function getCurrentYearEarnings(): int | null
    {
        $referenceCoa = ReferenceCoaModel::query()
            ->where('code', 'current-year-earnings')
            ->select('coa_id')
            ->first();

        return $referenceCoa->coa_id;
    }

    public static function getRetainedEarnings(): int | null
    {
        $referenceCoa = ReferenceCoaModel::query()
            ->where('code', 'retained-earnings')
            ->select('coa_id')
            ->first();

        return $referenceCoa->coa_id;
    }
}
