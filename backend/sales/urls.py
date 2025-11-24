from rest_framework.routers import DefaultRouter
from django.urls import path

from sales.views import SaleViewSet, InsightsSummaryView

router = DefaultRouter()
router.register(r"sales", SaleViewSet, basename="sale")

urlpatterns = router.urls + [
    path("insights/summary/", InsightsSummaryView.as_view(), name="insights-summary"),
]
