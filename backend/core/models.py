from django.conf import settings
from django.db import models


class Shop(models.Model):
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shop",
    )
    name = models.CharField(max_length=200)

    timezone = models.CharField(max_length=100, default="America/Chicago")
    currency = models.CharField(max_length=10, default="USD")
    default_hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    default_markup_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    theme = models.CharField(
        max_length=20,
        choices=[("light", "Light"), ("dark", "Dark"), ("system", "System")],
        default="system",
    )
    logo_image = models.ImageField(upload_to="shop_logos/", blank=True, null=True)
    description = models.TextField(blank=True)

    shipping_zones_config = models.JSONField(blank=True, default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Customer(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="customers")

    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    channel = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name
