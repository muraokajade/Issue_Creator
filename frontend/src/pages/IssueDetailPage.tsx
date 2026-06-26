import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Issue, IssueLog, IssueStatus } from "../types";
import { getIssueById, getProjectById } from "../mockData";
import IssueHeader from "../components/IssueHeader";
import IssueBody from "../components/IssueBody";
import IssueLogForm from "../components/IssueLogForm";
import IssueLogList from "../components/IssueLogList";
import MarkdownPreview from "../components/MarkdownPreview";

function generateMarkdown(issue: Issue): string {
  const logSection = issue.logs
    .map((log) => `- **[${log.logType}]** ${log.content}`)
    .join("\n");

  return `## Background

${issue.background}

## Goal

${issue.goal}

## Acceptance Criteria

${issue.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}

## Next Action

${issue.nextAction}

## Logs

${logSection || "_No logs yet._"}
`;
}

export default function IssueDetailPage() {
  const { issueId } = useParams();
  const initialIssue = getIssueById(Number(issueId));

  const [issue, setIssue] = useState<Issue | undefined>(initialIssue);
  const [markdownPreviewVisible, setMarkdownPreviewVisible] = useState(false);
  const [markdown, setMarkdown] = useState("");

  if (!issue) {
    return (
      <div className="p-8 text-center text-gray-500">
        Issue が見つかりません
      </div>
    );
  }

  const project = getProjectById(issue.projectId);
  const projectName = project?.name ?? "Project";

  const handleStatusChange = (status: IssueStatus) => {
    setIssue((prev) =>
      prev ? { ...prev, status, updatedAt: new Date().toISOString() } : prev,
    );
  };

  const handleAddLog = (log: IssueLog) => {
    setIssue((prev) =>
      prev
        ? {
            ...prev,
            logs: [...prev.logs, log],
            updatedAt: new Date().toISOString(),
          }
        : prev,
    );
  };

  const handleDeleteLog = (logId: number) => {
    setIssue((prev) =>
      prev
        ? {
            ...prev,
            logs: prev.logs.filter((l) => l.id !== logId),
            updatedAt: new Date().toISOString(),
          }
        : prev,
    );
  };

  const handleGenerateMarkdown = () => {
    const md = generateMarkdown(issue);
    setMarkdown(md);
    setMarkdownPreviewVisible(true);
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdown(issue);
    try {
      await navigator.clipboard.writeText(md);
      alert("Markdownをコピーしました");
    } catch {
      console.log("Clipboard API unavailable. Markdown:", md);
      alert("コピーに失敗しました（コンソールに出力済み）");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-5">
      {/* 戻るリンク */}
      <div className="mb-4">
        <Link
          to={`/projects/${issue.projectId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <span>←</span>
          <span>{projectName} のIssue一覧に戻る</span>
        </Link>
      </div>

      {/* Issue概要カード */}
      <IssueHeader
        issue={issue}
        onStatusChange={handleStatusChange}
        onGenerateMarkdown={handleGenerateMarkdown}
        onCopyMarkdown={handleCopyMarkdown}
      />

      {/* 主導線エリア: Next Action + Log入力 */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        {/* Next Action */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wide">
                Next
              </span>
              <span className="text-xs font-medium text-emerald-700">
                今やること
              </span>
            </div>
            <p className="text-[15px] font-semibold text-gray-900 leading-relaxed">
              {issue.nextAction}
            </p>
          </div>
        </div>

        {/* Log入力 */}
        <div className="lg:col-span-3">
          <IssueLogForm issueId={issue.id} onAddLog={handleAddLog} />
        </div>
      </div>

      {/* コンテンツエリア: Log一覧 + 参照情報 */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        {/* Log一覧 */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              作業ログ
            </h3>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500">
              {issue.logs.length}
            </span>
          </div>
          <IssueLogList logs={issue.logs} onDeleteLog={handleDeleteLog} />
        </div>

        {/* 参照情報 */}
        <div className="lg:col-span-2 space-y-4">
          <IssueBody issue={issue} />
          {markdownPreviewVisible && (
            <MarkdownPreview
              markdown={markdown}
              onClose={() => setMarkdownPreviewVisible(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
