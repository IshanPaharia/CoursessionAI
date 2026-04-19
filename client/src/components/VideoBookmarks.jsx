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
    <div className="learning-card p-4 sm:p-6 bg-surface flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Bookmark className="h-5 w-5 fill-current" />
          <h3 className="text-base font-semibold tracking-tight text-on-surface">Bookmarks</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 border border-outline-variant rounded-md px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {showForm && (
        <div className="mb-4 flex flex-col sm:flex-row gap-3 bg-surface-container rounded-md p-3">
          <input
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="0:00"
            className="w-full sm:w-24 rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm font-medium text-on-surface outline-none placeholder-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bookmark note..."
            className="flex-1 rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm font-medium text-on-surface outline-none placeholder-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!timestamp}
            className="rounded-md bg-primary text-on-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="border border-dashed border-outline-variant rounded-md p-6 text-center text-on-surface-variant flex-1 flex items-center justify-center">
          <p className="text-sm font-medium">No bookmarks yet.</p>
        </div>
      ) : (
        <div className="border border-outline-variant bg-surface rounded-md overflow-hidden flex-1 flex flex-col">
          {bookmarks.map((bm) => (
            <div key={bm.id} className="group flex items-center gap-3 border-b border-outline-variant px-4 py-3 transition-colors hover:bg-surface-container last:border-b-0">
              <button
                onClick={() => handleTimestampClick(bm.timestamp)}
                className="flex shrink-0 items-center gap-1.5 bg-surface border border-outline-variant rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                <Clock className="h-3.5 w-3.5" />
                {formatTimestamp(bm.timestamp)}
              </button>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-on-surface">{bm.note}</span>
              <button
                onClick={() => deleteBookmark.mutate(bm.id)}
                className="shrink-0 text-red-500 bg-red-50 hover:bg-red-100 p-1.5 rounded-md opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
