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
        Schema::create('receivable_payment_giro_ins', function (Blueprint $table) {
            $table->unsignedBigInteger('receivable_payment_id');
            $table->unsignedBigInteger('giro_in_id');

            $table->primary(['receivable_payment_id', 'giro_in_id']);

            $table->foreign('receivable_payment_id')->references('id')->on('receivable_payments')->onUpdate('cascade');
            $table->foreign('giro_in_id')->references('id')->on('giro_ins')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receivable_payment_giro_ins');
    }
};
