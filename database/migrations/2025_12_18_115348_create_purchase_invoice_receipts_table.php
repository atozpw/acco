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
        Schema::create('purchase_invoice_receipts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('purchase_invoice_id');
            $table->unsignedBigInteger('purchase_receipt_id');
            $table->string('note', 100)->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('purchase_invoice_id')->references('id')->on('purchase_invoices')->onUpdate('cascade');
            $table->foreign('purchase_receipt_id')->references('id')->on('purchase_receipts')->onUpdate('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onUpdate('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_invoice_receipts');
    }
};
