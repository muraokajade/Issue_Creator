from rest_framework import serializers
from .models import Project, Checkpoint, IssueDraft


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name", "description", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class CheckpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checkpoint
        fields = [
            "id", "project", "phase", "current_goal", "current_state",
            "learned", "next_action", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "project", "created_at", "updated_at"]


class IssueDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueDraft
        fields = [
            "id", "project", "title", "background", "purpose",
            "acceptance_criteria", "next_step", "status",
            "completed_at", "completed_summary",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "project", "created_at", "updated_at"]
