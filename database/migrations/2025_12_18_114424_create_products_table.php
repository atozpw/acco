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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_category_id');
            $table->string('code', 8)->unique();
            $table->string('name', 50);
            $table->unsignedBigInteger('unit_measurement_id');
            $table->decimal('sales_price', 16, 2)->default(0);
            $table->decimal('purchase_price', 16, 2)->default(0);
            $table->unsignedBigInteger('sales_tax_id')->nullable();
            $table->unsignedBigInteger('purchase_tax_id')->nullable();
            $table->decimal('minimum_stock', 10, 2)->nullable();
            $table->string('description', 100)->nullable();
            $table->string('image', 100)->nullable();
            $table->boolean('is_stock_tracking')->default(1);
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_category_id')->references('id')->on('product_categories')->onUpdate('cascade');
            $table->foreign('unit_measurement_id')->references('id')->on('unit_measurements')->onUpdate('cascade');
            $table->foreign('sales_tax_id')->references('id')->on('taxes')->onUpdate('cascade');
            $table->foreign('purchase_tax_id')->references('id')->on('taxes')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
