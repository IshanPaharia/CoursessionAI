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
    <div className="learning-card p-4 sm:p-6 bg-surface flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <StickyNote className="h-5 w-5" />
          <h3 className="text-base font-semibold tracking-tight text-on-surface">Notes</h3>
        </div>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm">Unsaved</span>}
          {saveNote.isPending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          <button
            onClick={handleSave}
            disabled={!dirty || saveNote.isPending}
            className="flex items-center gap-1.5 border border-outline-variant rounded-md px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add your notes for this video..."
        rows={6}
        className="w-full flex-1 resize-none rounded-md border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface font-medium placeholder-on-surface-variant outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
      />
    </div>
  );
}
