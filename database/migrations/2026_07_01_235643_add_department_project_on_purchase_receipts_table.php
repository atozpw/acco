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
        Schema::table('purchase_receipts', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable()->after('warehouse_id');
            $table->unsignedBigInteger('project_id')->nullable()->after('department_id');

            $table->foreign('department_id')->references('id')->on('departments')->onUpdate('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_receipts', function (Blueprint $table) {
            $table->dropForeign('purchase_receipts_department_id_foreign');
            $table->dropForeign('purchase_receipts_project_id_foreign');

            $table->dropColumn(['department_id', 'project_id']);
        });
    }
};
