export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
      <div className="aspect-video w-full animate-pulse bg-white/[0.04]" />
      <div className="p-4 sm:p-5">
        <div className="mb-2 h-4 w-3/4 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mb-3 h-3 w-1/2 animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="flex gap-3">
          <div className="h-3 w-16 animate-pulse rounded-lg bg-white/[0.04]" />
          <div className="h-3 w-16 animate-pulse rounded-lg bg-white/[0.04]" />
        </div>
        <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

export function SkeletonVideoList() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-2.5">
          <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="flex-1">
            <div className="mb-1.5 h-3.5 w-full animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="h-3 w-16 animate-pulse rounded-lg bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}
