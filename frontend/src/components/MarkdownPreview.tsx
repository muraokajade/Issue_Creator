interface MarkdownPreviewProps {
  markdown: string;
  onClose: () => void;
}

export default function MarkdownPreview({
  markdown,
  onClose,
}: MarkdownPreviewProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          Markdown Preview
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-0.5 text-[11px] font-medium text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
        >
          ✕ 閉じる
        </button>
      </div>
      <div className="max-h-56 overflow-auto rounded-md bg-gray-800/80 p-3 font-mono text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">
        {markdown}
      </div>
    </div>
  );
}
