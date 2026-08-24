import React, { createContext, useContext, useEffect, useState } from 'react';
import { Tool, ToolCategory } from '../types';
import { TOOLS } from '../data/tools';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  activeCategory: ToolCategory;
  setActiveCategory: (cat: ToolCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentRoute: string;
  navigate: (path: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (val: boolean) => void;
  activeTool: Tool | null;
  filteredTools: Tool[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('et_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Favorites state - strictly empty by default for new users
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('et_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Category and search state
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Client-side Routing state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname || '/';
    return path;
  });

  // Apply theme class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('et_theme', theme);
  }, [theme]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('et_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Listen to popstate (browser back / forward button)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleFavorite = (toolId: string) => {
    setFavorites(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active tool if on /tools/:toolId or clean /:toolId or t.route
  const activeTool = React.useMemo(() => {
    if (currentRoute === '/' || currentRoute === '') return null;
    
    // Check if route matches static pages or categories
    if (['/about', '/privacy', '/terms', '/contact'].includes(currentRoute)) return null;
    if (currentRoute.startsWith('/category/')) return null;

    // Check direct route match
    const directMatch = TOOLS.find(t => t.route === currentRoute);
    if (directMatch) return directMatch;

    // Check with /tools/ prefix stripped or added
    const cleanSlug = currentRoute.replace(/^\/tools\//, '').replace(/^\//, '');
    return TOOLS.find(t => t.id === cleanSlug || t.route === `/${cleanSlug}` || t.route === `/tools/${cleanSlug}`) || null;
  }, [currentRoute]);

  // Filter tools based on search, category, and favorites
  const filteredTools = React.useMemo(() => {
    let result = TOOLS;

    if (showFavoritesOnly) {
      result = result.filter(t => favorites.includes(t.id));
    }

    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => {
        const nameMatch = t.name?.toLowerCase().includes(q);
        const idMatch = t.id?.toLowerCase().includes(q);
        const keywordMatch = (t.keywords || []).some(k => k?.toLowerCase().includes(q));
        const categoryMatch = t.category?.toLowerCase().includes(q);
        return Boolean(nameMatch || idMatch || keywordMatch || categoryMatch);
      });
    }

    return result;
  }, [activeCategory, searchQuery, showFavoritesOnly, favorites]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        favorites,
        toggleFavorite,
        isFavorite,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        currentRoute,
        navigate,
        showFavoritesOnly,
        setShowFavoritesOnly,
        activeTool,
        filteredTools,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
