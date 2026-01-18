<?php

namespace App\Http\Requests\BeginningBalance;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'project_id' => $this->filled('project_id') ? $this->input('project_id') : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],
            'warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,id',
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
            'qty' => [
                'required',
                'decimal:2',
                'gt:0',
            ],
            'price' => [
                'required',
                'decimal:2',
                'gt:0',
            ],
        ];
    }
}
