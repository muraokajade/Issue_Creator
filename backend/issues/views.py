import logging

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.ai_issue_service import generate_issue_from_memo

logger = logging.getLogger(__name__)


@api_view(["POST"])
def generate_issue_view(request):
    """
    POST /api/issues/generate/

    AIラリー対応。phase を返す:
    - questions: 追加質問
    - result: 生成されたIssue
    """
    title = request.data.get("title", "").strip()
    raw_memo = request.data.get("rawMemo", "").strip()
    issue_type = request.data.get("issueType", "feature")
    priority = request.data.get("priority", "medium")

    intent = request.data.get("intent", "").strip()
    current_state = request.data.get("currentState", "").strip()
    target = request.data.get("target", "").strip()
    constraints = request.data.get("constraints", "").strip()
    done_state = request.data.get("doneState", "").strip()

    # Rally field
    clarifications = request.data.get("clarifications", None)

    if not raw_memo and not intent and not clarifications:
        return Response(
            {"error": "雑メモまたは具体化質問のいずれかを入力してください"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not title:
        title = "無題のIssue"

    try:
        result = generate_issue_from_memo(
            title=title,
            raw_memo=raw_memo,
            issue_type=issue_type,
            priority=priority,
            intent=intent,
            current_state=current_state,
            target=target,
            constraints=constraints,
            done_state=done_state,
            clarifications=clarifications if isinstance(clarifications, dict) else None,
        )
        return Response(result, status=status.HTTP_200_OK)

    except ValueError as e:
        logger.warning("Issue生成エラー: %s", e)
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.exception("Issue生成で予期しないエラー: %s", e)
        return Response(
            {"error": "AI生成中にエラーが発生しました。しばらくしてから再試行してください。"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
