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
        max_length=50,
        choices=CHANNEL_CHOICES,
        default="other",
    )

    # Core sale info
    price = models.DecimalField(max_digits=10, decimal_places=2)
    fees = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Legacy total fees; can be left null if using detailed fee fields.",
    )
    currency = models.CharField(max_length=10, default="USD")
    sold_at = models.DateTimeField()
    notes = models.TextField(blank=True)

    # 🔢 NEW: cost + margin fields for ML / analytics
    cost_of_goods = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Total cost of goods at time of sale (materials + consumables + labor if desired).",
    )
    gross_margin = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Gross margin (price - cost_of_goods) at time of sale.",
    )

    # 🔍 NEW: optional breakdown of fees / costs
    platform_fees = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Marketplace / payment platform fees (e.g. Etsy, Stripe).",
    )
    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual shipping cost paid by the shop.",
    )
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Sales tax collected/remitted for this sale.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Sale {self.id} – {self.price} {self.currency}"
