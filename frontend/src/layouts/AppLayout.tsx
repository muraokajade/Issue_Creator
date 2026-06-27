import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { fetchProjects } from "../api";
import type { ProjectRecord } from "../api";

function SidebarLink({
  to,
  label,
  icon,
  end,
  accent,
}: {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
  accent?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-gray-800 text-white"
            : accent
              ? "text-purple-400 hover:bg-gray-800/50 hover:text-purple-300"
              : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
        }`
      }
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  // Fetch DB projects for name resolution
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => {});
  }, []);

  const getProjectName = (id: number): string => {
    const p = projects.find((pr) => pr.id === id);
    return p?.name ?? `Project #${id}`;
  };

  // Derive project context from URL
  const projectMatch = path.match(/^\/projects\/(\d+)/);
  const projectId = projectMatch ? Number(projectMatch[1]) : null;
  const projectName = projectId ? getProjectName(projectId) : null;

  // Build breadcrumbs
  const breadcrumbs: { label: string; to?: string }[] = [];

  if (path === "/projects") {
    breadcrumbs.push({ label: "Projects" });
  } else if (path === "/settings") {
    breadcrumbs.push({ label: "Settings" });
  } else if (projectId) {
    const name = getProjectName(projectId);
    breadcrumbs.push({ label: "Projects", to: "/projects" });

    if (path === `/projects/${projectId}`) {
      breadcrumbs.push({ label: name, to: `/projects/${projectId}` });
      breadcrumbs.push({ label: "開発ボード" });
    } else if (path.endsWith("/issues/new")) {
      breadcrumbs.push({ label: name, to: `/projects/${projectId}` });
      breadcrumbs.push({ label: "AIでIssue作成" });
    } else if (path.endsWith("/app-map")) {
      breadcrumbs.push({ label: name, to: `/projects/${projectId}` });
      breadcrumbs.push({ label: "アプリ地図" });
    } else {
      breadcrumbs.push({ label: name });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100/60">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AC</span>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              App Creator
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <SidebarLink to="/projects" label="Projects" icon="◫" end />

          {projectId && projectName && (
            <>
              <div className="mt-5 mb-2 px-3">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {projectName}
                </span>
              </div>
              <SidebarLink
                to={`/projects/${projectId}/app-map`}
                label="アプリ地図"
                icon="🗺"
              />
              <SidebarLink
                to={`/projects/${projectId}/issues/new`}
                label="次Issueを作る"
                icon="✦"
                accent
              />
            </>
          )}

          <div className="mt-5 mb-2 px-3">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              System
            </span>
          </div>
          <SidebarLink to="/settings" label="Settings" icon="⚙" />
        </nav>

        <div className="border-t border-gray-800 px-4 py-3">
          <p className="text-[10px] text-gray-600">v0.1.0</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-2.5">
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            {breadcrumbs.map((item, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <span className="text-gray-300 shrink-0">/</span>}
                  {item.to && !isLast ? (
                    <Link
                      to={item.to}
                      className="text-gray-500 hover:text-gray-800 transition-colors truncate"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-gray-800 font-medium truncate">
                      {item.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {projectId && (
              <Link
                to={`/projects/${projectId}/issues/new`}
                className="rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:from-purple-600 hover:to-indigo-700 transition-all shadow-sm"
              >
                ✦ 次Issueを作る
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
