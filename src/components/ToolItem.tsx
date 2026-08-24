import React from 'react';
import { Tool } from '../types';
import { useApp } from '../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import { Heart } from 'lucide-react';

interface ToolItemProps {
  tool: Tool;
}

export const ToolItem: React.FC<ToolItemProps> = ({ tool }) => {
  const { navigate, isFavorite, toggleFavorite } = useApp();
  const favorite = isFavorite(tool.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(tool.route);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(tool.id);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(tool.route);
        }
      }}
      className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-[#11182C] border border-white/[0.06] hover:border-white/[0.18] hover:bg-[#17203B] active:scale-[0.97] transition-all duration-200 cursor-pointer text-center select-none shadow-sm hover:shadow-md hover:shadow-purple-500/5"
    >
      {/* Subtle Favorite toggle button */}
      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-label={favorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
        className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all cursor-pointer z-10 ${
          favorite
            ? 'opacity-100 text-pink-500 scale-110'
            : 'opacity-40 sm:opacity-0 group-hover:opacity-100 text-slate-400 hover:text-pink-400 hover:bg-white/[0.08]'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-pink-500 text-pink-500' : ''}`} />
      </button>

      {/* App-like Rounded Icon Container */}
      <div
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2.5 shadow-sm transition-transform duration-200 group-hover:scale-110"
        style={{
          backgroundColor: `${tool.colorAccent || '#8B5CF6'}18`,
          color: tool.colorAccent || '#8B5CF6',
          border: `1px solid ${tool.colorAccent || '#8B5CF6'}30`,
        }}
      >
        <DynamicIcon name={tool.icon} size={24} />
      </div>

      {/* Tool Name Only */}
      <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white leading-tight line-clamp-2 px-1">
        {tool.name}
      </span>
    </div>
  );
};
