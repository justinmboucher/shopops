from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/core/", include("core.urls")),
    path("api/", include("workflows.urls")),
    path("api/", include("projects.urls")),
    path("api/", include("products.urls")),
    # later: inventory, sales
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
