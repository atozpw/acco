<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePayrollComponentRequest extends FormRequest
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
            'code' => [
                'required',
                'string',
                'max:6',
                Rule::unique('payroll_components', 'code')->ignore($this->route('id')),
            ],

            'name' => [
                'required',
                'string',
                'max:50',
            ],

            'type' => [
                'required',
                'string',
                'in:earning,deduction',
            ],

            'payable_coa_id' => [
                'nullable',
                'exists:coas,id',
            ],

            'expense_coa_id' => [
                'nullable',
                'exists:coas,id',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }
}
