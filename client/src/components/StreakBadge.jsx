import { Flame } from 'lucide-react';
import { useStreaks } from '../hooks/useStreaks';

export default function StreakBadge() {
  const { data } = useStreaks();

  if (!data) return null;

  const streak = data.currentStreak;

  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors ${streak > 0 ? 'bg-primary/10 border-primary/20 text-on-surface' : 'bg-surface-container border-outline-variant text-on-surface-variant'}`}>
      <Flame className={`h-3.5 w-3.5 ${streak > 0 ? 'text-primary' : 'text-on-surface-variant'}`} />
      <span>{streak}</span>
    </div>
  );
}
