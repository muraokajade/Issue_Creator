import { Link } from "react-router-dom";

const codeLines = [
  "const map = createAppMap(project)",
  "issue = split(nextAction, { maxHours: 3 })",
  "checkpoint.save({ currentState, learned })",
  "if (scope > mvp) moveToNonMvp()",
  "context = latestCheckpoint + doneIssues",
  "AI_EDITOR !== PROJECT_MANAGER",
  "AppMap is not current state",
  "Current Issue drives today",
  "doneIssues.reduce(toJudgement)",
  "availableHours: 20 | 40 | 60",
  "human decides, AI assists",
  "nextIssue = generateFrom(context)",
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-950">
      <style>{`
        @keyframes codeDriftA {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -80px, 0);
          }
        }

        @keyframes codeDriftB {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, 70px, 0);
          }
        }

        @keyframes softLine {
          0% {
            transform: translateX(-40px);
            opacity: 0.25;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: translateX(40px);
            opacity: 0.2;
          }
        }

        .lp-bg {
          background-image: url("/images/lp-bg-image.png");
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
        }
      `}</style>

      {/* Fixed background */}
      <div className="pointer-events-none fixed inset-0 lp-bg opacity-75" />
      <div className="pointer-events-none fixed inset-0 bg-white/55" />

      {/* Very subtle floating code fragments */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {codeLines.map((line, index) => (
          <span
            key={line}
            className="absolute hidden whitespace-nowrap font-mono text-[10px] tracking-[0.08em] text-slate-900/10 lg:block"
            style={{
              left: `${6 + ((index * 19) % 82)}%`,
              top: `${8 + ((index * 17) % 82)}%`,
              animation:
                index % 2 === 0
                  ? `codeDriftA ${26 + index * 1.6}s linear infinite alternate`
                  : `codeDriftB ${28 + index * 1.4}s linear infinite alternate`,
              animationDelay: `${index * 0.7}s`,
            }}
          >
            {line}
          </span>
        ))}

        <div
          className="absolute left-0 top-[24%] h-px w-full bg-gradient-to-r from-transparent via-blue-400/25 to-transparent"
          style={{ animation: "softLine 18s ease-in-out infinite alternate" }}
        />
        <div
          className="absolute left-0 top-[72%] h-px w-full bg-gradient-to-r from-transparent via-slate-400/20 to-transparent"
          style={{ animation: "softLine 22s ease-in-out infinite alternate" }}
        />
      </div>

      <main className="relative z-10">
        {/* Header */}
        <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-xs font-black text-white">
              AC
            </div>
            <div>
              <p className="text-sm font-black tracking-[0.22em]">
                APP CREATOR
              </p>
              <p className="mt-0.5 text-[10px] tracking-[0.18em] text-slate-400">
                DEVELOPMENT NAVIGATOR
              </p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-bold text-slate-800 backdrop-blur transition hover:border-blue-600 hover:text-blue-700"
          >
            開発を始める
          </Link>
        </header>

        {/* Hero */}
        <section className="mx-auto flex min-h-[720px] max-w-5xl flex-col justify-center px-6 py-20">
          <p className="mb-7 text-xs font-black tracking-[0.36em] text-blue-700">
            AI EDITOR × HUMAN JUDGEMENT
          </p>

          <h1 className="max-w-4xl text-[42px] font-black leading-[1.15] tracking-[-0.045em] text-slate-950 md:text-[58px]">
            AIエディタで開発する人のための、
            <br />
            <span className="text-blue-700">現在地</span>と
            <span className="text-blue-700">次Issue</span>の開発ボード。
          </h1>

          <p className="mt-8 max-w-2xl text-[15px] leading-8 text-slate-600">
            App Creatorは、AIに全部作らせるツールではありません。
            個人開発のアイデアと最低限の自走力がある人が、KiroやCursorのようなAIエディタで暴走せず、
            目的のMVPまで進むためのナビです。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="rounded-full bg-blue-700 px-6 py-3 text-center text-sm font-bold text-white shadow-[0_10px_30px_rgba(29,78,216,0.18)] transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              開発を始める
            </Link>

            <Link
              to="/dashboard"
              className="rounded-full border border-slate-300 bg-white/75 px-6 py-3 text-center text-sm font-bold text-slate-900 backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-600 hover:text-blue-700"
            >
              新規Projectを作る
            </Link>
          </div>

          <p className="mt-7 max-w-xl text-xs leading-6 text-slate-500">
            対象は完全初心者ではなく、CRUDを理解し、AIエディタと個人開発を進めたい人。
            週20h〜60hの現実的な稼働で、スコープを削って完走するための道具です。
          </p>
        </section>

        {/* Concept */}
        <section className="mx-auto max-w-5xl px-6 py-28">
          <div className="grid gap-12 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-black tracking-[0.36em] text-blue-700">
                CONCEPT
              </p>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                コード生成ではなく、
                <br />
                判断の保存。
              </h2>
            </div>

            <div className="space-y-7 text-[15px] leading-8 text-slate-600">
              <p>
                AIエディタは速い。けれど、速いほどスコープは膨らみ、会話は流れ、
                「今どこまで終わったのか」が曖昧になります。
              </p>
              <p>
                App Creatorは、AIの代わりにコードを書くのではなく、
                人間がAIと開発するための現在地を残します。
              </p>
              <p>
                AppMapで初期地図を作り、Issueで次の一手に落とし、
                Checkpointで実際の現在地を保存する。その繰り返しで、迷子にならない開発を支えます。
              </p>
            </div>
          </div>
        </section>

        {/* Three words */}
        <section className="mx-auto max-w-5xl px-6 py-28">
          <p className="text-xs font-black tracking-[0.36em] text-blue-700">
            THREE OBJECTS
          </p>

          <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200 bg-white/45 backdrop-blur-sm">
            <div className="grid gap-4 py-9 md:grid-cols-[180px_1fr]">
              <p className="font-mono text-sm font-black text-blue-700">
                01 / AppMap
              </p>
              <div>
                <h3 className="text-2xl font-black tracking-[-0.035em]">
                  初期地図
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  最初に作る地図。MVP、非MVP、初期おすすめピースを整理する。
                  開発が進んだ後の現在地ではなく、判断材料として参照する。
                </p>
              </div>
            </div>

            <div className="grid gap-4 py-9 md:grid-cols-[180px_1fr]">
              <p className="font-mono text-sm font-black text-blue-700">
                02 / Issue
              </p>
              <div>
                <h3 className="text-2xl font-black tracking-[-0.035em]">
                  次の一手
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  KiroやCursorに投げられる作業単位。
                  30分〜3時間で進められる粒度に削り、実装の迷いを減らす。
                </p>
              </div>
            </div>

            <div className="grid gap-4 py-9 md:grid-cols-[180px_1fr]">
              <p className="font-mono text-sm font-black text-blue-700">
                03 / Checkpoint
              </p>
              <div>
                <h3 className="text-2xl font-black tracking-[-0.035em]">
                  現在地
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  終わったこと、分かったこと、次にやること。
                  次Issueを作るとき、AIが参照する最新の判断材料。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section className="mx-auto max-w-5xl px-6 py-28">
          <div className="mb-14">
            <p className="text-xs font-black tracking-[0.36em] text-blue-700">
              FLOW
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] md:text-4xl">
              縦に進む。戻って確認する。
            </h2>
          </div>

          <div className="relative ml-3 space-y-12 border-l border-blue-200 pl-8">
            {[
              {
                title: "AppMapを作る",
                text: "アイデアをMVPに削り、やらないことを決める。ここは入口であり、初期地図。",
              },
              {
                title: "Issueに落とす",
                text: "初期ピース、雑メモ、現在地から、次に実装する作業を小さく作る。",
              },
              {
                title: "開発する",
                text: "AIエディタにIssueを投げる。人間は判断し、やりすぎを止める。",
              },
              {
                title: "Checkpointを残す",
                text: "完了、学び、次アクションを保存する。以後のAI判断は現在地を優先する。",
              },
            ].map((item, index) => (
              <div key={item.title} className="relative">
                <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-blue-500 bg-white">
                  <span className="h-2 w-2 rounded-full bg-blue-700" />
                </span>
                <p className="font-mono text-xs font-black text-blue-700">
                  STEP {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.035em]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Target */}
        <section className="mx-auto max-w-5xl px-6 py-28">
          <div className="border-y border-slate-200 bg-white/45 py-16 backdrop-blur-sm">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-black tracking-[0.36em] text-blue-700">
                  TARGET USER
                </p>

                <h2 className="mt-8 text-[34px] font-black leading-[1.22] tracking-[-0.045em] text-slate-950 md:text-[42px]">
                  AIで速く作れる時代に、
                  <br />
                  必要なのは
                  <span className="text-blue-700"> 判断 </span>
                  です。
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-slate-600">
                  App Creatorは、AIに作業を丸投げするためではなく、
                  人間が判断しながらMVPまで進むための開発ナビです。
                </p>

                <div className="mt-8 h-px w-28 bg-blue-700/40" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
                  <p className="text-sm font-black text-blue-800">
                    CRUDは理解している
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    完全初心者向けではなく、最低限の開発経験がある個人開発者向け。
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/75 p-5">
                  <p className="text-sm font-black text-slate-950">
                    AIエディタを使っている
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    KiroやCursorで進めたいが、スコープが膨らみやすい人。
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/75 p-5">
                  <p className="text-sm font-black text-slate-950">
                    現在地を残したい
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    AppMap、Issue、CheckpointをProjectごとに残して進める。
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/75 p-5">
                  <p className="text-sm font-black text-slate-950">
                    週20h〜60hでMVPを作る
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    副業・本気個人開発・専念の現実的な稼働で完走を狙う。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-28 pt-20">
          <div className="border-t border-slate-200 pt-12">
            <p className="text-xs font-black tracking-[0.36em] text-blue-700">
              START
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-[-0.045em] md:text-5xl">
              AIと作るなら、
              <br />
              現在地を残して進む。
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600">
              AppMapで初期地図を作り、Issueで次の一手に落とし、
              Checkpointで現在地を残す。AIエディタと並走するための開発ボードです。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="rounded-full bg-blue-700 px-6 py-3 text-center text-sm font-bold text-white shadow-[0_10px_30px_rgba(29,78,216,0.18)] transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                開発を始める
              </Link>
              <Link
                to="/dashboard"
                className="rounded-full border border-slate-300 bg-white/75 px-6 py-3 text-center text-sm font-bold text-slate-900 backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-600 hover:text-blue-700"
              >
                新規Projectを作る
              </Link>
            </div>

            <p className="mt-12 text-[11px] text-slate-400">
              v0.1.0 · Local experiment mode · App Creator
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
