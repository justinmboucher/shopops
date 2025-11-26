from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🔐 Auth endpoints expected by your frontend
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path(
        "api/auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    # Your existing app URLs
    path("api/core/", include("core.urls")),
    path("api/workflows/", include("workflows.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/products/", include("products.urls")),
    path("api/projects/", include("projects.urls")),
    path("api/sales/", include("sales.urls")),
]
