<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class DataVisibilityScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (!Auth::check()) {
            return;
        }

        $user = Auth::user();

        $table = $model->getTable();

        if ($user->is_only_mine) {
            $builder->where(
                $table . '.created_by',
                $user->id
            );

            return;
        }

        $builder->whereIn(
            $table . '.department_id',
            function ($query) use ($user) {
                $query->select('department_id')
                    ->from('user_departments')
                    ->where('user_id', $user->id);
            }
        );
    }
}
