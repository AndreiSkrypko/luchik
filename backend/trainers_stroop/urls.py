from django.urls import path

from .views import StroopSessionView

urlpatterns = [
    path('session/', StroopSessionView.as_view(), name='stroop-session'),
]


