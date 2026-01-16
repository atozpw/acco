<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'address',
        'email',
        'phone',
        'avatar',
        'is_customer',
        'is_vendor',
        'is_employee',
        'is_active',
    ];

    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', 1);
    }

    public function salesInvoices(): HasMany
    {
        return $this->hasMany(SalesInvoice::class);
    }

    public function purchasesInvoices(): HasMany
    {
        return $this->hasMany(PurchaseInvoice::class);
    }
}
