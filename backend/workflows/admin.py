from django.contrib import admin
from .models import WorkflowRecipe, WorkflowDefinition, WorkflowStage, ProjectStageHistory


class WorkflowStageInline(admin.TabularInline):
    model = WorkflowStage
    extra = 1
    ordering = ("order",)


@admin.register(WorkflowDefinition)
class WorkflowDefinitionAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "is_default", "is_active", "created_at")
    list_filter = ("shop", "is_default", "is_active")
    search_fields = ("name", "shop__name")
    inlines = [WorkflowStageInline]


@admin.register(WorkflowStage)
class WorkflowStageAdmin(admin.ModelAdmin):
    list_display = ("name", "workflow", "order", "role")
    list_filter = ("workflow",)
    ordering = ("workflow", "order")


@admin.register(WorkflowRecipe)
class WorkflowRecipeAdmin(admin.ModelAdmin):
    list_display = ("name", "craft_type", "detail_level", "visibility", "is_system")
    list_filter = ("craft_type", "detail_level", "visibility")
    search_fields = ("name",)


@admin.register(ProjectStageHistory)
class ProjectStageHistoryAdmin(admin.ModelAdmin):
    list_display = ("project", "stage", "entered_at")
    list_filter = ("stage__workflow",)
    ordering = ("entered_at",)
