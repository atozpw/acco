<?php

namespace App\Helpers;

use App\Models\ReferenceNumber as ReferenceNumberModel;
use Illuminate\Support\Str;

class ReferenceNumber
{
    public static function getAccountBeginningBalance(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('account-beginning-balance')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateAccountBeginningBalance(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('account-beginning-balance')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getGeneralJournal(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('general-journal')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateGeneralJournal(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('general-journal')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getIncome(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('cash-in')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateIncome(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('cash-in')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getExpense(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('cash-out')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateExpense(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('cash-out')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getCashTransfer(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('cash-transfer')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateCashTransfer(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('cash-transfer')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }
}
