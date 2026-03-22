export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#111118]">
      <div className="aspect-video w-full animate-pulse bg-white/5" />
      <div className="p-4">
        <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="mb-3 h-3 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="flex gap-4">
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
        </div>
        <div className="mt-3 h-1.5 w-full animate-pulse rounded-full bg-white/5" />
      </div>
    </div>
  );
}

export function SkeletonVideoList() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-2.5">
          <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded-full bg-white/5" />
          <div className="flex-1">
            <div className="mb-1 h-3.5 w-full animate-pulse rounded bg-white/5" />
            <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
