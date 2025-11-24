from rest_framework.routers import DefaultRouter
from products.views import ProductTemplateViewSet

router = DefaultRouter()
router.register(r"templates", ProductTemplateViewSet, basename="template")

urlpatterns = router.urls
