from django.conf import settings
from django.db import models


class Shop(models.Model):
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shop",
    )

    name = models.CharField(max_length=200)

    # Contact info
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)

    # Address
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, default="USA")

    # Online presence
    website_url = models.URLField(blank=True, null=True)
    instagram_handle = models.CharField(max_length=255, blank=True, null=True)
    facebook_handle = models.CharField(max_length=255, blank=True, null=True)

    # Preferences
    timezone = models.CharField(max_length=100, default="America/Chicago")
    currency = models.CharField(max_length=10, default="USD")
    default_units = models.CharField(max_length=20, default="imperial")
    default_hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    default_markup_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    default_payment_terms = models.CharField(max_length=50, default="50/50")
    default_project_type = models.CharField(max_length=100, blank=True, null=True)

    # Appearance
    theme = models.CharField(
        max_length=20,
        choices=[("light", "Light"), ("dark", "Dark"), ("system", "System")],
        default="system",
    )
    logo_image = models.ImageField(upload_to="shop_logos/", blank=True, null=True)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True)

    # Shipping config
    shipping_zones_config = models.JSONField(blank=True, default=dict)

    # Audit
    joined_at = models.DateTimeField(blank=True, null=True)
    last_active_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Customer(models.Model):
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="customers",
    )

    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    channel = models.CharField(
        max_length=100,
        blank=True,
        help_text="Where this customer came from (Etsy, craft fair, Instagram, etc.)",
    )
    notes = models.TextField(blank=True)

    # NEW: address fields
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)

     # NEW: optional avatar / logo image
    avatar = models.ImageField(
        upload_to="customer_avatars/",
        blank=True,
        null=True,
    )

    # Status flags
    is_active = models.BooleanField(default=True)
    is_vip = models.BooleanField(
        default=False,
        help_text="Mark true for high-value / priority customers.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "name"]
        indexes = [
            models.Index(fields=["shop", "name"]),
            models.Index(fields=["shop", "email"]),
        ]

    def __str__(self) -> str:
        return self.name
