# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShopView, MeView, CustomerViewSet

router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customer")

urlpatterns = [
    path("shop/", ShopView.as_view(), name="shop-detail"),
    path("auth/me/", MeView.as_view(), name="auth-me"),

    # ⭐ This exposes: /api/customers/, /api/customers/<id>/, etc.
    path("", include(router.urls)),
]
