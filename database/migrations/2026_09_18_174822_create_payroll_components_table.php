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
        Schema::create('payroll_components', function (Blueprint $table) {
            $table->id();
            $table->string('code', 6)->unique();
            $table->string('name', 50);
            $table->enum('type', ['earning', 'deduction']);
            $table->unsignedBigInteger('payable_coa_id')->nullable();
            $table->unsignedBigInteger('expense_coa_id')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('payable_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('expense_coa_id')->references('id')->on('coas')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_components');
    }
};
