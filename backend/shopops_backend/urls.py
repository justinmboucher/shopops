from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/core/", include("core.urls")),
    # We'll later add:
    # path("api/workflows/", include("workflows.urls")),
    # path("api/inventory/", include("inventory.urls")),
    # path("api/products/", include("products.urls")),
    # path("api/projects/", include("projects.urls")),
    # path("api/sales/", include("sales.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
