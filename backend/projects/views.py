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


@api_view(["GET", "POST"])
def issue_draft_list(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        drafts = project.issue_drafts.all()
        return Response(IssueDraftSerializer(drafts, many=True).data)

    serializer = IssueDraftSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(project=project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
