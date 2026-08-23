import React from 'react';
import { Tool } from '../types';
import { ToolItem } from './ToolItem';
import { useApp } from '../context/AppContext';

interface ToolGridProps {
  tools?: Tool[];
  emptyMessage?: string;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  emptyMessage = 'No tools found matching your criteria.',
}) => {
  const { filteredTools } = useApp();
  const displayTools = tools ?? filteredTools ?? [];

  if (displayTools.length === 0) {
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

