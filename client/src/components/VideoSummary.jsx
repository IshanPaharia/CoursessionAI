import { Sparkles, Loader2 } from 'lucide-react';
import { useSummary, useGenerateSummary } from '../hooks/useSummaries';

export default function VideoSummary({ videoId }) {
  const { data } = useSummary(videoId);
  const generateSummary = useGenerateSummary();

  const summary = data?.summary;

  return (
    <div className="rounded-xl border border-white/5 bg-[#111118] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">AI Summary</h3>
        {!summary && (
          <button
            onClick={() => generateSummary.mutate(videoId)}
            disabled={generateSummary.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 transition-colors hover:bg-purple-500/20 disabled:opacity-50"
          >
            {generateSummary.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Generate
          </button>
        )}
      </div>

      {generateSummary.isPending && (
        <p className="mt-3 text-xs text-gray-500">Generating summary...</p>
      )}

      {summary && (
        <p className="mt-3 text-sm leading-relaxed text-gray-400">{summary}</p>
      )}
    </div>
  );
}
