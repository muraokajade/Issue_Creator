import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { getProjectById, getIssueById } from "../mockData";

function SidebarLink({
  to,
  label,
  icon,
  end,
}: {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
        }`
      }
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

/**
 * Derive project context from the current URL.
 * - /projects/:projectId → directly from URL
 * - /issues/:issueId → from the issue's projectId
 */
function useProjectContext() {
  const location = useLocation();
  const path = location.pathname;

  // Match /projects/:projectId
  const projectMatch = path.match(/^\/projects\/(\d+)/);
  if (projectMatch) {
    const projectId = Number(projectMatch[1]);
    const project = getProjectById(projectId);
    return project ? { projectId, projectName: project.name } : null;
  }

  // Match /issues/:issueId
  const issueMatch = path.match(/^\/issues\/(\d+)/);
  if (issueMatch) {
    const issueId = Number(issueMatch[1]);
    const issue = getIssueById(issueId);
    if (issue) {
      const project = getProjectById(issue.projectId);
      return project
        ? { projectId: project.id, projectName: project.name }
        : null;
    }
  }

  return null;
}

/**
 * Build breadcrumb items based on current path.
 */
function useBreadcrumbs() {
  const location = useLocation();
  const path = location.pathname;
  const items: { label: string; to?: string }[] = [];

  // /projects
  if (path === "/projects") {
    items.push({ label: "Projects" });
    return items;
  }

  // /settings
  if (path === "/settings") {
    items.push({ label: "Settings" });
    return items;
  }

  // /projects/:projectId
  const projectMatch = path.match(/^\/projects\/(\d+)/);
  if (projectMatch) {
    const projectId = Number(projectMatch[1]);
    const project = getProjectById(projectId);
    const projectName = project?.name ?? `Project #${projectId}`;

    items.push({ label: "Projects", to: "/projects" });

    // /projects/:projectId (exactly)
    if (path === `/projects/${projectId}`) {
      items.push({ label: projectName, to: `/projects/${projectId}` });
      items.push({ label: "Issue一覧" });
      return items;
    }

    // /projects/:projectId/issues/new
    if (path.endsWith("/issues/new")) {
      items.push({ label: projectName, to: `/projects/${projectId}` });
      items.push({ label: "新規Issue" });
      return items;
    }

    items.push({ label: projectName });
    return items;
  }

  // /issues/:issueId
  const issueMatch = path.match(/^\/issues\/(\d+)/);
  if (issueMatch) {
    const issueId = Number(issueMatch[1]);
    const issue = getIssueById(issueId);
    if (issue) {
      const project = getProjectById(issue.projectId);
      const projectName = project?.name ?? `Project #${issue.projectId}`;
      const issueTitle =
        issue.title.length > 24 ? issue.title.slice(0, 24) + "…" : issue.title;

      items.push({ label: "Projects", to: "/projects" });
      items.push({
        label: projectName,
        to: `/projects/${issue.projectId}`,
      });
      items.push({
        label: "Issue一覧",
        to: `/projects/${issue.projectId}`,
      });
      items.push({ label: issueTitle });
      return items;
    }
  }

  return items;
}

export default function AppLayout() {
  const projectContext = useProjectContext();
  const breadcrumbs = useBreadcrumbs();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100/60">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-800 bg-gray-900">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-800">
          <Link to="/projects" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">IC</span>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              IssueCreator
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <SidebarLink to="/projects" label="Projects" icon="◫" end />

          {projectContext && (
            <>
              <div className="mt-5 mb-2 px-3">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {projectContext.projectName}
                </span>
              </div>
              <SidebarLink
                to={`/projects/${projectContext.projectId}`}
                label="Issue一覧"
                icon="▤"
                end
              />
              <SidebarLink
                to={`/projects/${projectContext.projectId}/issues/new`}
                label="新規Issue"
                icon="＋"
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

        {/* Footer */}
        <div className="border-t border-gray-800 px-4 py-3">
          <p className="text-[10px] text-gray-600">v0.1.0 · Mock Mode</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-2.5">
          {/* Breadcrumb */}
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

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {projectContext && (
              <Link
                to={`/projects/${projectContext.projectId}/issues/new`}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                ＋ 新規Issue
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
