<?php

namespace App\Helpers;

use App\Models\ReferenceNumber as ReferenceNumberModel;
use Illuminate\Support\Str;

class ReferenceNumber
{
    public static function getAccountBeginningBalance(): string
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'account-beginning-balance')->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateAccountBeginningBalance(): void
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'account-beginning-balance')->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getGeneralJournal(): string
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'general-journal')->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateGeneralJournal(): void
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'general-journal')->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getIncome(): string
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'cash-in')->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateIncome(): void
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'cash-in')->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getExpense(): string
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'cash-out')->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateExpense(): void
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'cash-out')->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getCashTransfer(): string
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'cash-transfer')->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateCashTransfer(): void
    {
        $referenceNumber = ReferenceNumberModel::where('module', 'cash-transfer')->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }
}
