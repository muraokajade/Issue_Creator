import { useState } from "react";
import { Link } from "react-router-dom";

const projects = [
  {
    id: 2,
    name: "Simple Rent Roll",
    description: "Django / React で作る小さなレントロール管理アプリ",
    updatedAt: "06/27 13:47",
    checkpointCount: 5,
    activeIssueCount: 1,
    doneIssueCount: 1,
    status: "進行中",
  },
  {
    id: 1,
    name: "App Creator",
    description: "App Creator検証プロジェクト",
    updatedAt: "06/27 13:21",
    checkpointCount: 0,
    activeIssueCount: 0,
    doneIssueCount: 0,
    status: "進行中",
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
            aria-label="サイドバーを開閉"
          >
            ☰
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-xs font-black text-white">
              AC
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black leading-none text-slate-950">
                App Creator
              </p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-slate-400">
                開発ナビ
              </p>
            </div>
          </Link>

          <div className="mx-auto hidden w-full max-w-md md:block">
            <input
              type="search"
              placeholder="Project / Issue / Checkpoint を検索"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/projects"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
            >
              Project一覧
            </Link>

            <Link
              to="/projects"
              className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              ＋ 新規Project
            </Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside
          className={[
            "shrink-0 border-r border-slate-200 bg-white transition-all duration-200",
            sidebarOpen ? "w-72" : "w-16",
          ].join(" ")}
        >
          <div className="h-full px-3 py-5">
            {sidebarOpen ? (
              <>
                <div className="mb-6 px-2">
                  <p className="text-xs font-black tracking-[0.22em] text-blue-700">
                    DASHBOARD
                  </p>
                  <h2 className="mt-2 text-lg font-black text-slate-950">
                    開発の入口
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Projectを選んで、開発ボードを開きます。
                  </p>
                </div>

                <nav className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="block rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700"
                  >
                    今日のProject
                  </Link>
                  <Link
                    to="/projects"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Project一覧
                  </Link>
                  <Link
                    to="/settings"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Settings
                  </Link>
                </nav>

                <div className="mt-7 border-t border-slate-200 pt-5">
                  <div className="mb-3 flex items-center justify-between px-2">
                    <p className="text-xs font-black text-slate-500">進行中</p>
                    <span className="text-xs text-slate-400">
                      {projects.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="block rounded-lg px-3 py-2 text-sm transition hover:bg-slate-100"
                      >
                        <p className="truncate font-semibold text-slate-800">
                          {project.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          更新 {project.updatedAt}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <nav className="flex flex-col items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"
                  title="今日のProject"
                >
                  ●
                </Link>
                <Link
                  to="/projects"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                  title="Project一覧"
                >
                  ▦
                </Link>
                <Link
                  to="/settings"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                  title="Settings"
                >
                  ⚙
                </Link>
              </nav>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <section className="mb-8">
              <p className="text-xs font-black tracking-[0.28em] text-blue-700">
                TODAY
              </p>

              <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                    今日開くProjectを選ぶ
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    Dashboardは、開発中のProjectへ入る入口です。
                    Projectを開くと、現在地・今やるIssue・完了した作業を確認できます。
                  </p>
                </div>

                <Link
                  to="/projects"
                  className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-500 hover:text-blue-700"
                >
                  すべてのProjectを見る
                </Link>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-950">
                  進行中のProject
                </h2>
                <span className="text-xs text-slate-400">
                  {projects.length}件
                </span>
              </div>

              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black text-slate-950">
                            {project.name}
                          </h3>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                            {project.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {project.description}
                        </p>

                        <p className="mt-3 text-xs text-slate-400">
                          更新 {project.updatedAt}
                        </p>
                      </div>

                      <div className="grid min-w-[260px] grid-cols-3 gap-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                          <p className="text-lg font-black text-slate-950">
                            {project.checkpointCount}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            現在地
                          </p>
                        </div>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-center">
                          <p className="text-lg font-black text-blue-700">
                            {project.activeIssueCount}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            今やるIssue
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                          <p className="text-lg font-black text-slate-950">
                            {project.doneIssueCount}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            完了
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-slate-950">
                  1. 開発ボードを見る
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-600">
                  今やるIssue、現在地、完了した作業を確認します。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-slate-950">
                  2. 初期地図を見る
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-600">
                  AppMapでMVP・非MVP・最初の作業候補を確認します。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-slate-950">
                  3. 次Issueを作る
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-600">
                  迷ったら雑メモから、AIで次の1作業に整理します。
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
