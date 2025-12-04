# core/views.py
import re
from django.db.models import Q, Count, Sum
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from .models import Shop, Customer
from projects.models import Project
from inventory.models import Equipment, Material, Consumable
from products.models import ProductTemplate as Product

from .serializers import ShopSerializer, CurrentUserSerializer, CustomerSerializer, SearchResultSerializer

class MeView(APIView):
    """
    Return the currently authenticated user.

    GET /api/auth/me/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)


class ShopView(generics.RetrieveUpdateAPIView):
    """
    Get, update, or create the current user's shop.

    MVP: one shop per user.

    - GET   /api/shop/  -> current user's shop (404 if none yet)
    - PUT   /api/shop/  -> update current user's shop
    - PATCH /api/shop/  -> partial update
    - POST  /api/shop/  -> create a shop if none exists
    """

    serializer_class = ShopSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        try:
            return user.shop  # owner = OneToOneField(..., related_name="shop")
        except Shop.DoesNotExist:
            raise NotFound("Current user has no shop configured.")

    def post(self, request, *args, **kwargs):
        user = request.user

        if hasattr(user, "shop"):
            return Response(
                {"detail": "Shop already exists for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        shop = serializer.save(
            owner=user,
            joined_at=timezone.now(),  # set first-joined timestamp
        )

        # Re-serialize to include read-only fields
        return Response(self.get_serializer(shop).data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        """
        On any update, bump last_active_at.
        """
        instance = serializer.save()
        instance.last_active_at = timezone.now()
        instance.save(update_fields=["last_active_at"])

class CustomerViewSet(viewsets.ModelViewSet):
    """
    CRUD API for customers of the current user's shop.

    Endpoints (once wired with a router under /api/):
    - GET    /api/customers/        -> list customers with metrics
    - POST   /api/customers/        -> create customer
    - GET    /api/customers/{id}/   -> retrieve single customer
    - PUT    /api/customers/{id}/   -> full update
    - PATCH  /api/customers/{id}/   -> partial update (detail page edits)
    - DELETE /api/customers/{id}/   -> (optional) delete; you might rely on is_active instead
    """

    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        try:
            shop = user.shop
        except Shop.DoesNotExist:
            # No shop yet = no customers
            return Customer.objects.none()

        qs = Customer.objects.filter(shop=shop)

        # Start-of-year boundary for "orders_this_year"
        now = timezone.now()
        """ start_of_year = now.replace(
            month=1, day=1, hour=0, minute=0, second=0, microsecond=0
        ) """
        current_year = now.year

        qs = qs.annotate(
            # --- existing dashboard metrics (unchanged) ---
            total_projects=Count("projects", distinct=True),
            total_products=Count("projects__template", distinct=True),

            # --- NEW sales-based metrics ---
            # number of Sale rows for this customer
            total_sales=Count("sales", distinct=True),

            # real revenue: sum of Sale.price
            lifetime_revenue=Sum("sales__price"),

            # sales in the current calendar year
            orders_this_year=Count(
                "projects",
                filter=Q(projects__created_at__year=current_year),
                distinct=True,
            ),

            # completed projects (for completion rate)
            completed_projects=Count(
                "projects",
                filter=Q(projects__status="completed"),
                distinct=True,
            ),
        )

        return qs


    def perform_create(self, serializer):
        """
        Ensure the new customer is bound to the current user's shop.
        """
        user = self.request.user
        try:
            shop = user.shop
        except Shop.DoesNotExist:
            raise NotFound("Current user has no shop configured.")

        serializer.save(shop=shop)

class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    # entity prefixes like "customer: amy"
    PREFIX_MAP = {
        "customer": "customer",
        "customers": "customer",
        "cust": "customer",
        "c": "customer",

        "project": "project",
        "projects": "project",
        "proj": "project",
        "p": "project",

        "material": "material",
        "materials": "material",
        "mat": "material",

        "consumable": "consumable",
        "consumables": "consumable",
        "cons": "consumable",

        "equipment": "equipment",
        "equip": "equipment",
        "eq": "equipment",
    }

    # ---------- generic helpers ----------

    def get_shop(self, request):
        user = request.user
        if not user.is_authenticated:
            return None
        try:
            return user.shop
        except Shop.DoesNotExist:
            return None

    def parse_entity_prefix(self, text: str):
        """
        Leading entity prefixes like:
          customer: amy
          project: table
        Returns (model_key, remaining_text) or (None, text).
        """
        stripped = text.strip()
        if ":" not in stripped:
            return None, stripped

        first_colon = stripped.find(":")
        prefix = stripped[:first_colon].strip().lower()
        rest = stripped[first_colon + 1 :].strip()

        model_key = self.PREFIX_MAP.get(prefix)
        if not model_key:
            return None, stripped

        return model_key, rest

    def parse_natural_language_projects_for(self, text: str):
        """
        'projects for amy' (with or without quotes) →
        treat as project search filtered by customer name.
        Returns (clean_text, filters) or None.
        """
        stripped = text.strip().strip('"').strip("'")
        lower = stripped.lower()
        if lower.startswith("projects for "):
            name = stripped[len("projects for ") :].strip()
            if name:
                return name, {"customer_name": name}
        return None

    def parse_advanced_project_filters(self, text: str):
        """
        Parse project-level filters from the text:
          status: completed
          stage: sanding
          due: today / overdue
          tag: urgent
          price>50 / price>=50 / price<50 / price=50

        Returns (clean_free_text, filters_dict).
        """
        filters = {}
        working = text

        # status: completed
        m = re.search(r"status\s*:\s*([^\s]+)", working, re.IGNORECASE)
        if m:
            filters["status"] = m.group(1)
            working = (working[: m.start()] + working[m.end() :]).strip()

        # stage: sanding
        m = re.search(r"stage\s*:\s*([^\s]+)", working, re.IGNORECASE)
        if m:
            filters["stage"] = m.group(1)
            working = (working[: m.start()] + working[m.end() :]).strip()

        # due: today / overdue
        m = re.search(r"due\s*:\s*([^\s]+)", working, re.IGNORECASE)
        if m:
            filters["due"] = m.group(1)
            working = (working[: m.start()] + working[m.end() :]).strip()

        # tag: urgent
        m = re.search(r"tag\s*:\s*([^\s]+)", working, re.IGNORECASE)
        if m:
            filters["tag"] = m.group(1)
            working = (working[: m.start()] + working[m.end() :]).strip()

        # price>50, price>=50, price<50, price=50
        m = re.search(
            r"price\s*(>=|<=|>|<|=)\s*([0-9]+(?:\.[0-9]+)?)",
            working,
            re.IGNORECASE,
        )
        if m:
            filters["price_op"] = m.group(1)
            filters["price_value"] = float(m.group(2))
            working = (working[: m.start()] + working[m.end() :]).strip()

        return working.strip(), filters

    # ---------- per-entity search helpers ----------

    def search_customers(self, shop, q, limit):
        qs = (
            Customer.objects.filter(shop=shop)
            .filter(
                Q(name__icontains=q)
                | Q(email__icontains=q)
                | Q(phone__icontains=q)
            )[:limit]
        )
        return [
            {
                "type": "customer",
                "id": c.id,
                "label": c.name,
                "subtitle": c.email or c.phone or "",
                "url": f"/customers/{c.id}",
            }
            for c in qs
        ]

    def search_projects(self, shop, q, limit, filters=None):
        qs = Project.objects.filter(shop=shop)
        filters = filters or {}

        # free text across core project fields
        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(notes__icontains=q)
                | Q(status__icontains=q)
            )

        # status: completed
        status_val = filters.get("status")
        if status_val:
            qs = qs.filter(status__icontains=status_val)

        # stage: sanding  (via current_stage FK)
        stage_val = filters.get("stage")
        if stage_val:
            qs = qs.filter(current_stage__name__icontains=stage_val)

        # due: today / overdue
        due_val = filters.get("due")
        if due_val:
            today = timezone.now().date()
            dv = str(due_val).lower()
            if dv == "today":
                qs = qs.filter(due_date=today)
            elif dv == "overdue":
                qs = qs.filter(due_date__lt=today, completed_at__isnull=True)

        # tag: urgent — treat as fuzzy match in status/notes
        tag_val = filters.get("tag")
        if tag_val:
            qs = qs.filter(
                Q(notes__icontains=tag_val)
                | Q(status__icontains=tag_val)
            )

        # price filters use expected_price
        op = filters.get("price_op")
        val = filters.get("price_value")
        if op and val is not None:
            if op == ">":
                qs = qs.filter(expected_price__gt=val)
            elif op == "<":
                qs = qs.filter(expected_price__lt=val)
            elif op == ">=":
                qs = qs.filter(expected_price__gte=val)
            elif op == "<=":
                qs = qs.filter(expected_price__lte=val)
            elif op == "=":
                qs = qs.filter(expected_price=val)

        # natural language: projects for amy → customer name contains amy
        cust_name = filters.get("customer_name")
        if cust_name:
            qs = qs.filter(customer__name__icontains=cust_name)

        qs = qs[:limit]

        return [
            {
                "type": "project",
                "id": p.id,
                "label": p.name,
                "subtitle": p.status or "",
                "url": f"/projects/{p.id}",
            }
            for p in qs
        ]

    def search_materials(self, shop, q, limit):
        qs = (
            Material.objects.filter(shop=shop, is_active=True)
            .filter(
                Q(name__icontains=q)
                | Q(category__icontains=q)
                | Q(supplier_name__icontains=q)
                | Q(notes__icontains=q)
            )[:limit]
        )
        return [
            {
                "type": "material",
                "id": m.id,
                "label": m.name,
                "subtitle": m.category or m.supplier_name or "",
                "url": f"/inventory/materials/{m.id}",
            }
            for m in qs
        ]

    def search_consumables(self, shop, q, limit):
        qs = (
            Consumable.objects.filter(shop=shop, is_active=True)
            .filter(
                Q(name__icontains=q)
                | Q(notes__icontains=q)
            )[:limit]
        )
        return [
            {
                "type": "consumable",
                "id": c.id,
                "label": c.name,
                "subtitle": c.notes[:60] if c.notes else "",
                "url": f"/inventory/consumables/{c.id}",
            }
            for c in qs
        ]

    def search_equipment(self, shop, q, limit):
        qs = (
            Equipment.objects.filter(shop=shop, is_active=True)
            .filter(
                Q(name__icontains=q)
                | Q(notes__icontains=q)
            )[:limit]
        )
        return [
            {
                "type": "equipment",
                "id": e.id,
                "label": e.name,
                "subtitle": e.notes[:60] if e.notes else "",
                "url": f"/inventory/equipment/{e.id}",
            }
            for e in qs
        ]

    def default_full_search(self, shop, q):
        results = []
        results.extend(self.search_customers(shop, q, limit=5))
        results.extend(self.search_projects(shop, q, limit=5))
        results.extend(self.search_materials(shop, q, limit=5))
        results.extend(self.search_consumables(shop, q, limit=5))
        results.extend(self.search_equipment(shop, q, limit=5))
        return results

    # ---------- main GET ----------

    def get(self, request, *args, **kwargs):
        raw_q = (request.query_params.get("q") or "").strip()
        if not raw_q:
            return Response({"results": []})

        shop = self.get_shop(request)
        if not shop:
            return Response({"results": []})

        q = raw_q
        model_key = None
        filters = {}

        # 1) natural language: projects for amy
        nl = self.parse_natural_language_projects_for(q)
        if nl:
            q, filters = nl
            model_key = "project"
        else:
            # 2) entity prefix: customer:, project:, etc.
            model_key, q = self.parse_entity_prefix(q)
            # 3) advanced project filters inside whatever's left
            q, filters = self.parse_advanced_project_filters(q)

        # If we have project filters but no explicit entity, assume project search
        if not model_key and filters:
            model_key = "project"

        # Route to the appropriate search
        if model_key == "customer":
            results = self.search_customers(shop, q, limit=10)
        elif model_key == "project":
            results = self.search_projects(shop, q, limit=10, filters=filters)
        elif model_key == "material":
            results = self.search_materials(shop, q, limit=10)
        elif model_key == "consumable":
            results = self.search_consumables(shop, q, limit=10)
        elif model_key == "equipment":
            results = self.search_equipment(shop, q, limit=10)
        else:
            # no prefix, no filters → search everything
            results = self.default_full_search(shop, q)

        serializer = SearchResultSerializer(results, many=True)
        return Response({"results": serializer.data})