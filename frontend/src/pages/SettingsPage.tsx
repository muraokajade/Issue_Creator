import { useState } from "react";
import { mockSettings } from "../mockData";
import { ISSUE_TYPE_LABELS } from "../types";
import type { AppSettings } from "../types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(mockSettings);
  const [editingModel, setEditingModel] = useState(false);
  const [modelInput, setModelInput] = useState(settings.aiModel);

  const handleSaveModel = () => {
    setSettings((prev) => ({ ...prev, aiModel: modelInput }));
    setEditingModel(false);
    alert("AIモデルを保存しました（Mock）");
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">
        IssueCreator の設定を管理します
      </p>

      {/* AI Model */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-gray-800 mb-3">AIモデル</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">
                {settings.aiModel}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Issue作成時のAI構造化に使用します
              </p>
            </div>
            {editingModel ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none w-32"
                />
                <button
                  onClick={handleSaveModel}
                  className="rounded px-2 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditingModel(false)}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingModel(true)}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
              >
                変更
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Repository */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Repository連携</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">
                {settings.repositoryUrl || "未設定"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    settings.githubConnected
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {settings.githubConnected ? "接続済み" : "未接続"}
                </span>
              </div>
            </div>
            <button
              onClick={() => alert("Repository設定は今後実装予定です")}
              className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
            >
              設定
            </button>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-gray-800 mb-3">
          Issue種別テンプレート
        </h2>
        <p className="text-[11px] text-gray-400 mb-3">
          Issue作成時にAI生成の初期値として使われます
        </p>
        <div className="space-y-2">
          {settings.templates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                  {ISSUE_TYPE_LABELS[template.issueType]}
                </span>
                <button
                  onClick={() => alert("テンプレート編集は今後実装予定です")}
                  className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  編集
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    デフォルト完了条件
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {template.defaultAcceptanceCriteria.map((c, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-600 flex gap-1.5"
                      >
                        <span className="text-gray-400">•</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    デフォルト次の一手
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    → {template.defaultNextAction}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
