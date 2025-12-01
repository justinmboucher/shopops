# backend/projects/admin.py

from django.contrib import admin
from .models import Project, WorkLog


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
        "started_at",     # NEW
        "completed_at",   # NEW
        "created_at",
    )
    list_filter = ("shop", "workflow", "status", "current_stage")
    search_fields = ("name", "template__name", "customer__name")
    ordering = ("-created_at",)


@admin.register(WorkLog)
class WorkLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project",
        "stage",
        "started_at",
        "ended_at",
        "created_at",
    )
    list_filter = ("stage", "project__shop")
    search_fields = ("project__name", "stage__name", "notes")
    ordering = ("-started_at",)
