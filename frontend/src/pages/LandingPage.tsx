import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 flex flex-col items-center justify-center px-6">
      <div className="max-w-xl text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white text-sm font-bold">AC</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            App Creator
          </span>
        </div>

        {/* Catchcopy */}
        <h1 className="text-3xl font-bold text-white leading-tight mb-4">
          AIと開発しても、
          <br />
          現在地を見失わない
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-md mx-auto">
          作りたいアプリの雑メモから、MVP・非MVP・主要機能・画面・API・データモデル候補を整理し、アプリ地図を作ります。地図のピースからIssueを作ることで、KiroやVSCodeで次に何を実装するかが明確になります。
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/projects/1/app-map"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            🗺 アプリ地図を作る
          </Link>
          <Link
            to="/projects"
            className="rounded-lg border border-gray-700 bg-gray-800/50 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Demo Projects を見る
          </Link>
        </div>

        {/* Subtle footer */}
        <p className="mt-12 text-[11px] text-gray-600">
          v0.1.0 · 認証なし · ローカル実験モード
        </p>
      </div>
    </div>
  );
}
