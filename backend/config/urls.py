from django.urls import path, include

urlpatterns = [
    path("api/", include("issues.urls")),
    path("api/", include("app_maps.urls")),
    path("api/", include("projects.urls")),
]
