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
    <div className="rounded-xl border border-white/5 bg-[#111118] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-300">
          <Bookmark className="h-4 w-4 text-purple-400" />
          Bookmarks
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-xs text-purple-400 transition-colors hover:bg-purple-500/20"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {showForm && (
        <div className="mb-3 flex gap-2">
          <input
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="0:00"
            className="w-20 rounded-md border border-white/10 bg-[#0d0d14] px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/50"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bookmark note..."
            className="flex-1 rounded-md border border-white/10 bg-[#0d0d14] px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/50"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!timestamp}
            className="rounded-md bg-purple-500/20 px-2 py-1.5 text-xs text-purple-400 hover:bg-purple-500/30 disabled:opacity-30"
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
            <div key={bm.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/5">
              <button
                onClick={() => handleTimestampClick(bm.timestamp)}
                className="flex shrink-0 items-center gap-1 text-xs font-mono text-purple-400 hover:underline"
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
