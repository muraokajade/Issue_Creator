from django.urls import path
from . import views

urlpatterns = [
    path("app-map/generate/", views.generate_app_map_view, name="generate-app-map"),
]
