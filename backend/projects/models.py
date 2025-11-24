from django.db import models
from core.models import Shop, Customer
from products.models import ProductTemplate
from workflows.models import WorkflowDefinition, WorkflowStage


class Project(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="projects")
    template = models.ForeignKey(
        ProductTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    workflow = models.ForeignKey(
        WorkflowDefinition,
        on_delete=models.PROTECT,
        related_name="projects",
    )
    current_stage = models.ForeignKey(
        WorkflowStage,
        on_delete=models.PROTECT,
        related_name="current_projects",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )

    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    image = models.ImageField(upload_to="project_images/", blank=True, null=True)
    due_date = models.DateField(null=True, blank=True)

    estimated_hours = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    actual_hours = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="active"
    )

    expected_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    expected_currency = models.CharField(max_length=10, default="USD")

    cancel_reason = models.TextField(blank=True)
    cancel_stage = models.ForeignKey(
        WorkflowStage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_projects",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name
