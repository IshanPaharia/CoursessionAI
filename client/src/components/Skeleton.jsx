export function SkeletonCard() {
  return (
    <div className="brutal-card bg-white animate-pulse">
      <div className="aspect-video w-full bg-gray-200 border-b-[3px] border-black" />
      <div className="p-4 sm:p-5">
        <div className="mb-3 h-5 w-3/4 rounded-none bg-gray-300 border-[2px] border-black brutal-shadow-sm" />
        <div className="mb-4 h-4 w-1/2 rounded-none bg-gray-200 border-[2px] border-black" />
        <div className="flex gap-3">
          <div className="h-6 w-16 rounded-none bg-[#ff99e6]/50 border-[2px] border-black" />
          <div className="h-6 w-16 rounded-none bg-[#facc15]/50 border-[2px] border-black" />
        </div>
        <div className="mt-6 h-3 w-full rounded-none bg-gray-200 border-[2px] border-black" />
      </div>
    </div>
  );
}

export function SkeletonVideoList() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-start gap-4 px-4 py-3 brutal-card bg-gray-50 border-[2px] border-black animate-pulse">
          <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-gray-300 border-[2px] border-black" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-full rounded-none bg-gray-300 border-[2px] border-black" />
            <div className="h-3 w-20 rounded-none bg-gray-200 border-[2px] border-black" />
          </div>
        </div>
      ))}
    </div>
  );
}
