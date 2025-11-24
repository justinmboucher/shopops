from django.contrib import admin
from .models import Sale


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "shop",
        "project",
        "template",
        "customer",
        "channel",
        "price",
        "fees",
        "currency",
        "sold_at",
        "created_at",
    )
    list_filter = ("shop", "channel", "currency")
    search_fields = ("project__name", "template__name", "customer__name")
    ordering = ("-sold_at", "-created_at")
