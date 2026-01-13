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
        Schema::create('cash_advance_income_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cash_advance_income_id');
            $table->unsignedBigInteger('cash_advance_classification_id');
            $table->decimal('amount', 16, 2)->default(0);
            $table->decimal('tax_amount', 16, 2)->default(0);
            $table->decimal('total', 16, 2)->default(0);
            $table->string('note', 100)->nullable();
            $table->unsignedBigInteger('tax_id')->nullable();
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('cash_advance_income_id')->references('id')->on('cash_advance_incomes')->onUpdate('cascade');
            $table->foreign('cash_advance_classification_id', 'cash_advance_income_details_classification_id')->references('id')->on('cash_advance_classifications')->onUpdate('cascade');
            $table->foreign('tax_id')->references('id')->on('taxes')->onUpdate('cascade');
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
        Schema::dropIfExists('cash_advance_income_details');
    }
};
