from django.urls import path
from . import views

urlpatterns = [
    path("projects/", views.project_list, name="project-list"),
    path("projects/<int:project_id>/checkpoints/", views.checkpoint_list, name="checkpoint-list"),
    path("projects/<int:project_id>/issue-drafts/", views.issue_draft_list, name="issue-draft-list"),
]
