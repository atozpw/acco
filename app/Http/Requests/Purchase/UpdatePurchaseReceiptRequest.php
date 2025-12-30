<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseReceiptRequest extends FormRequest
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

            'warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,id',
            ],

            'reference_no' => [
                'required',
                'string',
                'max:10',
                Rule::unique('purchase_receipts', 'reference_no')->ignore($this->route('id')),
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
                'decimal:2',
            ],

            'tax_amount' => [
                'required',
                'decimal:2',
            ],

            'discount_percent' => [
                'required',
                'decimal:2',
            ],

            'discount_amount' => [
                'required',
                'decimal:2',
            ],

            'total' => [
                'required',
                'decimal:2',
            ],

            'is_closed' => [
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
                'decimal:2',
            ],

            'details.*.price' => [
                'required',
                'decimal:2',
            ],

            'details.*.amount' => [
                'required',
                'decimal:2',
            ],

            'details.*.tax_amount' => [
                'required',
                'decimal:2',
            ],

            'details.*.discount_percent' => [
                'required',
                'decimal:2',
            ],

            'details.*.discount_amount' => [
                'required',
                'decimal:2',
            ],

            'details.*.total' => [
                'required',
                'decimal:2',
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
        ];
    }
}
