import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/tools';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { ToolCategory } from '../types';

export const CategoryNav: React.FC = () => {
  const { activeCategory, setActiveCategory, showFavoritesOnly, setShowFavoritesOnly, navigate, currentRoute, favorites } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isHome = currentRoute === '/';

  const handleSelect = (catId: ToolCategory) => {
    setShowFavoritesOnly(false);
    setActiveCategory(catId);
    if (!isHome) {
      navigate('/');
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full border-b border-white/[0.06] bg-[#070A14]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center">
        
        {/* Left Scroll arrow for desktop */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex p-1.5 rounded-full bg-[#11182C] border border-white/[0.08] text-slate-400 hover:text-white shadow-sm mr-2 shrink-0 cursor-pointer"
          aria-label="Scroll Categories Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar scroll-smooth w-full"
        >
          {showFavoritesOnly && (
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(false)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer bg-pink-600 text-white shadow-md shadow-pink-500/25 border border-pink-400/40"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Favorites ({favorites.length})</span>
            </button>
          )}

          {CATEGORIES.map((cat) => {
            const isActive = !showFavoritesOnly && activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/40 scale-[1.02]'
                    : 'bg-[#11182C]/80 text-slate-300 border border-white/[0.06] hover:bg-[#17203B] hover:text-white hover:border-white/[0.14]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-transform"
                  style={{
                    backgroundColor: isActive ? '#FFFFFF' : cat.color,
                    boxShadow: isActive ? '0 0 6px rgba(255,255,255,0.8)' : undefined,
                  }}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll arrow for desktop */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex p-1.5 rounded-full bg-[#11182C] border border-white/[0.08] text-slate-400 hover:text-white shadow-sm ml-2 shrink-0 cursor-pointer"
          aria-label="Scroll Categories Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

