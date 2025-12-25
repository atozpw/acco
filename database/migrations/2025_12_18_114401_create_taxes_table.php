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
        Schema::create('taxes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name', 50);
            $table->decimal('rate', 4, 2)->default(0);
            $table->unsignedBigInteger('sales_coa_id')->nullable();
            $table->unsignedBigInteger('purchase_coa_id')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('sales_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('purchase_coa_id')->references('id')->on('coas')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taxes');
    }
};
