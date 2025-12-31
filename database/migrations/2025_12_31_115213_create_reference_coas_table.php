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
        Schema::create('reference_coas', function (Blueprint $table) {
            $table->id();
            $table->string('code', 25)->unique();
            $table->string('name', 50);
            $table->unsignedBigInteger('coa_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('coa_id')->references('id')->on('coas')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reference_coas');
    }
};
