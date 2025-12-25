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
        Schema::create('product_transfer_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_transfer_id');
            $table->unsignedBigInteger('product_id');
            $table->decimal('qty', 10, 2)->default(0);
            $table->string('note', 100)->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_transfer_id')->references('id')->on('product_transfers')->onUpdate('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_transfer_details');
    }
};
