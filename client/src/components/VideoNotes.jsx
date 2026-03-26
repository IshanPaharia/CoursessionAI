import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, StickyNote } from 'lucide-react';
import { useNote, useSaveNote } from '../hooks/useNotes';

export default function VideoNotes({ videoId }) {
  const { data: savedNotes, isLoading } = useNote(videoId);
  const saveNote = useSaveNote(videoId);
  const [notes, setNotes] = useState('');
  const [dirty, setDirty] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (savedNotes !== undefined) {
      setNotes(savedNotes);
      setDirty(false);
    }
  }, [savedNotes]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleChange = (val) => {
    setNotes(val);
    setDirty(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveNote.mutate(val);
      setDirty(false);
    }, 1500);
  };

  const handleSave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    saveNote.mutate(notes);
    setDirty(false);
  };

  if (isLoading) return null;

  return (
    <div className="card-warm p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[11px] font-medium text-amber-500">Unsaved</span>}
          {saveNote.isPending && <Loader2 className="h-3 w-3 animate-spin text-amber-400" />}
          <button
            onClick={handleSave}
            disabled={!dirty || saveNote.isPending}
            className="btn-ghost px-2 py-1 text-xs disabled:opacity-30"
          >
            <Save className="h-3 w-3" />
            Save
          </button>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add your notes for this video..."
        rows={4}
        className="w-full resize-none rounded-xl border border-white/[0.06] px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none transition-all focus:border-amber-500/30"
        style={{ backgroundColor: 'rgba(13, 13, 20, 0.5)' }}
      />
    </div>
  );
}
