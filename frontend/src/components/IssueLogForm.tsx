import { useState } from "react";
import type { LogType, IssueLog } from "../types";
import { LOG_TYPE_LABELS } from "../types";

const LOG_TYPES: LogType[] = [
  "note",
  "investigation",
  "implementation",
  "check",
  "blocker",
  "decision",
];

interface IssueLogFormProps {
  issueId: number;
  onAddLog: (log: IssueLog) => void;
}

export default function IssueLogForm({ issueId, onAddLog }: IssueLogFormProps) {
  const [logType, setLogType] = useState<LogType>("note");
  const [content, setContent] = useState("");

  const hasContent = content.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasContent) return;

    const now = new Date().toISOString();
    const newLog: IssueLog = {
      id: Date.now(),
      issueId,
      logType,
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    onAddLog(newLog);
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">
          作業メモを残す
        </span>
        <span className="text-[11px] text-gray-400">
          調べたこと、やったこと、詰まったことを雑に残せます
        </span>
      </div>
      <div className="flex items-end gap-2">
        <select
          value={logType}
          onChange={(e) => setLogType(e.target.value as LogType)}
          aria-label="Log種別"
          className="shrink-0 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-600 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-200"
        >
          {LOG_TYPES.map((type) => (
            <option key={type} value={type}>
              {LOG_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          placeholder="調べたこと、やったこと、詰まったことを残す"
          className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 resize-none leading-relaxed"
        />
        <button
          type="submit"
          disabled={!hasContent}
          className={`shrink-0 rounded px-4 py-1.5 text-sm font-semibold transition-all ${
            hasContent
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          追加
        </button>
      </div>
    </form>
  );
}
