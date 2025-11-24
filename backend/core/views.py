from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions

from .models import Shop
from .serializers import ShopSerializer


@api_view(["GET"])
def ping(request):
    return Response({"status": "ok", "message": "ShopOps backend is alive"})


class ShopView(generics.RetrieveUpdateAPIView):
    """
    Get or update the current user's shop.
    One shop per user in MVP.
    """

    serializer_class = ShopSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        try:
            return user.shop
        except Shop.DoesNotExist:
            raise RuntimeError("Current user has no shop configured.")
