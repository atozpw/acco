<?php

namespace App\Http\Requests\CashBank;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashAdvanceIncomeRequest extends FormRequest
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
                'unique:cash_advance_incomes,reference_no',
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

            'total' => [
                'required',
                'numeric',
            ],

            'details.*.cash_advance_classification_id' => [
                'required',
                'integer',
                'exists:cash_advance_classifications,id',
            ],

            'details.*.amount' => [
                'required',
                'numeric',
            ],

            'details.*.tax_amount' => [
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
        ];
    }
}
