/**
 * API client for App Creator backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ApiError {
  error: string;
}

// === Issue Generation API ===

export interface GenerateIssueRequest {
  title: string;
  rawMemo: string;
  issueType: string;
  priority: string;
  intent?: string;
  currentState?: string;
  target?: string;
  constraints?: string;
  doneState?: string;
  clarifications?: Record<string, string>;
}

export interface IssueResult {
  title: string;
  background: string;
  goal: string;
  acceptanceCriteria: string[];
  nextAction: string;
}

export interface GenerateIssueResponse {
  phase: "questions" | "result";
  questions?: string[];
  result?: IssueResult;
}

export async function generateIssue(
  data: GenerateIssueRequest,
): Promise<GenerateIssueResponse> {
  const response = await fetch(`${API_BASE_URL}/issues/generate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err: ApiError = await response
      .json()
      .catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `API Error: ${response.status}`);
  }
  return response.json();
}

// === App Map API (段階型) ===

export interface AppMapRequest {
  mode: "check_or_candidates" | "generate_app_map";
  appName?: string;
  appIdeaMemo?: string;
  targetUser?: string;
  currentProblem?: string;
  currentWorkflow?: string;
  constraints?: string;
  appPurposeType?: string;
  skillLevel?: number;
  experienceLanguages?: string[];
  experienceFrameworks?: string[];
  availableTime?: string;
  selectedCandidate?: string;
  additionalAnswers?: Record<string, string>;
}

export interface AppMapCandidate {
  id: string;
  name: string;
  summary: string;
  targetUser: string;
  solves: string;
  difficulty: string;
  estimatedDays: string;
  firstWin: string;
}

export interface AppMapFeature {
  name: string;
  description: string;
}

// Response varies by status
export interface AppMapNeedMoreInfo {
  status: "need_more_info";
  questions: string[];
  reason: string;
}

export interface AppMapCandidates {
  status: "candidates";
  candidates: AppMapCandidate[];
}

export interface AppMapResult {
  status: "app_map";
  appName: string;
  concept: string;
  targetUser: string;
  problem: string;
  mvp: string[];
  nonMvp: string[];
  features: AppMapFeature[];
  screens: string[];
  apis: string[];
  dataModels: string[];
  nextPiece: string;
}

export type AppMapResponse =
  | AppMapNeedMoreInfo
  | AppMapCandidates
  | AppMapResult;

export async function generateAppMap(
  data: AppMapRequest,
): Promise<AppMapResponse> {
  const response = await fetch(`${API_BASE_URL}/app-map/generate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err: ApiError = await response
      .json()
      .catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `API Error: ${response.status}`);
  }
  return response.json();
}

// === Project / Checkpoint / IssueDraft DB API ===

export interface ProjectRecord {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CheckpointRecord {
  id: number;
  project: number;
  phase: string;
  current_goal: string;
  current_state: string;
  learned: string;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface IssueDraftRecord {
  id: number;
  project: number;
  title: string;
  background: string;
  purpose: string;
  acceptance_criteria: string;
  next_step: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function fetchProjects(): Promise<ProjectRecord[]> {
  const res = await fetch(`${API_BASE_URL}/projects/`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(data: {
  name: string;
  description?: string;
}): Promise<ProjectRecord> {
  const res = await fetch(`${API_BASE_URL}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function fetchCheckpoints(
  projectId: number,
): Promise<CheckpointRecord[]> {
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/checkpoints/`);
  if (!res.ok) throw new Error("Failed to fetch checkpoints");
  return res.json();
}

export async function createCheckpoint(
  projectId: number,
  data: {
    phase: string;
    current_goal: string;
    current_state: string;
    learned?: string;
    next_action?: string;
  },
): Promise<CheckpointRecord> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/checkpoints/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("Failed to create checkpoint");
  return res.json();
}

export async function fetchIssueDrafts(
  projectId: number,
): Promise<IssueDraftRecord[]> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/issue-drafts/`,
  );
  if (!res.ok) throw new Error("Failed to fetch issue drafts");
  return res.json();
}

export async function createIssueDraft(
  projectId: number,
  data: {
    title: string;
    background?: string;
    purpose?: string;
    acceptance_criteria?: string;
    next_step?: string;
  },
): Promise<IssueDraftRecord> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/issue-drafts/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("Failed to create issue draft");
  return res.json();
}
