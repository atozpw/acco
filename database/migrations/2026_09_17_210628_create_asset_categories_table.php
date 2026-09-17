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
        Schema::create('asset_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code', 6)->unique();
            $table->string('name', 50);
            $table->unsignedTinyInteger('useful_life_in_years')->default(0);
            $table->unsignedSmallInteger('useful_life_in_months')->default(0);
            $table->unsignedBigInteger('asset_coa_id')->nullable();
            $table->unsignedBigInteger('accumulation_coa_id')->nullable();
            $table->unsignedBigInteger('depreciation_coa_id')->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('asset_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('accumulation_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('depreciation_coa_id')->references('id')->on('coas')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_categories');
    }
};
