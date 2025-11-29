# core/urls.py
from django.urls import path
from .views import ShopView, MeView

urlpatterns = [
    path("shop/", ShopView.as_view(), name="shop-detail"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
]
