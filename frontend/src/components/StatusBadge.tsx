import type { IssueStatus } from "../types";
import { STATUS_LABELS } from "../types";

const STATUS_COLORS: Record<IssueStatus, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  processed: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
};

interface StatusBadgeProps {
  status: IssueStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
