from django.urls import path

from .views import SimplySessionAPIView

app_name = "trainers_simply"

urlpatterns = [
    path("session/", SimplySessionAPIView.as_view(), name="session"),
]

