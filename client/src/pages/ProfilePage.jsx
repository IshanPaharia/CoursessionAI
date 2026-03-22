import { useState } from 'react';
import { useUser } from '@clerk/react';
import { User, Clock, BookOpen, PlayCircle, CheckCircle2, Flame, Gauge } from 'lucide-react';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { Loader2 } from 'lucide-react';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <div 
      className="glass-card p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-inner`}>
        <Icon className="h-6 w-6 text-white drop-shadow-md" />
      </div>
      <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StreakCalendar({ history }) {
  const days = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const record = history.find(h => {
      const hDate = typeof h.date === 'string' ? h.date.split('T')[0] : new Date(h.date).toISOString().split('T')[0];
      return hDate === dateStr;
    });

    let intensity = 0;
    if (record?.watchCount > 0) {
      if (record.watchCount >= 5) intensity = 4;
      else if (record.watchCount >= 3) intensity = 3;
      else if (record.watchCount >= 2) intensity = 2;
      else intensity = 1;
    }

    days.push({ date: dateStr, intensity, count: record?.watchCount || 0 });
  }

  const intensityColors = [
    'bg-white/5',
    'bg-purple-500/20',
    'bg-purple-500/40',
    'bg-purple-500/60',
    'bg-purple-500/80',
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            className={`h-5 w-5 rounded-sm ${intensityColors[day.intensity]} transition-colors`}
            title={`${day.date}: ${day.count} videos watched`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span>Less</span>
        {intensityColors.map((color, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [initialized, setInitialized] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!data) return null;

  const { user, stats, streakHistory } = data;

  if (!initialized && user) {
    setDisplayName(user.display_name || clerkUser?.fullName || '');
    setSpeed(Number(user.playback_speed) || 1.0);
    setInitialized(true);
  }

  const completionRate = stats.totalVideos > 0
    ? Math.round((stats.watchedVideos / stats.totalVideos) * 100)
    : 0;

  const handleSave = () => {
    updateProfile.mutate({ displayName, playbackSpeed: speed });
  };

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 relative">
      {/* Background blobs for profile */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] animate-blob -z-10" />
      <div className="pointer-events-none absolute top-40 -right-20 h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-[90px] animate-blob animation-delay-2000 -z-10" />

      {/* Header */}
      <div className="mb-10 flex items-center gap-6 animate-slide-up">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_25px_rgba(168,85,247,0.3)] p-1 backdrop-blur-md">
          {clerkUser?.imageUrl ? (
            <img src={clerkUser.imageUrl} alt="" className="h-full w-full rounded-full border-2 border-[#050508] object-cover" />
          ) : (
            <User className="h-10 w-10 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {user.display_name || clerkUser?.fullName || 'Your Profile'}
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-1 bg-white/5 inline-block px-3 py-1 rounded-full">{user.email}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={stats.totalCourses}
          gradient="from-purple-500/80 to-purple-600/80"
          delay={100}
        />
        <StatCard
          icon={CheckCircle2}
          label="Watched"
          value={stats.watchedVideos}
          gradient="from-green-500/80 to-emerald-600/80"
          delay={200}
        />
        <StatCard
          icon={Clock}
          label="Time"
          value={formatDuration(stats.watchedDuration)}
          gradient="from-blue-500/80 to-cyan-600/80"
          delay={300}
        />
        <StatCard
          icon={Gauge}
          label="Progress"
          value={`${completionRate}%`}
          gradient="from-pink-500/80 to-rose-600/80"
          delay={400}
        />
      </div>

      {/* Streak */}
      <section className="mb-10 glass-card p-8 animate-slide-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <div className="mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">
            Learning Activity (30 Days)
          </h2>
        </div>
        <StreakCalendar history={streakHistory} />
      </section>

      {/* Preferences */}
      <section className="mb-10 glass-card p-8 animate-slide-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
        <div className="mb-6 border-b border-white/5 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">
            Preferences
          </h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-purple-500/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-400">Default Playback Speed</label>
            <div className="flex flex-wrap gap-3">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    speed === s
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'border border-white/10 bg-white/[0.01] text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/40 disabled:opacity-50 disabled:hover:scale-100 min-w-[160px]"
            >
              {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Settings
            </button>

            {updateProfile.isSuccess && (
              <p className="text-sm font-medium text-green-400 animate-fade-in bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                Preferences saved successfully!
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
