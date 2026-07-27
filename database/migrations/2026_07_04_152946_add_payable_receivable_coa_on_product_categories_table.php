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
        Schema::table('product_categories', function (Blueprint $table) {
            $table->unsignedBigInteger('payable_coa_id')->nullable()->after('purchase_return_coa_id');
            $table->unsignedBigInteger('receivable_coa_id')->nullable()->after('sales_return_coa_id');

            $table->foreign('payable_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('receivable_coa_id')->references('id')->on('coas')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropForeign('product_categories_payable_coa_id_foreign');
            $table->dropForeign('product_categories_receivable_coa_id_foreign');

            $table->dropColumn(['payable_coa_id', 'receivable_coa_id']);
        });
    }
};
