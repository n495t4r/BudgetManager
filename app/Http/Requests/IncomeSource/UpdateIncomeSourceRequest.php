<?php

namespace App\Http\Requests\IncomeSource;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIncomeSourceRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => 'string|max:255',
            'amount' => 'numeric|min:0',
            'is_active' => 'boolean',
            'month_year' => 'date_format:Y-m-d',
        ];
    }
}
