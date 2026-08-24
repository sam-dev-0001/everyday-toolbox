import React from 'react';
import { Tool } from '../types';
import { ToolItem } from './ToolItem';
import { useApp } from '../context/AppContext';
import { Heart } from 'lucide-react';

interface ToolGridProps {
  tools?: Tool[];
  emptyMessage?: string;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  emptyMessage = 'No tools found matching your criteria.',
}) => {
  const { filteredTools, showFavoritesOnly } = useApp();
  const displayTools = tools ?? filteredTools ?? [];

  if (displayTools.length === 0) {
    if (showFavoritesOnly) {
      return (
        <div className="w-full py-16 px-6 text-center rounded-3xl bg-[#0D1224] border border-white/[0.08] space-y-3 shadow-lg max-w-lg mx-auto my-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No favorite tools yet</h3>
          <p className="text-xs sm:text-sm text-slate-400">Tap the heart on any tool to save it here.</p>
        </div>
      );
    }

    return (
      <div className="w-full py-12 text-center text-slate-400 bg-[#11182C]/50 rounded-2xl border border-white/[0.04]">
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
      {displayTools.map((tool) => (
        <ToolItem key={tool.id} tool={tool} />
      ))}
    </div>
  );
};


