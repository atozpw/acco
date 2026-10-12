<?php

namespace App\Http\Requests\Payrolls;

use Illuminate\Foundation\Http\FormRequest;

class StorePayrollFormulaRequest extends FormRequest
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
            'payroll_category_id' => [
                'required',
                'integer',
                'exists:payroll_categories,id',
            ],

            'contact_id' => [
                'required',
                'integer',
                'exists:contacts,id',
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

            'earning_amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'deduction_amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'total_amount' => [
                'required',
                'numeric',
            ],

            'details' => [
                'nullable',
                'array',
            ],

            'details.*.payroll_component_id' => [
                'required_with:details',
                'integer',
                'exists:payroll_components,id',
            ],

            'details.*.amount' => [
                'required_with:details',
                'numeric',
                'min:0',
            ],
        ];
    }
}
