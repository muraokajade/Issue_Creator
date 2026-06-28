from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Project, Checkpoint, IssueDraft
from .serializers import ProjectSerializer, CheckpointSerializer, IssueDraftSerializer


@api_view(["GET", "POST"])
def project_list(request):
    if request.method == "GET":
        projects = Project.objects.all()
        return Response(ProjectSerializer(projects, many=True).data)

    data = request.data
    serializer = ProjectSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
def checkpoint_list(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        checkpoints = project.checkpoints.all()
        return Response(CheckpointSerializer(checkpoints, many=True).data)

    serializer = CheckpointSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(project=project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# このviewは GET と POST の両方を受け付ける
# GET  = このProjectのIssueDraft一覧を返す
# POST = このProjectに新しいIssueDraftを作成する
@api_view(["GET", "POST"])
def issue_draft_list(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        drafts = project.issue_drafts.all()
        return Response(IssueDraftSerializer(drafts, many=True).data)

    serializer = IssueDraftSerializer(data=request.data) # .dataが不明
    if serializer.is_valid():
        project.issue_drafts.filter(status="current").update(status="backlog")
        serializer.save(project=project, status="current")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def complete_issue_draft(request, project_id, issue_draft_id):
    """
    POST /api/projects/{project_id}/issue-drafts/{issue_draft_id}/complete/

    IssueDraftを完了にし、Checkpointを作成し、次IssueDraftを作成する。
    """
    from django.utils import timezone

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        draft = IssueDraft.objects.get(id=issue_draft_id, project=project)
    except IssueDraft.DoesNotExist:
        return Response({"error": "IssueDraft not found"}, status=status.HTTP_404_NOT_FOUND)

    completed_summary = request.data.get("completedSummary", "").strip()
    learned = request.data.get("learned", "").strip()
    next_work_type = request.data.get("nextWorkType", "other").strip()
    next_work_memo = request.data.get("nextWorkMemo", "").strip()

    if not next_work_memo:
        return Response(
            {"error": "nextWorkMemo は必須です"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 1. Complete the current IssueDraft
    draft.status = "done"
    draft.completed_at = timezone.now()
    draft.completed_summary = completed_summary
    draft.save()

    # 2. Create Checkpoint
    checkpoint = Checkpoint.objects.create(
        project=project,
        phase=next_work_type,
        current_goal=f"前Issue「{draft.title}」を完了。次: {next_work_memo}",
        current_state=completed_summary,
        learned=learned,
        next_action=next_work_memo,
    )

    # TODO
    # 念のため、同じProject内の他currentをbacklogへ落とす
    project.issue_drafts.filter(status="current").exclude(id=draft.id).update(status="backlog")

    # 3. Create next IssueDraft
    next_draft = IssueDraft.objects.create(
        project=project,
        title=next_work_memo[:200],
        background=f"前Issue「{draft.title}」を完了した後の次作業。",
        purpose=next_work_memo,
        next_step=next_work_memo,
        # status="draft",
        status="current"
    )

    return Response({
        "completedDraft": IssueDraftSerializer(draft).data,
        "checkpoint": CheckpointSerializer(checkpoint).data,
        "nextDraft": IssueDraftSerializer(next_draft).data,
    }, status=status.HTTP_201_CREATED)
