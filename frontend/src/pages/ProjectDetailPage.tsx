import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchProjects,
  fetchCheckpoints,
  fetchIssueDrafts,
  createCheckpoint,
  completeIssueDraft,
} from "../api";
import type { ProjectRecord, CheckpointRecord, IssueDraftRecord } from "../api";
import CheckpointCard from "../components/project/CheckpointCard";
import ValidationLogPanel from "../components/project/ValidationLogPanel";

const VAL_LOG_KEY = "app_creator_validation_logs";
interface ValidationLog {
  id: string;
  createdAt: string;
  phase: string;
  validationName: string;
  result: "OK" | "\u5FAE\u5999" | "NG" | "";
  appName: string;
  appMapTitle: string;
  nextPiece: string;
  issueTitle: string;
  good: string;
  bad: string;
  nextFix: string;
  nextCheck: string;
}
function loadValLogs(): ValidationLog[] {
  try {
    const s = localStorage.getItem(VAL_LOG_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}
function saveValLogs(logs: ValidationLog[]) {
  try {
    localStorage.setItem(VAL_LOG_KEY, JSON.stringify(logs));
  } catch {
    /* */
  }
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const pid = Number(projectId) || 0;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [checkpoints, setCheckpoints] = useState<CheckpointRecord[]>([]);
  const [drafts, setDrafts] = useState<IssueDraftRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Checkpoint editing
  const [cpGoal, setCpGoal] = useState("");
  const [cpPhase, setCpPhase] = useState("");
  const [cpState, setCpState] = useState("");
  const [cpLearned, setCpLearned] = useState("");
  const [cpNextAction, setCpNextAction] = useState("");

  // Validation logs
  const [validationLogs, setValidationLogs] =
    useState<ValidationLog[]>(loadValLogs());
  const [valName, setValName] = useState("");
  const [valResult, setValResult] = useState<"OK" | "\u5FAE\u5999" | "NG" | "">(
    "",
  );
  const [valGood, setValGood] = useState("");
  const [valBad, setValBad] = useState("");
  const [valNextFix, setValNextFix] = useState("");
  const [valNextCheck, setValNextCheck] = useState("");

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
      fetchCheckpoints(pid).then((cps) => {
        setCheckpoints(cps);
        if (cps.length > 0) {
          setCpGoal(cps[0].current_goal);
          setCpPhase(cps[0].phase);
          setCpState(cps[0].current_state);
          setCpLearned(cps[0].learned);
          setCpNextAction(cps[0].next_action);
        }
      }),
      fetchIssueDrafts(pid).then(setDrafts),
    ]).finally(() => setLoading(false));
  }, [pid]);

  const activeDrafts = drafts.filter((d) => d.status !== "done");
  const doneDrafts = drafts.filter((d) => d.status === "done");
  const currentIssue = activeDrafts[0] || null;

  const handleSaveCheckpoint = async () => {
    try {
      const record = await createCheckpoint(pid, {
        phase: cpPhase || "dev",
        current_goal: cpGoal,
        current_state: cpState,
        learned: cpLearned,
        next_action: cpNextAction,
      });
      setCheckpoints((prev) => [record, ...prev]);
      alert("Checkpoint saved");
    } catch (e) {
      alert(`Save failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  const handleSaveValidationLog = () => {
    const log: ValidationLog = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      phase: cpPhase,
      validationName: valName,
      result: valResult,
      appName: project?.name || "",
      appMapTitle: "",
      nextPiece: "",
      issueTitle: currentIssue?.title || "",
      good: valGood,
      bad: valBad,
      nextFix: valNextFix,
      nextCheck: valNextCheck,
    };
    const updated = [log, ...validationLogs];
    setValidationLogs(updated);
    saveValLogs(updated);
    setValResult("");
    setValGood("");
    setValBad("");
    setValNextFix("");
  };

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
      alert(`Failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  if (loading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!project)
    return (
      <div className="p-8 text-center text-gray-500">Project not found</div>
    );

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      {/* Project Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {project.description || ""}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            開発ボードは、Projectの現在地を見る場所です。AppMapは初期地図、Issueは次にやる作業、Checkpointは実際に進んだ後の現在地です。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${pid}/app-map`}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            title="初期地図を見る・作る"
          >
            初期地図 (AppMap)
          </Link>
          <Link
            to={`/projects/${pid}/issues/new`}
            className="rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:from-purple-600 hover:to-indigo-700 shadow-sm"
            title="AIで次Issueを作る"
          >
            次Issueを作る
          </Link>
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-3 gap-3 mb-5">
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
          <p className="text-[11px] text-gray-500">Active Issue</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-green-600">
            {doneDrafts.length}
          </p>
          <p className="text-[11px] text-gray-500">Done</p>
        </div>
      </div>

      {/* Checkpoint Card */}
      <CheckpointCard
        cpGoal={cpGoal}
        cpPhase={cpPhase}
        cpState={cpState}
        cpLearned={cpLearned}
        cpNextAction={cpNextAction}
        setCpGoal={setCpGoal}
        setCpPhase={setCpPhase}
        setCpState={setCpState}
        setCpLearned={setCpLearned}
        setCpNextAction={setCpNextAction}
        onSaveCheckpoint={handleSaveCheckpoint}
        onSaveIssueDraft={() => {}}
        canSaveIssueDraft={false}
        checkpointCount={checkpoints.length}
        issueDraftCount={drafts.length}
      />

      {/* 今やるIssue */}
      {currentIssue && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50/30 p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
            今やるIssue
          </p>
          <p className="text-[10px] text-gray-400 mb-2">
            次に実装する1つの作業です。完了したらIssue結果メモを残します。
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {currentIssue.title}
          </p>
          {currentIssue.next_step && (
            <p className="text-xs text-emerald-700 mt-1">
              Next: {currentIssue.next_step}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                setCompletingId(
                  completingId === currentIssue.id ? null : currentIssue.id,
                )
              }
              className="rounded-md border border-blue-300 bg-white px-3 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50"
            >
              {completingId === currentIssue.id ? "Cancel" : "Complete"}
            </button>
          </div>
          {completingId === currentIssue.id && (
            <div className="mt-3 space-y-2 border-t border-emerald-200 pt-3">
              <textarea
                value={completeForm.completedSummary}
                onChange={(e) =>
                  setCompleteForm((f) => ({
                    ...f,
                    completedSummary: e.target.value,
                  }))
                }
                rows={2}
                placeholder="What was done"
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:border-blue-400 focus:outline-none resize-y"
              />
              <textarea
                value={completeForm.learned}
                onChange={(e) =>
                  setCompleteForm((f) => ({ ...f, learned: e.target.value }))
                }
                rows={2}
                placeholder="What was learned"
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:border-blue-400 focus:outline-none resize-y"
              />
              <select
                value={completeForm.nextWorkType}
                onChange={(e) =>
                  setCompleteForm((f) => ({
                    ...f,
                    nextWorkType: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
              >
                <option value="setup_continue">Setup</option>
                <option value="model">Model</option>
                <option value="form">Form</option>
                <option value="view_url">View/URL</option>
                <option value="template">Template</option>
                <option value="api">API</option>
                <option value="frontend">Frontend</option>
                <option value="test">Test</option>
                <option value="bugfix">Bugfix</option>
                <option value="deploy">Deploy</option>
                <option value="other">Other</option>
              </select>
              <textarea
                value={completeForm.nextWorkMemo}
                onChange={(e) =>
                  setCompleteForm((f) => ({
                    ...f,
                    nextWorkMemo: e.target.value,
                  }))
                }
                rows={2}
                placeholder="Next work"
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:border-blue-400 focus:outline-none resize-y"
              />
              <button
                type="button"
                onClick={handleComplete}
                disabled={!completeForm.nextWorkMemo.trim()}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${completeForm.nextWorkMemo.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400"}`}
              >
                Complete & Create Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Done Issues */}
      {doneDrafts.length > 0 && (
        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Done ({doneDrafts.length})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {doneDrafts.map((d) => (
              <div
                key={d.id}
                className="rounded-md border border-green-100 bg-green-50/30 p-2.5"
              >
                <span className="text-xs font-medium text-gray-700">
                  {d.title}
                </span>
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

      {/* Validation Log */}
      <ValidationLogPanel
        validationLogs={validationLogs}
        valName={valName}
        valResult={valResult}
        valGood={valGood}
        valBad={valBad}
        valNextFix={valNextFix}
        valNextCheck={valNextCheck}
        setValName={setValName}
        setValResult={setValResult}
        setValGood={setValGood}
        setValBad={setValBad}
        setValNextFix={setValNextFix}
        setValNextCheck={setValNextCheck}
        onSaveValidationLog={handleSaveValidationLog}
      />
    </div>
  );
}
