import React, { useState } from 'react';
import { Tool } from '../types';
import { TOOLS } from '../data/tools';
import { useApp } from '../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  FileCheck2,
  Cpu,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ToolSeoContentProps {
  tool: Tool;
}

export const ToolSeoContent: React.FC<ToolSeoContentProps> = ({ tool }) => {
  const { navigate } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Find related tools objects
  const relatedTools = (tool.relatedToolIds || [])
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is Tool => Boolean(t));

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="mt-16 sm:mt-20 border-t border-white/[0.08] pt-12 space-y-14 text-slate-300">
      
      {/* 1. Step-by-Step How to Use Guide */}
      {tool.howToUse && tool.howToUse.length > 0 && (
        <section aria-labelledby="how-to-use-heading" className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="how-to-use-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                How to Use {tool.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Follow these simple steps to process your files in seconds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {tool.howToUse.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl bg-[#0D1224]/80 border border-white/[0.08] p-5 sm:p-6 space-y-3 hover:border-purple-500/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-purple-500/20">
                  {step.step}
                </div>
                <h3 className="font-semibold text-base text-white group-hover:text-purple-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Specifications & Supported Formats Grid */}
      <section aria-labelledby="specs-heading" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supported Formats Card */}
        {tool.supportedFormats && tool.supportedFormats.length > 0 && (
          <div className="rounded-2xl bg-[#0D1224]/80 border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center gap-2 text-purple-400">
              <FileCheck2 className="w-5 h-5" />
              <h3 id="specs-heading" className="font-bold text-base text-white">
                Supported Formats & Input
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Input Formats:</span>
                <div className="flex flex-wrap gap-1.5">
                  {tool.supportedFormats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.06] text-slate-200 border border-white/[0.08]"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
              {tool.outputFormats && tool.outputFormats.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1.5">Output Formats:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.outputFormats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security & Client-Side Engine Card */}
        <div className="rounded-2xl bg-[#0D1224]/80 border border-white/[0.08] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">
                Privacy & Data Security
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {tool.privacyInfo || 'Processed 100% locally in your web browser. Your images, documents, and data are never uploaded to any remote server.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pt-3 border-t border-white/[0.04]">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Execution: Local Device Hardware & WebAssembly / Canvas</span>
          </div>
        </div>
      </section>

      {/* 3. Frequently Asked Questions (FAQ) with Accordion */}
      {tool.faq && tool.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Common questions about using {tool.name} online.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {tool.faq.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.question}
                  className="rounded-2xl bg-[#0D1224]/80 border border-white/[0.08] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none cursor-pointer group"
                  >
                    <span className="font-semibold text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors pr-4">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-purple-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 border-t border-white/[0.04] leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Related Tools Grid */}
      {relatedTools.length > 0 && (
        <section aria-labelledby="related-tools-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 id="related-tools-heading" className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Related Everyday Tools
            </h2>
            <button
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <span>View All 60+ Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((relTool) => (
              <button
                key={relTool.id}
                onClick={() => {
                  navigate(relTool.route);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-2xl bg-[#0D1224]/80 border border-white/[0.08] p-4 text-left hover:border-purple-500/40 hover:bg-[#11182C] transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${relTool.colorAccent || '#8B5CF6'}18` }}
                  >
                    <DynamicIcon
                      name={relTool.icon}
                      className="w-5 h-5"
                      style={{ color: relTool.colorAccent || '#8B5CF6' }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {relTool.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {relTool.category} Tool
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {relTool.description}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
