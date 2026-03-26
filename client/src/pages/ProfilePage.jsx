import { useUser } from '@clerk/react';
import {
  User,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useStreaks } from '../hooks/useStreaks';
import { useCourses } from '../hooks/useCourses';

export default function ProfilePage() {
  const { user } = useUser();
  const { data: streakData } = useStreaks();
  const { data: courses = [] } = useCourses();

  const totalCourses = courses.length;
  const totalVideos = courses.reduce((a, c) => a + Number(c.video_count || 0), 0);
  const watchedVideos = courses.reduce((a, c) => a + Number(c.watched_count || 0), 0);
  const totalDuration = courses.reduce((a, c) => a + Number(c.total_duration || 0), 0);
  const watchedDuration = courses.reduce((a, c) => a + Number(c.watched_duration || 0), 0);
  const completedCourses = courses.filter(c =>
    Number(c.video_count) > 0 && Number(c.watched_count) >= Number(c.video_count)
  ).length;

  const formatHours = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const stats = [
    {
      label: 'Courses',
      value: totalCourses,
      icon: BookOpen,
      gradient: 'from-amber-500/20 to-orange-500/20',
      color: 'text-amber-400',
    },
    {
      label: 'Completed',
      value: completedCourses,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      color: 'text-emerald-400',
    },
    {
      label: 'Videos Watched',
      value: `${watchedVideos}/${totalVideos}`,
      icon: TrendingUp,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      color: 'text-blue-400',
    },
    {
      label: 'Time Spent',
      value: formatHours(watchedDuration),
      icon: Clock,
      gradient: 'from-violet-500/20 to-purple-500/20',
      color: 'text-violet-400',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 sm:px-6 pb-20 sm:pb-8 relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[120px] animate-blob" />

      {/* Profile header */}
      <div className="text-center mb-8 sm:mb-10 animate-slide-up">
        <div className="inline-flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-3xl border-2 border-amber-500/20 mb-4 mx-auto overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(244, 63, 94, 0.1))' }}>
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Profile'}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-amber-400" />
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {user?.fullName || 'Student'}
        </h1>
        <p className="mt-1 text-sm text-gray-400 font-light">
          {user?.primaryEmailAddress?.emailAddress || ''}
        </p>
        {user?.createdAt && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Streak card */}
      {streakData && (
        <div className="mb-6 sm:mb-8 card-warm p-5 sm:p-6 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(249, 115, 22, 0.15))' }}>
            <Flame className={`h-8 w-8 ${streakData.currentStreak > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-gradient mb-1">
            {streakData.currentStreak}
          </div>
          <p className="text-sm font-medium text-gray-400">
            day learning streak
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Longest: {streakData.longestStreak || 0} days
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="card-warm p-4 sm:p-5 text-center animate-slide-up"
            style={{ animationDelay: `${(i + 2) * 100}ms` }}
          >
            <div className={`inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br ${stat.gradient} mb-3`}>
              <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</div>
            <p className="text-xs font-medium text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress overview */}
      <div className="card-warm p-5 sm:p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-gray-300">Overall Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Videos</span>
              <span className="font-semibold text-amber-400">{totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Time</span>
              <span className="font-semibold text-amber-400">{totalDuration > 0 ? Math.round((watchedDuration / totalDuration) * 100) : 0}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
