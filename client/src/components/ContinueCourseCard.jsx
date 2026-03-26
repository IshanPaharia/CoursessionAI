import { Link } from 'react-router-dom';
import { PlayCircle, ArrowRight, Clock } from 'lucide-react';
import { useLastWatched } from '../hooks/useLastWatched';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ContinueCourseCard() {
  const { data: lastWatched } = useLastWatched();

  if (!lastWatched) return null;

  const progress = lastWatched.video_count > 0
    ? Math.round((Number(lastWatched.watched_count) / Number(lastWatched.video_count)) * 100)
    : 0;

  // Don't render if course is complete
  if (progress >= 100) return null;

  return (
    <div className="mb-6 sm:mb-8 brutal-card bg-[#facc15] text-black w-full overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {lastWatched.video_thumbnail ? (
            <img
              src={lastWatched.video_thumbnail}
              alt=""
              className="h-14 w-24 sm:h-20 sm:w-32 rounded-none border-[2px] border-black object-cover brutal-shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-24 sm:h-20 sm:w-32 items-center justify-center rounded-none border-[2px] border-black bg-[#ff99e6] brutal-shadow-sm">
              <PlayCircle className="h-8 w-8 text-black stroke-[3px]" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-black">
            Continue Watching
          </p>
          <h3 className="mt-1 truncate font-display font-bold text-xl sm:text-2xl text-black uppercase">
            {lastWatched.title}
          </h3>
          <p className="mt-1 truncate text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">
            {lastWatched.video_title}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden border-[2px] border-black bg-white">
              <div
                className="h-full bg-[#ff8c00] border-r-[2px] border-black"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-black">{progress}%</span>
          </div>
        </div>

        <Link
          to={`/courses/${lastWatched.id}`}
          className="btn-primary px-5 py-2.5 shrink-0 w-full sm:w-auto justify-center bg-white hover:bg-black/5"
        >
          CONTINUE
          <ArrowRight className="h-5 w-5 stroke-[3px]" />
        </Link>
      </div>
    </div>
  );
}
