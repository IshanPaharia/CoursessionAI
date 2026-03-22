import { Flame } from 'lucide-react';
import { useStreaks } from '../hooks/useStreaks';

export default function StreakBadge() {
  const { data } = useStreaks();

  if (!data) return null;

  const streak = data.currentStreak;

  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-2.5 py-1 text-sm">
      <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
      <span className={`font-semibold ${streak > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
        {streak}
      </span>
    </div>
  );
}
