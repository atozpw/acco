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
        Schema::create('cash_transfers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('from_coa_id');
            $table->unsignedBigInteger('to_coa_id');
            $table->string('reference_no', 10)->unique();
            $table->date('date');
            $table->string('description', 100);
            $table->decimal('amount', 16, 2)->default(0);
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('from_coa_id')->references('id')->on('coas')->onUpdate('cascade');
            $table->foreign('to_coa_id')->references('id')->on('coas')->onUpdate('cascade');
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
        Schema::dropIfExists('fund_transfers');
    }
};
