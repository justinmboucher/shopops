from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from core.models import Shop, Customer
from workflows.models import WorkflowDefinition, WorkflowStage
from products.models import ProductTemplate
from projects.models import Project


class Command(BaseCommand):
    help = "Seed the database with example projects for development/testing."

    def handle(self, *args, **options):
        User = get_user_model()

        # 1. Ensure superuser exists
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            self.stdout.write(self.style.ERROR("No superuser found."))
            return

        # 2. Ensure Shop
        shop, created = Shop.objects.get_or_create(
            owner=user, defaults={"name": f"{user.username}'s Shop"}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created shop: {shop.name}"))
        else:
            self.stdout.write(self.style.WARNING(f"Using existing shop: {shop.name}"))

        # 3. Ensure Workflow
        workflow = WorkflowDefinition.objects.filter(
            shop=shop, is_default=True
        ).first()
        if not workflow:
            self.stdout.write(self.style.ERROR("No default workflow found. Run seed_workflows first."))
            return

        # Check stages
        stages = list(workflow.stages.order_by("order"))
        if not stages:
            self.stdout.write(self.style.ERROR("Workflow has no stages. Run seed_workflows first."))
            return

        first_stage = stages[0]

        # 4. Ensure at least one template
        templates = list(ProductTemplate.objects.filter(shop=shop, is_active=True))
        if not templates:
            self.stdout.write(self.style.WARNING("No product templates found. Creating a placeholder template."))

            placeholder = ProductTemplate.objects.create(
                shop=shop,
                name="Sample Template",
                description="Auto-generated for project seeds.",
                category="General",
                estimated_labor_hours=2,
                base_price=50,
                workflow=workflow,
            )
            templates = [placeholder]

        # 5. Ensure some customers
        customers = list(Customer.objects.filter(shop=shop, is_active=True))
        if not customers:
            self.stdout.write(self.style.WARNING("No customers found. Creating sample customers."))

            c1 = Customer.objects.create(shop=shop, name="Jane Doe", email="jane@example.com")
            c2 = Customer.objects.create(shop=shop, name="Bob Carpenter", email="bob@example.com")
            c3 = Customer.objects.create(shop=shop, name="Kitchen Market Buyer")

            customers = [c1, c2, c3]

        # 6. Generate example projects
        project_data = [
            ("Custom Walnut Cutting Board", 1),
            ("Set of 3 Etched Signs", 3),
            ("Large Epoxy River Table", 1),
            ("Small Birch Shelf", 2),
            ("Live Edge Coffee Table", 1),
        ]

        created_projects = []
        for name, qty in project_data:
            template = random.choice(templates)
            customer = random.choice(customers)

            estimated_hours = (
                template.estimated_labor_hours or 2
            ) * qty

            expected_price = (
                template.base_price or 50
            ) * qty

            due_date = timezone.now().date() + timedelta(days=random.randint(3, 21))

            project = Project.objects.create(
                shop=shop,
                template=template,
                workflow=workflow,
                current_stage=first_stage,
                customer=customer,
                name=name,
                quantity=qty,
                due_date=due_date,
                estimated_hours=estimated_hours,
                expected_price=expected_price,
                status="active",
                expected_currency=shop.currency,
            )

            created_projects.append(project)

        self.stdout.write(self.style.SUCCESS(
            f"Created {len(created_projects)} sample projects."
        ))

        for p in created_projects:
            self.stdout.write(f"- {p.name} (qty {p.quantity})")

        self.stdout.write(self.style.SUCCESS("Project seeding complete!"))
