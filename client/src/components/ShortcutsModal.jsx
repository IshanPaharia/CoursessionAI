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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#111118] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="text-sm text-gray-300">{description}</span>
              <kbd className="rounded-md border border-white/10 bg-[#0d0d14] px-2 py-0.5 font-mono text-xs text-purple-400">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Press <kbd className="rounded border border-white/10 bg-[#0d0d14] px-1 font-mono text-purple-400">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
