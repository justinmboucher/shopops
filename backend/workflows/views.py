# backend/workflows/views.py
from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied

from .models import WorkflowDefinition, WorkflowStage
from .serializers import WorkflowDefinitionSerializer, WorkflowStageSerializer
from .utils import get_current_shop


# -----------------------------
# Workflows: list + create
# -----------------------------
class WorkflowListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkflowDefinitionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        shop = get_current_shop(self.request)
        return WorkflowDefinition.objects.filter(shop=shop, is_active=True)

    def perform_create(self, serializer):
        shop = get_current_shop(self.request)
        serializer.save(shop=shop)


# -----------------------------
# Single workflow: retrieve / update / delete
# -----------------------------
class WorkflowDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkflowDefinitionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        shop = get_current_shop(self.request)
        return WorkflowDefinition.objects.filter(shop=shop)

    
# -----------------------------
# Workflow stages: list + create
# -----------------------------
class WorkflowStageListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkflowStageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_workflow(self):
        shop = get_current_shop(self.request)
        workflow_id = self.kwargs["workflow_id"]
        workflow = WorkflowDefinition.objects.filter(id=workflow_id, shop=shop).first()
        if not workflow:
            raise NotFound("Workflow not found.")
        return workflow

    def get_queryset(self):
        workflow = self._get_workflow()
        return workflow.stages.all()

    def perform_create(self, serializer):
        workflow = self._get_workflow()
        serializer.save(workflow=workflow)


# -----------------------------
# Single stage: retrieve / update / delete
# -----------------------------
class WorkflowStageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkflowStageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_workflow(self):
        shop = get_current_shop(self.request)
        workflow_id = self.kwargs["workflow_id"]
        workflow = WorkflowDefinition.objects.filter(id=workflow_id, shop=shop).first()
        if not workflow:
            raise NotFound("Workflow not found.")
        return workflow

    def get_queryset(self):
        workflow = self._get_workflow()
        return workflow.stages.all()