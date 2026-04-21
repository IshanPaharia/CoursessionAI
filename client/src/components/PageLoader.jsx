import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background text-on-surface">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-semibold text-on-surface-variant">Loading CoursessionAI...</p>
      </div>
    </div>
  );
}
