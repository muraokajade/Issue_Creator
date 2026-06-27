from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name


class Checkpoint(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="checkpoints")
    phase = models.CharField(max_length=100, default="Phase 0.5")
    current_goal = models.TextField(default="")
    current_state = models.TextField(default="")
    learned = models.TextField(blank=True, default="")
    next_action = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.phase}] {self.current_goal[:40]}"


class IssueDraft(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="issue_drafts")
    title = models.CharField(max_length=300)
    background = models.TextField(blank=True, default="")
    purpose = models.TextField(blank=True, default="")
    acceptance_criteria = models.TextField(blank=True, default="")
    next_step = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
