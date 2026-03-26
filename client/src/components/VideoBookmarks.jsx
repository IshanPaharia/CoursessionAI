import { useState } from 'react';
import { Bookmark, Plus, Trash2, Clock } from 'lucide-react';
import { useBookmarks, useCreateBookmark, useDeleteBookmark } from '../hooks/useNotes';

function formatTimestamp(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoBookmarks({ videoId, youtubeId }) {
  const { data: bookmarks = [] } = useBookmarks(videoId);
  const createBookmark = useCreateBookmark(videoId);
  const deleteBookmark = useDeleteBookmark(videoId);
  const [showForm, setShowForm] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [note, setNote] = useState('');

  const parseTimestamp = (str) => {
    const parts = str.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return Number(str) || 0;
  };

  const handleAdd = () => {
    createBookmark.mutate(
      { timestamp: parseTimestamp(timestamp), note },
      {
        onSuccess: () => {
          setTimestamp('');
          setNote('');
          setShowForm(false);
        },
      }
    );
  };

  const handleTimestampClick = (seconds) => {
    const iframe = document.querySelector('iframe[src*="youtube"]');
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${youtubeId}?rel=0&start=${seconds}&autoplay=1`;
    }
  };

  return (
    <div className="card-warm p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Bookmarks</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {showForm && (
        <div className="mb-3 flex flex-col sm:flex-row gap-2">
          <input
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="0:00"
            className="w-full sm:w-20 rounded-xl border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/40"
            style={{ backgroundColor: 'rgba(13, 13, 20, 0.5)' }}
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bookmark note..."
            className="flex-1 rounded-xl border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/40"
            style={{ backgroundColor: 'rgba(13, 13, 20, 0.5)' }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!timestamp}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-400 disabled:opacity-30"
            style={{ background: 'rgba(251, 146, 60, 0.15)' }}
          >
            Save
          </button>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <p className="text-xs text-gray-600">No bookmarks yet.</p>
      ) : (
        <div className="space-y-1.5">
          {bookmarks.map((bm) => (
            <div key={bm.id} className="group flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[0.03]">
              <button
                onClick={() => handleTimestampClick(bm.timestamp)}
                className="flex shrink-0 items-center gap-1 text-xs font-mono text-amber-400 hover:underline"
              >
                <Clock className="h-3 w-3" />
                {formatTimestamp(bm.timestamp)}
              </button>
              <span className="min-w-0 flex-1 truncate text-xs text-gray-400">{bm.note}</span>
              <button
                onClick={() => deleteBookmark.mutate(bm.id)}
                className="shrink-0 text-gray-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
