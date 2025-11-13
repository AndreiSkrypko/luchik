from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TrainerViewSet

router = DefaultRouter()
router.register(r'trainers', TrainerViewSet, basename='trainer')

urlpatterns = [
    path('', include(router.urls)),
]

