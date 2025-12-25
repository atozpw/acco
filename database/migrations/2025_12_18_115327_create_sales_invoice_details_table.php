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
        Schema::create('sales_invoice_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sales_invoice_id');
            $table->unsignedBigInteger('product_id');
            $table->decimal('qty', 10, 2)->default(0);
            $table->decimal('price', 16, 2)->default(0);
            $table->decimal('amount', 16, 2)->default(0);
            $table->decimal('tax_amount', 16, 2)->default(0);
            $table->decimal('discount_percent', 4, 2)->default(0);
            $table->decimal('discount_amount', 16, 2)->default(0);
            $table->decimal('total', 16, 2)->default(0);
            $table->string('note', 100)->nullable();
            $table->unsignedBigInteger('tax_id')->nullable();
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('sales_invoice_id')->references('id')->on('sales_invoices')->onUpdate('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onUpdate('cascade');
            $table->foreign('tax_id')->references('id')->on('taxes')->onUpdate('cascade');
            $table->foreign('department_id')->references('id')->on('departments')->onUpdate('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onUpdate('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_invoice_details');
    }
};
