import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/tools';
import { Sparkles, ShieldCheck, Heart, X } from 'lucide-react';
import { ToolCategory } from '../types';

export const Footer: React.FC = () => {
  const { setActiveCategory, navigate } = useApp();
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  const handleCategoryNav = (catId: ToolCategory) => {
    setActiveCategory(catId);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 sm:mt-24 border-t border-white/[0.08] bg-[#070A14] py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top footer row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight flex items-center gap-0.5">
                <span className="text-white">Everyday</span>
                <span className="text-purple-400">Toolbox</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Extremely simple, lightning-fast utilities. All conversions and calculations happen 100% locally inside your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Server Storage & Zero Data Tracking</span>
          </div>
        </div>

        {/* Categories Link Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 pt-6 border-t border-white/[0.04] text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryNav(cat.id)}
              className="text-left text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Bottom footer row */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-400">
            © 2026 Everyday Toolbox. All rights reserved. 100% Private Client-Side Utilities.
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => { navigate('/about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => { navigate('/privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => { navigate('/terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              onClick={() => { navigate('/contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Info Dialog Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0D1224] border border-white/[0.12] p-6 sm:p-8 space-y-4 shadow-2xl">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white capitalize">
              {modalType === 'privacy' && 'Privacy Policy'}
              {modalType === 'terms' && 'Terms of Service'}
              {modalType === 'contact' && 'Contact Everyday Toolbox'}
            </h3>

            <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed max-h-96 overflow-y-auto pr-2">
              {modalType === 'privacy' && (
                <>
                  <p>
                    Everyday Toolbox operates entirely on a <strong>client-side execution model</strong>.
                  </p>
                  <p>
                    <strong>1. No File Uploads:</strong> When you compress an image, merge a PDF, convert text, or calculate numbers, your files and data never leave your browser. All processing is carried out in local memory via JavaScript, Web APIs, and Canvas.
                  </p>
                  <p>
                    <strong>2. No Accounts or Tracking:</strong> We do not require accounts, sign-ups, or personal identity collection. Preferences like favorites and dark/light themes are saved exclusively on your local device via standard browser localStorage.
                  </p>
                </>
              )}

              {modalType === 'terms' && (
                <>
                  <p>
                    Everyday Toolbox provides free online utilities on an "as is" and "as available" basis without warranties of any kind.
                  </p>
                  <p>
                    By using this service, you agree not to use the tools for illegal, abusive, or harmful activities. Because all operations are executed on your local device, you maintain full ownership and responsibility for your files and documents.
                  </p>
                </>
              )}

              {modalType === 'contact' && (
                <>
                  <p>
                    Have tool suggestions or feedback? Everyday Toolbox is built to provide the fastest, simplest utility experience.
                  </p>
                  <p className="p-3 rounded-xl bg-[#11182C] border border-white/[0.08] font-mono text-purple-300 text-xs">
                    support@everydaytoolbox.app
                  </p>
                  <p className="text-xs text-slate-400">
                    We typically review tool suggestions and browser compatibility reports within 24-48 hours.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
