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
        Schema::create('payable_payment_giro_outs', function (Blueprint $table) {
            $table->unsignedBigInteger('payable_payment_id');
            $table->unsignedBigInteger('giro_out_id');

            $table->primary(['payable_payment_id', 'giro_out_id']);

            $table->foreign('payable_payment_id')->references('id')->on('payable_payments')->onUpdate('cascade');
            $table->foreign('giro_out_id')->references('id')->on('giro_outs')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payable_payment_giro_outs');
    }
};
