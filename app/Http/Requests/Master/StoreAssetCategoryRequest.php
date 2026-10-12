<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetCategoryRequest extends FormRequest
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
                'unique:asset_categories,code',
            ],

            'name' => [
                'required',
                'string',
                'max:50',
            ],

            'useful_life_in_years' => [
                'required',
                'integer',
                'min:0',
            ],

            'asset_coa_id' => [
                'nullable',
                'exists:coas,id',
            ],

            'accumulation_coa_id' => [
                'nullable',
                'exists:coas,id',
            ],

            'depreciation_coa_id' => [
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
