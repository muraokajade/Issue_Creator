"""
AI App Map Generation Service (段階型AIラリー)

Phase 1: check_or_candidates
  - 入力不足 → status: need_more_info + questions
  - 入力十分 → status: candidates + 3候補

Phase 2: generate_app_map
  - selectedCandidate → status: app_map + フルAppMap
"""

import json
import logging
from typing import Optional

from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)

EVALUATE_PROMPT = """あなたはアプリ開発の相談を受けるアシスタントです。

ユーザーの入力を見て、アプリ候補を3つ提案するのに十分な情報があるか判定してください。

十分の基準（以下の3つが揃っていること）:
1. 誰のためか（対象ユーザー）が分かる
2. 何が困っている/面倒かが分かる
3. 今どうやって回しているか、または何を作りたいかが分かる

出力は必ず以下のJSON形式にしてください:
{
  "sufficient": true または false,
  "questions": ["不足情報を聞く質問1", "質問2"],
  "reason": "なぜ追加質問が必要か（1文）"
}

ルール:
- sufficient が true なら questions は空配列、reason は空文字
- sufficient が false なら 2〜4個の質問を返す
- 質問は「はい/いいえ」ではなく、具体情報を引き出す形にする
- appIdeaMemo に「困っていること」「今のやり方」「対象ユーザー」が含まれていれば十分と判定してよい
- 曖昧でも方向性が見える場合は sufficient: true にしてよい（候補提示で絞れるため）
- JSON以外のテキストを出力しない
"""

CANDIDATES_PROMPT = """あなたはアプリ開発の相談を受けるアシスタントです。

ユーザーの入力から、作れそうなアプリの候補を3つ提案してください。
3候補は差を出してください:
- 候補1: 最小限で作れる案（初心者でも3〜5日で完成）
- 候補2: 実用性がある案（1〜2週間、実際に使える）
- 候補3: 拡張性がある案（2〜4週間、将来機能追加しやすい）
- 候補4: 中規模のアプリ(1～3ヵ月)
- 候補5: 大規模個人開発(3か月以上、500時間程度)

重要ルール:
- appPurposeType が learning_app_for_self → 他人向けの教材サービスを提案しない。本人が作って学ぶ練習アプリにする
- business_tool → 現場の今の運用を小さく置き換えるMVPを優先する
- public_web_app → 最初は小さなMVPに絞る
- existing_app_improvement → 改修対象の画面・機能・不満点を候補に反映する
- idea_planning → すぐ実装せず候補比較を重視する
- skillLevel / experienceLanguages / experienceFrameworks / availableTime で難易度を調整する
- skillLevel 1〜2 なら CRUD中心の小さいアプリ
- skillLevel 4〜5 なら少し高度な機能を含めてよい

MVP最小化の厳格ルール:
- MVPは「管理者1人が手動で利用して最小の価値を得られる範囲」にする
- 認証・ログイン機能は、ユーザーから明示されない限り候補に含めない
- 外部API連携（SNS API、Udemy API、決済APIなど）は、ユーザーから明示されない限り含めない
- 自動投稿・自動化・スケジューラは、ユーザーから明示されない限り含めない
- 分析ダッシュボード・集計機能は最初の候補には含めない
- firstWin は外部連携なしで動くものにする
- 候補1（最小案）は特に小さく、CRUD + 1画面で完結するレベルにする

出力は必ず以下のJSON形式にしてください:
{
  "candidates": [
    {
      "id": "candidate_1",
      "name": "アプリ名",
      "summary": "一言説明（1〜2文）",
      "targetUser": "対象ユーザー",
      "solves": "何を解決するか（1文）",
      "difficulty": "低/中/高",
      "estimatedDays": "3〜5日",
      "firstWin": "最初に動くもの（1文）"
    }
  ]
}

ルール:
- 必ず3候補出す
- id は candidate_1, candidate_2, candidate_3
- name は具体的にする
- firstWin は「最初に動かして嬉しい瞬間」を書く
- JSON以外のテキストを出力しない
"""

