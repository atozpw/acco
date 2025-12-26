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
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code', 6)->unique();
            $table->string('name', 50);
            $table->unsignedBigInteger('inventory_coa_id')->nullable();
            $table->unsignedBigInteger('purchase_coa_id')->nullable();
            $table->unsignedBigInteger('purchase_receipt_coa_id')->nullable();
            $table->unsignedBigInteger('purchase_return_coa_id')->nullable();
            $table->unsignedBigInteger('sales_coa_id')->nullable();
            $table->unsignedBigInteger('sales_delivery_coa_id')->nullable();
            $table->unsignedBigInteger('sales_return_coa_id')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('inventory_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('purchase_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('purchase_receipt_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('purchase_return_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('sales_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('sales_delivery_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('sales_return_coa_id')->references('id')->on('coas')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
