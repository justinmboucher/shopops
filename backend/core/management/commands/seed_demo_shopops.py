# core/management/commands/seed_demo_shopops.py

import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import models

from faker import Faker

# Core + domain models
from core.models import Shop, Customer
from inventory.models import Material, Consumable, Equipment
from products.models import ProductTemplate, BOMItem
from workflows.models import WorkflowDefinition, WorkflowStage, ProjectStageHistory
from projects.models import Project, WorkLog
from sales.models import Sale


fake = Faker()
User = get_user_model()


class Command(BaseCommand):
    help = "Reset and seed a demo ShopOps tenant with 1+ year realistic data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            default="demo@shopops.local",
            help="Email for the demo user",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="demo1234",
            help="Password for the demo user",
        )
        parser.add_argument(
            "--projects",
            type=int,
            default=60,
            help="Number of projects to create",
        )
        parser.add_argument(
            "--customers",
            type=int,
            default=20,
            help="Number of customers to create",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete any existing shop + data for this user before seeding.",
        )

    # ---------------------------------------------------------------------
    # MAIN HANDLER
    # ---------------------------------------------------------------------

    def handle(self, *args, **options):
        email = options["email"]
        password = options["password"]
        num_projects = options["projects"]
        num_customers = options["customers"]
        reset = options["reset"]

        self.stdout.write(self.style.MIGRATE_HEADING("Seeding demo ShopOps data..."))

        if reset:
            self._reset_demo_data(email)

        user, shop = self._get_or_create_demo_user_and_shop(email, password)
        workflow, stages = self._get_or_create_workflow(shop)
        materials, consumables, equipment_items = self._get_or_create_inventory(shop)
        products = self._get_or_create_products(shop, workflow, materials, equipment_items)
        customers = self._get_or_create_customers(shop, num_customers)
        projects = self._create_projects_with_history(
            shop=shop,
            workflow=workflow,
            stages=stages,
            products=products,
            customers=customers,
            count=num_projects,
        )
        self._create_sales_for_projects(shop, projects)
        self._update_template_averages_from_sales(shop)

        self.stdout.write(self.style.SUCCESS("✅ Demo seeding complete."))

    # ---------------------------------------------------------------------
    # RESET — FIXED VERSION (SAFE ORDER)
    # ---------------------------------------------------------------------

    def _reset_demo_data(self, email: str):
        """
        Safely deletes all data for the user's shop.
        Handles PROTECT FK relationships by deleting in dependency order.
        Leaves the user account intact.
        """
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(self.style.WARNING(f"No user {email}; nothing to reset."))
            return

        shops = Shop.objects.filter(owner=user)
        if not shops.exists():
            self.stdout.write(self.style.WARNING(f"No shop for {email}."))
            return

        for shop in shops:
            self.stdout.write(self.style.WARNING(f"Deleting shop data for '{shop.name}'..."))

            # Delete in safe order
            Sale.objects.filter(shop=shop).delete()
            WorkLog.objects.filter(project__shop=shop).delete()
            ProjectStageHistory.objects.filter(project__shop=shop).delete()
            Project.objects.filter(shop=shop).delete()
            BOMItem.objects.filter(template__shop=shop).delete()
            ProductTemplate.objects.filter(shop=shop).delete()
            Material.objects.filter(shop=shop).delete()
            Consumable.objects.filter(shop=shop).delete()
            Equipment.objects.filter(shop=shop).delete()
            WorkflowStage.objects.filter(workflow__shop=shop).delete()
            WorkflowDefinition.objects.filter(shop=shop).delete()
            Customer.objects.filter(shop=shop).delete()

            shop.delete()

        self.stdout.write(self.style.SUCCESS(f"Reset complete for demo tenant {email}."))

    # ---------------------------------------------------------------------
    # USER + SHOP
    # ---------------------------------------------------------------------

    def _get_or_create_demo_user_and_shop(self, email, password):
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": email, "is_staff": True},
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(f"Created demo user {email}")
        else:
            self.stdout.write(f"Using existing user {email}")

        shop, created = Shop.objects.get_or_create(
            owner=user,
            defaults={
                "name": "Demo Woodworks",
                "tagline": "Handcrafted pieces for real humans.",
                "description": "A busy woodworking shop producing custom builds.",

                "contact_email": "contact@demowoodworks.local",
                "contact_phone": fake.phone_number(),
                "address_line1": "123 Sawdust Lane",
                "city": "Austin",
                "state": "TX",
                "postal_code": "73301",
                "country": "USA",

                "website_url": "https://demowoodworks.local",
                "instagram_handle": "@demo_woodworks",

                "timezone": "America/Chicago",
                "currency": "USD",
                "default_units": "imperial",
                "default_hourly_rate": Decimal("75"),
                "default_markup_pct": Decimal("25"),
                "default_payment_terms": "50/50",
                "default_project_type": "Woodworking",
                "theme": "system",
            },
        )

        # Historical join time
        if shop.joined_at is None:
            months_ago = random.randint(14, 20)
            shop.joined_at = timezone.now() - timedelta(days=months_ago * 30)

        shop.last_active_at = timezone.now() - timedelta(days=random.randint(0, 5))
        shop.save()

        return user, shop

    # ---------------------------------------------------------------------
    # WORKFLOW
    # ---------------------------------------------------------------------

    def _get_or_create_workflow(self, shop):
        workflow, _ = WorkflowDefinition.objects.get_or_create(
            shop=shop,
            name="Default Woodworking Workflow",
            defaults={
                "description": "Standard workflow for most woodworking projects.",
                "is_default": True,
                "is_active": True,
            },
        )

        stage_defs = [
            ("Idea / Quote", "owner", "idea"),
            ("Design", "owner", "design"),
            ("Materials Prep", "owner", "prep"),
            ("In Progress", "owner", "build"),
            ("Finishing", "owner", "finish"),
            ("Ready for Pickup", "owner", "ready"),
            ("Completed", "owner", "completed"),
            ("Cancelled", "owner", "cancelled"),
        ]

        existing = {s.name: s for s in workflow.stages.all()}
        stages = []
        order = 1
        for name, role, key in stage_defs:
            if name in existing:
                stage = existing[name]
                if stage.order != order:
                    stage.order = order
                    stage.save(update_fields=["order"])
            else:
                stage = WorkflowStage.objects.create(
                    workflow=workflow, name=name, role=role, key=key, order=order
                )
            stages.append(stage)
            order += 1

        return workflow, stages

    # ---------------------------------------------------------------------
    # INVENTORY
    # ---------------------------------------------------------------------

    def _get_or_create_inventory(self, shop):
        # Basic starter materials
        materials_data = [
            ("Cedar 1x6", "Lumber", "board", 7.50),
            ("Pine 2x4", "Lumber", "board", 4.00),
            ("Baltic Birch Plywood 3/4\"", "Sheet Goods", "sheet", 80.00),
            ("Walnut 4/4", "Lumber", "board", 18.00),
            ("Maple 4/4", "Lumber", "board", 12.00),
        ]

        materials = []
        for name, category, unit, cpu in materials_data:
            m, _ = Material.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={
                    "category": category,
                    "unit": unit,
                    "quantity": random.uniform(10, 50),
                    "cost_per_unit": Decimal(str(cpu)),
                    "supplier_name": fake.company(),
                },
            )
            materials.append(m)

        consumables_data = [
            ("Wood Glue", "bottle", 9.50),
            ("Danish Oil", "quart", 18.00),
            ("Polyurethane Finish", "quart", 22.00),
            ("Sandpaper", "pack", 10.00),
        ]

        consumables = []
        for name, unit, cpu in consumables_data:
            c, _ = Consumable.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={
                    "unit": unit,
                    "cost_per_unit": Decimal(str(cpu)),
                    "quantity": random.uniform(5, 50),
                },
            )
            consumables.append(c)

        # ✅ FIXED: no 'model' field, just name + cost
        equipment_data = [
            ("Table Saw", 3500),
            ("Miter Saw", 700),
            ("Lathe", 900),
            ("CNC Router", 2500),
        ]

        equipment_items = []
        for name, cost in equipment_data:
            e, _ = Equipment.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={
                    "purchase_date": timezone.now().date()
                    - timedelta(days=random.randint(200, 1800)),
                    "purchase_cost": Decimal(str(cost)),
                    "is_active": True,
                },
            )
            equipment_items.append(e)

        return materials, consumables, equipment_items

    # ---------------------------------------------------------------------
    # PRODUCTS + BOM
    # ---------------------------------------------------------------------

    def _get_or_create_products(self, shop, workflow, materials, equipment_items):
        product_defs = [
            ("Cutting Board", "Kitchen", 75, 250, 4),
            ("Dining Table", "Furniture", 900, 3200, 40),
            ("Coffee Table", "Furniture", 250, 900, 18),
            ("Bookshelf", "Storage", 200, 800, 16),
            ("Custom Sign", "Decor", 60, 350, 6),
        ]

        products = []
        for name, category, low, high, est_hours in product_defs:
            base_price = random.randint(low, high)

            template, created = ProductTemplate.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={
                    "description": f"Custom {name.lower()} made to order.",
                    "category": category,
                    "workflow": workflow,
                    "estimated_labor_hours": est_hours,
                    "hourly_rate": shop.default_hourly_rate,
                    "estimated_consumables_cost": Decimal("20"),
                    "base_price": Decimal(str(base_price)),
                },
            )
            products.append(template)

            if created:
                self._seed_bom_for_template(template, materials, equipment_items)

        return products

    def _seed_bom_for_template(self, template, materials, equipment_items):
        # 1–3 materials
        k = random.randint(1, min(3, len(materials)))
        chosen = random.sample(materials, k=k)
        for mat in chosen:
            BOMItem.objects.create(
                template=template,
                material=mat,
                quantity=random.uniform(0.25, 2.5),
                unit=mat.unit,
            )

        # Equipment linking
        if equipment_items:
            template.equipment.set(
                random.sample(equipment_items, k=random.randint(1, 2))
            )

    # ---------------------------------------------------------------------
    # CUSTOMERS
    # ---------------------------------------------------------------------

    def _get_or_create_customers(self, shop, count):
        customers = []
        channels = ["Etsy", "Craft Fair", "Instagram", "Website", "Referral"]

        for _ in range(count):
            cust = Customer.objects.create(
                shop=shop,
                name=fake.name(),
                email=fake.email(),
                phone=fake.phone_number(),
                channel=random.choice(channels),
                notes="Demo seeded customer.",
                address_line1=f"{random.randint(10, 9999)} {fake.street_name()}",
                city=fake.city(),
                state="TX",
                postal_code=fake.postcode(),
                country="USA",
                is_active=True,
                is_vip=random.random() < 0.15,
            )
            customers.append(cust)

        return customers

    # ---------------------------------------------------------------------
    # PROJECTS + WORKLOG + STAGE HISTORY
    # ---------------------------------------------------------------------

    def _create_projects_with_history(self, shop, workflow, stages, products, customers, count=60):
        projects = []

        completed_stage = next((s for s in stages if s.key == "completed"), stages[-1])
        cancelled_stage = next((s for s in stages if s.key == "cancelled"), stages[-1])
        ready_stage = next((s for s in stages if s.key == "ready"), stages[-2])

        active_choices = [
            s for s in stages if s.key in {"idea", "design", "prep", "build", "finish"}
        ] or stages

        for _ in range(count):
            # Creation date across last ~18 months
            created_at = timezone.now() - timedelta(days=random.randint(0, 540))

            template = random.choice(products)
            customer = random.choice(customers)
            quantity = random.randint(1, 3)

            expected_price = (
                template.base_price * quantity
                * Decimal(str(random.uniform(0.9, 1.3)))
            )

            age_days = (timezone.now() - created_at).days
            if age_days > 120:
                status = random.choices(["completed", "cancelled", "active"], [0.6, 0.2, 0.2])[0]
            elif age_days > 30:
                status = random.choices(["active", "completed", "cancelled"], [0.6, 0.3, 0.1])[0]
            else:
                status = "active"

            if status == "completed":
                current_stage = completed_stage
            elif status == "cancelled":
                current_stage = cancelled_stage
            elif age_days > 30:
                current_stage = random.choice(active_choices + [ready_stage])
            else:
                current_stage = random.choice(active_choices)

            # Lifecycle fields
            quoted_at = created_at - timedelta(days=random.randint(1, 7))
            confirmed_at = created_at
            started_at = created_at + timedelta(days=random.randint(0, 7))

            if status == "completed":
                completed_at = created_at + timedelta(
                    days=random.randint(7, max(8, min(120, age_days)))
                )
            else:
                completed_at = None

            estimated_hours = template.estimated_labor_hours * quantity
            actual_hours = (
                Decimal(str(random.uniform(float(estimated_hours) * 0.7,
                                        float(estimated_hours) * 1.4)))
                if status == "completed"
                else None
            )

            project = Project.objects.create(
                shop=shop,
                template=template,
                workflow=workflow,
                current_stage=current_stage,
                customer=customer,
                name=f"{template.name} for {customer.name.split()[0]}",
                quantity=quantity,
                due_date=created_at.date() + timedelta(days=random.randint(7, 90)),
                quoted_at=quoted_at,
                confirmed_at=confirmed_at,
                started_at=started_at,
                completed_at=completed_at,
                estimated_hours=estimated_hours,
                actual_hours=actual_hours,
                status=status,
                expected_price=expected_price,
                expected_currency=shop.currency,
                cancel_reason="Customer changed their mind."
                if status == "cancelled" else "",
                cancel_stage=cancelled_stage if status == "cancelled" else None,
                cancelled_at=(created_at + timedelta(days=random.randint(3, 60)))
                if status == "cancelled" else None,
                notes="Demo seeded project.",
                created_at=created_at,
                updated_at=created_at + timedelta(days=random.randint(0, max(1, age_days))),
            )

            self._seed_stage_history_for_project(project, stages, created_at)
            self._seed_work_logs_for_project(project)
            projects.append(project)

        return projects

    def _seed_stage_history_for_project(self, project, stages, created_at):
        ordered = list(stages)
        path = []
        for s in ordered:
            path.append(s)
            if s.id == project.current_stage_id:
                break

        entered_at = created_at
        for s in path:
            hist = ProjectStageHistory.objects.create(project=project, stage=s)
            entered_at += timedelta(days=random.randint(1, 7))
            ProjectStageHistory.objects.filter(pk=hist.pk).update(entered_at=entered_at)

    def _seed_work_logs_for_project(self, project):
        if not project.started_at:
            return

        end_time = project.completed_at or timezone.now()
        end_time = max(end_time, project.started_at + timedelta(hours=2))

        total_hours = float(project.actual_hours or project.estimated_hours or 4)
        total_hours = max(total_hours, 1.0)

        num_logs = random.randint(1, 4)
        hours_per_log = total_hours / num_logs
        workflow_stages = list(project.workflow.stages.all())

        span_seconds = (end_time - project.started_at).total_seconds()
        if span_seconds <= 0:
            span_seconds = total_hours * 3600

        for _ in range(num_logs):
            offset = random.uniform(0, span_seconds)
            started_at = project.started_at + timedelta(seconds=offset)
            ended_at = started_at + timedelta(hours=hours_per_log * random.uniform(0.6, 1.4))

            WorkLog.objects.create(
                project=project,
                stage=random.choice(workflow_stages),
                started_at=started_at,
                ended_at=ended_at,
                notes="Demo seeded work log.",
            )

    # ---------------------------------------------------------------------
    # SALES
    # ---------------------------------------------------------------------

    def _create_sales_for_projects(self, shop, projects):
        channels = [c[0] for c in Sale.CHANNEL_CHOICES]
        sales_created = 0

        for project in projects:
            if project.status == "completed":
                create_sale = True
            elif project.status == "active":
                create_sale = random.random() < 0.25
            else:
                create_sale = random.random() < 0.05

            if not create_sale:
                continue

            price = (project.expected_price * Decimal(str(random.uniform(0.95, 1.15)))).quantize(
                Decimal("0.01")
            )

            channel = random.choice(channels)

            cost_ratio = random.uniform(0.4, 0.7)
            cost_of_goods = (price * Decimal(str(cost_ratio))).quantize(Decimal("0.01"))

            if channel in ["etsy", "instagram"]:
                platform_ratio = random.uniform(0.08, 0.15)
            elif channel == "market":
                platform_ratio = random.uniform(0.02, 0.06)
            else:
                platform_ratio = random.uniform(0.0, 0.03)

            platform_fees = (price * Decimal(str(platform_ratio))).quantize(
                Decimal("0.01")
            )

            shipping_cost = Decimal(str(random.choice([0, 10, 15, 25, 40])))
            tax_amount = (price * Decimal(str(random.uniform(0.0, 0.1)))).quantize(
                Decimal("0.01")
            )

            fees = (platform_fees + shipping_cost).quantize(Decimal("0.01"))

            sold_at = project.completed_at or (
                project.created_at + timedelta(days=random.randint(1, 60))
            )

            gross_margin = (
                price - cost_of_goods - platform_fees - shipping_cost
            ).quantize(Decimal("0.01"))

            Sale.objects.create(
                shop=shop,
                project=project,
                template=project.template,
                customer=project.customer,
                channel=channel,
                price=price,
                fees=fees,
                platform_fees=platform_fees,
                shipping_cost=shipping_cost,
                tax_amount=tax_amount,
                cost_of_goods=cost_of_goods,
                gross_margin=gross_margin,
                currency=shop.currency,
                sold_at=sold_at,
                notes="Demo seeded sale.",
            )

            sales_created += 1

        self.stdout.write(f"Created {sales_created} sales.")

    # ---------------------------------------------------------------------
    # TEMPLATE AVERAGES (OPTIONAL ML PREP)
    # ---------------------------------------------------------------------

    def _update_template_averages_from_sales(self, shop):
        templates = ProductTemplate.objects.filter(shop=shop)
        for t in templates:
            qs = Sale.objects.filter(shop=shop, template=t, cost_of_goods__isnull=False)
            agg = qs.aggregate(
                total=models.Sum("cost_of_goods"),
                count=models.Count("id")
            )
            if agg["count"] == 0:
                continue

            avg = (agg["total"] / agg["count"]).quantize(Decimal("0.01"))
            try:
                t.average_material_cost = (avg * Decimal("0.7")).quantize(Decimal("0.01"))
                t.average_consumable_cost = (avg * Decimal("0.3")).quantize(Decimal("0.01"))
                t.save(update_fields=["average_material_cost", "average_consumable_cost"])
            except AttributeError:
                pass
