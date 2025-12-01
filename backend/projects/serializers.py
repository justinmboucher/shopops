# backend/projects/serializers.py

from rest_framework import serializers
from rest_framework import serializers as drf_serializers

from core.models import Customer
from products.models import ProductTemplate
from workflows.models import WorkflowDefinition, WorkflowStage
from projects.models import Project, WorkLog
from sales.models import Sale


class ProjectSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source="template.name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    workflow_name = serializers.CharField(source="workflow.name", read_only=True)
    current_stage_name = serializers.CharField(
        source="current_stage.name",
        read_only=True,
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "shop",  # read-only, derived from user
            "template",
            "template_name",
            "workflow",
            "workflow_name",
            "current_stage",
            "current_stage_name",
            "customer",
            "customer_name",
            "name",
            "quantity",
            "image",
            "due_date",

            # NEW lifecycle fields
            "quoted_at",
            "confirmed_at",
            "started_at",
            "completed_at",

            "estimated_hours",
            "actual_hours",
            "status",
            "expected_price",
            "expected_currency",
            "cancel_reason",
            "cancel_stage",
            "cancelled_at",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "shop",
            "workflow",
            "current_stage",
            "status",
            "expected_currency",
            "cancel_reason",
            "cancel_stage",
            "cancelled_at",

            # lifecycle timestamps handled by backend logic
            "quoted_at",
            "confirmed_at",
            "started_at",
            "completed_at",

            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        """
        Validation that works for both create and partial update.

        - On create: template is required
        - On update: if template not provided, reuse existing instance.template
        - Quantity must be >= 1
        """
        # Figure out template (new value or existing one)
        template = attrs.get("template")
        if not template and self.instance is not None:
            template = getattr(self.instance, "template", None)

        if not template:
            raise serializers.ValidationError(
                {"template": "A product template is required to create a project."}
            )

        # Quantity: prefer incoming value, else existing, else 1
        if "quantity" in attrs:
            quantity = attrs["quantity"]
        elif self.instance is not None:
            quantity = getattr(self.instance, "quantity", 1)
        else:
            quantity = 1

        if quantity is None or quantity <= 0:
            raise serializers.ValidationError(
                {"quantity": "Quantity must be at least 1."}
            )

        return attrs

    def create(self, validated_data):
        """
        Project creation rules:
        - shop = request.user.shop
        - workflow:
          - template.workflow if set
          - else shop's default workflow
        - current_stage = first stage in workflow
        - estimated_hours:
          - provided value OR
          - template.estimated_labor_hours * quantity
        - expected_price:
          - provided value OR
          - template.base_price * quantity (if present)
        - status = "active"
        """
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        # Get the user's shop
        try:
            shop = user.shop
        except Exception:
            raise serializers.ValidationError("Current user has no shop configured.")

        template: ProductTemplate = validated_data.get("template")
        quantity = validated_data.get("quantity", 1)

        # Resolve workflow
        workflow = template.workflow
        if workflow is None:
            workflow = (
                WorkflowDefinition.objects.filter(
                    shop=shop,
                    is_default=True,
                    is_active=True,
                ).first()
            )
        if workflow is None:
            raise serializers.ValidationError(
                "No workflow is configured for this template or as a shop default."
            )

        # Resolve first stage
        first_stage: WorkflowStage | None = workflow.stages.order_by("order").first()
        if first_stage is None:
            raise serializers.ValidationError(
                "Selected workflow has no stages defined."
            )

        # Estimated hours
        estimated_hours = validated_data.get("estimated_hours")
        if estimated_hours is None or estimated_hours == 0:
            if template.estimated_labor_hours:
                estimated_hours = template.estimated_labor_hours * quantity
            else:
                estimated_hours = 0

        # Expected price
        expected_price = validated_data.get("expected_price")
        if expected_price is None and template.base_price:
            expected_price = template.base_price * quantity

        project = Project.objects.create(
            shop=shop,
            template=template,
            workflow=workflow,
            current_stage=first_stage,
            customer=validated_data.get("customer"),
            name=validated_data.get("name"),
            quantity=quantity,
            image=validated_data.get("image"),
            due_date=validated_data.get("due_date"),
            estimated_hours=estimated_hours,
            actual_hours=validated_data.get("actual_hours"),
            status="active",
            expected_price=expected_price,
            expected_currency=shop.currency,
            notes=validated_data.get("notes", ""),
        )

        # Optionally: you can hook ProjectStageHistory here later
        return project


class LogSaleSerializer(drf_serializers.Serializer):
    price = drf_serializers.DecimalField(max_digits=10, decimal_places=2)
    channel = drf_serializers.ChoiceField(
        choices=[c[0] for c in Sale.CHANNEL_CHOICES],
        default="other",
    )
    fees = drf_serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True,
    )
    sold_at = drf_serializers.DateTimeField(
        required=False,
        help_text="If omitted, defaults to now.",
    )
    notes = drf_serializers.CharField(
        required=False,
        allow_blank=True,
    )


class WorkLogSerializer(serializers.ModelSerializer):
    """
    Serializer for work logs (time tracking) on a project.
    """

    project_name = serializers.CharField(source="project.name", read_only=True)
    stage_name = serializers.CharField(source="stage.name", read_only=True)

    class Meta:
        model = WorkLog
        fields = [
            "id",
            "project",
            "project_name",
            "stage",
            "stage_name",
            "started_at",
            "ended_at",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
