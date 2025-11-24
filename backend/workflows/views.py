from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Shop
from workflows.models import WorkflowDefinition
from workflows.serializers import (
    WorkflowDefinitionSerializer,
    BoardStageSerializer,
)
from projects.models import Project


class WorkflowDefinitionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for workflows.

    - GET /api/workflows/          -> list workflows for the current user's shop
    - GET /api/workflows/{id}/     -> workflow detail
    - GET /api/workflows/{id}/board/ -> board data (stages + projects)
    """

    permission_classes = [IsAuthenticated]
    serializer_class = WorkflowDefinitionSerializer

    def get_queryset(self):
        user = self.request.user

        # If user isn't authenticated, DRF will block earlier via permissions,
        # but we'll be defensive anyway.
        if not user.is_authenticated:
            return WorkflowDefinition.objects.none()

        # Try to get the user's shop; if missing, return empty queryset
        try:
            shop = user.shop
        except Shop.DoesNotExist:
            # For now: no shop -> no workflows
            return WorkflowDefinition.objects.none()

        return WorkflowDefinition.objects.filter(shop=shop, is_active=True).order_by(
            "name"
        )

    @action(detail=True, methods=["get"])
    def board(self, request, pk=None):
        """
        Return board data for this workflow:
        - stages in order
        - active projects assigned to this workflow grouped by stage
        """
        workflow = self.get_object()

        stages = list(workflow.stages.all())
        projects = (
            Project.objects.filter(
                workflow=workflow,
                status="active",
            )
            .select_related("current_stage", "template", "customer")
            .order_by("due_date", "id")
        )

        # Group projects by stage id
        projects_by_stage = {stage.id: [] for stage in stages}
        for project in projects:
            stage_id = project.current_stage_id
            if stage_id in projects_by_stage:
                projects_by_stage[stage_id].append(project)

        # Build list of stage dicts with projects
        board_stages = []
        for stage in stages:
            board_stages.append(
                {
                    "id": stage.id,
                    "name": stage.name,
                    "order": stage.order,
                    "role": stage.role,
                    "projects": projects_by_stage.get(stage.id, []),
                }
            )

        serializer = BoardStageSerializer(board_stages, many=True)
        return Response(
            {
                "workflow": WorkflowDefinitionSerializer(workflow).data,
                "stages": serializer.data,
            }
        )
