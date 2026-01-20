<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'contact_id' => [
                'required',
                'integer',
                'exists:contacts,id',
            ],

            'coa_id' => [
                'required',
                'integer',
                'exists:coas,id',
            ],

            'warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,id',
            ],

            'reference_no' => [
                'required',
                'string',
                'max:10',
                'unique:purchase_invoices,reference_no',
            ],

            'date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'description' => [
                'required',
                'string',
                'max:100',
            ],

            'amount' => [
                'required',
                'numeric',
            ],

            'tax_amount' => [
                'required',
                'numeric',
            ],

            'discount_percent' => [
                'required',
                'numeric',
            ],

            'discount_amount' => [
                'required',
                'numeric',
            ],

            'total' => [
                'required',
                'numeric',
            ],

            'is_paid' => [
                'required',
                'boolean',
            ],

            'is_receipt' => [
                'required',
                'boolean',
            ],

            'details.*.product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],

            'details.*.qty' => [
                'required',
                'numeric',
            ],

            'details.*.price' => [
                'required',
                'numeric',
            ],

            'details.*.amount' => [
                'required',
                'numeric',
            ],

            'details.*.tax_amount' => [
                'required',
                'numeric',
            ],

            'details.*.discount_percent' => [
                'required',
                'numeric',
            ],

            'details.*.discount_amount' => [
                'required',
                'numeric',
            ],

            'details.*.total' => [
                'required',
                'numeric',
            ],

            'details.*.note' => [
                'nullable',
                'string',
                'max:100',
            ],

            'details.*.tax_id' => [
                'nullable',
                'integer',
                'exists:taxes,id',
            ],

            'details.*.department_id' => [
                'required',
                'integer',
                'exists:departments,id',
            ],

            'details.*.project_id' => [
                'nullable',
                'integer',
                'exists:projects,id',
            ],

            'receipts.*.sales_delivery_id' => [
                'required_if:is_receipt,true',
                'integer',
                'exists:purchase_receipts,id',
            ],

            'receipts.*.note' => [
                'nullable',
                'string',
                'max:100',
            ],
        ];
    }
}
