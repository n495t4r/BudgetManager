<?php

namespace App\Http\Requests\Expense;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'line_item_id' => 'required|exists:line_items,id',
            'description' => 'required|string|max:255',
        ];
    }

    // In StoreExpenseRequest.php
    protected function prepareForValidation()
    {
        if ($this->has('date')) {
            $this->merge([
                'date' => Carbon::parse($this->input('date')),
            ]);
        }
    }

}
