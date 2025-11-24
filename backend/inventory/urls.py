from rest_framework.routers import DefaultRouter
from inventory.views import MaterialViewSet, ConsumableViewSet, EquipmentViewSet

router = DefaultRouter()
router.register(r"materials", MaterialViewSet, basename="material")
router.register(r"consumables", ConsumableViewSet, basename="consumable")
router.register(r"equipment", EquipmentViewSet, basename="equipment")

urlpatterns = router.urls
