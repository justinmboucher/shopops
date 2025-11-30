# backend/workflows/urls.py
from django.urls import path
from .views import (
    WorkflowListCreateView,
    WorkflowDetailView,
    WorkflowStageListCreateView,
    WorkflowStageDetailView,
)

urlpatterns = [
    # Workflows
    path("", WorkflowListCreateView.as_view(), name="workflow-list-create"),
    path("<int:pk>/", WorkflowDetailView.as_view(), name="workflow-detail"),

    # Stages
    path(
        "<int:workflow_id>/stages/",
        WorkflowStageListCreateView.as_view(),
        name="workflow-stage-list-create",
    ),
    path(
        "<int:workflow_id>/stages/<int:pk>/",
        WorkflowStageDetailView.as_view(),
        name="workflow-stage-detail",
    ),
]
