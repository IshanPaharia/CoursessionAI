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
      bg: 'bg-[#facc15]',
    },
    {
      label: 'Completed',
      value: completedCourses,
      icon: CheckCircle2,
      bg: 'bg-[#ff99e6]',
    },
    {
      label: 'Videos Watched',
      value: `${watchedVideos}/${totalVideos}`,
      icon: TrendingUp,
      bg: 'bg-[#00e6e6]',
    },
    {
      label: 'Time Spent',
      value: formatHours(watchedDuration),
      icon: Clock,
      bg: 'bg-[#c399ff]',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 sm:px-6 pb-20 sm:pb-12 bg-white min-h-screen font-sans text-black">
      {/* Profile header */}
      <div className="text-center mb-10 sm:mb-14 animate-slide-up">
        <div className="inline-flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32 rounded-none border-[4px] border-black bg-[#ff8c00] brutal-shadow mb-6 mx-auto overflow-hidden">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Profile'}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-black stroke-[2.5px]" />
          )}
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-black uppercase tracking-tight leading-none">
          {user?.fullName || 'Student'}
        </h1>
        <p className="mt-3 text-base font-bold text-gray-800 tracking-wide uppercase">
          {user?.primaryEmailAddress?.emailAddress || ''}
        </p>
        {user?.createdAt && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-black bg-gray-100 border-[2px] border-black px-4 py-1.5 brutal-shadow-sm inline-flex mx-auto">
            <Calendar className="h-4 w-4 stroke-[3px]" />
            JOINED {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Streak card */}
      {streakData && (
        <div className="mb-8 sm:mb-10 brutal-card bg-[#ff8c00] p-6 sm:p-8 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center justify-center h-16 w-16 mb-4 bg-white border-[3px] border-black brutal-shadow-sm">
            <Flame className={`h-10 w-10 stroke-[2.5px] ${streakData.currentStreak > 0 ? 'text-[#ff4500]' : 'text-gray-400'}`} />
          </div>
          <div className="text-5xl sm:text-6xl font-display font-black text-black mb-2 uppercase">
            {streakData.currentStreak}
          </div>
          <p className="text-lg font-bold text-black uppercase tracking-widest">
            day learning streak
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-tight text-gray-900 bg-white inline-block px-3 py-1 border-[2px] border-black">
            Longest: {streakData.longestStreak || 0} days
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-10">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="brutal-card bg-white p-5 sm:p-6 text-center animate-slide-up hover:-translate-y-1 transition-transform"
            style={{ animationDelay: `${(i + 2) * 100}ms` }}
          >
            <div className={`inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-none border-[3px] border-black ${stat.bg} brutal-shadow-sm mb-4`}>
              <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 text-black stroke-[2.5px]" />
            </div>
            <div className="text-3xl sm:text-4xl font-display font-black text-black uppercase">{stat.value}</div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress overview */}
      <div className="brutal-card bg-[#facc15] p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h3 className="text-xl font-display font-black text-black mb-6 uppercase tracking-widest">Overall Progress</h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm sm:text-base font-bold uppercase tracking-wider text-black mb-3">
              <span>Videos</span>
              <span className="bg-white border-[2px] border-black px-2 py-0.5 brutal-shadow-sm">
                {totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0}%
              </span>
            </div>
            <div className="h-4 w-full bg-white border-[3px] border-black overflow-hidden relative brutal-shadow-sm">
              <div 
                className="h-full bg-black border-r-[3px] border-black absolute left-0 top-0 bottom-0" 
                style={{ width: `${totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0}%` }} 
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm sm:text-base font-bold uppercase tracking-wider text-black mb-3">
              <span>Time</span>
              <span className="bg-white border-[2px] border-black px-2 py-0.5 brutal-shadow-sm">
                {totalDuration > 0 ? Math.round((watchedDuration / totalDuration) * 100) : 0}%
              </span>
            </div>
            <div className="h-4 w-full bg-white border-[3px] border-black overflow-hidden relative brutal-shadow-sm">
              <div 
                className="h-full bg-[#ff99e6] border-r-[3px] border-black absolute left-0 top-0 bottom-0" 
                style={{ width: `${totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
