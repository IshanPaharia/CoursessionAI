import { HelpCircle } from 'lucide-react';

export default function HelpTooltip({ text, className = '' }) {
  return (
    <span className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:bg-surface-container focus-visible:text-on-surface"
        aria-label={text}
        title={text}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-56 -translate-x-1/2 rounded-md border border-outline-variant bg-surface px-3 py-2 text-left text-xs font-medium leading-relaxed text-on-surface shadow-lg group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}
