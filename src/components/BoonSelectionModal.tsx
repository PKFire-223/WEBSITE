import React from 'react';
import confetti from 'canvas-confetti';
import { AncientBoon } from '../types/boon';
import { playClickSound, playSealAwakenSound } from '../utils/audio';
import { Sparkles, Zap, CheckCircle2, Clock, X } from 'lucide-react';

interface BoonSelectionModalProps {
  isOpen: boolean;
  boons: AncientBoon[];
  stageNumber: number;
  onSelectBoon: (boon: AncientBoon) => void;
  onClose?: () => void;
}

const RARITY_THEMES: Record<string, {
  border: string;
  bg: string;
  glow: string;
  badge: string;
  text: string;
}> = {
  rare: {
    border: 'border-cyan-500/70 hover:border-cyan-400',
    bg: 'bg-gradient-to-b from-cyan-950/70 via-neutral-950 to-neutral-950',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    text: 'text-cyan-300',
  },
  epic: {
    border: 'border-purple-500/80 hover:border-purple-400',
    bg: 'bg-gradient-to-b from-purple-950/80 via-neutral-950 to-neutral-950',
    glow: 'shadow-[0_0_35px_rgba(168,85,247,0.3)]',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    text: 'text-purple-300',
  },
  legend: {
    border: 'border-amber-400 hover:border-yellow-300',
    bg: 'bg-gradient-to-b from-amber-950/80 via-neutral-950 to-neutral-950',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.35)]',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-black',
    text: 'text-amber-300',
  },
  mystic: {
    border: 'border-rose-400 hover:border-rose-300 ring-2 ring-rose-500/40',
    bg: 'bg-gradient-to-b from-rose-950/85 via-neutral-950 to-neutral-950',
    glow: 'shadow-[0_0_50px_rgba(244,63,94,0.45)]',
    badge: 'bg-gradient-to-r from-rose-500 to-amber-500 text-neutral-950 font-black',
    text: 'text-rose-300',
  },
};

export const BoonSelectionModal: React.FC<BoonSelectionModalProps> = ({
  isOpen,
  boons,
  stageNumber,
  onSelectBoon,
  onClose,
}) => {
  if (!isOpen || boons.length === 0) return null;

  const handlePick = (boon: AncientBoon) => {
    playSealAwakenSound();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#c084fc', '#f43f5e'],
    });
    onSelectBoon(boon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-5xl flex flex-col bg-neutral-950 border-2 border-amber-500/60 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-28 bg-gradient-to-b from-amber-500/25 via-purple-600/15 to-transparent blur-3xl pointer-events-none" />

        {/* Close / Postpone button */}
        {onClose && (
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title="Để sau (Bạn có thể mở lại bất kỳ lúc nào)"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center border-b border-neutral-800/80 bg-neutral-900/40 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>HOÀN THÀNH ĐƠN HÀNG ĐỢT {stageNumber}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-mono tracking-wide uppercase">
            CHỌN 1 TRONG 3 THƯỢNG CỔ THẦN LỰC
          </h2>

          {/* NO TIMER BADGE / ASSURANCE BANNER */}
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold shadow-sm">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>⏳ KHÔNG GIỚI HẠN THỜI GIAN — Bạn hãy thong thả đọc kỹ hiệu ứng của cả 3 Thần Lực trước khi chọn!</span>
          </div>
        </div>

        {/* 3 BOONS CARDS GRID */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto max-h-[65vh]">
          {boons.map(boon => {
            const theme = RARITY_THEMES[boon.rarity] || RARITY_THEMES.rare;

            return (
              <div
                key={boon.id}
                onClick={() => handlePick(boon)}
                className={`relative rounded-2xl p-5 border-2 ${theme.border} ${theme.bg} ${theme.glow} flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer group shadow-xl`}
              >
                {/* Rarity & Icon */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase tracking-wider ${theme.badge}`}>
                      {boon.rarity}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono font-bold">
                      #{boon.id}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto my-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                    {boon.iconEmoji}
                  </div>

                  {/* Title & Name */}
                  <div className="text-center mb-3">
                    <p className="text-[11px] text-amber-400 font-mono font-bold italic uppercase tracking-wider">
                      {boon.title}
                    </p>
                    <h3 className="text-base sm:text-lg font-black text-white font-mono mt-0.5 group-hover:text-amber-300 transition-colors">
                      {boon.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-300 leading-relaxed text-center mb-4">
                    {boon.description}
                  </p>
                </div>

                {/* Short effect highlight & action button */}
                <div>
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-center mb-4">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{boon.shortEffect}</span>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handlePick(boon);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-xs font-mono uppercase tracking-wide shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chọn Thần Lực Này</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom footer hint & Postpone button */}
        <div className="px-6 py-3 border-t border-neutral-800/80 bg-neutral-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
          <span>🔮 Mỗi đợt trả nhiệm vụ sẽ khai mở 3 Thần Lực ngẫu nhiên khác nhau từ 80 sức mạnh cổ tích!</span>
          {onClose && (
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Để Xem Lại Sau
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
