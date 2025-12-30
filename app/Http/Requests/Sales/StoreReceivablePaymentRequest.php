<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class StoreReceivablePaymentRequest extends FormRequest
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

            'reference_no' => [
                'required',
                'string',
                'max:10',
                'unique:receivable_payments,reference_no',
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

            'details.*.sales_invoice_id' => [
                'required',
                'integer',
                'exists:sales_invoices,id',
            ],

            'details.*.amount' => [
                'required',
                'decimal:2',
            ],

            'details.*.note' => [
                'nullable',
                'string',
                'max:100',
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
