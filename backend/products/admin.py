# backend/products/admin.py
from django.contrib import admin
from .models import ProductTemplate

@admin.register(ProductTemplate)
class ProductTemplateAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "shop",
        "workflow",
        "base_price",
        "average_material_cost",      # NEW
        "average_consumable_cost",    # NEW
        "is_active",
    )
    list_filter = ("shop", "workflow", "is_active")
    search_fields = ("name",)
