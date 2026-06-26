import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectById, getIssuesByProject } from "../mockData";
import type { Issue, IssueStatus, IssueType } from "../types";
import { STATUS_LABELS, ISSUE_TYPE_LABELS } from "../types";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const STATUS_LIST: IssueStatus[] = ["todo", "in_progress", "processed", "done"];

function IssueCard({ issue }: { issue: Issue }) {
  const isActive = issue.status === "in_progress";
  const isDone = issue.status === "done";

  return (
    <Link
      to={`/issues/${issue.id}`}
      className={`block rounded-lg border px-4 py-3 transition-all group ${
        isActive
          ? "border-l-[3px] border-l-blue-500 border-t-gray-200 border-r-gray-200 border-b-gray-200 bg-blue-50/40 hover:bg-blue-50/70 hover:border-gray-300"
          : isDone
            ? "border-gray-200 bg-gray-50/50 hover:border-gray-300 opacity-70"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={issue.status} />
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              {ISSUE_TYPE_LABELS[issue.issueType]}
            </span>
            <PriorityBadge priority={issue.priority} />
          </div>
          <h3
            className={`text-sm font-semibold transition-colors truncate ${
              isDone
                ? "text-gray-500 group-hover:text-gray-700"
                : "text-gray-800 group-hover:text-blue-600"
            }`}
          >
            {issue.title}
          </h3>
          {issue.nextAction && issue.status !== "done" && (
            <p className="mt-1 text-xs text-emerald-600 truncate">
              → {issue.nextAction}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-gray-400">
            {new Date(issue.updatedAt).toLocaleDateString("ja-JP", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="mt-1 flex items-center gap-2 justify-end">
            {issue.logs.length > 0 && (
              <span className="text-[10px] text-gray-400">
                Log {issue.logs.length}
              </span>
            )}
            {issue.githubIssueUrl && (
              <span className="text-[10px] text-gray-400">GitHub ✓</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const project = getProjectById(Number(projectId));
  const allIssues = getIssuesByProject(Number(projectId));

  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");
  const [search, setSearch] = useState("");

  if (!project) {
    return (
      <div className="p-8 text-center text-gray-500">
        Project が見つかりません
      </div>
    );
  }

  const filteredIssues = allIssues.filter((issue) => {
    if (statusFilter !== "all" && issue.status !== statusFilter) return false;
    if (typeFilter !== "all" && issue.issueType !== typeFilter) return false;
    if (search && !issue.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const statusCounts = STATUS_LIST.reduce(
    (acc, s) => {
      acc[s] = allIssues.filter((i) => i.status === s).length;
      return acc;
    },
    {} as Record<IssueStatus, number>,
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      {/* Project header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500"
              >
                {tech}
              </span>
            ))}
          </div>
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-500 hover:text-blue-700 hover:underline"
            >
              Repository ↗
            </a>
          )}
        </div>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {STATUS_LIST.map((status) => {
          const isSelected = statusFilter === status;
          const count = statusCounts[status];
          const colorMap: Record<IssueStatus, string> = {
            todo: isSelected
              ? "border-gray-400 bg-gray-50"
              : "border-gray-200 bg-white",
            in_progress: isSelected
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 bg-white",
            processed: isSelected
              ? "border-amber-400 bg-amber-50"
              : "border-gray-200 bg-white",
            done: isSelected
              ? "border-green-400 bg-green-50"
              : "border-gray-200 bg-white",
          };

          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(isSelected ? "all" : status)}
              className={`rounded-lg border p-3 text-center transition-all hover:shadow-sm ${colorMap[status]}`}
            >
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {STATUS_LABELS[status]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="キーワード検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 w-48"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as IssueType | "all")}
          className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:border-blue-400 focus:outline-none"
        >
          <option value="all">全種別</option>
          {Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-[11px] text-gray-400">
          {filteredIssues.length} / {allIssues.length} Issues
        </span>
      </div>

      {/* Issue list */}
      <div className="space-y-2">
        {filteredIssues.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-400">該当するIssueがありません</p>
          </div>
        ) : (
          filteredIssues
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )
            .map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  );
}
