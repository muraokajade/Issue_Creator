from django.urls import path
from . import views

urlpatterns = [
    path("issues/generate/", views.generate_issue_view, name="generate-issue"),
]