GENERATE_MAP_PROMPT = """あなたはソフトウェア開発の全体設計を整理するアシスタントです。

ユーザーが選んだアプリ候補をもとに、具体的なアプリ地図を生成してください。
対象読者は実務1年程度のSEです。

出力は必ず以下のJSON形式にしてください:
{
  "appName": "アプリ名",
  "concept": "一言説明（1〜2文）",
  "targetUser": "対象ユーザー",
  "problem": "解決する課題（1〜3文）",
  "setup": ["セットアップ手順1", "セットアップ手順2"],
  "mvp": ["MVP項目1", "MVP項目2", "MVP項目3"],
  "nonMvp": ["非MVP項目1", "非MVP項目2"],
  "features": [{"name": "機能名", "description": "説明（1文）"}],
  "screens": ["画面名1", "画面名2"],
  "apis": ["POST /api/xxx/", "GET /api/yyy/"],
  "dataModels": ["Model名1", "Model名2"],
  "nextPiece": "最初にIssue化できる具体的な作業ピース"
}

setup フィールドのルール:
- プロジェクト立ち上げに必要なセットアップ手順を3〜8個列挙する
- 例（Django系）: 作業フォルダ作成, venv作成, Django/DRFインストール, startproject, startapp, settings.py登録, urls.py接続, runserver確認
- 例（React系）: npm create vite, 依存インストール, dev server起動確認
- 例（Laravel系）: composer create-project, .env設定, migrate, serve確認
- setupが完了していないプロジェクトでは、nextPieceはMVP実装ではなくsetupの最初の手順にする

nextPiece の厳格ルール:
- 「次に作るべき領域」ではなく「最初にIssue化できる具体的な作業ピース」にする
- 1〜3時間で着手できる粒度にする
- 「確認する」「整理する」「学ぶ」だけで終わらせない
- 可能なら画面名・コンポーネント名・ファイル候補を含める

nextPiece の優先順位（上から順に検討する）:
0. プロジェクト立ち上げ: プロジェクト/アプリがまだ作成されていなければ、セットアップが最優先
1. 画面プロトタイプ: Reactなどで主要画面をモックデータで表示する
2. モックデータ表示: 中心データをハードコードで画面に出す
3. 選択UI: ユーザーが選択・操作できるインタラクション
4. localStorage保存: 状態を保持して次回復元できる仕組み
5. Issue作成へのprefill: 生成結果を次の画面に渡す導線
6. DB / API / Model作成: 上記が揃った後に初めて着手する

プロジェクト立ち上げの判定:
- implementationStatus フィールドを最優先で確認する
- implementationStatus = nothing → nextPieceはプロジェクト作成・環境起動確認にする。Model/View/一覧画面/APIをnextPieceにしない
- implementationStatus = folder_created → venv作成、フレームワークインストール、プロジェクト作成を案内
- implementationStatus = django_project_created → startapp、settings.py登録、urls.py接続を案内
- implementationStatus = django_app_created → Model作成を案内してよい
- implementationStatus = model_created → Form作成、一覧view作成を案内してよい
- implementationStatus = list_screen_created → 作成画面 or 編集画面を案内してよい
- implementationStatus = crud_done → テスト、改善、デプロイ準備を案内してよい
- implementationStatus が未指定または nothing の場合、ユーザーが「既にセットアップ済み」「プロジェクト作成済み」と明示していない限り、プロジェクト未作成と仮定する
- Django系: startproject / startapp / runserver確認がまだなら、nextPieceはセットアップにする
- React系: create vite / npm install / dev server起動がまだなら、nextPieceはセットアップにする
- Laravel系: composer create-project / serve確認がまだなら、nextPieceはセットアップにする

重要:
- 現在は Phase 0.5（検証段階）として扱う
- DB保存、Model作成、migration、API作成は、ユーザーが明示していない限り nextPiece にしない
- まずは画面体験・モックデータ・localStorageで検証できる作業を優先する
- CRUDアプリ化に寄せすぎない
- App Creator系の場合: 候補カード表示、候補選択UI、AppMapプレビュー、Issue prefillを優先する
- 予約管理系の場合: 予約一覧画面のモック表示、ステータス切り替えUIを優先する
- 学習系の場合: 学習記録カード表示、追加フォーム表示を優先する

悪い nextPiece（プロジェクト未作成の段階で）:
- Laravelで AppCandidate モデルを作成する
- Djangoで Candidate モデルとmigrationを作成する
- DjangoでRentRollEntry一覧画面を作成し、モックデータを3件表示する
- GET /api/candidates を作成する
- CRUD機能の実装を始める
- 認証機能を実装する
- Userモデルを作成する

良い nextPiece（プロジェクト未作成の場合）:
- Django で simple_rent_roll プロジェクトを作成し、runserver で初期画面を表示する
- simple_rent_roll app を startapp で作成し、settings.py の INSTALLED_APPS に登録する
- npm create vite@latest で React プロジェクトを作成し、dev server で初期画面を表示する
- composer create-project で Laravel プロジェクトを作成し、php artisan serve で起動確認する

良い nextPiece（プロジェクト作成済みの場合）:
- Reactで候補カードを3件表示し、1つ選択できるUIを作る
- Reactで予約一覧画面の空テーブルを作成し、モックデータを3件表示する
- Vue/Reactで学習記録カードを3件モック表示し、追加フォームのUIを作る

生成ルール:
- ユーザーのスキルレベル・経験に合った技術選定にする
- mvp は3〜5個。「管理者1人が手動で使える最小価値」に絞る
- 以下は、ユーザーから明示されない限り mvp に入れず nonMvp に回す:
  - 認証・ログイン機能
  - 外部API連携（SNS API、Udemy API、決済API等）
  - 自動投稿・自動化・スケジューラ
  - 分析ダッシュボード・集計
  - 複数ユーザー対応
- nonMvp に上記を明記し、将来拡張として位置づける
- features は3〜8個
- screens は3〜10個
- apis は3〜10個（RESTful想定）
- dataModels は2〜8個。Userモデルは認証がMVPに含まれる場合のみ入れる
- dataModels の命名ルール:
  - 末尾に安易に「Model」を付けない（悪い例: CandidateModel, AppMapModel, MVPModel）
  - ドメイン固有の自然な名前にする（良い例: AppIdea, AppCandidate, AppMap, MapPiece, IssueDraft）
  - MVP項目やfeaturesは独立Modelにせず MapPiece のような集約で扱う
  - 「MVP」「Candidate」「Feature」をそのままModel名にしない
  - Issue確定前の下書きは IssueDraft、確定後は Issue
  - アプリのドメイン概念に合った英語名を付ける（例: 予約アプリなら Reservation, 学習アプリなら LearningItem）
- 個人開発者が作れる範囲に収める
- JSON以外のテキストを出力しない
"""


