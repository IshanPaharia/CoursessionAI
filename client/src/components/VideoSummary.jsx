import { Sparkles, Loader2 } from 'lucide-react';
import { useSummary, useGenerateSummary } from '../hooks/useSummaries';
import { useEffect, useRef } from 'react';

export default function VideoSummary({ videoId }) {
  const { data, isLoading } = useSummary(videoId);
  const generateSummary = useGenerateSummary();
  const hasGeneratedRef = useRef({});

  const summary = data?.summary;

  useEffect(() => {
    if (!isLoading && !summary && !generateSummary.isPending && !hasGeneratedRef.current[videoId]) {
      hasGeneratedRef.current[videoId] = true;
      generateSummary.mutate(videoId);
    }
  }, [videoId, isLoading, summary, generateSummary.isPending]);

  return (
    <div className="card-warm p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">AI Summary</h3>
        </div>
      </div>

      {(isLoading || generateSummary.isPending) && (
        <div className="mt-4 flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500/50" />
        </div>
      )}

      {summary && (
        <p className="mt-3 text-sm leading-relaxed text-gray-400">{summary}</p>
      )}
    </div>
  );
}
