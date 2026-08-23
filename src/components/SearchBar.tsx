import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, Command } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, filteredTools, navigate } = useApp();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTool = (route: string) => {
    navigate(route);
    setIsFocused(false);
    setSearchQuery('');
  };

  const showDropdown = isFocused && searchQuery.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto my-4 sm:my-6 px-4">
      {/* Search Input Container */}
      <div
        className={`relative flex items-center w-full rounded-2xl bg-[#0D1224] border transition-all duration-200 shadow-lg ${
          isFocused
            ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-purple-500/10'
            : 'border-white/[0.08] hover:border-white/[0.16]'
        }`}
      >
        <div className="pl-4 pr-2 text-slate-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search any tool... (e.g. compress, jpg, pdf, qr)"
          className="w-full py-3.5 pr-10 text-sm sm:text-base bg-transparent text-white placeholder-slate-400 focus:outline-none"
        />

        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
            className="pr-4 text-slate-400 hover:text-white"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 pr-4 text-slate-400 text-xs font-mono">
            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] flex items-center gap-0.5">
              <Command className="w-3 h-3" /> K
            </span>
          </div>
        )}
      </div>

      {/* Instant Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute left-4 right-4 mt-2 bg-[#0D1224]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 z-50 max-h-80 overflow-y-auto no-scrollbar p-2">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredTools.slice(0, 12).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.route)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-left bg-[#11182C]/70 hover:bg-purple-600/20 border border-white/[0.04] hover:border-purple-500/30 transition-all group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `${tool.colorAccent || '#8B5CF6'}20`,
                      color: tool.colorAccent || '#8B5CF6',
                    }}
                  >
                    <DynamicIcon name={tool.icon} size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-100 group-hover:text-white truncate">
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No matching tools found for "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
