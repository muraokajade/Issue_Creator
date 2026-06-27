import logging

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.ai_app_map_service import check_or_candidates, generate_app_map_from_candidate

logger = logging.getLogger(__name__)


@api_view(["POST"])
def generate_app_map_view(request):
    """
    POST /api/app-map/generate/

    段階型AIラリー:
    - mode=check_or_candidates → need_more_info or candidates
    - mode=generate_app_map → app_map
    """
    mode = request.data.get("mode", "check_or_candidates").strip()

    app_name = request.data.get("appName", "").strip()
    app_idea_memo = request.data.get("appIdeaMemo", "").strip()
    target_user = request.data.get("targetUser", "").strip()
    current_problem = request.data.get("currentProblem", "").strip()
    current_workflow = request.data.get("currentWorkflow", "").strip()
    constraints = request.data.get("constraints", "").strip()
    app_purpose_type = request.data.get("appPurposeType", "").strip()
    skill_level = request.data.get("skillLevel", None)
    experience_languages = request.data.get("experienceLanguages", [])
    experience_frameworks = request.data.get("experienceFrameworks", [])
    available_time = request.data.get("availableTime", "").strip()
    implementation_status = request.data.get("implementationStatus", "").strip()
    selected_candidate = request.data.get("selectedCandidate", "").strip()
    additional_answers = request.data.get("additionalAnswers", None)

    if mode == "check_or_candidates":
        if not app_idea_memo:
            return Response(
                {"error": "作りたいもの・困っていることを入力してください"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            result = check_or_candidates(
                app_name=app_name, app_idea_memo=app_idea_memo,
                target_user=target_user, current_problem=current_problem,
                current_workflow=current_workflow, constraints=constraints,
                app_purpose_type=app_purpose_type, skill_level=skill_level,
                experience_languages=experience_languages,
                experience_frameworks=experience_frameworks,
                available_time=available_time,
                implementation_status=implementation_status,
                additional_answers=additional_answers if isinstance(additional_answers, dict) else None,
            )
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("AppMap check_or_candidates エラー: %s", e)
            return Response({"error": "AI生成中にエラーが発生しました。"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif mode == "generate_app_map":
        if not selected_candidate:
            return Response(
                {"error": "selectedCandidate は必須です"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            result = generate_app_map_from_candidate(
                selected_candidate=selected_candidate,
                app_name=app_name, app_idea_memo=app_idea_memo,
                target_user=target_user, current_problem=current_problem,
                current_workflow=current_workflow, constraints=constraints,
                app_purpose_type=app_purpose_type, skill_level=skill_level,
                experience_languages=experience_languages,
                experience_frameworks=experience_frameworks,
                available_time=available_time,
                implementation_status=implementation_status,
                additional_answers=additional_answers if isinstance(additional_answers, dict) else None,
            )
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("AppMap generate エラー: %s", e)
            return Response({"error": "AI生成中にエラーが発生しました。"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    else:
        return Response({"error": f"不明なmode: {mode}"}, status=status.HTTP_400_BAD_REQUEST)
