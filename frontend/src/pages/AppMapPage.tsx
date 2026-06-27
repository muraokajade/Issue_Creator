import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  generateAppMap,
  createCheckpoint,
  createIssueDraft,
  fetchCheckpoints,
  fetchIssueDrafts,
  fetchProjects,
} from "../api";
import type {
  AppMapResponse,
  AppMapCandidate,
  AppMapResult,
  CheckpointRecord,
  IssueDraftRecord,
} from "../api";

const STORAGE_KEY_PREFIX = "app_creator_draft_project_";
const LANGUAGES = [
  "PHP",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "Ruby",
  "Go",
  "その他",
];
const FRAMEWORKS = [
  "Laravel",
  "Spring Boot",
  "Django",
  "React",
  "Next.js",
  "Vue",
  "Rails",
  "Express",
  "その他",
];
const SKILL_LEVELS = [
  { value: 1, label: "1: 入門中。チュートリアル中心" },
  { value: 2, label: "2: CRUDは写経ならできる" },
  { value: 3, label: "3: 既存コードを見ながら修正できる" },
  { value: 4, label: "4: 自分で小さいアプリを作ってデプロイできる" },
  { value: 5, label: "5: 実務で機能追加・テスト・レビュー対応できる" },
];
const PURPOSE_TYPES = [
  { value: "learning_app_for_self", label: "自分が学ぶための練習アプリ" },
  { value: "public_web_app", label: "他人に提供するWebアプリ" },
  { value: "business_tool", label: "業務改善アプリ" },
  { value: "existing_app_improvement", label: "既存アプリの改修" },
  { value: "idea_planning", label: "アイデア整理" },
];

interface DraftState {
  input: InputState;
  additionalAnswers: Record<string, string>;
  candidates: AppMapCandidate[];
  selectedCandidate: string;
  appMap: AppMapResult | null;
  phase: Phase;
  questions: string[];
  reason: string;
}

interface InputState {
  appName: string;
  appIdeaMemo: string;
  targetUser: string;
  currentProblem: string;
  currentWorkflow: string;
  constraints: string;
  appPurposeType: string;
  skillLevel: number;
  experienceLanguages: string[];
  experienceFrameworks: string[];
  availableTime: string;
}

type Phase = "input" | "need_more_info" | "candidates" | "app_map";

function loadDraft(projectId: string): DraftState | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY_PREFIX + projectId);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

const PRESETS: { label: string; input: InputState }[] = [
  {
    label: "App Creator検証",
    input: {
      appName: "App Creator",
      appIdeaMemo:
        "AIやKiroと開発していると、作業は進むが現在地が分からなくなる。雑な相談から候補を出し、小さいMVPに削り、最初のIssueまで整理したい。コード自動生成ではなく、Kiroに投げる前の整理役にしたい。",
      targetUser:
        "AIエディタで個人開発しているが、作業が散りやすいエンジニア。",
      currentProblem:
        "AIがそれっぽい設計やIssueを出すが、認証・API連携・自動化・分析などが盛られて重くなる。最初に何を作ればいいか分からなくなる。",
      currentWorkflow:
        "ChatGPTで相談し、Kiroに実装指示を投げている。ただし会話が長くなると、判断理由や現在地が流れてしまう。",
      constraints:
        "自動実装、認証、GitHub連携、DB保存はまだやらない。まず候補、AppMap、Issue化の流れを検証したい。MVPは管理者1人が手動で使える範囲に絞る。",
      appPurposeType: "idea_planning",
      skillLevel: 3,
      experienceLanguages: [
        "PHP",
        "Java",
        "JavaScript",
        "TypeScript",
        "Python",
      ],
      experienceFrameworks: ["Laravel", "Spring Boot", "React", "Django"],
      availableTime: "まず3日〜1週間で、使えるかどうかを検証したい",
    },
  },
  {
    label: "予約管理Mini",
    input: {
      appName: "予約メモMini",
      appIdeaMemo:
        "友達が教室の予約管理をLINEと紙メモでやっていて混乱している。まず予約一覧とステータス管理だけ作りたい。",
      targetUser: "個人で教室を運営している友達",
      currentProblem:
        "予約変更やキャンセルがLINE、紙メモ、Googleカレンダーに散って分からなくなる",
      currentWorkflow:
        "LINEで予約を受けて、Googleカレンダーと紙メモに手で転記している",
      constraints:
        "決済、LINE連携、認証はまだやらない。まず管理者1人用でよい。",
      appPurposeType: "business_tool",
      skillLevel: 2,
      experienceLanguages: ["PHP", "JavaScript"],
      experienceFrameworks: ["Laravel"],
      availableTime: "1日2時間、2週間",
    },
  },
  {
    label: "Django学習Mini",
    input: {
      appName: "StudyLog",
      appIdeaMemo:
        "Djangoの基本を学ぶために、学習記録を付けるアプリを作りたい。CRUD操作の練習になるものがよい。",
      targetUser: "自分（Django初学者）",
      currentProblem:
        "チュートリアルをやったが、自分でゼロから作ったことがない。何を作ればいいか分からない。",
      currentWorkflow:
        "Djangoチュートリアルを写経した。次に何をすればいいか迷っている。",
      constraints:
        "認証、デプロイ、外部APIはまだやらない。ローカルで動けばよい。",
      appPurposeType: "learning_app_for_self",
      skillLevel: 2,
      experienceLanguages: ["Python", "JavaScript"],
      experienceFrameworks: ["Django"],
      availableTime: "1日3時間、1週間",
    },
  },
];

