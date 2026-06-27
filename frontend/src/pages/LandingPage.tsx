import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white text-sm font-bold">AC</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            App Creator
          </span>
        </div>

        {/* Copy */}
        <h1 className="text-2xl font-bold text-white leading-snug mb-4">
          AIと開発しても、
          <br />
          現在地を見失わない
        </h1>

        <p className="text-sm text-gray-400 leading-relaxed mb-3">
          作りたいものを整理し、MVPに削り、次にやる作業を明確にします。
        </p>
        <p className="text-xs text-gray-500 mb-10">
          アプリ地図・現在地・次のIssueを、Projectごとに残せます。
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/projects"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            Projectを開く
          </Link>
          <Link
            to="/projects"
            className="rounded-lg border border-gray-700 bg-gray-800/50 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            新規Projectを作る
          </Link>
        </div>

        <p className="mt-14 text-[11px] text-gray-700">
          v0.1.0 · ローカル実験モード
        </p>
      </div>
    </div>
  );
}
