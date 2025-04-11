<?php

namespace App\Http\Requests\Bucket;
use Illuminate\Foundation\Http\FormRequest;

class StoreBucketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'percentage' => 'required|numeric|min:0|max:100',
        ];
    }
}
