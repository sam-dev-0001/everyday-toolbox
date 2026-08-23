import React from 'react';
import { Download, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DownloadButtonProps {
  onClick: () => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  className?: string;
  fireConfetti?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onClick,
  label = 'Download Result',
  sublabel,
  disabled = false,
  isProcessing = false,
  className = '',
  fireConfetti = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled || isProcessing) return;
    if (fireConfetti) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#7C3AED', '#8B5CF6', '#3B82F6', '#10B981'],
        });
      } catch {
        // Safe fallback
      }
    }
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.99] ${
        disabled
          ? 'bg-white/[0.05] text-slate-400 border border-white/[0.08] cursor-not-allowed shadow-none'
          : isProcessing
          ? 'bg-purple-700 text-white animate-pulse'
          : 'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#3B82F6] hover:from-[#6D28D9] hover:to-[#2563EB] text-white shadow-purple-500/25 hover:shadow-purple-500/40 border border-white/20'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Download className="w-5 h-5 shrink-0" />
        )}
        <span>{isProcessing ? 'Processing...' : label}</span>
      </div>

      {sublabel && (
        <span className="text-xs font-normal text-purple-200 bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
          {sublabel}
        </span>
      )}
    </button>
  );
};
