<?php

namespace App\Http\Requests\Payrolls;

use Illuminate\Foundation\Http\FormRequest;

class StorePayrollPeriodRequest extends FormRequest
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

            'reference_no' => [
                'required',
                'string',
                'max:10',
                'unique:payroll_periodes,reference_no',
            ],

            'date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'start_date' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'end_date' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:start_date',
            ],

            'description' => [
                'required',
                'string',
                'max:100',
            ],
        ];
    }
}
