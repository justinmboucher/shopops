from django.db import models
from core.models import Shop, Customer
from products.models import ProductTemplate
from projects.models import Project


class Sale(models.Model):
    CHANNEL_CHOICES = [
        ("etsy", "Etsy"),
        ("market", "Market"),
        ("instagram", "Instagram"),
        ("direct", "Direct"),
        ("other", "Other"),
    ]

    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="sales")
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )
    template = models.ForeignKey(
        ProductTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )

    channel = models.CharField(
        max_length=50, choices=CHANNEL_CHOICES, default="other"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    fees = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    currency = models.CharField(max_length=10, default="USD")
    sold_at = models.DateTimeField()

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Sale {self.id} – {self.price} {self.currency}"