def _call_openai(system_prompt: str, user_message: str) -> dict:
    """OpenAI API呼び出し共通関数"""
    api_key = settings.OPENAI_API_KEY
    if not api_key or api_key == "your-api-key-here":
        raise ValueError("OPENAI_API_KEY が設定されていません。.env を確認してください。")

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
        raise ValueError(f"JSON解析失敗: {e}")


def _build_context(
    app_name: str, app_idea_memo: str, target_user: str = "",
    current_problem: str = "", current_workflow: str = "",
    constraints: str = "", app_purpose_type: str = "",
    skill_level: Optional[int] = None,
    experience_languages: Optional[list] = None,
    experience_frameworks: Optional[list] = None,
    available_time: str = "",
    implementation_status: str = "",
    additional_answers: Optional[dict] = None,
) -> str:
    parts = []
    if app_name:
        parts.append(f"アプリ名: {app_name}")
    if app_purpose_type:
        parts.append(f"相談の種類: {app_purpose_type}")
    if skill_level is not None:
        parts.append(f"開発レベル: {skill_level}/5")
    if experience_languages:
        parts.append(f"経験言語: {', '.join(experience_languages)}")
    if experience_frameworks:
        parts.append(f"経験FW: {', '.join(experience_frameworks)}")
    if available_time:
        parts.append(f"使える時間: {available_time}")
    if implementation_status:
        parts.append(f"現在の実装状態: {implementation_status}")
    if app_idea_memo:
        parts.append(f"\n作りたいもの・困っていること:\n{app_idea_memo}")
    if target_user:
        parts.append(f"\n誰のために: {target_user}")
    if current_problem:
        parts.append(f"何が面倒: {current_problem}")
    if current_workflow:
        parts.append(f"今のやり方: {current_workflow}")
    if constraints:
        parts.append(f"制約: {constraints}")
    if additional_answers:
        parts.append("\n追加回答:")
        for q, a in additional_answers.items():
            parts.append(f"  Q: {q}\n  A: {a}")
    return "\n".join(parts)


