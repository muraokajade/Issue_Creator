import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectById, getIssuesByProject } from "../mockData";
import type { Issue, IssueStatus, IssueType } from "../types";
import { STATUS_LABELS, ISSUE_TYPE_LABELS } from "../types";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const STATUS_LIST: IssueStatus[] = ["todo", "in_progress", "processed", "done"];

// --- Focus Card ---
function FocusCard({
  issues,
  projectId,
}: {
  issues: Issue[];
  projectId: number;
}) {
  const inProgress = issues.filter((i) => i.status === "in_progress");
  const currentIssue = inProgress.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];

  if (currentIssue) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-green-50 to-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Focus
          </span>
          <span className="text-xs font-medium text-emerald-700">
            今日の開発フォーカス
          </span>
        </div>
        <Link to={`/issues/${currentIssue.id}`} className="group block">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
            {currentIssue.title}
          </h3>
          <p className="mt-1.5 text-sm text-emerald-700 font-medium">
            → {currentIssue.nextAction}
          </p>
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <Link
            to={`/issues/${currentIssue.id}`}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            作業を続ける
          </Link>
          <Link
            to={`/projects/${projectId}/issues/new`}
            className="rounded-md border border-purple-300 bg-white px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
          >
            ✦ 雑メモからIssueを作る
          </Link>
        </div>
      </div>
    );
  }

  // No in-progress issues
  return (
    <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
          Next
        </span>
        <span className="text-xs font-medium text-purple-700">
          次の作業を決めましょう
        </span>
      </div>
      <p className="text-sm text-gray-700">
        処理中のIssueがありません。雑メモから次のIssueを作りましょう。
      </p>
      <div className="mt-3">
        <Link
          to={`/projects/${projectId}/issues/new`}
          className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-600 hover:to-indigo-700 transition-all shadow-sm"
        >
          <span>✦</span>
          <span>雑メモからIssueを作る</span>
        </Link>
      </div>
    </div>
  );
}

// --- Alerts Card ---
function AlertsCard({ issues }: { issues: Issue[] }) {
  const noNextAction = issues.filter(
    (i) => i.status !== "done" && !i.nextAction.trim(),
  ).length;
  const hasBlocker = issues.filter(
    (i) => i.status !== "done" && i.logs.some((l) => l.logType === "blocker"),
  ).length;
  const processedNotDone = issues.filter(
    (i) => i.status === "processed",
  ).length;

  if (noNextAction === 0 && hasBlocker === 0 && processedNotDone === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
        気になるIssue
      </h4>
      <div className="flex flex-wrap gap-3">
        {hasBlocker > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">
              詰まり中 <span className="font-semibold">{hasBlocker}</span>
            </span>
          </div>
        )}
        {processedNotDone > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-600">
              処理済み未完了{" "}
              <span className="font-semibold">{processedNotDone}</span>
            </span>
          </div>
        )}
        {noNextAction > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-xs text-gray-600">
              次の一手なし <span className="font-semibold">{noNextAction}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Issue Card ---
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

// --- Empty State ---
function EmptyState({ projectId }: { projectId: number }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/20 p-8 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-3">
        <span className="text-xl">✦</span>
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-1">
        まだIssueがありません
      </h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
        雑メモを貼るとAIがIssue案に整理します。
        <br />
        最初から完璧に書く必要はありません。
      </p>
      <Link
        to={`/projects/${projectId}/issues/new`}
        className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-600 hover:to-indigo-700 transition-all shadow-sm"
      >
        <span>✦</span>
        <span>雑メモからIssueを作る</span>
      </Link>
    </div>
  );
}

// --- Main Page ---
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
      {/* Project header - compact */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500"
              >
                {tech}
              </span>
            ))}
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
      </div>

      {/* Focus Card - primary */}
      <FocusCard issues={allIssues} projectId={Number(projectId)} />

      {/* Alerts + Status counts - secondary row */}
      <div className="mt-4 flex flex-wrap items-start gap-4">
        {/* Alerts */}
        <div className="flex-1 min-w-0">
          <AlertsCard issues={allIssues} />
        </div>

        {/* Status counts - compact inline */}
        <div className="shrink-0 flex items-center gap-1">
          {STATUS_LIST.map((status) => {
            const isSelected = statusFilter === status;
            const count = statusCounts[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(isSelected ? "all" : status)}
                className={`rounded-md border px-2.5 py-1.5 text-center transition-all min-w-[52px] ${
                  isSelected
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-bold text-gray-800">{count}</p>
                <p className="text-[10px] text-gray-400">
                  {STATUS_LABELS[status]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Issues section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">Issues</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 w-36"
            />
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as IssueType | "all")
              }
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 focus:border-blue-400 focus:outline-none"
            >
              <option value="all">全種別</option>
              {Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-gray-400">
              {filteredIssues.length}/{allIssues.length}
            </span>
          </div>
        </div>

        {/* Issue list */}
        {allIssues.length === 0 ? (
          <EmptyState projectId={Number(projectId)} />
        ) : filteredIssues.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-400">該当するIssueがありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIssues
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              )
              .map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
