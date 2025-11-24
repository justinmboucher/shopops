from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "shop",
        "template",
        "customer",
        "status",
        "workflow",
        "current_stage",
        "quantity",
        "due_date",
        "expected_price",
        "estimated_hours",
        "created_at",
    )
    list_filter = ("shop", "workflow", "status", "current_stage")
    search_fields = ("name", "template__name", "customer__name")
    ordering = ("-created_at",)