def check_or_candidates(
    app_name: str, app_idea_memo: str, target_user: str = "",
    current_problem: str = "", current_workflow: str = "",
    constraints: str = "", app_purpose_type: str = "",
    skill_level: Optional[int] = None,
    experience_languages: Optional[list] = None,
    experience_frameworks: Optional[list] = None,
    available_time: str = "",
    implementation_status: str = "",
    additional_answers: Optional[dict] = None,
) -> dict:
    """Phase 1: 入力評価 → need_more_info or candidates"""
    context = _build_context(
        app_name=app_name, app_idea_memo=app_idea_memo,
        target_user=target_user, current_problem=current_problem,
        current_workflow=current_workflow, constraints=constraints,
        app_purpose_type=app_purpose_type, skill_level=skill_level,
        experience_languages=experience_languages,
        experience_frameworks=experience_frameworks,
        available_time=available_time,
        implementation_status=implementation_status,
        additional_answers=additional_answers,
    )

    logger.info("AppMap Phase1: 入力評価 appName=%s", app_name)
    eval_result = _call_openai(EVALUATE_PROMPT, f"以下のユーザー入力を評価してください。\n\n{context}")

    if not eval_result.get("sufficient", False):
        return {
            "status": "need_more_info",
            "questions": eval_result.get("questions", ["もう少し詳しく教えてください"]),
            "reason": eval_result.get("reason", "情報が不足しています"),
        }

    logger.info("AppMap Phase1→2: 候補生成")
    cand_result = _call_openai(CANDIDATES_PROMPT, f"以下のユーザー入力からアプリ候補を3つ提案してください。\n\n{context}")
    candidates = cand_result.get("candidates", [])

    return {"status": "candidates", "candidates": candidates}


def generate_app_map_from_candidate(
    selected_candidate: str,
    app_name: str, app_idea_memo: str, target_user: str = "",
    current_problem: str = "", current_workflow: str = "",
    constraints: str = "", app_purpose_type: str = "",
    skill_level: Optional[int] = None,
    experience_languages: Optional[list] = None,
    experience_frameworks: Optional[list] = None,
    available_time: str = "",
    implementation_status: str = "",
    additional_answers: Optional[dict] = None,
) -> dict:
    """Phase 2: 選択された候補からAppMapを生成"""
    context = _build_context(
        app_name=app_name, app_idea_memo=app_idea_memo,
        target_user=target_user, current_problem=current_problem,
        current_workflow=current_workflow, constraints=constraints,
        app_purpose_type=app_purpose_type, skill_level=skill_level,
        experience_languages=experience_languages,
        experience_frameworks=experience_frameworks,
        available_time=available_time,
        implementation_status=implementation_status,
        additional_answers=additional_answers,
    )

    logger.info("AppMap Phase2: 地図生成 candidate=%s", selected_candidate)
    user_msg = (
        f"ユーザーが以下の候補を選びました: {selected_candidate}\n\n"
        f"ユーザー情報:\n{context}\n\n"
        f"この候補のアプリ地図を生成してください。"
    )
    result = _call_openai(GENERATE_MAP_PROMPT, user_msg)
    return {"status": "app_map", **result}
