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
    <div className="mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-amber-500/15" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.06), rgba(17, 17, 24, 1) 50%, rgba(244, 63, 94, 0.04))' }}>
      <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {lastWatched.video_thumbnail ? (
            <img
              src={lastWatched.video_thumbnail}
              alt=""
              className="h-14 w-24 sm:h-16 sm:w-28 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-14 w-24 sm:h-16 sm:w-28 items-center justify-center rounded-lg" style={{ background: 'rgba(251, 146, 60, 0.15)' }}>
              <PlayCircle className="h-8 w-8 text-amber-400/50" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            Continue Watching
          </p>
          <h3 className="mt-1 truncate font-semibold text-white text-sm sm:text-base">
            {lastWatched.title}
          </h3>
          <p className="mt-0.5 truncate text-xs sm:text-sm text-gray-400">
            {lastWatched.video_title}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
              />
            </div>
            <span className="text-xs font-semibold text-amber-400">{progress}%</span>
          </div>
        </div>

        <Link
          to={`/courses/${lastWatched.id}`}
          className="btn-primary px-5 py-2.5 shrink-0 w-full sm:w-auto justify-center"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
