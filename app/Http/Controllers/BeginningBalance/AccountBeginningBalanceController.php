<?php

namespace App\Http\Controllers\BeginningBalance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Response;

class AccountBeginningBalanceController extends Controller
{
    public function index(Request $request): Response
    {
        return inertia('settings/beginning-balance/account-index');
    }
}
