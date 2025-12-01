from django.db import models
from core.models import Shop
from workflows.models import WorkflowDefinition
from inventory.models import Material, Equipment


class ProductTemplate(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="templates")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to="template_images/", blank=True, null=True)

    workflow = models.ForeignKey(
        WorkflowDefinition,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="templates",
    )

    estimated_labor_hours = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    estimated_consumables_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    # NEW: ML-friendly summary fields
    average_material_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Historical average material cost for this template.",
    )
    average_consumable_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Historical average consumable cost for this template.",
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    equipment = models.ManyToManyField(
        Equipment,
        related_name="templates",
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name

class BOMItem(models.Model):
    template = models.ForeignKey(
        ProductTemplate, on_delete=models.CASCADE, related_name="bom_items"
    )
    material = models.ForeignKey(Material, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(
        max_length=50,
        blank=True,
        help_text="Optional override; defaults to material.unit in UI logic",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.template.name} – {self.material.name}"
