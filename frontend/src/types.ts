// === Enum Types ===

export type IssueStatus = "todo" | "in_progress" | "processed" | "done";

export type IssueType =
  | "feature"
  | "bug"
  | "research"
  | "learning"
  | "test"
  | "refactor"
  | "setup";

export type IssuePriority = "low" | "medium" | "high";

export type LogType =
  | "note"
  | "investigation"
  | "implementation"
  | "check"
  | "blocker"
  | "decision";

// === Data Models ===

export interface IssueLog {
  id: number;
  issueId: number;
  logType: LogType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: number;
  projectId: number;
  title: string;
  status: IssueStatus;
  issueType: IssueType;
  priority: IssuePriority;
  rawMemo: string;
  background: string;
  goal: string;
  acceptanceCriteria: string[];
  nextAction: string;
  githubIssueUrl?: string;
  logs: IssueLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  techStack: string[];
  repositoryUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueTemplate {
  id: number;
  issueType: IssueType;
  defaultAcceptanceCriteria: string[];
  defaultNextAction: string;
}

export interface AppSettings {
  aiModel: string;
  repositoryUrl: string;
  githubConnected: boolean;
  templates: IssueTemplate[];
}

// === Label Maps ===

export const STATUS_LABELS: Record<IssueStatus, string> = {
  todo: "未対応",
  in_progress: "処理中",
  processed: "処理済み",
  done: "完了",
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  feature: "機能追加",
  bug: "バグ修正",
  research: "調査",
  learning: "学習",
  test: "テスト",
  refactor: "リファクタ",
  setup: "環境構築",
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export const LOG_TYPE_LABELS: Record<LogType, string> = {
  note: "メモ",
  investigation: "調査",
  implementation: "実装",
  check: "確認",
  blocker: "詰まり",
  decision: "判断",
};
