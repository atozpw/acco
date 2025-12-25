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
        Schema::create('payable_payment_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payable_payment_id');
            $table->unsignedBigInteger('purchase_invoice_id');
            $table->decimal('amount', 16, 2)->default(0);
            $table->string('note', 100)->nullable();
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('payable_payment_id')->references('id')->on('payable_payments')->onUpdate('cascade');
            $table->foreign('purchase_invoice_id')->references('id')->on('purchase_invoices')->onUpdate('cascade');
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
        Schema::dropIfExists('payable_payment_details');
    }
};
