import { Flame } from 'lucide-react';
import { useStreaks } from '../hooks/useStreaks';

export default function StreakBadge() {
  const { data } = useStreaks();

  if (!data) return null;

  const streak = data.currentStreak;

  return (
    <div className={`flex items-center gap-1.5 border-[2px] border-black px-2.5 py-1 text-sm brutal-shadow-sm font-bold uppercase tracking-wider ${streak > 0 ? 'bg-white text-black' : 'bg-gray-200 text-gray-500'}`}>
      <Flame className={`h-4 w-4 stroke-[3px] ${streak > 0 ? 'text-[#ff8c00] fill-[#ff8c00]' : 'text-gray-500'}`} />
      <span>{streak}</span>
    </div>
  );
}
