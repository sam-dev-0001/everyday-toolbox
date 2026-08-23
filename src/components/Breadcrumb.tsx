import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, Home } from 'lucide-react';
import { Tool } from '../types';
import { CATEGORIES } from '../data/tools';

interface BreadcrumbProps {
  tool?: Tool | null;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ tool }) => {
  const { navigate, setActiveCategory } = useApp();

  const handleHomeClick = () => {
    setActiveCategory('all');
    navigate('/');
  };

  const handleCategoryClick = () => {
    if (tool) {
      setActiveCategory(tool.category);
      navigate('/');
    }
  };

  const categoryInfo = tool ? CATEGORIES.find(c => c.id === tool.category) : null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 sm:mb-6">
      <button
        onClick={handleHomeClick}
        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {categoryInfo && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <button
            onClick={handleCategoryClick}
            className="hover:text-white transition-colors cursor-pointer capitalize"
          >
            {categoryInfo.name} Tools
          </button>
        </>
      )}

      {tool && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-purple-300 font-semibold truncate max-w-[200px] sm:max-w-none">
            {tool.name}
          </span>
        </>
      )}
    </nav>
  );
};
