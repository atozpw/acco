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
        Schema::table('cash_transfers', function (Blueprint $table) {
            $table->unsignedBigInteger('to_department_id')->nullable()->after('department_id');
            $table->unsignedBigInteger('to_project_id')->nullable()->after('project_id');

            $table->foreign('to_department_id')->references('id')->on('departments')->onUpdate('cascade');
            $table->foreign('to_project_id')->references('id')->on('projects')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_transfers', function (Blueprint $table) {
            $table->dropForeign('cash_transfers_to_department_id_foreign');
            $table->dropForeign('cash_transfers_to_project_id_foreign');

            $table->dropColumn(['to_department_id', 'to_project_id']);
        });
    }
};
