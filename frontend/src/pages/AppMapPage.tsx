import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById } from "../mockData";
import { generateAppMap } from "../api";
import type { AppMapResponse, AppMapCandidate, AppMapResult } from "../api";

const STORAGE_KEY = "app_creator_draft";
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

function loadDraft(): DraftState | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function saveDraft(d: DraftState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}
function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function AppMapPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = getProjectById(Number(projectId));
  const draft = loadDraft();

  const defaultInput: InputState = {
    appName: project?.name || "",
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

  // Persist to localStorage on state change
  useEffect(() => {
    saveDraft({
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
    clearDraft();
  };

  const goToIssue = (prefill: Record<string, string>) => {
    navigate(`/projects/${projectId}/issues/new`, { state: { prefill } });
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
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  あなたについて
                </p>
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
                              title: item,
                              rawMemo: `${item} を実装する`,
                              intent: "MVP項目をIssue化",
                              currentState: "アプリ地図生成済み",
                              target: "",
                              constraints: "",
                              doneState: "",
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
                            title: f.name,
                            rawMemo: f.description,
                            intent: "主要機能をIssue化",
                            currentState: "地図で整理済み",
                            target: "",
                            constraints: "MVP範囲",
                            doneState: `${f.name} が動く`,
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
                      rawMemo: appMap.nextPiece,
                      intent: "nextPieceをIssue化",
                      currentState: "AppMap生成済み",
                      target: "",
                      constraints: "大規模変更はしない",
                      doneState: "実装Issueが作成できる",
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
    </div>
  );
}
