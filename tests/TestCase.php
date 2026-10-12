<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (DB::connection()->getDriverName() === 'sqlite') {
            $pdo = DB::connection()->getPdo();

            $registerFunction = function (string $name, callable $callback) use ($pdo): void {
                if (method_exists($pdo, 'createFunction')) {
                    $pdo->createFunction($name, $callback);
                } elseif (method_exists($pdo, 'sqliteCreateFunction')) {
                    call_user_func([$pdo, 'sqliteCreateFunction'], $name, $callback);
                }
            };

            $registerFunction('MONTH', fn ($date) => $date ? (int) date('m', strtotime($date)) : null);
            $registerFunction('YEAR', fn ($date) => $date ? (int) date('Y', strtotime($date)) : null);
            $registerFunction('DAY', fn ($date) => $date ? (int) date('d', strtotime($date)) : null);
        }
    }
}
