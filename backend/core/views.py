# core/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Shop
from .serializers import ShopSerializer, CurrentUserSerializer

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
        shop = serializer.save(owner=user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
