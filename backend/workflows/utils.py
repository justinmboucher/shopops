# backend/workflows/utils.py
from rest_framework.exceptions import NotFound, PermissionDenied
from core.models import Shop


def get_current_shop(request):
    """
    Return the current user's Shop or raise a clean API error instead of 500.
    """
    user = request.user

    # Reverse OneToOne: accessing user.shop can raise Shop.DoesNotExist
    try:
        shop = user.shop
    except Shop.DoesNotExist:
        # 404 is fine here because from the app's POV the "current shop" doesn't exist
        raise NotFound("Current user has no shop configured.")

    if shop is None:
        raise PermissionDenied("User has no shop configured.")

    return shop
