import { Link } from 'react-router-dom';
import { PlayCircle, ArrowRight } from 'lucide-react';
import { useLastWatched } from '../hooks/useLastWatched';

export default function ContinueCourseCard() {
  const { data: lastWatched } = useLastWatched();

  if (!lastWatched) return null;

  const progress = lastWatched.video_count > 0
    ? Math.round((Number(lastWatched.watched_count) / Number(lastWatched.video_count)) * 100)
    : 0;

  // Don't render if course is complete
  if (progress >= 100) return null;

  return (
    <div className="mb-6 sm:mb-8 learning-card bg-surface overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-4">
          {lastWatched.video_thumbnail ? (
            <img
              src={lastWatched.video_thumbnail}
              alt=""
              className="h-16 w-28 sm:h-20 sm:w-36 rounded-md border border-outline-variant object-cover shadow-sm bg-surface-container"
            />
          ) : (
            <div className="flex h-16 w-28 sm:h-20 sm:w-36 items-center justify-center rounded-md border border-outline-variant bg-surface-container shadow-sm p-2">
              <PlayCircle className="h-8 w-8 text-on-surface-variant" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Continue Learning
          </p>
          <h3 className="mt-1 truncate font-display font-semibold text-lg sm:text-xl text-on-surface">
            {lastWatched.title}
          </h3>
          <p className="mt-1 truncate text-xs sm:text-sm font-medium text-on-surface-variant">
            {lastWatched.video_title}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">{progress}%</span>
          </div>
        </div>

        <Link
          to={`/courses/${lastWatched.id}`}
          className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 shrink-0 w-full sm:w-auto text-sm"
        >
          Resume
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
