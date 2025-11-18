from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContactViewSet, CourseViewSet, home_data

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'contacts', ContactViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('', include('trainers.urls')),
    path('trainers/schulte-table/', include('trainers_schulte_table.urls')),
    path('trainers/flash-cards/', include('trainers_flash_cards.urls')),
    path('trainers/stroop-test/', include('trainers_stroop.urls')),
    path('trainers/simply/', include('trainers_simply.urls')),
    path('home/', home_data, name='home-data'),
]
