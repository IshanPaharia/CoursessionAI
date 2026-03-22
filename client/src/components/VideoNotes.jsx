import { useState, useEffect, useRef } from 'react';
import { Save, Loader2 } from 'lucide-react';
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
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
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
    <div className="rounded-xl border border-white/5 bg-[#111118] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Notes</h3>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs text-yellow-500">Unsaved</span>}
          {saveNote.isPending && <Loader2 className="h-3 w-3 animate-spin text-purple-400" />}
          <button
            onClick={handleSave}
            disabled={!dirty || saveNote.isPending}
            className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-gray-400 transition-colors hover:text-white disabled:opacity-30"
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
        className="w-full resize-none rounded-lg border border-white/5 bg-[#0d0d14] px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-purple-500/30"
      />
    </div>
  );
}
