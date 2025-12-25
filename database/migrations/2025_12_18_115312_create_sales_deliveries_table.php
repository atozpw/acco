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
        Schema::create('sales_deliveries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('contact_id');
            $table->unsignedBigInteger('warehouse_id');
            $table->string('reference_no', 10)->unique();
            $table->date('date');
            $table->string('description', 100);
            $table->decimal('amount', 16, 2)->default(0);
            $table->decimal('tax_amount', 16, 2)->default(0);
            $table->decimal('discount_percent', 3, 2)->default(0);
            $table->decimal('discount_amount', 16, 2)->default(0);
            $table->decimal('total', 16, 2)->default(0);
            $table->boolean('is_closed')->default(0);
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('contact_id')->references('id')->on('contacts')->onUpdate('cascade');
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onUpdate('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_deliveries');
    }
};
