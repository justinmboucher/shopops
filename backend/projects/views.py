from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Shop
from projects.models import Project
from projects.serializers import ProjectSerializer
from workflows.models import WorkflowStage, ProjectStageHistory


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

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoints for projects.

    - GET /api/projects/            -> list projects for current user's shop
    - POST /api/projects/           -> create a project (from template)
    - GET /api/projects/{id}/       -> retrieve a project
    - PATCH /api/projects/{id}/     -> update certain fields (later)
    - POST /api/projects/{id}/move/ -> move project to a new stage
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

        return (
            Project.objects.filter(shop=shop)
            .select_related("template", "workflow", "current_stage", "customer")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def move(self, request, pk=None):
        """
        Move a project to a new stage within its workflow.

        Expected payload:
        {
          "stage_id": <int>
        }
        """
        project: Project = self.get_object()

        if project.status != "active":
            return Response(
                {"detail": "Only active projects can be moved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stage_id = request.data.get("stage_id")
        if not stage_id:
            return Response(
                {"detail": "stage_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            stage_id = int(stage_id)
        except (TypeError, ValueError):
            return Response(
                {"detail": "stage_id must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_stage = WorkflowStage.objects.get(
                id=stage_id, workflow=project.workflow
            )
        except WorkflowStage.DoesNotExist:
            return Response(
                {"detail": "Target stage does not exist for this workflow."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If already in that stage, no-op
        if project.current_stage_id == target_stage.id:
            serializer = self.get_serializer(project)
            return Response(serializer.data)

        # Update project stage
        project.current_stage = target_stage
        project.save(update_fields=["current_stage", "updated_at"])

        # Log history
        ProjectStageHistory.objects.create(
            project=project,
            stage=target_stage,
        )

        serializer = self.get_serializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(detail=True, methods=["post"])
    
    def cancel(self, request, pk=None):
        """
        Cancel a project (client bailed, etc.).

        Expected payload (all optional except maybe reason in the UI):

        {
          "reason": "Client changed mind",
          "expected_price": 200.00,
          "notes": "They might rebook later."
        }
        """
        project: Project = self.get_object()

        if project.status != "active":
            return Response(
                {"detail": "Only active projects can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data

        # Optional: allow overriding/setting expected_price at cancel time
        expected_price = data.get("expected_price", None)
        if expected_price is not None:
            try:
                project.expected_price = float(expected_price)
            except (TypeError, ValueError):
                return Response(
                    {"detail": "expected_price must be a number."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Reason & notes
        reason = data.get("reason", "").strip()
        if reason:
            project.cancel_reason = reason

        notes = data.get("notes", "").strip()
        if notes:
            # Append or replace; for now we just append if existing
            if project.notes:
                project.notes = (project.notes + "\n\n") + f"Cancellation note: {notes}"
            else:
                project.notes = f"Cancellation note: {notes}"

        # Set cancel metadata
        project.status = "cancelled"
        project.cancel_stage = project.current_stage
        project.cancelled_at = timezone.now()

        project.save(
            update_fields=[
                "expected_price",
                "cancel_reason",
                "notes",
                "status",
                "cancel_stage",
                "cancelled_at",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)
