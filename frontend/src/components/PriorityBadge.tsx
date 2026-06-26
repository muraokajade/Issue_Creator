import type { IssuePriority } from "../types";
import { PRIORITY_LABELS } from "../types";

const PRIORITY_COLORS: Record<IssuePriority, string> = {
  low: "text-gray-500",
  medium: "text-amber-600",
  high: "text-red-600",
};

interface PriorityBadgeProps {
  priority: IssuePriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold ${PRIORITY_COLORS[priority]}`}
    >
      {priority === "high" && "▲ "}
      {priority === "medium" && "● "}
      {priority === "low" && "▽ "}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
