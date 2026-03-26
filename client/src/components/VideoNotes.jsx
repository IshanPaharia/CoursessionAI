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
    <div className="brutal-card bg-[#facc15] p-4 sm:p-5 text-black">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 stroke-[2.5px]" />
          <h3 className="text-base font-black uppercase tracking-widest text-black">Notes</h3>
        </div>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-white px-1.5 py-0.5 border-[2px] border-black brutal-shadow-sm">Unsaved</span>}
          {saveNote.isPending && <Loader2 className="h-4 w-4 animate-spin text-black stroke-[3px]" />}
          <button
            onClick={handleSave}
            disabled={!dirty || saveNote.isPending}
            className="flex items-center gap-1 bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black hover:-translate-y-0.5 hover:-translate-x-0.5 brutal-shadow-sm transition-transform disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            <Save className="h-4 w-4 stroke-[3px]" />
            Save
          </button>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add your notes for this video..."
        rows={6}
        className="w-full resize-none rounded-none border-[3px] border-black bg-white px-4 py-3 text-sm text-black font-medium placeholder-gray-500 outline-none transition-all brutal-shadow-sm focus:translate-x-1 focus:translate-y-1 focus:shadow-none bg-grid-pattern"
      />
    </div>
  );
}
