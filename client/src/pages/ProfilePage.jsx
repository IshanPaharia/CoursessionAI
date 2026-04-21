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
    },
    {
      label: 'Completed',
      value: completedCourses,
      icon: CheckCircle2,
    },
    {
      label: 'Videos Watched',
      value: `${watchedVideos}/${totalVideos}`,
      icon: TrendingUp,
    },
    {
      label: 'Time Spent',
      value: formatHours(watchedDuration),
      icon: Clock,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 sm:px-6 pb-20 sm:pb-12 min-h-screen font-sans">
      {/* Profile header */}
      <div className="text-center mb-12 sm:mb-16 animate-slide-up">
        <div className="inline-flex items-center justify-center h-28 w-28 sm:h-36 sm:w-36 rounded-full border border-outline-variant bg-surface shadow-sm mb-6 mx-auto overflow-hidden">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Profile'}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-on-surface-variant" />
          )}
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
          {user?.fullName || 'Student'}
        </h1>
        <p className="mt-3 text-lg font-medium text-on-surface-variant">
          {user?.primaryEmailAddress?.emailAddress || ''}
        </p>
        {user?.createdAt && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-on-surface-variant bg-surface-container rounded-full px-4 py-1.5 inline-flex mx-auto">
            <Calendar className="h-4 w-4" />
            Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Streak card */}
      {streakData && (
        <div className="mb-8 learning-card p-6 sm:p-8 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center justify-center h-16 w-16 mb-4 rounded-full bg-primary/10 text-primary">
            <Flame className={`h-8 w-8 ${streakData.currentStreak > 0 ? 'text-primary' : 'text-on-surface-variant'}`} />
          </div>
          {streakData.currentStreak > 0 ? (
            <>
              <div className="text-5xl sm:text-6xl font-display font-bold mb-2">
                {streakData.currentStreak}
              </div>
              <p className="text-lg font-medium text-on-surface-variant">
                Day Learning Streak
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl sm:text-3xl font-display font-bold mb-2">
                Begin your journey
              </div>
              <p className="text-lg font-medium text-on-surface-variant max-w-xs mx-auto">
                Start your first lesson to begin your streak
              </p>
            </>
          )}
          <div className="mt-4 inline-block px-3 py-1 text-sm font-medium rounded-md bg-surface-container text-on-surface-variant">
            Longest: {streakData.longestStreak || 0} days
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="learning-card p-5 sm:p-6 text-center animate-slide-up hover:-translate-y-1 transition-transform"
            style={{ animationDelay: `${(i + 2) * 100}ms` }}
          >
            <div className={`inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-surface-container mb-4 text-primary`}>
              <stat.icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="text-3xl sm:text-4xl font-display font-bold">{stat.value}</div>
            <p className="text-sm font-medium text-on-surface-variant mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress overview */}
      <div className="learning-card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h3 className="text-xl font-display font-semibold mb-6 tracking-tight">Overall Progress</h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm sm:text-base font-medium text-on-surface-variant mb-3">
              <span>Videos</span>
              <span className="font-semibold text-on-surface">
                {totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0}%` }} 
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm sm:text-base font-medium text-on-surface-variant mb-3">
              <span>Time</span>
              <span className="font-semibold text-on-surface">
                {totalDuration > 0 ? Math.round((watchedDuration / totalDuration) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-500" 
                style={{ width: `${totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
