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
        Schema::table('payroll_details', function (Blueprint $table) {
            $table->dropForeign(['coa_id']);
            $table->dropColumn('coa_id');

            $table->unsignedBigInteger('payable_coa_id')->nullable()->after('payroll_component_id');
            $table->unsignedBigInteger('expense_coa_id')->nullable()->after('payable_coa_id');

            $table->foreign('payable_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('expense_coa_id')->references('id')->on('coas')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_details', function (Blueprint $table) {
            $table->dropForeign(['payable_coa_id']);
            $table->dropForeign(['expense_coa_id']);
            $table->dropColumn(['payable_coa_id', 'expense_coa_id']);

            $table->unsignedBigInteger('coa_id')->nullable()->after('payroll_component_id');
            $table->foreign('coa_id')->references('id')->on('coas')->onUpdate('cascade');
        });
    }
};
