<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReferenceNumber extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'module',
        'code',
        'value',
    ];

    #[Scope]
    protected function ofModule(Builder $query, string $module): void
    {
        $query->where('module', $module);
    }
}
