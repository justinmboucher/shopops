from django.contrib import admin
from .models import Material, Consumable, Equipment


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "category", "unit", "quantity", "cost_per_unit", "is_active")
    list_filter = ("shop", "category", "is_active")
    search_fields = ("name", "category", "supplier_name")


@admin.register(Consumable)
class ConsumableAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "unit", "cost_per_unit", "quantity", "is_active")
    list_filter = ("shop", "is_active")
    search_fields = ("name",)


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "purchase_date", "purchase_cost", "is_active")
    list_filter = ("shop", "is_active")
    search_fields = ("name",)
