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

interface ValidationLogPanelProps {
  validationLogs: ValidationLog[];

  valName: string;
  valResult: "OK" | "微妙" | "NG" | "";
  valGood: string;
  valBad: string;
  valNextFix: string;
  valNextCheck: string;

  setValName: (value: string) => void;
  setValResult: (value: "OK" | "微妙" | "NG" | "") => void;
  setValGood: (value: string) => void;
  setValBad: (value: string) => void;
  setValNextFix: (value: string) => void;
  setValNextCheck: (value: string) => void;

  onSaveValidationLog: () => void;
}

export default function ValidationLogPanel({
  validationLogs,
  valName,
  valResult,
  valGood,
  valBad,
  valNextFix,
  valNextCheck,
  setValName,
  setValResult,
  setValGood,
  setValBad,
  setValNextFix,
  setValNextCheck,
  onSaveValidationLog,
}: ValidationLogPanelProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Issue結果メモ
        </p>
        <p className="text-[10px] text-gray-400">
          Issueをやってみた結果を残します。うまくいったこと、想定と違ったこと、次に確認することは、次Issueを作るときの判断材料になります。
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">
              メモのタイトル
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
              結果
            </label>
            <div className="flex gap-2">
              {(["OK", "微妙", "NG"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setValResult(v)}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                    valResult === v
                      ? v === "OK"
                        ? "border-green-400 bg-green-50 text-green-700"
                        : v === "NG"
                          ? "border-red-400 bg-red-50 text-red-700"
                          : "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
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
              うまくいったこと
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
              想定と違ったこと
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
              次にやること
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
              次に確認すること
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
          onClick={onSaveValidationLog}
          className="rounded-md bg-gray-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-900 transition-colors"
        >
          Issue結果を保存
        </button>
      </div>

      {validationLogs.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Issue結果メモ ({validationLogs.length})
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {validationLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-md border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      log.result === "OK"
                        ? "bg-green-100 text-green-700"
                        : log.result === "NG"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
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
  );
}
