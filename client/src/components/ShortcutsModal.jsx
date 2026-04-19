import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { key: 'n', description: 'Next video' },
  { key: 'p', description: 'Previous video' },
  { key: 'm', description: 'Mark as watched' },
  { key: 's', description: 'Toggle sidebar' },
  { key: 'a', description: 'Open AI chat' },
  { key: '?', description: 'Show shortcuts' },
];

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border border-outline-variant p-6 shadow-xl bg-surface animate-slide-up">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-on-surface" />
            <h2 className="text-lg font-semibold tracking-wide text-on-surface">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between rounded-md bg-surface-container px-3 py-2.5">
              <span className="text-sm font-medium text-on-surface">{description}</span>
              <kbd className="rounded-sm border border-outline-variant bg-surface px-2 py-0.5 font-mono text-xs font-semibold text-on-surface shadow-sm">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-xs font-medium text-on-surface-variant">
          Press <kbd className="rounded-sm border border-outline-variant bg-surface-container px-1.5 font-mono">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
