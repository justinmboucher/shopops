from rest_framework.routers import DefaultRouter
from workflows.views import WorkflowDefinitionViewSet

router = DefaultRouter()
router.register(r"workflows", WorkflowDefinitionViewSet, basename="workflow")

urlpatterns = router.urls
