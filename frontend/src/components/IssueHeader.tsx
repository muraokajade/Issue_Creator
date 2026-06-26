import type { Issue, IssueStatus } from "../types";
import { ISSUE_TYPE_LABELS, STATUS_LABELS } from "../types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

interface IssueHeaderProps {
  issue: Issue;
  onStatusChange: (status: IssueStatus) => void;
  onGenerateMarkdown: () => void;
  onCopyMarkdown: () => void;
}

const STATUS_LIST: IssueStatus[] = ["todo", "in_progress", "processed", "done"];

const STATUS_BUTTON_COLORS: Record<
  IssueStatus,
  { active: string; inactive: string }
> = {
  todo: {
    active: "bg-gray-700 text-white border-gray-700",
    inactive:
      "bg-transparent text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600",
  },
  in_progress: {
    active: "bg-blue-600 text-white border-blue-600",
    inactive:
      "bg-transparent text-blue-400 border-blue-200 hover:border-blue-400 hover:text-blue-600",
  },
  processed: {
    active: "bg-amber-500 text-white border-amber-500",
    inactive:
      "bg-transparent text-amber-400 border-amber-200 hover:border-amber-400 hover:text-amber-600",
  },
  done: {
    active: "bg-green-600 text-white border-green-600",
    inactive:
      "bg-transparent text-green-400 border-green-200 hover:border-green-400 hover:text-green-600",
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IssueHeader({
  issue,
  onStatusChange,
  onGenerateMarkdown,
  onCopyMarkdown,
}: IssueHeaderProps) {
  const handleAiOrganize = () => {
    alert("AI整理機能は今後実装予定です（OpenAI API接続時）");
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
      {/* 上段: タイトル + メタ情報 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-gray-900 leading-tight break-words">
            {issue.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={issue.status} />
            <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
              {ISSUE_TYPE_LABELS[issue.issueType]}
            </span>
            <PriorityBadge priority={issue.priority} />
            <span className="text-[11px] text-gray-400">·</span>
            {issue.githubIssueUrl ? (
              <a
                href={issue.githubIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-500 hover:text-blue-700 hover:underline"
              >
                GitHub連携済み
              </a>
            ) : (
              <span className="text-[11px] text-gray-400">GitHub未連携</span>
            )}
          </div>
        </div>
        <div className="text-right text-[11px] text-gray-400 whitespace-nowrap leading-relaxed">
          <div>作成 {formatDate(issue.createdAt)}</div>
          <div>更新 {formatDate(issue.updatedAt)}</div>
        </div>
      </div>

      {/* 下段: 状態変更 + 補助アクション */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
        {STATUS_LIST.map((status) => {
          const isActive = issue.status === status;
          const colors = STATUS_BUTTON_COLORS[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={`rounded border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                isActive ? colors.active : colors.inactive
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}

        {/* 補助アクション - 右寄せ */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleAiOrganize}
            className="rounded px-2 py-1 text-[11px] text-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            AI整理
          </button>
          <button
            type="button"
            onClick={onGenerateMarkdown}
            className="rounded px-2 py-1 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            MD生成
          </button>
          <button
            type="button"
            onClick={onCopyMarkdown}
            className="rounded px-2 py-1 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            MDコピー
          </button>
        </div>
      </div>
    </div>
  );
}
