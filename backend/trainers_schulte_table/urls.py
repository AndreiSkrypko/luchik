from django.urls import path

from .views import SchulteSessionView

urlpatterns = [
    path('session/', SchulteSessionView.as_view(), name='schulte-session'),
]

