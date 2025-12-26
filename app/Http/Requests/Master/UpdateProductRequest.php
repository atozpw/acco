<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
            'product_category_id' => [
                'required',
                'integer',
                'exists:product_categories,id',
            ],

            'code' => [
                'required',
                'string',
                'max:8',
                Rule::unique('products', 'code')->ignore($this->product->id),
            ],

            'name' => [
                'required',
                'string',
                'max:50',
            ],

            'unit_measurement_id' => [
                'required',
                'integer',
                'exists:unit_measurements,id',
            ],

            'sales_price' => [
                'required',
                'decimal:2',
            ],

            'purchase_price' => [
                'required',
                'decimal:2',
            ],

            'sales_tax_id' => [
                'nullable',
                'integer',
                'exists:taxes,id',
            ],

            'purchase_tax_id' => [
                'nullable',
                'integer',
                'exists:taxes,id',
            ],

            'minimum_stock' => [
                'nullable',
                'decimal:2',
            ],

            'description' => [
                'nullable',
                'string',
                'max:100',
            ],

            'image' => [
                'nullable',
                'image',
                'max:1024',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }
}
