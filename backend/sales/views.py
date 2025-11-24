from django.db import models
from decimal import Decimal

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from core.models import Shop
from sales.models import Sale
from sales.serializers import SaleSerializer
from projects.models import Project


class SaleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve sales for the current user's shop.

    - GET /api/sales/
    - GET /api/sales/{id}/
    """

    permission_classes = [IsAuthenticated]
    serializer_class = SaleSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Sale.objects.none()
        try:
            shop: Shop = user.shop
        except Shop.DoesNotExist:
            return Sale.objects.none()

        qs = Sale.objects.filter(shop=shop).select_related(
            "project", "template", "customer"
        )

        # Optional simple filters:
        channel = self.request.query_params.get("channel")
        if channel:
            qs = qs.filter(channel=channel)

        return qs.order_by("-sold_at", "-created_at")

class InsightsSummaryView(APIView):
    """
    Return a simple summary of revenue, lost revenue, and project counts
    for the current user's shop.

    GET /api/insights/summary/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            shop: Shop = user.shop
        except Shop.DoesNotExist:
            return Response(
                {"detail": "Current user has no shop configured."},
                status=400,
            )

        # Sales sums
        sales_qs = Sale.objects.filter(shop=shop)
        total_revenue = sales_qs.aggregate_sum = (
            sales_qs.aggregate(total=models.Sum("price"))["total"] or Decimal("0.00")
        )
        total_fees = (
            sales_qs.aggregate(total=models.Sum("fees"))["total"] or Decimal("0.00")
        )
        net_revenue = total_revenue - total_fees

        # Projects stats
        projects_qs = Project.objects.filter(shop=shop)
        completed_projects = projects_qs.filter(status="completed").count()
        cancelled_projects = projects_qs.filter(status="cancelled").count()
        active_projects = projects_qs.filter(status="active").count()

        # Lost revenue = expected_price sum for cancelled projects
        lost_revenue = (
            projects_qs.filter(status="cancelled")
            .aggregate(total=models.Sum("expected_price"))["total"]
            or Decimal("0.00")
        )

        data = {
            "currency": shop.currency,
            "total_revenue": str(total_revenue),
            "total_fees": str(total_fees),
            "net_revenue": str(net_revenue),
            "lost_revenue": str(lost_revenue),
            "project_counts": {
                "active": active_projects,
                "completed": completed_projects,
                "cancelled": cancelled_projects,
            },
        }

        return Response(data)
