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

        qs = (
            Sale.objects.filter(shop=shop)
            .select_related("project", "template", "customer")
        )

        # Optional simple filters:
        channel = self.request.query_params.get("channel")
        if channel:
            qs = qs.filter(channel=channel)

        return qs.order_by("-sold_at", "-created_at")


class InsightsSummaryView(APIView):
    """
    Return a simple summary of revenue, costs, and project counts
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

        sales_qs = Sale.objects.filter(shop=shop)

        # Revenue & fee aggregates
        total_revenue = (
            sales_qs.aggregate(total=models.Sum("price"))["total"]
            or Decimal("0.00")
        )
        total_fees = (
            sales_qs.aggregate(total=models.Sum("fees"))["total"]
            or Decimal("0.00")
        )
        net_revenue = total_revenue - total_fees

        # NEW: cost & margin aggregates (can be null for older rows)
        total_cost_of_goods = (
            sales_qs.aggregate(total=models.Sum("cost_of_goods"))["total"]
            or Decimal("0.00")
        )
        total_gross_margin = (
            sales_qs.aggregate(total=models.Sum("gross_margin"))["total"]
            or (total_revenue - total_cost_of_goods)
        )

        total_platform_fees = (
            sales_qs.aggregate(total=models.Sum("platform_fees"))["total"]
            or Decimal("0.00")
        )
        total_shipping_cost = (
            sales_qs.aggregate(total=models.Sum("shipping_cost"))["total"]
            or Decimal("0.00")
        )
        total_tax_amount = (
            sales_qs.aggregate(total=models.Sum("tax_amount"))["total"]
            or Decimal("0.00")
        )

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
            # NEW summary section for ML/analytics
            "costs_and_margins": {
                "total_cost_of_goods": str(total_cost_of_goods),
                "total_gross_margin": str(total_gross_margin),
                "total_platform_fees": str(total_platform_fees),
                "total_shipping_cost": str(total_shipping_cost),
                "total_tax_amount": str(total_tax_amount),
            },
        }
        return Response(data)
