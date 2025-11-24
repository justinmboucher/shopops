from django.urls import path
from . import views

urlpatterns = [
    path("ping/", views.ping, name="ping"),
    path("shop/", views.ShopView.as_view(), name="shop-detail"),
]
