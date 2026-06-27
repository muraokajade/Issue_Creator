import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppMapResultView from "../components/app-map/AppMapResultView";
import { generateAppMap, fetchProjects } from "../api";
import type { AppMapResponse, AppMapCandidate, AppMapResult } from "../api";

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

export default function AppMapPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const pid = projectId || "0";
  const draft = loadDraft(pid);

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

  useEffect(() => {
    if (currentProjectName && !draft) {
      setInput((prev) =>
        prev.appName ? prev : { ...prev, appName: currentProjectName },
      );
    }
  }, [currentProjectName, draft]);

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

  const goToProjectBoard = () => {
    navigate(`/projects/${projectId}`);
  };

  const goToBlankIssue = () => {
    navigate(`/projects/${projectId}/issues/new`);
  };

  const renderHeader = () => (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">アプリ地図 (AppMap)</h1>
        <p className="text-sm text-gray-500 mt-1">
          AIが質問し、候補を提示し、選んだ案から初期地図を作ります
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          AppMapは最初に作った地図です。開発が進んだ後の現在地は、開発ボードのCheckpointを見てください。
        </p>
      </div>

      <div className="flex items-center gap-2">
        {phase === "app_map" && (
          <button
            type="button"
            onClick={goToProjectBoard}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
          >
            開発ボードへ戻る
          </button>
        )}

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
    </div>
  );

  const renderError = () =>
    error ? (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-sm text-red-700">⚠ {error}</p>
      </div>
    ) : null;

  const renderInputPhase = () => (
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
            onChange={(e) => setField("skillLevel", Number(e.target.value))}
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
                className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                  input.experienceLanguages.includes(l)
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
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
                className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                  input.experienceFrameworks.includes(f)
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
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
            onChange={(e) => setField("currentWorkflow", e.target.value)}
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
        className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
          isLoading || !canSubmit
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm"
        }`}
      >
        {isLoading ? "AIが考え中..." : "🗺 AIに相談する"}
      </button>
    </>
  );

  const renderNeedMoreInfoPhase = () => (
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
            <p className="text-sm text-gray-700 font-medium mb-1">{q}</p>
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
        className={`mt-4 w-full rounded-md px-4 py-2 text-sm font-semibold transition-all ${
          isLoading
            ? "bg-gray-100 text-gray-400"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        }`}
      >
        {isLoading ? "AIが考え中..." : "回答して候補を出す"}
      </button>
    </div>
  );

  const renderCandidatesPhase = () => (
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
              <span className="text-sm font-bold text-gray-800">{c.name}</span>
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
  );

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-3 animate-pulse">
            <span className="text-lg">🗺</span>
          </div>
          <p className="text-sm text-blue-700 font-medium">AIが処理中...</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-3">
          <span className="text-lg">🗺</span>
        </div>
        <p className="text-sm text-gray-500 mb-1">
          ここはプレビューです。ボタンを押すまで保存やIssue作成はされません。
        </p>
        <p className="text-xs text-gray-400">
          入力 → 追加質問 → 候補選択 → 地図生成
        </p>
      </div>
    );
  };

  const renderWorkingPhase = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        {phase === "input" && renderInputPhase()}
        {phase === "need_more_info" && renderNeedMoreInfoPhase()}
        {phase === "candidates" && renderCandidatesPhase()}
      </div>

      <div>{renderPreview()}</div>
    </div>
  );

  const renderAppMapPhase = () => {
    if (!appMap) return null;

    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                初期AppMap
              </p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">
                これは最初に作った地図です
              </h2>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                AppMapは、MVP範囲・初期設計・最初のIssue候補を確認するためのページです。
                作業が進むと現在地は変わります。現在の次Issueや完了ログは開発ボードで確認してください。
              </p>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                AppMap内の「Issue→」や「このピースからIssueを作る」は、
                地図の内容をIssue作成画面へ渡すだけです。IssueDraftとして保存されるのは、Issue作成画面で保存した後です。
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={goToProjectBoard}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
              >
                開発ボードへ戻る
              </button>
              <button
                type="button"
                onClick={goToBlankIssue}
                className="rounded-md border border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50"
              >
                雑メモからIssue
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                選んだ候補
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {selectedCandidate || appMap.appName}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {input.appIdeaMemo}
              </p>
            </div>

            <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 lg:max-w-sm">
              <p className="font-semibold">このページの役割</p>
              <p className="mt-1 leading-relaxed">
                地図は判断材料です。日々の作業は開発ボードでIssueを読んで進めます。
              </p>
            </div>
          </div>
        </div>

        <AppMapResultView appMap={appMap} onGoToIssue={goToIssue} />
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-5">
      {renderHeader()}
      {renderError()}
      {phase === "app_map" && appMap
        ? renderAppMapPhase()
        : renderWorkingPhase()}
    </div>
  );
}