function saveDraft(projectId: string, d: DraftState) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + projectId, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}
function clearDraft(projectId: string) {
  localStorage.removeItem(STORAGE_KEY_PREFIX + projectId);
}

// === Validation Log ===
const VALIDATION_LOG_KEY = "app_creator_validation_logs";

interface ValidationLog {
  id: string;
  createdAt: string;
  phase: string;
  validationName: string;
  result: "OK" | "微妙" | "NG" | "";
  appName: string;
  appMapTitle: string;
  nextPiece: string;
  issueTitle: string;
  good: string;
  bad: string;
  nextFix: string;
  nextCheck: string;
}

function loadValidationLogs(): ValidationLog[] {
  try {
    const s = localStorage.getItem(VALIDATION_LOG_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveValidationLogs(logs: ValidationLog[]) {
  try {
    localStorage.setItem(VALIDATION_LOG_KEY, JSON.stringify(logs));
  } catch {
    /* ignore */
  }
}

export default function AppMapPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const pid = projectId || "0";
  const draft = loadDraft(pid);

  // Fetch current project name from DB
  const [currentProjectName, setCurrentProjectName] = useState("");
  useEffect(() => {
    fetchProjects()
      .then((projects) => {
        const p = projects.find((pr) => pr.id === Number(pid));
        if (p) setCurrentProjectName(p.name);
      })
      .catch(() => {});
  }, [pid]);

  const defaultInput: InputState = {
    appName: currentProjectName || "",
    appIdeaMemo: "",
    targetUser: "",
    currentProblem: "",
    currentWorkflow: "",
    constraints: "",
    appPurposeType: "learning_app_for_self",
    skillLevel: 2,
    experienceLanguages: [],
    experienceFrameworks: [],
    availableTime: "",
  };

  const [input, setInput] = useState<InputState>(draft?.input ?? defaultInput);

  // When project name loads and no draft exists, set appName
  useEffect(() => {
    if (currentProjectName && !draft) {
      setInput((prev) =>
        prev.appName ? prev : { ...prev, appName: currentProjectName },
      );
    }
  }, [currentProjectName, draft]);

  const [phase, setPhase] = useState<Phase>(draft?.phase ?? "input");
  const [questions, setQuestions] = useState<string[]>(draft?.questions ?? []);
  const [reason, setReason] = useState(draft?.reason ?? "");
  const [additionalAnswers, setAdditionalAnswers] = useState<
    Record<string, string>
  >(draft?.additionalAnswers ?? {});
  const [candidates, setCandidates] = useState<AppMapCandidate[]>(
    draft?.candidates ?? [],
  );
  const [selectedCandidate, setSelectedCandidate] = useState(
    draft?.selectedCandidate ?? "",
  );
  const [appMap, setAppMap] = useState<AppMapResult | null>(
    draft?.appMap ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation log state
  const [validationLogs, setValidationLogs] =
    useState<ValidationLog[]>(loadValidationLogs());
  // Checkpoint editing state (current location)
  const [cpGoal, setCpGoal] = useState("");
  const [cpPhase, setCpPhase] = useState("");
  const [cpState, setCpState] = useState("");
  const [cpLearned, setCpLearned] = useState("");
  const [cpNextAction, setCpNextAction] = useState("");

  const [valName, setValName] = useState("");
  const [valResult, setValResult] = useState<"OK" | "微妙" | "NG" | "">("");
  const [valGood, setValGood] = useState("");
  const [valBad, setValBad] = useState("");
  const [valNextFix, setValNextFix] = useState("");
  const [valNextCheck, setValNextCheck] = useState(
    "Issue化結果がKiroに投げられる粒度か確認する",
  );

  // DB records
  const [savedCheckpoints, setSavedCheckpoints] = useState<CheckpointRecord[]>(
    [],
  );
  const [savedDrafts, setSavedDrafts] = useState<IssueDraftRecord[]>([]);

  // Load DB records on mount using URL projectId
  const dbProjectId = Number(projectId) || 0;
  useEffect(() => {
    if (!dbProjectId) return;
    fetchCheckpoints(dbProjectId)
      .then((cps) => {
        setSavedCheckpoints(cps);
        // Populate editing fields with latest checkpoint
        if (cps.length > 0) {
          const latest = cps[0];
          setCpGoal(latest.current_goal);
          setCpPhase(latest.phase);
          setCpState(latest.current_state);
          setCpLearned(latest.learned);
          setCpNextAction(latest.next_action);
        } else {
          // Default for new project
          setCpGoal(`このProjectの現在地と次にやる作業を整理する`);
          setCpPhase("検証中");
          setCpState("");
          setCpLearned("");
          setCpNextAction("");
        }
      })
      .catch((e) =>
        console.warn(`Checkpoint取得失敗 (project ${dbProjectId}):`, e.message),
      );
    fetchIssueDrafts(dbProjectId)
      .then(setSavedDrafts)
      .catch((e) =>
        console.warn(`IssueDraft取得失敗 (project ${dbProjectId}):`, e.message),
      );
  }, [dbProjectId]);

  // Persist to localStorage on state change
  useEffect(() => {
    saveDraft(pid, {
      input,
      additionalAnswers,
      candidates,
      selectedCandidate,
      appMap,
      phase,
      questions,
      reason,
    });
  }, [
    pid,
    input,
    additionalAnswers,
    candidates,
    selectedCandidate,
    appMap,
    phase,
    questions,
    reason,
  ]);

  const setField = <K extends keyof InputState>(
    key: K,
    value: InputState[K],
  ) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const toggleList = (
    key: "experienceLanguages" | "experienceFrameworks",
    item: string,
  ) => {
    setInput((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((x) => x !== item)
        : [...prev[key], item],
    }));
  };

  const canSubmit = input.appIdeaMemo.trim().length > 0;

  const buildBaseRequest = () => ({
    appName: input.appName.trim(),
    appIdeaMemo: input.appIdeaMemo.trim(),
    targetUser: input.targetUser.trim() || undefined,
    currentProblem: input.currentProblem.trim() || undefined,
    currentWorkflow: input.currentWorkflow.trim() || undefined,
    constraints: input.constraints.trim() || undefined,
    appPurposeType: input.appPurposeType,
    skillLevel: input.skillLevel,
    experienceLanguages:
      input.experienceLanguages.length > 0
        ? input.experienceLanguages
        : undefined,
    experienceFrameworks:
      input.experienceFrameworks.length > 0
        ? input.experienceFrameworks
        : undefined,
    availableTime: input.availableTime.trim() || undefined,
  });

  const handleCheckOrCandidates = async (answers?: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    try {
      const res: AppMapResponse = await generateAppMap({
        mode: "check_or_candidates",
        ...buildBaseRequest(),
        additionalAnswers:
          answers && Object.keys(answers).length > 0 ? answers : undefined,
      });
      if (res.status === "need_more_info") {
        setQuestions(res.questions);
        setReason(res.reason);
        setPhase("need_more_info");
      } else if (res.status === "candidates") {
        setCandidates(res.candidates);
        setPhase("candidates");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCandidate = async (candidate: AppMapCandidate) => {
    setSelectedCandidate(candidate.name);
    setIsLoading(true);
    setError(null);
    try {
      const res: AppMapResponse = await generateAppMap({
        mode: "generate_app_map",
        ...buildBaseRequest(),
        selectedCandidate: candidate.name,
        additionalAnswers:
          Object.keys(additionalAnswers).length > 0
            ? additionalAnswers
            : undefined,
      });
      if (res.status === "app_map") {
        setAppMap(res);
        setPhase("app_map");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInput(defaultInput);
    setPhase("input");
    setQuestions([]);
    setReason("");
    setAdditionalAnswers({});
    setCandidates([]);
    setSelectedCandidate("");
    setAppMap(null);
    setError(null);
    clearDraft(pid);
  };

  const goToIssue = (prefill: Record<string, string>) => {
    navigate(`/projects/${projectId}/issues/new`, { state: { prefill } });
  };

  const handleSaveValidationLog = () => {
    const newLog: ValidationLog = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      phase: cpPhase,
      validationName: valName,
      result: valResult,
      appName: appMap?.appName || input.appName,
      appMapTitle: appMap?.appName || "",
      nextPiece: appMap?.nextPiece || "",
      issueTitle: "",
      good: valGood,
      bad: valBad,
      nextFix: valNextFix,
      nextCheck: valNextCheck,
    };
    const updated = [newLog, ...validationLogs];
    setValidationLogs(updated);
    saveValidationLogs(updated);
    // Reset form
    setValResult("");
    setValGood("");
    setValBad("");
    setValNextFix("");
  };

  const handleSaveCheckpointToDB = async () => {
    if (!dbProjectId) {
      alert("Project IDが不明です。URLを確認してください。");
      return;
    }
    try {
      const record = await createCheckpoint(dbProjectId, {
        phase: cpPhase || "検証中",
        current_goal: cpGoal,
        current_state: cpState,
        learned: cpLearned,
        next_action: cpNextAction,
      });
      setSavedCheckpoints((prev) => [record, ...prev]);
      alert("現在地をDBに保存しました");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        `Checkpoint保存エラー (POST /api/projects/${dbProjectId}/checkpoints/):`,
        msg,
      );
      alert(`保存失敗: ${msg}\nURL: /api/projects/${dbProjectId}/checkpoints/`);
    }
  };

  const handleSaveIssueDraftToDB = async () => {
    if (!appMap?.nextPiece || !dbProjectId) return;
    try {
      const record = await createIssueDraft(dbProjectId, {
        title: appMap.nextPiece,
        background: appMap.concept,
        purpose: appMap.problem,
        acceptance_criteria: appMap.mvp.join("\n"),
        next_step: appMap.nextPiece,
      });
      setSavedDrafts((prev) => [record, ...prev]);
      alert("Issue案をDBに保存しました");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        `IssueDraft保存エラー (POST /api/projects/${dbProjectId}/issue-drafts/):`,
        msg,
      );
      alert(
        `保存失敗: ${msg}\nURL: /api/projects/${dbProjectId}/issue-drafts/`,
      );
    }
  };

  /** nextPiece の文面から技術スタックを推定して target を組み立てる */
  const guessTarget = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("laravel") && lower.match(/\b(\w+)\s*モデル/)) {
      const match = text.match(/(\w+)\s*モデル/);
      const model = match ? match[1] : "";
      return `Laravel の app/Models/${model}.php と database/migrations の ${model} migration`;
    }
    if (lower.includes("django") && lower.match(/\b(\w+)\s*モデル/)) {
      const match = text.match(/(\w+)\s*モデル/);
      const model = match ? match[1] : "";
      return `Django app の models.py に ${model} モデルと migration`;
    }
    if (lower.includes("spring boot") && lower.includes("/api/")) {
      return "Controller クラスと該当APIエンドポイント";
    }
    if (
      (lower.includes("react") || lower.includes("next")) &&
      (lower.includes("画面") || lower.includes("一覧"))
    ) {
      return "frontend/src/pages または components 配下の該当コンポーネント";
    }
    return "未定。必要な画面・API・Model・ファイル候補をIssue生成時に提案してほしい";
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">アプリ地図</h1>
          <p className="text-sm text-gray-500 mt-1">
            AIが質問し、候補を提示し、選んだ案からアプリ地図を作ります
          </p>
        </div>
        {phase !== "input" && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            最初から
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">⚠ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 左カラム */}
        <div className="space-y-4">
          {/* Input Phase */}
          {phase === "input" && (
            <>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    あなたについて
                  </p>
                  <div className="relative group/preset">
                    <button
                      type="button"
                      className="rounded px-2 py-1 text-[10px] text-gray-400 border border-gray-200 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                    >
                      検証プリセット ▾
                    </button>
                    <div className="absolute right-0 top-full mt-1 z-10 hidden group-focus-within/preset:block group-hover/preset:block rounded-md border border-gray-200 bg-white shadow-lg py-1 min-w-[140px]">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setInput(preset.input)}
                          className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    これは何を作る相談ですか？
                  </label>
                  <select
                    value={input.appPurposeType}
                    onChange={(e) => setField("appPurposeType", e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:bg-white focus:border-blue-400 focus:outline-none"
                  >
                    {PURPOSE_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    開発レベル
                  </label>
                  <select
                    value={input.skillLevel}
                    onChange={(e) =>
                      setField("skillLevel", Number(e.target.value))
                    }
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:bg-white focus:border-blue-400 focus:outline-none"
                  >
                    {SKILL_LEVELS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    経験言語
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => toggleList("experienceLanguages", l)}
                        className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${input.experienceLanguages.includes(l) ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    経験フレームワーク
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {FRAMEWORKS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleList("experienceFrameworks", f)}
                        className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${input.experienceFrameworks.includes(f) ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    使える時間
                  </label>
                  <input
                    type="text"
                    value={input.availableTime}
                    onChange={(e) => setField("availableTime", e.target.value)}
                    placeholder="例: 1日2時間、2週間"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  作りたいもの
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    アプリ名（任意）
                  </label>
                  <input
                    type="text"
                    value={input.appName}
                    onChange={(e) => setField("appName", e.target.value)}
                    placeholder="App Creator"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    作りたいもの・困っていること
                  </label>
                  <textarea
                    value={input.appIdeaMemo}
                    onChange={(e) => setField("appIdeaMemo", e.target.value)}
                    rows={4}
                    placeholder="友達が予約管理をLINEと紙メモでやっていて混乱している。まず予約一覧とステータス管理だけ作りたい。"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none resize-y leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    誰のために作る？
                  </label>
                  <input
                    type="text"
                    value={input.targetUser}
                    onChange={(e) => setField("targetUser", e.target.value)}
                    placeholder="個人で教室を運営している友達"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    何が面倒・困っている？
                  </label>
                  <input
                    type="text"
                    value={input.currentProblem}
                    onChange={(e) => setField("currentProblem", e.target.value)}
                    placeholder="予約変更やキャンセルがLINE、紙メモ、Googleカレンダーに散って分からなくなる"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    今はどうやって回している？
                  </label>
                  <input
                    type="text"
                    value={input.currentWorkflow}
                    onChange={(e) =>
                      setField("currentWorkflow", e.target.value)
                    }
                    placeholder="LINEで予約を受けて、Googleカレンダーと紙メモに手で転記している"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    やらないこと・制約
                  </label>
                  <input
                    type="text"
                    value={input.constraints}
                    onChange={(e) => setField("constraints", e.target.value)}
                    placeholder="決済、LINE連携、認証はまだやらない。まず管理者1人用でよい。"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCheckOrCandidates()}
                disabled={isLoading || !canSubmit}
                className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${isLoading || !canSubmit ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm"}`}
              >
                {isLoading ? "AIが考え中..." : "🗺 AIに相談する"}
              </button>
            </>
          )}

          {/* Need More Info Phase */}
          {phase === "need_more_info" && (
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50/30 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  AI
                </span>
                <span className="text-sm font-semibold text-amber-800">
                  もう少し確認したいことがあります
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{reason}</p>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={i}>
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      {q}
                    </p>
                    <input
                      type="text"
                      value={additionalAnswers[q] || ""}
                      onChange={(e) =>
                        setAdditionalAnswers((prev) => ({
                          ...prev,
                          [q]: e.target.value,
                        }))
                      }
                      placeholder="分からなければ「未定」でOK。思いつく範囲で短く書いてください。"
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleCheckOrCandidates(additionalAnswers)}
                disabled={isLoading}
                className={`mt-4 w-full rounded-md px-4 py-2 text-sm font-semibold transition-all ${isLoading ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"}`}
              >
                {isLoading ? "AIが考え中..." : "回答して候補を出す"}
              </button>
            </div>
          )}

          {/* Candidates Phase */}
          {phase === "candidates" && (
            <div className="rounded-lg border-2 border-purple-200 bg-purple-50/20 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  AI
                </span>
                <span className="text-sm font-semibold text-purple-800">
                  3つの候補があります
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                作りたいものに近い候補を選んでください。選んだ案からアプリ地図を作ります。
              </p>
              <div className="space-y-2">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCandidate(c)}
                    disabled={isLoading}
                    className="w-full text-left rounded-lg border border-gray-200 bg-white p-4 hover:border-purple-300 hover:bg-purple-50/50 transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {c.difficulty} / {c.estimatedDays}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1.5">{c.summary}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-gray-500">
                      <span>対象: {c.targetUser}</span>
                      <span>解決: {c.solves}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-emerald-600">
                      🎯 {c.firstWin}
                    </p>
                  </button>
                ))}
              </div>
              {isLoading && (
                <p className="mt-3 text-xs text-purple-500 text-center animate-pulse">
                  AIがアプリ地図を生成中...
                </p>
              )}
            </div>
          )}

          {/* AppMap Phase - summary */}
          {phase === "app_map" && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                選んだ候補
              </p>
              <p className="text-sm font-medium text-gray-800">
                {selectedCandidate}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {input.appIdeaMemo}
              </p>
            </div>
          )}
        </div>

        {/* 右カラム: AppMapプレビュー */}
        <div>
          {phase !== "app_map" && !isLoading && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-3">
                <span className="text-lg">🗺</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">
                候補を選ぶとアプリ地図が表示されます
              </p>
              <p className="text-xs text-gray-400">
                入力 → 追加質問 → 候補選択 → 地図生成
              </p>
            </div>
          )}

          {phase !== "app_map" && isLoading && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-3 animate-pulse">
                <span className="text-lg">🗺</span>
              </div>
              <p className="text-sm text-blue-700 font-medium">AIが処理中...</p>
            </div>
          )}

          {appMap && phase === "app_map" && (
            <div className="rounded-lg border-2 border-blue-200 bg-white p-5 shadow-sm space-y-4">
              {/* 使い方ガイド */}
              <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1.5">
                  この地図の使い方
                </p>
                <ol className="text-[11px] text-gray-600 leading-relaxed space-y-0.5 list-decimal list-inside">
                  <li>
                    まずMVPの中から、最初に作れそうなピースを1つ選びます。
                  </li>
                  <li>
                    迷ったら、下の「おすすめの次のピース」から始めてください。
                  </li>
                  <li>「Issue→」を押すと、Issue作成画面に材料が入ります。</li>
                  <li>AIが追加質問してきたら、分かる範囲で答えればOKです。</li>
                  <li>
                    目的は完璧な設計ではなく、最初に手を動かせるIssueを作ることです。
                  </li>
                </ol>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  MAP
                </span>
                <span className="text-sm font-semibold text-blue-800">
                  {appMap.appName}
                </span>
              </div>
              <div className="rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-900 font-medium leading-relaxed">
                  {appMap.concept}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    対象ユーザー
                  </h4>
                  <p className="text-xs text-gray-700">{appMap.targetUser}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    解決する課題
                  </h4>
                  <p className="text-xs text-gray-700">{appMap.problem}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                    MVP
                  </h4>
                  <p className="text-[10px] text-gray-400 mb-1.5">
                    「Issue→」で作業Issueに変換できます
                  </p>
                  <ul className="space-y-1">
                    {appMap.mvp.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-1.5 text-xs text-gray-700 group/mvp"
                      >
                        <span className="text-emerald-500 shrink-0">✓</span>
                        <span className="flex-1">{item}</span>
                        <button
                          type="button"
                          onClick={() =>
                            goToIssue({
                              title: `${item} を実装する`,
                              rawMemo: `AppMapのMVP項目「${item}」をIssue化したい。`,
                              intent:
                                "このMVP項目を、最初に手を動かせる実装Issueにしたい。",
                              currentState: "AppMapでMVP項目として整理済み。",
                              target: guessTarget(item),
                              constraints:
                                "MVP範囲内で、1〜3時間程度で進められるIssueにする。認証、外部API連携、自動化、複数ユーザー対応はまだやらない。",
                              doneState:
                                "このMVP項目を進めるための最初の実装Issueが作成できる。",
                            })
                          }
                          className="shrink-0 opacity-0 group-hover/mvp:opacity-100 rounded px-1.5 py-0.5 text-[10px] text-blue-500 hover:bg-blue-50 transition-all"
                        >
                          Issue→
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    非MVP
                  </h4>
                  <ul className="space-y-0.5">
                    {appMap.nonMvp.map((item, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-500 flex gap-1.5"
                      >
                        <span className="text-gray-300 shrink-0">○</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  主要機能
                </h4>
                <div className="space-y-1">
                  {appMap.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs group/feat"
                    >
                      <span className="font-semibold text-gray-700 shrink-0">
                        {f.name}
                      </span>
                      <span className="text-gray-500 flex-1">
                        — {f.description}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          goToIssue({
                            title: `${f.name} を実装する`,
                            rawMemo: `AppMapの主要機能「${f.name}」をIssue化したい。説明: ${f.description}`,
                            intent: `${f.name} の最初の実装Issueを作りたい。`,
                            currentState: "AppMapで主要機能として整理済み。",
                            target: guessTarget(f.name + " " + f.description),
                            constraints:
                              "MVP範囲内で最小実装にする。認証、外部API連携、自動化、複数ユーザー対応はまだやらない。",
                            doneState: `${f.name} の最初の実装Issueが作成できる。`,
                          })
                        }
                        className="shrink-0 opacity-0 group-hover/feat:opacity-100 rounded px-1.5 py-0.5 text-[10px] text-blue-500 hover:bg-blue-50 transition-all"
                      >
                        Issue→
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    画面
                  </h4>
                  <ul className="space-y-0.5">
                    {appMap.screens.map((s, i) => (
                      <li key={i} className="text-xs text-gray-600">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    API
                  </h4>
                  <ul className="space-y-0.5">
                    {appMap.apis.map((a, i) => (
                      <li
                        key={i}
                        className="text-[11px] text-gray-600 font-mono"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    データモデル
                  </h4>
                  <ul className="space-y-0.5">
                    {appMap.dataModels.map((m, i) => (
                      <li key={i} className="text-xs text-gray-600">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="rounded-md border-2 border-emerald-300 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    おすすめ
                  </span>
                  <h4 className="text-xs font-semibold text-emerald-800">
                    次のピース
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 mb-2">
                  迷ったら、まずここからIssue化してください。AIがMVPの中から最初に着手しやすい作業として選んだものです。
                </p>
                <p className="text-sm font-semibold text-emerald-900">
                  → {appMap.nextPiece}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    goToIssue({
                      title: appMap.nextPiece,
                      rawMemo: `AppMapで次に作るべきピースとして「${appMap.nextPiece}」が提示された。このピースを、実際に手を動かせる実装Issueにしたい。`,
                      intent: appMap.nextPiece,
                      currentState:
                        "AppMapでMVPと主要機能が整理され、次に作るべきピースとしてこの作業が提示されている。",
                      target: guessTarget(appMap.nextPiece),
                      constraints:
                        "認証、外部API連携、自動化、複数ユーザー対応はまだやらない。まず管理者1人が手動で使う前提にする。",
                      doneState: appMap.nextPiece.replace(
                        /する$/,
                        "している状態になる。",
                      ),
                    })
                  }
                  className="mt-3 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  ✦ このピースからIssueを作る
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 現在地カード */}
      <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50/30 p-4 shadow-sm">
        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
          現在地
        </p>
        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
              今の目的
            </label>
            <input
              type="text"
              value={cpGoal}
              onChange={(e) => setCpGoal(e.target.value)}
              placeholder="このProjectで達成したいこと"
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                フェーズ
              </label>
              <input
                type="text"
                value={cpPhase}
                onChange={(e) => setCpPhase(e.target.value)}
                placeholder="検証中"
                className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                やっていること
              </label>
              <input
                type="text"
                value={cpState}
                onChange={(e) => setCpState(e.target.value)}
                placeholder="今取り組んでいる作業"
                className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                わかったこと
              </label>
              <input
                type="text"
                value={cpLearned}
                onChange={(e) => setCpLearned(e.target.value)}
                placeholder="判明した知見"
                className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                次にやること
              </label>
              <input
                type="text"
                value={cpNextAction}
                onChange={(e) => setCpNextAction(e.target.value)}
                placeholder="次の具体的な作業"
                className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveCheckpointToDB}
            className="rounded-md border border-indigo-300 bg-white px-3 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            現在地をDBに保存
          </button>
          {appMap && (
            <button
              type="button"
              onClick={handleSaveIssueDraftToDB}
              className="rounded-md border border-emerald-300 bg-white px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              nextPieceをIssue案としてDB保存
            </button>
          )}
        </div>
        {(savedCheckpoints.length > 0 || savedDrafts.length > 0) && (
          <div className="mt-3 pt-3 border-t border-indigo-100 flex gap-4 text-[10px] text-gray-500">
            <span>Checkpoint {savedCheckpoints.length}件</span>
            <span>IssueDraft {savedDrafts.length}件</span>
          </div>
        )}
      </div>

      {/* 検証ログを残す */}
      <div className="mt-4 space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            検証ログを残す
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                今回の検証名
              </label>
              <input
                type="text"
                value={valName}
                onChange={(e) => setValName(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 focus:bg-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                判定
              </label>
              <div className="flex gap-2">
                {(["OK", "微妙", "NG"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValResult(v)}
                    className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${valResult === v ? (v === "OK" ? "border-green-400 bg-green-50 text-green-700" : v === "NG" ? "border-red-400 bg-red-50 text-red-700" : "border-amber-400 bg-amber-50 text-amber-700") : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                良かったこと
              </label>
              <textarea
                value={valGood}
                onChange={(e) => setValGood(e.target.value)}
                rows={2}
                placeholder="nextPieceが画面体験寄りになっている等"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none resize-y"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                ズレたこと
              </label>
              <textarea
                value={valBad}
                onChange={(e) => setValBad(e.target.value)}
                rows={2}
                placeholder="CRUDに寄りすぎた、MVPが大きい等"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none resize-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                次に直すこと
              </label>
              <textarea
                value={valNextFix}
                onChange={(e) => setValNextFix(e.target.value)}
                rows={2}
                placeholder="プロンプトの〇〇ルールを強化する等"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none resize-y"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                次に見ること
              </label>
              <textarea
                value={valNextCheck}
                onChange={(e) => setValNextCheck(e.target.value)}
                rows={2}
                placeholder="Issue化結果がKiroに投げられる粒度か確認する"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none resize-y"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveValidationLog}
            className="rounded-md bg-gray-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-900 transition-colors"
          >
            この検証結果を保存
          </button>
        </div>

        {/* 保存済みログ一覧 */}
        {validationLogs.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              検証ログ ({validationLogs.length})
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {validationLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-md border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${log.result === "OK" ? "bg-green-100 text-green-700" : log.result === "NG" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {log.result || "—"}
                    </span>
                    <span className="text-[11px] font-medium text-gray-700">
                      {log.validationName}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(log.createdAt).toLocaleDateString("ja-JP", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {log.nextPiece && (
                    <p className="text-[11px] text-emerald-600 mb-1">
                      → {log.nextPiece}
                    </p>
                  )}
                  {log.good && (
                    <p className="text-[11px] text-gray-600">
                      <span className="text-gray-400">良:</span> {log.good}
                    </p>
                  )}
                  {log.bad && (
                    <p className="text-[11px] text-gray-600">
                      <span className="text-gray-400">ズレ:</span> {log.bad}
                    </p>
                  )}
                  {log.nextFix && (
                    <p className="text-[11px] text-gray-600">
                      <span className="text-gray-400">修正:</span> {log.nextFix}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
