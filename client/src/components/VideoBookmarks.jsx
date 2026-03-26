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
    <div className="brutal-card bg-white p-4 sm:p-5 text-black">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 stroke-[2.5px] fill-black" />
          <h3 className="text-base font-black uppercase tracking-widest text-black">Bookmarks</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black hover:-translate-y-0.5 hover:-translate-x-0.5 brutal-shadow-sm transition-transform"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          ADD
        </button>
      </div>

      {showForm && (
        <div className="mb-4 flex flex-col sm:flex-row gap-3 bg-[#facc15] border-[3px] border-black p-3 brutal-shadow-sm">
          <input
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="0:00"
            className="w-full sm:w-24 rounded-none border-[3px] border-black px-3 py-2 text-sm font-bold text-black outline-none placeholder-gray-600 focus:translate-x-1 focus:translate-y-1 focus:shadow-none brutal-shadow-sm transition-all bg-white"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bookmark note..."
            className="flex-1 rounded-none border-[3px] border-black px-3 py-2 text-sm font-bold text-black outline-none placeholder-gray-600 focus:translate-x-1 focus:translate-y-1 focus:shadow-none brutal-shadow-sm transition-all bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!timestamp}
            className="rounded-none border-[3px] border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="border-[2px] border-dashed border-black p-4 text-center">
          <p className="text-xs font-bold uppercase text-gray-500">No bookmarks yet.</p>
        </div>
      ) : (
        <div className="border-[3px] border-black bg-white brutal-shadow-sm">
          {bookmarks.map((bm) => (
            <div key={bm.id} className="group flex items-center gap-3 border-b-[2px] border-black px-3 py-3 transition-colors hover:bg-[#ff99e6] last:border-b-0">
              <button
                onClick={() => handleTimestampClick(bm.timestamp)}
                className="flex shrink-0 items-center gap-1 bg-white border-[2px] border-black px-2 py-1 text-xs font-bold text-black brutal-shadow-sm hover:-translate-y-0.5 transition-transform"
              >
                <Clock className="h-3 w-3 stroke-[3px]" />
                {formatTimestamp(bm.timestamp)}
              </button>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">{bm.note}</span>
              <button
                onClick={() => deleteBookmark.mutate(bm.id)}
                className="shrink-0 text-black border-[2px] border-black bg-white p-1 hover:bg-red-400 brutal-shadow-sm group-hover:opacity-100 sm:opacity-0 transition-opacity"
              >
                <Trash2 className="h-4 w-4 stroke-[2.5px]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
