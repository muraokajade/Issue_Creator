import type { Project, Issue, AppSettings } from "./types";

export const mockProjects: Project[] = [
  {
    id: 1,
    name: "IssueCreator",
    description: "個人開発向けIssueベース進捗管理アプリ",
    techStack: ["React", "TypeScript", "Django", "SQLite"],
    repositoryUrl: "https://github.com/user/issue-creator",
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-06-25T14:30:00Z",
  },
  {
    id: 2,
    name: "PropertyAnalyzer",
    description: "不動産物件の収益性を自動分析するCLIツール",
    techStack: ["Python", "Django", "PostgreSQL"],
    repositoryUrl: "https://github.com/user/property-analyzer",
    createdAt: "2026-05-10T09:00:00Z",
    updatedAt: "2026-06-20T11:00:00Z",
  },
  {
    id: 3,
    name: "StudyLog",
    description: "技術学習の進捗を記録・振り返るアプリ",
    techStack: ["Next.js", "TypeScript", "Supabase"],
    repositoryUrl: undefined,
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-22T16:00:00Z",
  },
];

export const mockIssues: Issue[] = [
  {
    id: 1,
    projectId: 1,
    title: "expense-initial APIを作る",
    status: "in_progress",
    issueType: "feature",
    priority: "high",
    rawMemo:
      "serviceは完成済み。Reactから呼びたい。APIテストも通したい。URL末尾スラッシュとDecimal比較で少し詰まった。",
    background:
      "解体費単価計算serviceは完成しているが、Reactから利用するためのAPIがまだ整っていない。",
    goal: "get_expense_initial の結果をJSONで返すAPIを用意し、React側から参照できる状態にする。",
    acceptanceCriteria: [
      "GET /api/properties/{id}/expense-initial/ が200を返す",
      "JSONに propertyId, demolitionQuantity, demolitionUnitPrice, demolitionCost が含まれる",
      "存在しない property_id では404を返す",
      "APIテストが通る",
    ],
    nextAction:
      "views.py に expense_initial_view を追加し、urls.py にルーティングを定義する",
    githubIssueUrl: undefined,
    logs: [
      {
        id: 1,
        issueId: 1,
        logType: "investigation",
        content:
          "reverse の使い方を確認した。reverse('expense-initial', args=[property_id]) で呼べる。",
        createdAt: "2026-06-25T10:30:00Z",
        updatedAt: "2026-06-25T10:30:00Z",
      },
      {
        id: 2,
        issueId: 1,
        logType: "blocker",
        content:
          "URL末尾スラッシュなしで404になった。Django の APPEND_SLASH 設定を確認する必要あり。",
        createdAt: "2026-06-25T11:15:00Z",
        updatedAt: "2026-06-25T11:15:00Z",
      },
      {
        id: 3,
        issueId: 1,
        logType: "blocker",
        content:
          "response.data の Decimal 比較でテストが落ちた。JSON化すると文字列になるため、期待値側も str() で比較するか Decimal を使う必要がある。",
        createdAt: "2026-06-25T14:00:00Z",
        updatedAt: "2026-06-25T14:00:00Z",
      },
      {
        id: 4,
        issueId: 1,
        logType: "decision",
        content:
          "期待値を Decimal に直す方針に決定。テストの一貫性を保つため、全テストで Decimal 比較に統一する。",
        createdAt: "2026-06-25T14:30:00Z",
        updatedAt: "2026-06-25T14:30:00Z",
      },
    ],
    createdAt: "2026-06-24T09:00:00Z",
    updatedAt: "2026-06-25T14:30:00Z",
  },
  {
    id: 2,
    projectId: 1,
    title: "Issue詳細画面のMock UIを作る",
    status: "done",
    issueType: "feature",
    priority: "medium",
    rawMemo:
      "IssueCreatorのfrontendにIssue詳細画面を追加する。Tailwind CSSを導入してMock UIを作成。",
    background:
      "IssueCreatorのfrontendが初期状態のままであり、Issue詳細画面が存在しない。",
    goal: "Issue詳細画面のMock UIを作り、UIコンポーネントの構成とデザイン方針を確定する。",
    acceptanceCriteria: [
      "Issue詳細画面が表示される",
      "Log追加ができる",
      "状態変更ができる",
      "Tailwind CSSが動作する",
    ],
    nextAction: "完了済み",
    githubIssueUrl: "https://github.com/user/issue-creator/issues/1",
    logs: [
      {
        id: 5,
        issueId: 2,
        logType: "implementation",
        content: "Tailwind CSS v4をViteプラグインとして導入した。",
        createdAt: "2026-06-23T10:00:00Z",
        updatedAt: "2026-06-23T10:00:00Z",
      },
      {
        id: 6,
        issueId: 2,
        logType: "decision",
        content: "UIライブラリは使わず、TailwindのみでUIを構成する方針に決定。",
        createdAt: "2026-06-23T11:00:00Z",
        updatedAt: "2026-06-23T11:00:00Z",
      },
    ],
    createdAt: "2026-06-22T09:00:00Z",
    updatedAt: "2026-06-24T16:00:00Z",
  },
  {
    id: 3,
    projectId: 1,
    title: "Django REST Framework のセットアップ",
    status: "todo",
    issueType: "setup",
    priority: "high",
    rawMemo: "DRFを入れる。serializer, viewset, router の基本構成を作る。",
    background:
      "フロントとバックエンドを接続するためにDjango REST Frameworkが必要。",
    goal: "DRFの基本設定を完了し、最初のAPI endpoint が動く状態にする。",
    acceptanceCriteria: [
      "django-rest-framework がインストールされる",
      "settings.py に REST_FRAMEWORK 設定がある",
      "GET /api/health/ が200を返す",
    ],
    nextAction:
      "pip install djangorestframework を実行し、settings.py に追加する",
    githubIssueUrl: undefined,
    logs: [],
    createdAt: "2026-06-25T16:00:00Z",
    updatedAt: "2026-06-25T16:00:00Z",
  },
  {
    id: 4,
    projectId: 1,
    title: "Issue作成画面のAI生成フロー実装",
    status: "todo",
    issueType: "feature",
    priority: "medium",
    rawMemo: "雑メモを入力→AI生成→プレビュー→採用/破棄のフローを作りたい。",
    background:
      "IssueCreatorのコア機能として、雑メモからAIでIssue構造を生成するフローが必要。",
    goal: "Issue作成画面でAI生成→プレビュー→採用の流れが動く状態にする。",
    acceptanceCriteria: [
      "雑メモ入力後にAI生成ボタンを押せる",
      "生成結果がプレビュー表示される",
      "採用/破棄を選べる",
      "採用時にIssueが保存される",
    ],
    nextAction: "Issue作成画面のMock UIを先に作る",
    githubIssueUrl: undefined,
    logs: [],
    createdAt: "2026-06-26T09:00:00Z",
    updatedAt: "2026-06-26T09:00:00Z",
  },
  {
    id: 5,
    projectId: 1,
    title: "Logの種別フィルタ機能",
    status: "processed",
    issueType: "feature",
    priority: "low",
    rawMemo: "Log一覧で種別ごとにフィルタしたい。blockerだけ見たいことがある。",
    background: "Logが増えると全部見るのが辛い。種別フィルタがあると便利。",
    goal: "Log一覧に種別フィルタを追加し、特定種別のLogだけ表示できるようにする。",
    acceptanceCriteria: [
      "種別セレクトで絞り込める",
      "全表示に戻せる",
      "フィルタ状態がURLに残らなくてよい",
    ],
    nextAction: "GitHub Issue として反映し、完了確認する",
    githubIssueUrl: undefined,
    logs: [
      {
        id: 7,
        issueId: 5,
        logType: "implementation",
        content:
          "IssueLogList に filterType state を追加し、select で切り替える実装にした。",
        createdAt: "2026-06-24T13:00:00Z",
        updatedAt: "2026-06-24T13:00:00Z",
      },
    ],
    createdAt: "2026-06-23T09:00:00Z",
    updatedAt: "2026-06-24T13:00:00Z",
  },
  {
    id: 6,
    projectId: 2,
    title: "収益率計算ロジックの実装",
    status: "in_progress",
    issueType: "feature",
    priority: "high",
    rawMemo: "NOI利回りと表面利回りの計算を実装する。",
    background: "物件の収益性評価に利回り計算が必要。",
    goal: "NOI利回りと表面利回りを計算するサービスを実装する。",
    acceptanceCriteria: [
      "NOI利回りが計算できる",
      "表面利回りが計算できる",
      "テストが通る",
    ],
    nextAction: "NOI利回りの計算式を確認し、サービスクラスに実装する",
    githubIssueUrl: undefined,
    logs: [
      {
        id: 8,
        issueId: 6,
        logType: "investigation",
        content: "NOI = 賃料収入 - 運営費用。利回り = NOI / 物件価格 × 100。",
        createdAt: "2026-06-20T10:00:00Z",
        updatedAt: "2026-06-20T10:00:00Z",
      },
    ],
    createdAt: "2026-06-19T09:00:00Z",
    updatedAt: "2026-06-20T10:00:00Z",
  },
  {
    id: 7,
    projectId: 3,
    title: "Supabase認証のセットアップ",
    status: "todo",
    issueType: "setup",
    priority: "medium",
    rawMemo: "Supabaseのauth機能を使ってログインを実装したい。",
    background: "StudyLogはユーザーごとのデータを持つため認証が必要。",
    goal: "Supabase Authでメール/パスワードログインができる状態にする。",
    acceptanceCriteria: [
      "サインアップできる",
      "ログインできる",
      "ログアウトできる",
      "認証状態がUIに反映される",
    ],
    nextAction: "Supabaseプロジェクトを作成し、環境変数を設定する",
    githubIssueUrl: undefined,
    logs: [],
    createdAt: "2026-06-22T09:00:00Z",
    updatedAt: "2026-06-22T09:00:00Z",
  },
];

