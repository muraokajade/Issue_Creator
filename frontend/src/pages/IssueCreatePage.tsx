import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProjectById } from "../mockData";
import type { IssueType, IssuePriority } from "../types";
import { ISSUE_TYPE_LABELS, PRIORITY_LABELS } from "../types";

interface AiGeneratedResult {
  background: string;
  goal: string;
  acceptanceCriteria: string[];
  nextAction: string;
}

const MOCK_AI_RESULT: AiGeneratedResult = {
  background:
    "現在の開発フローでは、思いついたタスクを整理する仕組みがなく、作業が散らばりやすい状態にある。",
  goal: "入力された雑メモを元に、背景・目的・完了条件・次の一手を構造化し、作業可能なIssueとして保存できるようにする。",
  acceptanceCriteria: [
    "雑メモを入力してAI生成ボタンを押せる",
    "生成結果がプレビューとして表示される",
    "採用ボタンでIssueが保存される",
    "破棄ボタンで生成結果がクリアされる",
  ],
  nextAction: "雑メモの入力フォームとAI生成ボタンのUIを実装する",
};

export default function IssueCreatePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = getProjectById(Number(projectId));

  const [title, setTitle] = useState("");
  const [rawMemo, setRawMemo] = useState("");
  const [issueType, setIssueType] = useState<IssueType>("feature");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [aiResult, setAiResult] = useState<AiGeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!project) {
    return (
      <div className="p-8 text-center text-gray-500">
        Project が見つかりません
      </div>
    );
  }

  const handleGenerate = () => {
    if (!rawMemo.trim()) {
      alert("雑メモを入力してください");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setAiResult(MOCK_AI_RESULT);
      setIsGenerating(false);
    }, 1200);
  };

  const handleAdopt = () => {
    alert("Issueを保存しました（Mock）");
    navigate(`/projects/${projectId}`);
  };

  const handleDiscard = () => {
    setAiResult(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-5">
      {/* 戻るリンク */}
      <div className="mb-4">
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <span>←</span>
          <span>{project.name} のIssue一覧に戻る</span>
        </Link>
      </div>

      {/* タイトル + 説明 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">新規Issue作成</h1>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-medium text-gray-700">{project.name}</span>{" "}
          に新しいIssueを作成します。雑メモを入力してAIに構造化してもらえます。
        </p>
      </div>

      {/* 入力フロー説明 */}
      <div className="mb-5 rounded-md bg-gray-50 border border-gray-200 p-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-600">作成の流れ:</span>{" "}
          雑メモを書く → AIが構造化 → プレビュー確認 → 採用して保存
        </p>
      </div>

      {/* Input section */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
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
            雑メモ
            <span className="ml-2 font-normal text-gray-400">
              — 思いついたことをそのまま書く
            </span>
          </label>
          <textarea
            value={rawMemo}
            onChange={(e) => setRawMemo(e.target.value)}
            rows={5}
            placeholder={
              "やりたいこと、気になること、調べたいこと...\n整理しなくてOK。AIが構造化します。"
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
              {Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
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
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Generate button */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !rawMemo.trim()}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
              isGenerating || !rawMemo.trim()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-sm"
            }`}
          >
            {isGenerating ? "生成中..." : "✦ AIでIssueを構造化する"}
          </button>
          <p className="text-[11px] text-gray-400 mt-1.5">
            雑メモを元に背景・目的・完了条件・次の一手を生成します
          </p>
        </div>
      </div>

      {/* AI Result Preview */}
      {aiResult && (
        <div className="mt-6 rounded-lg border-2 border-purple-200 bg-purple-50/30 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[11px] font-bold text-white">
                AI
              </span>
              <span className="text-sm font-semibold text-purple-800">
                生成結果プレビュー
              </span>
            </div>
            <span className="text-[11px] text-purple-400">
              内容を確認してから採用してください
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                背景
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aiResult.background}
              </p>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                目的
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aiResult.goal}
              </p>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                完了条件
              </h4>
              <ul className="space-y-1">
                {aiResult.acceptanceCriteria.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                次の一手
              </h4>
              <p className="text-sm font-medium text-emerald-700">
                → {aiResult.nextAction}
              </p>
            </div>
          </div>

          {/* Adopt / Discard */}
          <div className="mt-5 pt-4 border-t border-purple-200 flex items-center gap-3">
            <button
              type="button"
              onClick={handleAdopt}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              採用して保存
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              破棄
            </button>
            <span className="text-[11px] text-gray-400 ml-auto">
              採用後にIssue詳細で編集できます
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
