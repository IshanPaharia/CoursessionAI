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

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-[#111118] to-pink-500/5">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-4">
          {lastWatched.video_thumbnail ? (
            <img
              src={lastWatched.video_thumbnail}
              alt=""
              className="h-16 w-28 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-purple-500/20">
              <PlayCircle className="h-8 w-8 text-purple-400/50" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-purple-400">
            Continue Watching
          </p>
          <h3 className="mt-1 truncate font-semibold text-white">
            {lastWatched.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-gray-400">
            {lastWatched.video_title}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-purple-400">{progress}%</span>
          </div>
        </div>

        <Link
          to={`/courses/${lastWatched.id}`}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
