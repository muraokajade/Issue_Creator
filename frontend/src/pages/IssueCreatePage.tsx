import { useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { getProjectById } from "../mockData";
import { generateIssue } from "../api";
import type { IssueResult } from "../api";
import type { IssueType, IssuePriority } from "../types";
import { ISSUE_TYPE_LABELS, PRIORITY_LABELS } from "../types";

interface Prefill {
  title?: string;
  rawMemo?: string;
  intent?: string;
  currentState?: string;
  target?: string;
  constraints?: string;
  doneState?: string;
}

export default function IssueCreatePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const project = getProjectById(Number(projectId));
  const prefill = (location.state as { prefill?: Prefill } | null)?.prefill;

  const [title, setTitle] = useState(prefill?.title ?? "");
  const [rawMemo, setRawMemo] = useState(prefill?.rawMemo ?? "");
  const [issueType, setIssueType] = useState<IssueType>("feature");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [intent, setIntent] = useState(prefill?.intent ?? "");
  const [currentState, setCurrentState] = useState(prefill?.currentState ?? "");
  const [target, setTarget] = useState(prefill?.target ?? "");
  const [constraints, setConstraints] = useState(prefill?.constraints ?? "");
  const [doneState, setDoneState] = useState(prefill?.doneState ?? "");

  // Rally state
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showQuestions, setShowQuestions] = useState(false);

  const [aiResult, setAiResult] = useState<IssueResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="p-8 text-center text-gray-500">
        Project が見つかりません
      </div>
    );
  }

  const canGenerate = rawMemo.trim().length > 0 || intent.trim().length > 0;

  const handleGenerate = async (clarifications?: Record<string, string>) => {
    if (!canGenerate && !clarifications) return;
    setIsGenerating(true);
    setError(null);
    setAiResult(null);

    try {
      const res = await generateIssue({
        title: title.trim() || "無題のIssue",
        rawMemo: rawMemo.trim(),
        issueType,
        priority,
        intent: intent.trim() || undefined,
        currentState: currentState.trim() || undefined,
        target: target.trim() || undefined,
        constraints: constraints.trim() || undefined,
        doneState: doneState.trim() || undefined,
        clarifications,
      });

      if (res.phase === "questions" && res.questions) {
        setQuestions(res.questions);
        setAnswers({});
        setShowQuestions(true);
      } else if (res.phase === "result" && res.result) {
        setAiResult(res.result);
        setShowQuestions(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSubmit = () => {
    handleGenerate(answers);
  };

  const handleAdopt = () => {
    alert("Issueを保存しました（Mock — 保存APIは今後実装予定）");
    navigate(`/projects/${projectId}`);
  };

  const handleDiscard = () => {
    setAiResult(null);
    setShowQuestions(false);
    setQuestions([]);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-5">
      <div className="mb-4">
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <span>←</span>
          <span>{project.name} の開発ボードに戻る</span>
        </Link>
      </div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">AIで次Issueを作る</h1>
        <p className="text-sm text-gray-500 mt-1">
          今のメモとProjectの現在地をもとに、AIが次にやる1作業へ整理します。
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          AIは初期AppMap・最新Checkpoint・Done
          Issue・Issue結果メモ・入力メモを判断材料にします。
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">⚠ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 左: 入力 */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
              まずは雑に書く
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                タイトル
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="何をする？（例: expense-initial APIを作る）"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                雑メモ{" "}
                <span className="font-normal text-gray-400">
                  — 思いついたことをそのまま
                </span>
              </label>
              <textarea
                value={rawMemo}
                onChange={(e) => setRawMemo(e.target.value)}
                rows={4}
                placeholder={
                  "views.py にAPI追加、urls.pyにルーティング、404も確認、テスト通したい"
                }
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 resize-y leading-relaxed"
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  種別
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as IssueType)}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:border-blue-400 focus:outline-none"
                >
                  {Object.entries(ISSUE_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  優先度
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:border-blue-400 focus:outline-none"
                >
                  {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                具体化する（任意）
              </p>
              <span className="text-[10px] text-gray-400">
                答えるとAI精度が上がります
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                何をしたい？
              </label>
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="nextActionを今すぐ実行できる1アクションにしたい"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                今どこまで？
              </label>
              <input
                type="text"
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
                placeholder="OpenAI APIでIssue案生成はできている"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                対象ファイル・画面・API
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="backend/issues/services/ai_issue_service.py"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                やらないこと・制約
              </label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="frontendは大きく変えない"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                完了した状態
              </label>
              <input
                type="text"
                value={doneState}
                onChange={(e) => setDoneState(e.target.value)}
                placeholder="nextActionに具体ファイルパスが含まれる"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating || !canGenerate}
            className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${isGenerating || !canGenerate ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-sm"}`}
          >
            {isGenerating ? "AIが考え中..." : "✦ Issue案を生成する"}
          </button>
        </div>

        {/* 右: AI質問 or 結果 */}
        <div className="space-y-4">
          {/* Initial state */}
          {!aiResult && !showQuestions && !isGenerating && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-3">
                <span className="text-lg">✦</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">AIが入力を評価します</p>
              <p className="text-xs text-gray-400">
                曖昧なら追加質問、十分なら具体的なIssueを生成します
              </p>
            </div>
          )}

          {/* Loading */}
          {isGenerating && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-3 animate-pulse">
                <span className="text-lg">✦</span>
              </div>
              <p className="text-sm text-purple-700 font-medium">
                AIが考え中...
              </p>
            </div>
          )}

          {/* AI Questions */}
          {showQuestions && !isGenerating && (
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50/30 p-5 shadow-sm">
              {/* Guide */}
              <div className="rounded-md bg-amber-50 border border-amber-100 p-3 mb-4">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  AIが追加確認しています
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  まだIssueとして具体化するには情報が少し足りません。分からない項目は「未定」でOKです。完璧な仕様を書く必要はありません。今決めたいのは、最初に作る1画面・1ファイル・1アクションです。
                </p>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  AI
                </span>
                <span className="text-sm font-semibold text-amber-800">
                  もう少し具体的に教えてください
                </span>
              </div>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={i}>
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      {q}
                    </p>
                    <input
                      type="text"
                      value={answers[q] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                      }
                      placeholder="分からなければ「未定」でOK。思いつく範囲で短く書いてください。"
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                ))}
              </div>
              {/* 回答例 */}
              <details className="mt-3">
                <summary className="text-[11px] text-gray-500 cursor-pointer hover:text-gray-700">
                  回答例を見る
                </summary>
                <div className="mt-2 rounded-md bg-white border border-gray-100 p-2.5 text-[11px] text-gray-500 leading-relaxed space-y-1">
                  <p>
                    • デザインやレイアウト:
                    左に入力フォーム、右にAI結果を表示する2カラム
                  </p>
                  <p>• フォーム項目: appName, appIdeaMemo, targetUser 等</p>
                  <p>• 対象ファイル: frontend/src/pages/AppMapPage.tsx</p>
                  <p>• 未定の場合: 「未定」「おまかせ」でOK</p>
                </div>
              </details>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleAnswerSubmit}
                  disabled={isGenerating}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  回答してIssue生成
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* AI Result */}
          {aiResult && (
            <div className="rounded-lg border-2 border-purple-200 bg-purple-50/30 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  AI
                </span>
                <span className="text-sm font-semibold text-purple-800">
                  生成結果プレビュー
                </span>
              </div>
              <div className="space-y-3">
                {aiResult.title && aiResult.title !== title && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                      タイトル（AI提案）
                    </h4>
                    <p className="text-sm font-medium text-gray-800">
                      {aiResult.title}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    背景
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiResult.background}
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    目的
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiResult.goal}
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    完了条件
                  </h4>
                  <ul className="space-y-0.5">
                    {aiResult.acceptanceCriteria.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-gray-400 shrink-0">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    次の一手
                  </h4>
                  <p className="text-sm font-medium text-emerald-700">
                    → {aiResult.nextAction}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-200 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAdopt}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  採用してIssueを作成
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  破棄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
