<?php

namespace App\Http\Requests\IncomeSource;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncomeSourceRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            // 'period' => 'string',
            // 'month_year' => 'required|date_format:Y-m-d',
        ];
    }
}
