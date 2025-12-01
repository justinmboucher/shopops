# core/management/commands/seed_demo_shopops.py

import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

from core.models import Shop, Customer
from inventory.models import Material, Consumable, Equipment
from products.models import ProductTemplate, BOMItem
from workflows.models import WorkflowDefinition, WorkflowStage, ProjectStageHistory
from projects.models import Project
from sales.models import Sale


fake = Faker()
User = get_user_model()


class Command(BaseCommand):
    help = "Seed a demo ShopOps tenant with realistic shop, customers, inventory, workflows, projects, and sales."

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

    def handle(self, *args, **options):
        email = options["email"]
        password = options["password"]
        num_projects = options["projects"]
        num_customers = options["customers"]

        self.stdout.write(self.style.MIGRATE_HEADING("Seeding demo ShopOps data..."))

        user, shop = self._get_or_create_demo_user_and_shop(email, password)
        workflow = self._get_or_create_workflow(shop)
        stages = list(workflow.stages.all().order_by("order"))
        materials, consumables, equipment_items = self._get_or_create_inventory(shop)
        products = self._get_or_create_products(shop, workflow, materials, equipment_items)
        customers = self._get_or_create_customers(shop, count=num_customers)
        projects = self._create_projects(
            shop=shop,
            workflow=workflow,
            stages=stages,
            products=products,
            customers=customers,
            count=num_projects,
        )
        self._create_sales_for_projects(shop, projects)

        self.stdout.write(self.style.SUCCESS("✅ Demo data seeding complete."))

    # -------------------------------------------------------------------------
    # 1) User + Shop
    # -------------------------------------------------------------------------
    def _get_or_create_demo_user_and_shop(self, email, password):
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "is_staff": True,
                "is_superuser": False,
            },
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(f"Created demo user {email}")
        else:
            self.stdout.write(f"Using existing user {email}")

        shop, shop_created = Shop.objects.get_or_create(
            owner=user,
            defaults={
                "name": "Demo Woodworks",
                "tagline": "Handcrafted pieces for real humans.",
                "description": (
                    "A busy one-person woodworking shop doing custom "
                    "cutting boards, tables, bookshelves, and decor."
                ),
                # Contact
                "contact_email": "contact@demowoodworks.local",
                "contact_phone": fake.phone_number(),
                # Address
                "address_line1": "123 Sawdust Lane",
                "address_line2": "",
                "city": "Austin",
                "state": "TX",
                "postal_code": "73301",
                "country": "USA",
                # Online presence
                "website_url": "https://demowoodworks.local",
                "instagram_handle": "@demo_woodworks",
                "facebook_handle": "demowoodworks",
                # Preferences
                "timezone": "America/Chicago",
                "currency": "USD",
                "default_units": "imperial",
                "default_hourly_rate": 75,
                "default_markup_pct": 25,
                "default_payment_terms": "50/50",
                "default_project_type": "Woodworking",
                # Appearance
                "theme": "system",
                # Shipping config
                "shipping_zones_config": {
                    "zones": [
                        {
                            "name": "Local Pickup",
                            "type": "pickup",
                            "regions": ["Austin, TX"],
                            "flat_rate": 0,
                        },
                        {
                            "name": "Domestic Shipping",
                            "type": "shipping",
                            "regions": ["USA"],
                            "flat_rate": 75,
                        },
                    ]
                },
            },
        )

        # Fake historical usage: joined 14–20 months ago
        if shop.joined_at is None:
            months_ago = random.randint(14, 20)
            shop.joined_at = timezone.now() - timedelta(days=months_ago * 30)

        # Last active = sometime in the last week
        shop.last_active_at = timezone.now() - timedelta(days=random.randint(0, 7))
        shop.save()

        if shop_created:
            self.stdout.write(f"Created shop '{shop.name}' for {email}")
        else:
            self.stdout.write(f"Using existing shop '{shop.name}' for {email}")

        return user, shop

    # -------------------------------------------------------------------------
    # 2) Workflow + stages
    # -------------------------------------------------------------------------
    def _get_or_create_workflow(self, shop):
        workflow, _ = WorkflowDefinition.objects.get_or_create(
            shop=shop,
            name="Default Woodworking Workflow",
            defaults={
                "description": "Standard build workflow for most woodworking projects.",
                "is_default": True,
                "is_active": True,
            },
        )

        stage_defs = [
            # name, role, key
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
        order = 1
        for name, role, key in stage_defs:
            if name in existing:
                stage = existing[name]
                # Keep order consistent
                if stage.order != order:
                    stage.order = order
                    stage.save(update_fields=["order"])
            else:
                WorkflowStage.objects.create(
                    workflow=workflow,
                    name=name,
                    role=role,
                    key=key,
                    order=order,
                )
            order += 1

        self.stdout.write(
            f"Ensured {workflow.stages.count()} workflow stages for '{workflow.name}'."
        )
        return workflow

    # -------------------------------------------------------------------------
    # 3) Inventory
    # -------------------------------------------------------------------------
    def _get_or_create_inventory(self, shop):
        materials_data = [
            ("Cedar 1x6", "Lumber", "board", 7.50),
            ("Pine 2x4", "Lumber", "board", 4.00),
            ("Baltic Birch Plywood 3/4\"", "Sheet Goods", "sheet", 80.00),
            ("Walnut 4/4", "Lumber", "board", 18.00),
            ("Maple 4/4", "Lumber", "board", 12.00),
        ]
        consumables_data = [
            ("Wood Glue", "bottle", 9.50),
            ("Polyurethane Finish", "quart", 22.00),
            ("Danish Oil", "quart", 18.00),
            ("Sandpaper", "pack", 12.00),
            ("Pocket Hole Screws", "box", 15.00),
        ]
        equipment_data = [
            ("Table Saw", "SawStop PCS", 3500.00),
            ("Miter Saw", "12in Sliding", 700.00),
            ("CNC Router", "Shapeoko", 2500.00),
            ("Lathe", "Midi Lathe", 900.00),
            ("Drill Press", "Floor Standing", 650.00),
        ]

        materials = []
        for name, category, unit, cpu in materials_data:
            m, _ = Material.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={
                    "category": category,
                    "unit": unit,
                    "quantity": random.uniform(5, 60),
                    "cost_per_unit": cpu,
                    "supplier_name": fake.company(),
                    "is_active": True,
                },
            )
            materials.append(m)

        consumables = []
        for name, unit, cpu in consumables_data:
            c, _ = Consumable.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={
                    "unit": unit,
                    "cost_per_unit": cpu,
                    "quantity": random.uniform(2, 100),
                    "is_active": True,
                },
            )
            consumables.append(c)

        equipment_items = []
        for name, model, cost in equipment_data:
            e, _ = Equipment.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={
                    "purchase_date": timezone.now().date()
                    - timedelta(days=random.randint(365, 365 * 5)),
                    "purchase_cost": cost,
                    "is_active": True,
                },
            )
            equipment_items.append(e)

        self.stdout.write(
            f"Ensured {len(materials)} materials, {len(consumables)} consumables, "
            f"{len(equipment_items)} equipment items."
        )
        return materials, consumables, equipment_items

    # -------------------------------------------------------------------------
    # 4) Products + BOM
    # -------------------------------------------------------------------------
    def _get_or_create_products(self, shop, workflow, materials, equipment_items):
        product_defs = [
            # name, category, base_price range (low, high), est hours
            ("Cutting Board", "Kitchen", (75, 250), 4),
            ("Dining Table", "Furniture", (900, 3200), 40),
            ("Coffee Table", "Furniture", (250, 900), 18),
            ("Bookshelf", "Storage", (200, 800), 16),
            ("Custom Sign", "Decor", (60, 350), 6),
            ("End Table", "Furniture", (150, 500), 10),
        ]

        products = []
        for name, category, (low, high), est_hours in product_defs:
            base_price = random.randint(low, high)
            template, created = ProductTemplate.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={
                    "description": f"Custom {name.lower()} made to order.",
                    "category": category,
                    "workflow": workflow,
                    "estimated_labor_hours": est_hours,
                    "hourly_rate": shop.default_hourly_rate or 75,
                    "estimated_consumables_cost": random.randint(10, 80),
                    "base_price": base_price,
                    "is_active": True,
                },
            )
            products.append(template)

            # Ensure BOM items exist (if any materials; skip if already populated)
            if created and materials:
                self._seed_bom_for_template(template, materials)

        self.stdout.write(f"Ensured {len(products)} product templates.")
        return products

    def _seed_bom_for_template(self, template, materials):
        # 1–3 materials in the BOM
        bom_materials = random.sample(
            materials, k=random.randint(1, min(3, len(materials)))
        )
        for mat in bom_materials:
            BOMItem.objects.create(
                template=template,
                material=mat,
                quantity=random.uniform(0.25, 3.0),
                unit=mat.unit,
            )

    # -------------------------------------------------------------------------
    # 5) Customers
    # -------------------------------------------------------------------------
    def _get_or_create_customers(self, shop, count=20):
        existing = list(shop.customers.all())
        if len(existing) >= count:
            self.stdout.write(
                f"{len(existing)} customers already exist for this shop; not creating more."
            )
            return existing

        customers = existing[:]
        remaining = count - len(existing)

        channels = ["Etsy", "Craft Fair", "Instagram", "Word of Mouth", "Website"]

        for _ in range(remaining):
            name = fake.name()
            email = fake.email()
            phone = fake.phone_number()
            channel = random.choice(channels)

            cust = Customer.objects.create(
                shop=shop,
                name=name,
                email=email,
                phone=phone,
                channel=channel,
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

        self.stdout.write(f"Ensured {len(customers)} customers for demo shop.")
        return customers

    # -------------------------------------------------------------------------
    # 6) Projects (+ ProjectStageHistory)
    # -------------------------------------------------------------------------
    def _create_projects(
        self,
        shop,
        workflow,
        stages,
        products,
        customers,
        count=60,
    ):
        if not stages:
            self.stdout.write(self.style.WARNING("No stages found; skipping projects."))
            return []

        projects = []

        for _ in range(count):
            # Random date in the last ~18 months
            days_ago = random.randint(0, 540)
            created_at = timezone.now() - timedelta(days=days_ago)

            template = random.choice(products)
            customer = random.choice(customers) if customers else None

            quantity = random.randint(1, 3)
            base_price = template.base_price or random.randint(100, 500)
            expected_price = base_price * quantity * random.uniform(0.9, 1.3)

            # Decide status based on age
            age_days = (timezone.now() - created_at).days
            if age_days > 120:
                status = random.choices(
                    ["completed", "cancelled", "active"],
                    weights=[0.6, 0.2, 0.2],
                )[0]
            elif age_days > 30:
                status = random.choices(
                    ["active", "completed", "cancelled"],
                    weights=[0.6, 0.3, 0.1],
                )[0]
            else:
                status = "active"

            # Choose final/current stage based on status
            completed_stage = next(
                (s for s in stages if s.key == "completed"), stages[-1]
            )
            cancelled_stage = next(
                (s for s in stages if s.key == "cancelled"), stages[-1]
            )
            ready_stage = next((s for s in stages if s.key == "ready"), stages[-2])
            active_stage_choices = [
                s for s in stages if s.key in {"idea", "design", "prep", "build", "finish"}
            ] or stages

            if status == "completed":
                current_stage = completed_stage
            elif status == "cancelled":
                current_stage = cancelled_stage
            elif age_days > 30:
                current_stage = random.choice(active_stage_choices + [ready_stage])
            else:
                current_stage = random.choice(active_stage_choices)

            project_name = f"{template.name} for {customer.name.split()[0]}" if customer else template.name

            project = Project.objects.create(
                shop=shop,
                template=template,
                workflow=workflow,
                current_stage=current_stage,
                customer=customer,
                name=project_name,
                quantity=quantity,
                due_date=created_at.date()
                + timedelta(days=random.randint(7, 90)),
                estimated_hours=template.estimated_labor_hours or random.uniform(4, 40),
                actual_hours=(
                    random.uniform(3, 60) if status in ["completed", "cancelled"] else None
                ),
                status=status,
                expected_price=round(expected_price, 2),
                expected_currency=shop.currency,
                cancel_reason=(
                    "Customer changed their mind."
                    if status == "cancelled"
                    else ""
                ),
                cancel_stage=(cancelled_stage if status == "cancelled" else None),
                cancelled_at=(
                    created_at + timedelta(days=random.randint(3, 60))
                    if status == "cancelled"
                    else None
                ),
                notes="Demo seeded project.",
                created_at=created_at,
                updated_at=created_at
                + timedelta(days=random.randint(0, max(1, age_days))),
            )

            # Simple stage history: created → 1–3 stages → current
            self._seed_stage_history_for_project(project, stages, created_at)

            projects.append(project)

        self.stdout.write(f"Created {len(projects)} demo projects.")
        return projects

    def _seed_stage_history_for_project(self, project, stages, created_at):
        """
        Create a simple stage progression for each project.
        """
        # pick a subset of stages in order that ends with current_stage
        # ensure we respect WorkflowStage.order
        ordered = list(stages)
        stage_ids_in_path = []

        for stage in ordered:
            stage_ids_in_path.append(stage.id)
            if stage.id == project.current_stage_id:
                break

        if not stage_ids_in_path:
            stage_ids_in_path = [project.current_stage_id]

        entered_at = created_at
        for sid in stage_ids_in_path:
            ProjectStageHistory.objects.create(
                project=project,
                stage_id=sid,
                entered_at=entered_at,
            )
            entered_at += timedelta(days=random.randint(1, 14))

    # -------------------------------------------------------------------------
    # 7) Sales (for completed / some active projects)
    # -------------------------------------------------------------------------
    def _create_sales_for_projects(self, shop, projects):
        """
        Create Sale rows tied to projects where it makes sense.
        """
        channels = [c[0] for c in Sale.CHANNEL_CHOICES]  # etsy, market, instagram, direct, other

        sales_created = 0

        for project in projects:
            # Most completed projects should have a sale.
            # Some active ones might be pre-sold.
            if project.status == "completed":
                create_sale = True
            elif project.status == "active":
                create_sale = random.random() < 0.25
            else:  # cancelled
                create_sale = random.random() < 0.05

            if not create_sale:
                continue

            # Treat price ~ expected_price with some noise
            base_price = project.expected_price or 0
            if base_price <= 0:
                base_price = random.randint(100, 1000)

            price = round(base_price * random.uniform(0.95, 1.15), 2)

            # Fees higher for Etsy/Instagram, lower for direct/market
            channel = random.choice(channels)
            if channel in ["etsy", "instagram"]:
                fees_pct = random.uniform(0.08, 0.15)
            elif channel == "market":
                fees_pct = random.uniform(0.02, 0.06)
            else:
                fees_pct = random.uniform(0.0, 0.03)

            fees = round(price * fees_pct, 2)

            # sold_at near due_date, or after created_at for active
            if project.status == "completed":
                sold_at_date = project.due_date or project.created_at.date()
                sold_at = timezone.make_aware(
                    timezone.datetime.combine(
                        sold_at_date + timedelta(days=random.randint(-3, 10)),
                        timezone.datetime.min.time(),
                    )
                )
            else:
                sold_at = project.created_at + timedelta(days=random.randint(1, 60))

            Sale.objects.create(
                shop=shop,
                project=project,
                template=project.template,
                customer=project.customer,
                channel=channel,
                price=price,
                fees=fees,
                currency=project.expected_currency,
                sold_at=sold_at,
                notes="Demo seeded sale.",
            )
            sales_created += 1

        self.stdout.write(f"Created {sales_created} demo sales linked to projects.")
