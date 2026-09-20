<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCashAdvanceClassificationRequest extends FormRequest
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
        $id = $this->route('id');

        return [
            'code' => [
                'required',
                'string',
                'max:6',
                'unique:cash_advance_classifications,code,' . $id,
            ],

            'name' => [
                'required',
                'string',
                'max:50',
            ],

            'cash_advance_income_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'cash_advance_expense_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }
}