export const mockSettings: AppSettings = {
  aiModel: "gpt-4o",
  repositoryUrl: "https://github.com/user/issue-creator",
  githubConnected: true,
  templates: [
    {
      id: 1,
      issueType: "feature",
      defaultAcceptanceCriteria: [
        "機能が正常に動作する",
        "エラーハンドリングがある",
        "テストが通る",
      ],
      defaultNextAction: "要件を整理し、設計を決める",
    },
    {
      id: 2,
      issueType: "bug",
      defaultAcceptanceCriteria: [
        "バグが再現しなくなる",
        "既存テストが通る",
        "回帰テストを追加する",
      ],
      defaultNextAction: "バグの再現手順を確認する",
    },
    {
      id: 3,
      issueType: "setup",
      defaultAcceptanceCriteria: [
        "セットアップが完了する",
        "動作確認ができる",
        "READMEに手順を追記する",
      ],
      defaultNextAction: "必要なパッケージを確認し、インストールする",
    },
  ],
};

// Helper: get issues for a project
export function getIssuesByProject(projectId: number): Issue[] {
  return mockIssues.filter((i) => i.projectId === projectId);
}

// Helper: get issue by id
export function getIssueById(issueId: number): Issue | undefined {
  return mockIssues.find((i) => i.id === issueId);
}

// Helper: get project by id
export function getProjectById(projectId: number): Project | undefined {
  return mockProjects.find((p) => p.id === projectId);
}

// Helper: count issues by status for a project
export function getStatusCounts(projectId: number) {
  const issues = getIssuesByProject(projectId);
  return {
    todo: issues.filter((i) => i.status === "todo").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    processed: issues.filter((i) => i.status === "processed").length,
    done: issues.filter((i) => i.status === "done").length,
  };
}
