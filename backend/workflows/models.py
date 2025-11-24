from django.conf import settings
from django.db import models
from core.models import Shop


class WorkflowRecipe(models.Model):
    CRAFT_TYPES = [
        ("wood", "Woodworking"),
        ("resin", "Resin"),
        ("sign_etching", "Sign Etching"),
        ("mixed", "Mixed / General"),
        ("other", "Other"),
    ]

    DETAIL_LEVELS = [
        ("simple", "Simple"),
        ("standard", "Standard"),
        ("detailed", "Detailed"),
    ]

    VISIBILITY_CHOICES = [
        ("system", "System"),
        ("private", "Private"),
        ("public", "Public"),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    craft_type = models.CharField(max_length=50, choices=CRAFT_TYPES)
    detail_level = models.CharField(max_length=20, choices=DETAIL_LEVELS)
    project_type_tags = models.JSONField(blank=True, default=list)

    is_system = models.BooleanField(default=False)
    visibility = models.CharField(
        max_length=20, choices=VISIBILITY_CHOICES, default="system"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_workflow_recipes",
    )

    data = models.JSONField()  # contains stages and flags

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class WorkflowDefinition(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="workflows")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    source_recipe = models.ForeignKey(
        WorkflowRecipe,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="derived_workflows",
    )

    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("shop", "name")]

    def __str__(self) -> str:
        return f"{self.shop.name} – {self.name}"


class WorkflowStage(models.Model):
    workflow = models.ForeignKey(
        WorkflowDefinition, on_delete=models.CASCADE, related_name="stages"
    )
    name = models.CharField(max_length=200)
    order = models.PositiveIntegerField()
    role = models.CharField(max_length=50, blank=True)
    key = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["order"]
        unique_together = [("workflow", "order")]

    def __str__(self) -> str:
        return f"{self.workflow.name}: {self.name}"


class ProjectStageHistory(models.Model):
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="stage_history",
    )
    stage = models.ForeignKey(WorkflowStage, on_delete=models.CASCADE)
    entered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["entered_at"]

    def __str__(self) -> str:
        return f"{self.project} → {self.stage.name} @ {self.entered_at}"
