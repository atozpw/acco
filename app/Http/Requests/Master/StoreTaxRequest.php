<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaxRequest extends FormRequest
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
                'max:10',
                'unique:taxes,code',
            ],

            'name' => [
                'required',
                'string',
                'max:50',
            ],

            'rate' => [
                'required',
                'numeric',
            ],

            'sales_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'purchase_coa_id' => [
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
