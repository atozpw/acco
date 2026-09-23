<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payroll_formula_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payroll_formula_id');
            $table->unsignedBigInteger('payroll_component_id');
            $table->decimal('amount', 16, 2)->default(0);
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('payroll_formula_id')->references('id')->on('payroll_formulas')->onUpdate('cascade');
            $table->foreign('payroll_component_id')->references('id')->on('payroll_components')->onUpdate('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_formula_details');
    }
};
