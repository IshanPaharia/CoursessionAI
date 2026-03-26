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
    <div className="brutal-card bg-[#ff8c00] p-4 sm:p-5 text-black">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 stroke-[2.5px]" />
          <h3 className="text-base font-black uppercase tracking-widest text-black">AI Summary</h3>
        </div>
      </div>

      {(isLoading || generateSummary.isPending) && (
        <div className="mt-4 flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin stroke-[3px]" />
        </div>
      )}

      {summary && (
        <div className="mt-4 bg-white border-[3px] border-black p-4 brutal-shadow-sm">
          <p className="text-sm sm:text-base font-medium leading-relaxed text-black">{summary}</p>
        </div>
      )}
    </div>
  );
}
