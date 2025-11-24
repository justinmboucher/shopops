from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def ping(request):
    return Response({"status": "ok", "message": "ShopOps backend is alive"})
