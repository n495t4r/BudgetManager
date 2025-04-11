<?php

namespace App\Http\Requests\LineItem;
use Illuminate\Foundation\Http\FormRequest;

class StoreLineItemRequest extends FormRequest
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
