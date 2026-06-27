import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProjects, createProject } from "../api";
import type { ProjectRecord } from "../api";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((e) => {
        console.error("Project一覧取得失敗:", e.message);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateProject = async () => {
    const name = prompt("新しいProjectの名前を入力してください:");
    if (!name?.trim()) return;

    try {
      const created = await createProject({ name: name.trim() });
      navigate(`/projects/${created.id}/app-map`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Project作成失敗:", msg);
      alert(`Project作成失敗: ${msg}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            開発中のProjectを選んでアプリ地図を作りましょう
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateProject}
          className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm"
        >
          ＋ 新規Project
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">⚠ API接続エラー: {error}</p>
          <p className="text-xs text-red-500 mt-1">
            Djangoサーバー (http://localhost:8000)
            が起動しているか確認してください
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-sm text-gray-400">
          読み込み中...
        </div>
      )}

      {!loading && projects.length === 0 && !error && (
        <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/20 p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-3">
            <span className="text-lg">🗺</span>
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">
            まだProjectがありません
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            「+
            新規Project」から始めましょう。アプリ地図を作って開発を整理できます。
          </p>
          <button
            type="button"
            onClick={handleCreateProject}
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm"
          >
            ＋ 新規Project
          </button>
        </div>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => navigate(`/projects/${project.id}/app-map`)}
            className="block w-full text-left rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h2>
                {project.description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  {project.status}
                </span>
                <p className="text-[11px] text-gray-400 mt-1">
                  更新{" "}
                  {new Date(project.updated_at).toLocaleDateString("ja-JP", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
