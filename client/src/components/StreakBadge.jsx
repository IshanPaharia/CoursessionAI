import { Flame } from 'lucide-react';
import { useStreaks } from '../hooks/useStreaks';

export default function StreakBadge() {
  const { data } = useStreaks();

  if (!data) return null;

  const streak = data.currentStreak;

  return (
    <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm" style={{ background: streak > 0 ? 'rgba(251, 146, 60, 0.12)' : 'rgba(255,255,255,0.05)' }}>
      <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
      <span className={`font-bold ${streak > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
        {streak}
      </span>
    </div>
  );
}
