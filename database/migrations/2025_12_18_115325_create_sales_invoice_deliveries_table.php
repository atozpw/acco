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
        Schema::create('sales_invoice_deliveries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sales_invoice_id');
            $table->unsignedBigInteger('sales_delivery_id');
            $table->string('note', 100)->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('sales_invoice_id')->references('id')->on('sales_invoices')->onUpdate('cascade');
            $table->foreign('sales_delivery_id')->references('id')->on('sales_deliveries')->onUpdate('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_invoice_deliveries');
    }
};
