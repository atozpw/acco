<?php

namespace App\Http\Requests\Ledger;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGeneralJournalRequest extends FormRequest
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
            'reference_no' => [
                'required',
                'string',
                'max:10',
                Rule::unique('journals', 'reference_no')->ignore($this->route('id')),
            ],

            'date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'description' => [
                'required',
                'string',
                'max:100',
            ],

            'details.*.coa_id' => [
                'required',
                'integer',
                'exists:coas,id',
            ],

            'details.*.debit' => [
                'required',
                'decimal:2',
            ],

            'details.*.credit' => [
                'required',
                'decimal:2',
            ],

            'details.*.note' => [
                'nullable',
                'string',
                'max:100',
            ],

            'details.*.department_id' => [
                'required',
                'integer',
                'exists:departments,id',
            ],

            'details.*.project_id' => [
                'nullable',
                'integer',
                'exists:projects,id',
            ],
        ];
    }
}
