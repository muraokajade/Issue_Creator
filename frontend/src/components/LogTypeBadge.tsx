import type { LogType } from "../types";
import { LOG_TYPE_LABELS } from "../types";

const LOG_TYPE_COLORS: Record<LogType, string> = {
  note: "bg-gray-100 text-gray-600",
  investigation: "bg-indigo-50 text-indigo-600",
  implementation: "bg-emerald-50 text-emerald-700",
  check: "bg-sky-50 text-sky-600",
  blocker: "bg-red-50 text-red-600",
  decision: "bg-purple-50 text-purple-600",
};

interface LogTypeBadgeProps {
  logType: LogType;
}

export default function LogTypeBadge({ logType }: LogTypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${LOG_TYPE_COLORS[logType]}`}
    >
      {LOG_TYPE_LABELS[logType]}
    </span>
  );
}
