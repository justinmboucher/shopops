from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from workflows.views import WorkflowDefinitionViewSet 
from core.views import ShopView

router = DefaultRouter()
router.register(r"workflows", WorkflowDefinitionViewSet, basename="workflow-definition")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Core API
    path("api/shop/", ShopView.as_view(), name="shop-detail"),

    # JWT auth
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Router-driven endpoints (workflows, etc.)
    path("api/", include(router.urls)),
]
