from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from core.models import Shop
from projects.models import Project
from projects.serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoints for projects.

    - GET /api/projects/            -> list projects for current user's shop
    - POST /api/projects/           -> create a project (from template)
    - GET /api/projects/{id}/       -> retrieve a project
    - PATCH /api/projects/{id}/     -> update certain fields (later)
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Project.objects.none()

        try:
            shop: Shop = user.shop
        except Shop.DoesNotExist:
            return Project.objects.none()

        # You can filter further later (e.g., only active)
        return (
            Project.objects.filter(shop=shop)
            .select_related("template", "workflow", "current_stage", "customer")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        # Serializer.create handles shop/workflow/etc using request in context
        serializer.save()
