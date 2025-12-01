# core/views.py
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from .models import Shop, Customer
from .serializers import ShopSerializer, CurrentUserSerializer, CustomerSerializer

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

        # Metrics:
        # - total_projects: number of projects linked to this customer
        # - total_products: rough count of distinct "things" they’ve bought
        #
        # This assumes Project has:
        #   customer = ForeignKey(Customer, related_name="projects", ...)
        # and a template/product field, adjust as needed:
        #   projects__template  or  projects__product_template  etc.
        qs = qs.annotate(
            total_projects=Count("projects", distinct=True),
            # TODO: adjust "projects__template" to your actual field if different.
            total_products=Count("projects__template", distinct=True),
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