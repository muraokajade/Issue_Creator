import { useState } from "react";
import type { Issue } from "../types";

interface IssueBodyProps {
  issue: Issue;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2.5 text-left group"
      >
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">
          {title}
        </span>
        <svg
          className={`h-3 w-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

export default function IssueBody({ issue }: IssueBodyProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          Issue情報
        </h3>
        <button
          type="button"
          className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => alert("Issue情報の編集画面は今後実装予定です")}
        >
          編集
        </button>
      </div>

      <CollapsibleSection title="雑メモ" defaultOpen>
        <p className="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed">
          {issue.rawMemo}
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="背景">
        <p className="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed">
          {issue.background}
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="目的">
        <p className="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed">
          {issue.goal}
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="完了条件" defaultOpen>
        <ul className="space-y-1 text-xs text-gray-600 leading-relaxed">
          {issue.acceptanceCriteria.map((criterion, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-gray-400 shrink-0">•</span>
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
}
