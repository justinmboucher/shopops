from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from core.models import Shop
from workflows.models import WorkflowDefinition, WorkflowStage


class Command(BaseCommand):
    help = "Seed the database with a default workflow and stages for the first shop."

    def handle(self, *args, **options):
        User = get_user_model()

        # Get or create a superuser (dev convenience)
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            self.stdout.write(self.style.ERROR("No superuser found. Create one first."))
            return

        # Create Shop if missing
        shop, created = Shop.objects.get_or_create(
            owner=user,
            defaults={"name": f"{user.username}'s Shop"},
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created shop: {shop.name}"))
        else:
            self.stdout.write(self.style.WARNING(f"Shop already exists: {shop.name}"))

        # Create Default Workflow if missing
        workflow, created = WorkflowDefinition.objects.get_or_create(
            shop=shop,
            name="Default Workflow",
            defaults={
                "description": "Basic woodworking workflow",
                "is_default": True,
                "is_active": True,
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Created Default Workflow"))
        else:
            self.stdout.write(self.style.WARNING("Default Workflow already exists"))

        # Seed stages only if workflow has none
        if workflow.stages.count() == 0:
            STAGE_DATA = [
                ("Design", "pre_production"),
                ("Materials Ready", "production"),
                ("Build", "production"),
                ("Finishing", "finishing"),
                ("Ready to Ship", "fulfillment"),
            ]

            for order, (name, role) in enumerate(STAGE_DATA, start=1):
                WorkflowStage.objects.create(
                    workflow=workflow,
                    name=name,
                    order=order,
                    role=role,
                    key=name.lower().replace(" ", "_"),
                )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Created {len(STAGE_DATA)} workflow stages for Default Workflow"
                )
            )
        else:
            self.stdout.write(self.style.WARNING("Workflow already has stages"))

        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
