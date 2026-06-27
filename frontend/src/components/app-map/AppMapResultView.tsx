import type { AppMapResult } from "../../api";

type IssuePrefill = Record<string, string>;

interface AppMapResultViewProps {
  appMap: AppMapResult;
  onGoToIssue: (prefill: IssuePrefill) => void;
}

/** nextPiece の文面から技術スタックを推定して target を組み立てる */
function guessTarget(text: string): string {
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
}

export default function AppMapResultView({
  appMap,
  onGoToIssue,
}: AppMapResultViewProps) {
  return (
    <div className="rounded-lg border-2 border-blue-200 bg-white p-5 shadow-sm space-y-4">
      {/* 使い方ガイド */}
      <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
        <p className="text-xs font-semibold text-blue-700 mb-1.5">
          この地図の使い方
        </p>
        <ol className="text-[11px] text-gray-600 leading-relaxed space-y-0.5 list-decimal list-inside">
          <li>まずMVPの中から、最初に作れそうなピースを1つ選びます。</li>
          <li>迷ったら、下の「おすすめの次のピース」から始めてください。</li>
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
                    onGoToIssue({
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
              <li key={i} className="text-xs text-gray-500 flex gap-1.5">
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
            <div key={i} className="flex items-center gap-2 text-xs group/feat">
              <span className="font-semibold text-gray-700 shrink-0">
                {f.name}
              </span>
              <span className="text-gray-500 flex-1">— {f.description}</span>

              <button
                type="button"
                onClick={() =>
                  onGoToIssue({
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
              <li key={i} className="text-[11px] text-gray-600 font-mono">
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
          <h4 className="text-xs font-semibold text-emerald-800">次のピース</h4>
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
            onGoToIssue({
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
  );
}
