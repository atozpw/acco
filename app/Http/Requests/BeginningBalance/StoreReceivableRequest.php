<?php

namespace App\Http\Requests\BeginningBalance;

use Illuminate\Foundation\Http\FormRequest;

class StoreReceivableRequest extends FormRequest
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
            'contact_id' => [
                'required',
                'integer',
                'exists:contacts,id',
            ],

            'coa_id' => [
                'required',
                'integer',
                'exists:coas,id',
            ],

            'reference_no' => [
                'required',
                'string',
                'max:10',
                'unique:sales_invoices,reference_no',
            ],

            'date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'amount' => [
                'required',
                'numeric',
            ],
        ];
    }
}
