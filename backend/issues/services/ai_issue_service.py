"""
AI Issue Generation Service (Rally対応)

入力が曖昧なら追加質問を返し、十分なら具体的なIssueを生成する。
Issue は必ず対象ファイル・画面・API・実行コマンドレベルまで落とし込む。
"""

import json
import logging
from typing import Optional

from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)

EVALUATE_PROMPT = """あなたは個人開発者の作業Issueを整理するアシスタントです。

ユーザーの入力を見て、具体的なIssue（対象ファイル・画面・API・実行コマンドを含む作業指示）を
生成するのに十分な情報があるか判定してください。

十分の基準:
- 何をしたいか具体的に分かる
- 対象ファイル・画面・APIのいずれかが分かる、または推測できる
- 完了状態がイメージできる

不十分の例:
- 「APIを作りたい」だけで、何のAPIか分からない
- 「修正したい」だけで、何をどう修正するか分からない
- 対象が広すぎて1 Issueに収まらない

出力は必ず以下のJSON形式にしてください:
{
  "sufficient": true/false,
  "questions": ["具体化のための質問1", "質問2"]
}

ルール:
- sufficient が true なら questions は空配列
- sufficient が false なら 2〜3個の質問を返す
- 質問は「はい/いいえ」ではなく、具体情報を引き出す形にする
- 例: 「対象のファイルパスは分かりますか？」「どの画面の話ですか？」
- JSON以外のテキストを出力しない
"""

GENERATE_PROMPT = """あなたは個人開発者の雑メモを、今すぐ実行可能なIssueに変換するアシスタントです。

最重要:
- nextAction は「方針」ではなく「今すぐ実行できる1アクション」にする
- 必ず対象ファイル・対象画面・対象API・実行コマンド・Kiroへの依頼文のいずれかを含める
- 抽象的な方針を書かない

出力は必ず以下のJSON形式にしてください:
{
  "title": "Issueタイトル",
  "background": "なぜこの作業が必要か（1〜3文）",
  "goal": "このIssueで達成すること（1〜2文）",
  "acceptanceCriteria": ["完了条件1", "完了条件2", "完了条件3"],
  "nextAction": "今すぐ実行する1アクション（ファイルパス or コマンド含む）"
}

生成ルール:
- title は具体的に。何をどこに対してやるか分かるように
- background は1〜3文
- goal は1〜2文
- acceptanceCriteria は3〜5個。検証可能に
- 大きすぎるIssueにしない。1〜3時間で終わる粒度
- constraintsに書かれた「やらないこと」は含めすぎない
- doneState があれば acceptanceCriteria に反映する
- target があれば nextAction に反映する

nextAction の厳格ルール:
- 必ず1文にする
- 複数の作業を詰め込まない
- 「確認する」「整理する」「設計する」だけで終わらせない
- 以下のいずれかを含める:
  - 対象ファイルパス（例: backend/issues/views.py）
  - 実行コマンド（例: python manage.py check）
  - 対象画面（例: AppMapPage の生成ボタン）
  - Kiroへの依頼文（例: Kiroに「〜して」と投げる）

悪い例:
- バックエンド設計を整理する
- 必要なAPIを検討する
- 実装を開始する

良い例:
- backend/issues/views.py を開き、generate_issue_view に clarifications パラメータを追加する
- python manage.py check を実行し、設定エラーがないことを確認する
- Kiroに「IssueCreatePage の追加質問UI部分を実装して」と依頼する

JSON以外のテキストを出力しない。
"""


def _call_openai(system_prompt: str, user_message: str) -> dict:
    """OpenAI APIを呼び出してJSONレスポンスを返す共通関数"""
    api_key = settings.OPENAI_API_KEY
    if not api_key or api_key == "your-api-key-here":
        raise ValueError(
            "OPENAI_API_KEY が設定されていません。.env ファイルを確認してください。"
        )

    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("AIからの応答が空でした")

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        logger.error("AI出力のJSONパースに失敗: %s", content)
        raise ValueError(f"AIの出力をJSONとして解析できませんでした: {e}")


def _build_context(
    title: str,
    raw_memo: str,
    issue_type: str,
    priority: str,
    intent: str = "",
    current_state: str = "",
    target: str = "",
    constraints: str = "",
    done_state: str = "",
    clarifications: Optional[dict] = None,
) -> str:
    """ユーザー入力からコンテキスト文字列を組み立てる"""
    parts = [
        f"タイトル: {title}",
        f"種別: {issue_type}",
        f"優先度: {priority}",
    ]

    if raw_memo:
        parts.append(f"\n雑メモ:\n{raw_memo}")

    specifics = []
    if intent:
        specifics.append(f"- 何をしたい: {intent}")
    if current_state:
        specifics.append(f"- 今どこまで: {current_state}")
    if target:
        specifics.append(f"- 対象: {target}")
    if constraints:
        specifics.append(f"- 制約: {constraints}")
    if done_state:
        specifics.append(f"- 完了状態: {done_state}")

    if specifics:
        parts.append("\n具体化質問への回答:")
        parts.extend(specifics)

    if clarifications:
        parts.append("\nAI追加質問への回答:")
        for q, a in clarifications.items():
            parts.append(f"  Q: {q}\n  A: {a}")

    return "\n".join(parts)


def generate_issue_from_memo(
    title: str,
    raw_memo: str,
    issue_type: str = "feature",
    priority: str = "medium",
    intent: str = "",
    current_state: str = "",
    target: str = "",
    constraints: str = "",
    done_state: str = "",
    clarifications: Optional[dict] = None,
) -> dict:
    """
    AIラリー対応のIssue生成。

    Returns:
        {"phase": "questions", "questions": [...]}
        or {"phase": "result", "result": {...}}
    """
    context = _build_context(
        title=title,
        raw_memo=raw_memo,
        issue_type=issue_type,
        priority=priority,
        intent=intent,
        current_state=current_state,
        target=target,
        constraints=constraints,
        done_state=done_state,
        clarifications=clarifications,
    )

    # If clarifications provided, skip evaluation and go straight to generation
    if clarifications:
        logger.info("Issue生成: clarifications付き → 直接生成")
        gen_msg = f"以下の情報からIssueを生成してください。\n\n{context}"
        result = _call_openai(GENERATE_PROMPT, gen_msg)
        return {"phase": "result", "result": result}

    # Phase 1: evaluate sufficiency
    logger.info("Issue生成 Phase 1: 入力評価 title=%s", title)
    eval_msg = f"以下のユーザー入力を評価してください。\n\n{context}"
    evaluation = _call_openai(EVALUATE_PROMPT, eval_msg)

    if not evaluation.get("sufficient", False):
        questions = evaluation.get("questions", ["もう少し具体的に教えてください"])
        logger.info("Issue Phase 1: 追加質問 %d個", len(questions))
        return {"phase": "questions", "questions": questions}

    # Phase 2: generate issue
    logger.info("Issue生成 Phase 2: 直接生成")
    gen_msg = f"以下の情報からIssueを生成してください。\n\n{context}"
    result = _call_openai(GENERATE_PROMPT, gen_msg)
    return {"phase": "result", "result": result}
