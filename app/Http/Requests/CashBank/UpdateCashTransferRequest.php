<?php

namespace App\Http\Requests\CashBank;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCashTransferRequest extends FormRequest
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
            'from_coa_id' => [
                'required',
                'integer',
                'exists:coas,id',
            ],

            'to_coa_id' => [
                'required',
                'integer',
                'exists:coas,id',
            ],

            'reference_no' => [
                'required',
                'string',
                'max:10',
                Rule::unique('cash_transfers', 'reference_no')->ignore($this->route('id')),
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

            'department_id' => [
                'required',
                'integer',
                'exists:departments,id',
            ],

            'project_id' => [
                'nullable',
                'integer',
                'exists:projects,id',
            ],
        ];
    }
}
