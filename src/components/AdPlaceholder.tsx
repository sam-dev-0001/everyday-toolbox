import React from 'react';

interface AdPlaceholderProps {
  slot: 'top-banner' | 'in-content' | 'result-page' | 'sidebar';
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ slot, className = '' }) => {
  // Discreet, non-intrusive container reserved for future Google AdSense integration
  if (slot === 'top-banner') {
    return (
      <aside
        aria-label="Sponsored advertisement area"
        className={`w-full max-w-5xl mx-auto my-3 px-4 ${className}`}
      >
        <div className="h-14 sm:h-16 w-full rounded-2xl bg-[#0D1224]/50 border border-white/[0.04] flex items-center justify-center text-[11px] font-medium text-slate-400 select-none">
          <span className="uppercase tracking-widest text-[9px] text-slate-400">Advertisement Area</span>
        </div>
      </aside>
    );
  }

  if (slot === 'result-page') {
    return (
      <aside
        aria-label="Sponsored advertisement area"
        className={`w-full my-4 ${className}`}
      >
        <div className="h-20 sm:h-24 w-full rounded-2xl bg-[#0D1224]/50 border border-white/[0.04] flex items-center justify-center text-[11px] font-medium text-slate-400 select-none">
          <span className="uppercase tracking-widest text-[9px] text-slate-400">Advertisement Area</span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Sponsored advertisement area"
      className={`w-full my-4 ${className}`}
    >
      <div className="h-16 sm:h-20 w-full rounded-2xl bg-[#0D1224]/50 border border-white/[0.04] flex items-center justify-center text-[11px] font-medium text-slate-400 select-none">
        <span className="uppercase tracking-widest text-[9px] text-slate-400">Advertisement Area</span>
      </div>
    </aside>
  );
};
