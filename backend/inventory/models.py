from django.db import models
from core.models import Shop


class Material(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="materials")
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True)

    unit = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    supplier_name = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Consumable(models.Model):
    shop = models.ForeignKey(
        Shop, on_delete=models.CASCADE, related_name="consumables"
    )
    name = models.CharField(max_length=200)
    unit = models.CharField(max_length=50, blank=True)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        null=True,
        blank=True,
        help_text="Optional: track quantity if desired",
    )

    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Equipment(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="equipment")
    name = models.CharField(max_length=200)

    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name
