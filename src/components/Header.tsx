import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/tools';
import { Search, Heart, Sun, Moon, Sparkles, Menu, X, ShieldCheck } from 'lucide-react';
import { ToolCategory } from '../types';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    favorites,
    navigate,
    currentRoute,
    activeCategory,
    setActiveCategory,
    showFavoritesOnly,
    setShowFavoritesOnly,
    setSearchQuery,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = currentRoute === '/';

  const handleCategoryClick = (catId: ToolCategory) => {
    setActiveCategory(catId);
    setShowFavoritesOnly(false);
    if (!isHome) {
      navigate('/');
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setActiveCategory('all');
    setShowFavoritesOnly(false);
    setSearchQuery('');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleFavoritesClick = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    if (!isHome) {
      navigate('/');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070A14]/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          aria-label="Everyday Toolbox Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight flex items-center gap-0.5">
              <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Everyday</span>
              <span className={theme === 'light' ? 'text-purple-600' : 'text-purple-400'}>Toolbox</span>
            </span>
          </div>
        </button>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {CATEGORIES.slice(0, 7).map((cat) => {
            const isActive = isHome && !showFavoritesOnly && activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Favorites, Theme Toggle, Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Favorites Button */}
          <button
            onClick={handleFavoritesClick}
            aria-label="View Favorites"
            className={`relative p-2 rounded-xl border transition-all ${
              showFavoritesOnly
                ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                : 'border-white/[0.08] bg-[#11182C] text-slate-300 hover:text-white hover:border-white/[0.15]'
            }`}
            title="Saved Favorite Tools"
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-pink-500 text-pink-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-white/[0.08] bg-[#11182C] text-slate-300 hover:text-white hover:border-white/[0.15] transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-400" />
            )}
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 rounded-xl border border-white/[0.08] bg-[#11182C] text-slate-300 hover:text-white hover:border-white/[0.15]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#0D1224] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = isHome && !showFavoritesOnly && activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                      : 'bg-[#11182C] text-slate-300 border border-white/[0.05] hover:border-white/[0.15]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser & Private
            </span>
            <span>v1.0</span>
          </div>
        </div>
      )}
    </header>
  );
};
