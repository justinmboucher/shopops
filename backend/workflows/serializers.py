from rest_framework import serializers
from workflows.models import WorkflowDefinition, WorkflowStage
from projects.models import Project


class WorkflowStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStage
        fields = ["id", "name", "order", "role", "key"]


class WorkflowDefinitionSerializer(serializers.ModelSerializer):
    stages = WorkflowStageSerializer(many=True, read_only=True)

    class Meta:
        model = WorkflowDefinition
        fields = [
            "id",
            "name",
            "description",
            "is_default",
            "is_active",
            "created_at",
            "updated_at",
            "stages",
        ]


class ProjectCardSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(
        source="template.name", read_only=True
    )
    customer_name = serializers.CharField(
        source="customer.name", read_only=True
    )
    current_stage_id = serializers.IntegerField(
        source="current_stage.id", read_only=True
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "template_name",
            "customer_name",
            "quantity",
            "due_date",
            "estimated_hours",
            "status",
            "expected_price",
            "image",
            "current_stage_id",
        ]


class BoardStageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    order = serializers.IntegerField()
    role = serializers.CharField(allow_blank=True)
    projects = ProjectCardSerializer(many=True)
