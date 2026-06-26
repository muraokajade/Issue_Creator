import type { IssueLog } from "../types";
import LogTypeBadge from "./LogTypeBadge";

interface IssueLogListProps {
  logs: IssueLog[];
  onDeleteLog: (logId: number) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IssueLogList({ logs, onDeleteLog }: IssueLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-400">
        Logはまだありません。上の入力欄から作業メモを追加できます。
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {[...logs].reverse().map((log) => (
        <div
          key={log.id}
          className="group rounded-lg border border-gray-150 bg-white px-3.5 py-2.5 hover:border-gray-250 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <LogTypeBadge logType={log.logType} />
                <span className="text-[11px] text-gray-400">
                  {formatDate(log.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                {log.content}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDeleteLog(log.id)}
              className="shrink-0 rounded p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-400 transition-all"
              aria-label="削除"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
