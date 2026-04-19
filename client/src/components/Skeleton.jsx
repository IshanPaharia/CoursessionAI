export function SkeletonCard() {
  return (
    <div className="learning-card bg-surface overflow-hidden p-0 animate-pulse">
      <div className="aspect-video w-full bg-surface-variant border-b border-outline-variant" />
      <div className="p-4 sm:p-5">
        <div className="mb-3 h-5 w-3/4 rounded-md bg-surface-container" />
        <div className="mb-4 h-4 w-1/2 rounded-md bg-surface-variant" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-md bg-surface-container" />
          <div className="h-6 w-16 rounded-md bg-surface-container" />
        </div>
        <div className="mt-6 h-1 w-full rounded-full bg-surface-container" />
      </div>
    </div>
  );
}

export function SkeletonVideoList() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-surface border border-outline-variant rounded-md animate-pulse">
          <div className="h-5 w-5 shrink-0 rounded-full bg-surface-container" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-3/4 rounded-md bg-surface-container" />
            <div className="h-3 w-20 rounded-md bg-surface-variant" />
          </div>
        </div>
      ))}
    </div>
  );
}
