interface CheckpointCardProps {
  cpGoal: string;
  cpPhase: string;
  cpState: string;
  cpLearned: string;
  cpNextAction: string;

  setCpGoal: (value: string) => void;
  setCpPhase: (value: string) => void;
  setCpState: (value: string) => void;
  setCpLearned: (value: string) => void;
  setCpNextAction: (value: string) => void;

  onSaveCheckpoint: () => void;
  onSaveIssueDraft: () => void;

  canSaveIssueDraft: boolean;
  checkpointCount: number;
  issueDraftCount: number;
}

export default function CheckpointCard({
  cpGoal,
  cpPhase,
  cpState,
  cpLearned,
  cpNextAction,
  setCpGoal,
  setCpPhase,
  setCpState,
  setCpLearned,
  setCpNextAction,
  onSaveCheckpoint,
  onSaveIssueDraft,
  canSaveIssueDraft,
  checkpointCount,
  issueDraftCount,
}: CheckpointCardProps) {
  return (
    <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50/30 p-4 shadow-sm">
      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
        現在地
      </p>

      <div className="space-y-2">
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
            今の目的
          </label>
          <input
            type="text"
            value={cpGoal}
            onChange={(e) => setCpGoal(e.target.value)}
            placeholder="このProjectで達成したいこと"
            className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
              フェーズ
            </label>
            <input
              type="text"
              value={cpPhase}
              onChange={(e) => setCpPhase(e.target.value)}
              placeholder="検証中"
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
              やっていること
            </label>
            <input
              type="text"
              value={cpState}
              onChange={(e) => setCpState(e.target.value)}
              placeholder="今取り組んでいる作業"
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
              わかったこと
            </label>
            <input
              type="text"
              value={cpLearned}
              onChange={(e) => setCpLearned(e.target.value)}
              placeholder="判明した知見"
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
              次にやること
            </label>
            <input
              type="text"
              value={cpNextAction}
              onChange={(e) => setCpNextAction(e.target.value)}
              placeholder="次の具体的な作業"
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onSaveCheckpoint}
          className="rounded-md border border-indigo-300 bg-white px-3 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
        >
          現在地をDBに保存
        </button>

        {canSaveIssueDraft && (
          <button
            type="button"
            onClick={onSaveIssueDraft}
            className="rounded-md border border-emerald-300 bg-white px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            nextPieceをIssue案としてDB保存
          </button>
        )}
      </div>

      {(checkpointCount > 0 || issueDraftCount > 0) && (
        <div className="mt-3 pt-3 border-t border-indigo-100 flex gap-4 text-[10px] text-gray-500">
          <span>Checkpoint {checkpointCount}件</span>
          <span>IssueDraft {issueDraftCount}件</span>
        </div>
      )}
    </div>
  );
}
