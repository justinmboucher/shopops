# core/urls.py
from django.urls import path
from .views import ShopView

urlpatterns = [
    path("shop/", ShopView.as_view(), name="shop-detail"),
]
