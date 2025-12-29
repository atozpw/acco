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

    public static function getSalesDelivery(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('sales-delivery')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateSalesDelivery(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('sales-delivery')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getSalesInvoice(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('sales-invoice')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateSalesInvoice(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('sales-invoice')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getReceivablePayment(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('receivable-payment')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateReceivablePayment(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('receivable-payment')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getPurchaseReceipt(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('purchase-receipt')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updatePurchaseReceipt(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('purchase-receipt')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getPurchaseInvoice(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('purchase-invoice')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updatePurchaseInvoice(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('purchase-invoice')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getPayablePayment(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('payable-payment')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updatePayablePayment(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('payable-payment')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }
}
