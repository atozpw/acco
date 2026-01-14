<?php

namespace App\Helpers;

use App\Models\ReferenceNumber as ReferenceNumberModel;
use Illuminate\Support\Str;

class ReferenceNumber
{
    public static function getCustomer(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('customer')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateCustomer(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('customer')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 4, '0');

        $referenceNumber->save();
    }

    public static function getVendor(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('vendor')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateVendor(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('vendor')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 4, '0');

        $referenceNumber->save();
    }

    public static function getEmployee(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('employee')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateEmployee(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('employee')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 4, '0');

        $referenceNumber->save();
    }

    public static function getProduct(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('product')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateProduct(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('product')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 4, '0');

        $referenceNumber->save();
    }

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

    public static function getReceivableBeginningBalance(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('receivable-beginning-balance')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateReceivableBeginningBalance(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('receivable-beginning-balance')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getPayableBeginningBalance(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('payable-beginning-balance')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updatePayableBeginningBalance(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('payable-beginning-balance')
            ->first();

        $referenceNumber->value = Str::padLeft($referenceNumber->value + 1, 6, '0');

        $referenceNumber->save();
    }

    public static function getInventoryBeginningBalance(): string
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('inventory-beginning-balance')
            ->select('code', 'value')
            ->first();

        return ($referenceNumber) ? $referenceNumber->code . '-' . $referenceNumber->value : '';
    }

    public static function updateInventoryBeginningBalance(): void
    {
        $referenceNumber = ReferenceNumberModel::query()
            ->ofModule('inventory-beginning-balance')
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
