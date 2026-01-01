<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductCategoryRequest extends FormRequest
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
                Rule::unique('product_categories', 'code')->ignore($this->route('id')),
            ],

            'name' => [
                'required',
                'string',
                'max:50',
            ],

            'inventory_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'purchase_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'purchase_receipt_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'purchase_return_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'sales_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'sales_delivery_coa_id' => [
                'nullable',
                'integer',
                'exists:coas,id',
            ],

            'sales_return_coa_id' => [
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
