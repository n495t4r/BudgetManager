<?php

namespace App\Http\Requests\Expense;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
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
}
