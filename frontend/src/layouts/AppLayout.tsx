import { useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";

function getPageTitle(pathname: string) {
  if (pathname === "/projects") return "Projects";
  if (pathname === "/settings") return "Settings";
  if (pathname.includes("/app-map")) return "アプリ地図";
  if (pathname.includes("/issues/new")) return "AIでIssue作成";
  if (pathname.includes("/issues/")) return "Issue詳細";
  if (pathname.includes("/projects/")) return "開発ボード";
  return "Dashboard";
}

function getProjectIdFromPath(pathname: string) {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match?.[1] ?? null;
}

function navItemClass({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const params = useParams();

  const projectId = useMemo(() => {
    return params.projectId ?? getProjectIdFromPath(location.pathname);
  }, [location.pathname, params.projectId]);

  const pageTitle = getPageTitle(location.pathname);
  const projectName = projectId ? "Simple Rent Roll" : "";

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

          <Link to="/dashboard" className="flex items-center gap-2">
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

          <div className="hidden h-6 w-px bg-slate-200 md:block" />

          <div className="hidden min-w-0 items-center gap-2 text-sm md:flex">
            <Link to="/projects" className="text-slate-500 hover:text-blue-700">
              Projects
            </Link>

            {projectId && (
              <>
                <span className="text-slate-300">/</span>
                <Link
                  to={`/projects/${projectId}`}
                  className="max-w-[180px] truncate text-slate-500 hover:text-blue-700"
                >
                  {projectName}
                </Link>
              </>
            )}

            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-950">{pageTitle}</span>
          </div>

          <div className="mx-auto hidden w-full max-w-md lg:block">
            <input
              type="search"
              placeholder="Project / Issue / Checkpoint を検索"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {projectId && (
              <Link
                to={`/projects/${projectId}/issues/new`}
                className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                ＋ 雑メモからIssue
              </Link>
            )}

            <button
              type="button"
              className="hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 sm:inline-flex"
            >
              もっと見る
            </button>
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
                    APP CREATOR
                  </p>
                  <h2 className="mt-2 text-lg font-black text-slate-950">
                    開発ナビ
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Projectを選び、現在地と次Issueを確認します。
                  </p>
                </div>

                <nav className="space-y-1">
                  <NavLink to="/projects" className={navItemClass}>
                    <span className="w-5 text-center">▦</span>
                    <span>Projects</span>
                  </NavLink>

                  <NavLink to="/settings" className={navItemClass}>
                    <span className="w-5 text-center">⚙</span>
                    <span>Settings</span>
                  </NavLink>
                </nav>

                {projectId && (
                  <div className="mt-7 border-t border-slate-200 pt-5">
                    <div className="mb-3 px-2">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {projectName}
                      </p>
                    </div>

                    <nav className="space-y-1">
                      <NavLink
                        to={`/projects/${projectId}`}
                        end
                        className={navItemClass}
                      >
                        <span className="w-5 text-center">●</span>
                        <span>開発ボード</span>
                      </NavLink>

                      <NavLink
                        to={`/projects/${projectId}/app-map`}
                        className={navItemClass}
                      >
                        <span className="w-5 text-center">🗺</span>
                        <span>アプリ地図</span>
                      </NavLink>

                      <NavLink
                        to={`/projects/${projectId}/issues/new`}
                        className={navItemClass}
                      >
                        <span className="w-5 text-center">✦</span>
                        <span>雑メモからIssue</span>
                      </NavLink>
                    </nav>

                    <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                      <p className="text-xs font-black text-blue-700">
                        今の流れ
                      </p>
                      <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                        <p>1. 開発ボードで現在地を見る</p>
                        <p>2. 必要ならAppMapを確認する</p>
                        <p>3. 雑メモから次Issueを作る</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <nav className="flex flex-col items-center gap-2">
                <NavLink
                  to="/projects"
                  className={({ isActive }) =>
                    [
                      "flex h-10 w-10 items-center justify-center rounded-lg text-sm transition",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")
                  }
                  title="Projects"
                >
                  ▦
                </NavLink>

                {projectId && (
                  <>
                    <NavLink
                      to={`/projects/${projectId}`}
                      end
                      className={({ isActive }) =>
                        [
                          "flex h-10 w-10 items-center justify-center rounded-lg text-sm transition",
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100",
                        ].join(" ")
                      }
                      title="開発ボード"
                    >
                      ●
                    </NavLink>

                    <NavLink
                      to={`/projects/${projectId}/app-map`}
                      className={({ isActive }) =>
                        [
                          "flex h-10 w-10 items-center justify-center rounded-lg text-sm transition",
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100",
                        ].join(" ")
                      }
                      title="アプリ地図"
                    >
                      🗺
                    </NavLink>

                    <NavLink
                      to={`/projects/${projectId}/issues/new`}
                      className={({ isActive }) =>
                        [
                          "flex h-10 w-10 items-center justify-center rounded-lg text-sm transition",
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100",
                        ].join(" ")
                      }
                      title="雑メモからIssue"
                    >
                      ✦
                    </NavLink>
                  </>
                )}

                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    [
                      "flex h-10 w-10 items-center justify-center rounded-lg text-sm transition",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")
                  }
                  title="Settings"
                >
                  ⚙
                </NavLink>
              </nav>
            )}
          </div>
        </aside>

        {/* Page body */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
