from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, ContactViewSet, home_data

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'contacts', ContactViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('home/', home_data, name='home-data'),
]

