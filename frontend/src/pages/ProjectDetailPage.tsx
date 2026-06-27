import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchProjects,
  fetchCheckpoints,
  fetchIssueDrafts,
  completeIssueDraft,
} from "../api";
import type { ProjectRecord, CheckpointRecord, IssueDraftRecord } from "../api";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const pid = Number(projectId) || 0;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [checkpoints, setCheckpoints] = useState<CheckpointRecord[]>([]);
  const [drafts, setDrafts] = useState<IssueDraftRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Complete form
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completeForm, setCompleteForm] = useState({
    completedSummary: "",
    learned: "",
    nextWorkType: "setup_continue",
    nextWorkMemo: "",
  });

  useEffect(() => {
    if (!pid) return;
    Promise.all([
      fetchProjects().then((ps) =>
        setProject(ps.find((p) => p.id === pid) || null),
      ),
      fetchCheckpoints(pid).then(setCheckpoints),
      fetchIssueDrafts(pid).then(setDrafts),
    ]).finally(() => setLoading(false));
  }, [pid]);

  const activeDrafts = drafts.filter((d) => d.status !== "done");
  const doneDrafts = drafts.filter((d) => d.status === "done");
  const latestCheckpoint = checkpoints[0] || null;
  const currentIssue = activeDrafts[0] || null;

  const handleComplete = async () => {
    if (!completingId || !completeForm.nextWorkMemo.trim()) return;
    try {
      const res = await completeIssueDraft(pid, completingId, {
        completedSummary: completeForm.completedSummary,
        learned: completeForm.learned,
        nextWorkType: completeForm.nextWorkType,
        nextWorkMemo: completeForm.nextWorkMemo,
      });
      setDrafts((prev) => [
        res.nextDraft,
        ...prev.map((d) => (d.id === completingId ? res.completedDraft : d)),
      ]);
      setCheckpoints((prev) => [res.checkpoint, ...prev]);
      setCompletingId(null);
      setCompleteForm({
        completedSummary: "",
        learned: "",
        nextWorkType: "setup_continue",
        nextWorkMemo: "",
      });
    } catch (e) {
      alert(`完了失敗: ${e instanceof Error ? e.message : e}`);
    }
  };

  if (loading)
    return <div className="p-8 text-center text-gray-400">読み込み中...</div>;
  if (!project)
    return (
      <div className="p-8 text-center text-gray-500">
        Project が見つかりません
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      {/* Project Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {project.description || "説明はまだありません"}
        </p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-gray-800">
            {checkpoints.length}
          </p>
          <p className="text-[11px] text-gray-500">Checkpoint</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-blue-600">
            {activeDrafts.length}
          </p>
          <p className="text-[11px] text-gray-500">未完了Issue</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-green-600">
            {doneDrafts.length}
          </p>
          <p className="text-[11px] text-gray-500">完了Issue</p>
        </div>
      </div>

      {/* Current Location */}
      {latestCheckpoint && (
        <div className="mb-5 rounded-lg border border-indigo-200 bg-indigo-50/30 p-4 shadow-sm">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
            現在地
          </p>
          <div className="space-y-1.5 text-xs text-gray-700">
            <p>
              <span className="font-semibold text-gray-500">フェーズ:</span>{" "}
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700">
                {latestCheckpoint.phase}
              </span>
            </p>
            {latestCheckpoint.current_goal && (
              <p>
                <span className="font-semibold text-gray-500">目的:</span>{" "}
                {latestCheckpoint.current_goal}
              </p>
            )}
            {latestCheckpoint.current_state && (
              <p>
                <span className="font-semibold text-gray-500">状態:</span>{" "}
                {latestCheckpoint.current_state}
              </p>
            )}
            {latestCheckpoint.learned && (
              <p>
                <span className="font-semibold text-gray-500">
                  わかったこと:
                </span>{" "}
                {latestCheckpoint.learned}
              </p>
            )}
            {latestCheckpoint.next_action && (
              <p>
                <span className="font-semibold text-emerald-600">次:</span>{" "}
                {latestCheckpoint.next_action}
              </p>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            {new Date(latestCheckpoint.created_at).toLocaleString("ja-JP")}
          </p>
        </div>
      )}

      {/* Current Next Issue */}
      {currentIssue && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50/30 p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
            現在の次Issue
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {currentIssue.title}
          </p>
          {currentIssue.next_step && (
            <p className="text-xs text-emerald-700 mt-1">
              → {currentIssue.next_step}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCompletingId(
                  completingId === currentIssue.id ? null : currentIssue.id,
                )
              }
              className="rounded-md border border-blue-300 bg-white px-3 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {completingId === currentIssue.id ? "キャンセル" : "完了にする"}
            </button>
            <Link
              to={`/projects/${pid}/issues/new`}
              state={{
                prefill: {
                  title: currentIssue.title,
                  rawMemo: currentIssue.purpose || currentIssue.next_step,
                  intent: currentIssue.next_step,
                  currentState: "",
                  target: "",
                  constraints: "",
                  doneState: "",
                },
              }}
              className="rounded-md border border-purple-300 bg-white px-3 py-1 text-[11px] font-medium text-purple-700 hover:bg-purple-50 transition-colors"
            >
              Issueを具体化する
            </Link>
          </div>
          {/* Complete form */}
          {completingId === currentIssue.id && (
            <div className="mt-3 space-y-2 border-t border-emerald-200 pt-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                  完了したこと
                </label>
                <textarea
                  value={completeForm.completedSummary}
                  onChange={(e) =>
                    setCompleteForm((f) => ({
                      ...f,
                      completedSummary: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none resize-y"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                  分かったこと
                </label>
                <textarea
                  value={completeForm.learned}
                  onChange={(e) =>
                    setCompleteForm((f) => ({ ...f, learned: e.target.value }))
                  }
                  rows={2}
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none resize-y"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                  次にやる作業タイプ
                </label>
                <select
                  value={completeForm.nextWorkType}
                  onChange={(e) =>
                    setCompleteForm((f) => ({
                      ...f,
                      nextWorkType: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none"
                >
                  <option value="setup_continue">setupを続ける</option>
                  <option value="model">Modelを作る</option>
                  <option value="form">Formを作る</option>
                  <option value="view_url">View/URLを作る</option>
                  <option value="template">Template/画面を作る</option>
                  <option value="api">APIを作る</option>
                  <option value="frontend">Frontendを作る</option>
                  <option value="test">テストする</option>
                  <option value="bugfix">エラー修正</option>
                  <option value="deploy">デプロイ準備</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                  次に具体的にやりたいこと
                </label>
                <textarea
                  value={completeForm.nextWorkMemo}
                  onChange={(e) =>
                    setCompleteForm((f) => ({
                      ...f,
                      nextWorkMemo: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="具体的な作業を書く"
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-y"
                />
              </div>
              <button
                type="button"
                onClick={handleComplete}
                disabled={!completeForm.nextWorkMemo.trim()}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${completeForm.nextWorkMemo.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                完了して次Issueを作る
              </button>
            </div>
          )}
        </div>
      )}

      {/* No issues yet */}
      {!currentIssue && doneDrafts.length === 0 && (
        <div className="mb-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            まだIssueDraftがありません
          </p>
          <Link
            to={`/projects/${pid}/app-map`}
            className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm"
          >
            アプリ地図を作る
          </Link>
        </div>
      )}

      {/* Done Issues */}
      {doneDrafts.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            完了済みIssue ({doneDrafts.length})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {doneDrafts.map((d) => (
              <div
                key={d.id}
                className="rounded-md border border-green-100 bg-green-50/30 p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {d.title}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {d.completed_at
                      ? new Date(d.completed_at).toLocaleDateString("ja-JP", {
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
                {d.completed_summary && (
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {d.completed_summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
