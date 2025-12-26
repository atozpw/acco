<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class StoreCoaRequest extends FormRequest
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
            'parent_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'code' => [
                'required',
                'string',
                'max:10',
                'unique:coas,code',
            ],

            'name' => [
                'required',
                'string',
                'max:50',
            ],

            'coa_classification_id' => [
                'required',
                'integer',
                'exists:coa_classifications,id',
            ],

            'is_debit' => [
                'required',
                'boolean',
            ],

            'is_cash_bank' => [
                'required',
                'boolean',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }
}
