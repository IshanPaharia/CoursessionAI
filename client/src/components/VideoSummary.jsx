import { Sparkles, Loader2 } from 'lucide-react';
import { useSummary, useGenerateSummary } from '../hooks/useSummaries';
import { useEffect, useRef } from 'react';

export default function VideoSummary({ videoId }) {
  const { data, isLoading } = useSummary(videoId);
  const { mutate: generateSummary, isPending: isGeneratingSummary } = useGenerateSummary();
  const hasGeneratedRef = useRef({});

  const summary = data?.summary;

  useEffect(() => {
    if (!isLoading && !summary && !isGeneratingSummary && !hasGeneratedRef.current[videoId]) {
      hasGeneratedRef.current[videoId] = true;
      generateSummary(videoId);
    }
  }, [videoId, isLoading, summary, isGeneratingSummary, generateSummary]);

  return (
    <div className="learning-card p-4 sm:p-6 bg-surface">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h3 className="text-base font-semibold tracking-tight text-on-surface">AI Summary</h3>
        </div>
      </div>

      {(isLoading || isGeneratingSummary) && (
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center text-on-surface-variant">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
          <p className="text-sm font-medium">Studying video content to generate a summary...</p>
        </div>
      )}

      {summary && (
        <div className="mt-6">
          <p className="text-sm sm:text-base font-medium leading-relaxed text-on-surface-variant">{summary}</p>
        </div>
      )}
    </div>
  );
}
