<?php

namespace App\Http\Controllers\Ledger;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Response;

class LedgerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return inertia('ledger/index');
    }
}
