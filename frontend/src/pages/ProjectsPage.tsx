import { Link } from "react-router-dom";
import { mockProjects } from "../mockData";
import { getStatusCounts, getIssuesByProject } from "../mockData";
import type { IssueStatus } from "../types";
import { STATUS_LABELS } from "../types";

const STATUS_DOT_COLORS: Record<IssueStatus, string> = {
  todo: "bg-gray-400",
  in_progress: "bg-blue-500",
  processed: "bg-amber-500",
  done: "bg-green-500",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            作業対象のProjectを選んでください
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          onClick={() => alert("新規Project作成は今後実装予定です")}
        >
          ＋ 新規Project
        </button>
      </div>

      <div className="space-y-3">
        {mockProjects.map((project) => {
          const counts = getStatusCounts(project.id);
          const issues = getIssuesByProject(project.id);
          const recentIssue = issues.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )[0];

          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {project.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {/* Status counts */}
                  <div className="flex items-center gap-3">
                    {(Object.entries(counts) as [IssueStatus, number][]).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center gap-1"
                          title={STATUS_LABELS[status]}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`}
                          />
                          <span className="text-xs font-medium text-gray-500">
                            {count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    更新{" "}
                    {new Date(project.updatedAt).toLocaleDateString("ja-JP", {
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Recent issue */}
              {recentIssue && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">最近の作業:</p>
                  <p className="text-xs text-gray-600 mt-0.5 truncate">
                    {recentIssue.title}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
