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
        Schema::create('journal_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('journal_id');
            $table->unsignedBigInteger('coa_id');
            $table->decimal('debit', 16, 2)->default(0);
            $table->decimal('credit', 16, 2)->default(0);
            $table->string('note')->nullable();
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('journal_id')->references('id')->on('journals')->onUpdate('cascade');
            $table->foreign('coa_id')->references('id')->on('coas')->onUpdate('cascade');
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
        Schema::dropIfExists('journal_details');
    }
};
