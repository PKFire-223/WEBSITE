import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GachaItem, Rarity, GachaCardState } from '../types/gacha';
import { RARITY_CONFIG } from '../data/gachaItems';
import { gachaAudio } from '../utils/gachaAudio';
import { Sparkles, FastForward, CheckCircle2, Coins, Flame, RotateCcw, X } from 'lucide-react';

interface CardRevealModalProps {
  items: GachaItem[];
  coins: number;
  alchemyBonusMultiplier?: number;
  onClose: () => void;
  onSpinAgain1: () => void;
  onSpinAgain10: () => void;
  onSellSelected: (rarities: Rarity[]) => void;
}

export const CardRevealModal: React.FC<CardRevealModalProps> = ({
  items,
  coins,
  alchemyBonusMultiplier = 0,
  onClose,
  onSpinAgain1,
  onSpinAgain10,
  onSellSelected,
}) => {
  const [cards, setCards] = useState<GachaCardState[]>(() =>
    items.map((item, index) => ({
      index,
      item,
      isFlipped: false,
    }))
  );

  const [activeMysticItem, setActiveMysticItem] = useState<GachaItem | null>(null);
  const [activeLegendItem, setActiveLegendItem] = useState<GachaItem | null>(null);
  const [soldRarities, setSoldRarities] = useState<Set<Rarity>>(new Set());
  const hasTriggeredInitialSound = useRef(false);

  // Check if all cards are flipped
  const allFlipped = cards.every(c => c.isFlipped);

  // Trigger high rarity special fanfare on reveal
  const handleFlipCard = (index: number) => {
    setCards(prev => {
      if (prev[index].isFlipped) return prev;
      const updated = [...prev];
      const card = { ...updated[index], isFlipped: true, flippedAt: Date.now() };
      updated[index] = card;

      // Audio feedback
      gachaAudio.playCardFlip();
      gachaAudio.playRarityReveal(card.item.rarity);

      // Visual fanfare according to rarity
      if (card.item.rarity === 'mystic') {
        setActiveMysticItem(card.item);
        // Multi-stage rainbow confetti
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ff0055', '#ff9900', '#ffff00', '#33cc33', '#3399ff', '#9933ff'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 70,
            origin: { x: 0 },
            colors: ['#ff007f', '#a855f7', '#38bdf8', '#fbbf24'],
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 70,
            origin: { x: 1 },
            colors: ['#ff007f', '#a855f7', '#38bdf8', '#fbbf24'],
          });
        }, 300);
      } else if (card.item.rarity === 'legend') {
        setActiveLegendItem(card.item);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff'],
        });
      }

      return updated;
    });
  };

  // Flip all remaining cards immediately (SKIP button)
  const handleSkipAll = () => {
    gachaAudio.playSkipAll();
    let foundMystic: GachaItem | null = null;
    let foundLegend: GachaItem | null = null;

    setCards(prev =>
      prev.map(c => {
        if (!c.isFlipped) {
          if (c.item.rarity === 'mystic' && !foundMystic) foundMystic = c.item;
          if (c.item.rarity === 'legend' && !foundLegend) foundLegend = c.item;
          return { ...c, isFlipped: true, flippedAt: Date.now() };
        }
        return c;
      })
    );

    if (foundMystic) {
      gachaAudio.playRarityReveal('mystic');
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#ff0055', '#a855f7', '#fbbf24', '#38bdf8'],
      });
    } else if (foundLegend) {
      gachaAudio.playRarityReveal('legend');
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#fff'],
      });
    }
  };

  // Auto flip single card after short delay if x1 pull
  useEffect(() => {
    if (cards.length === 1 && !hasTriggeredInitialSound.current) {
      hasTriggeredInitialSound.current = true;
      const t = setTimeout(() => {
        handleFlipCard(0);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [cards.length]);

  // Summarize pulled items
  const countsByRarity: Record<Rarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legend: 0,
    mystic: 0,
  };
  cards.forEach(c => {
    countsByRarity[c.item.rarity]++;
  });

  const priceMult = 1 + alchemyBonusMultiplier;
  const commonSellTotal = Math.round(countsByRarity.common * RARITY_CONFIG.common.sellPrice * priceMult * 10) / 10;
  const rareSellTotal = Math.round(countsByRarity.rare * RARITY_CONFIG.rare.sellPrice * priceMult * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Mystic Special Highlight Modal Overlay if just revealed */}
      {activeMysticItem && (
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-scaleUp">
          <div className="relative max-w-md w-full bg-gradient-to-b from-rose-950/90 via-purple-950/90 to-neutral-950 border-2 border-rose-500 rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(244,63,94,0.6)]">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r from-rose-600 via-fuchsia-600 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-lg border border-amber-300 animate-pulse">
              ✨ BÁU VẬT THẦN THOẠI (MYSTIC) ✨
            </div>
            <div className="text-8xl my-6 animate-bounce filter drop-shadow-[0_0_25px_rgba(244,63,94,0.8)]">
              {activeMysticItem.iconEmoji}
            </div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-amber-200 to-fuchsia-300 mb-1">
              {activeMysticItem.name}
            </h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-400 text-rose-200 text-xs font-semibold mb-4">
              <span>Hệ: {activeMysticItem.element}</span>
              <span>•</span>
              <span>Giá bán: 1,000 Đồng</span>
            </div>
            <p className="text-sm text-neutral-300 mb-6 italic leading-relaxed">
              "{activeMysticItem.description}"
            </p>
            <button
              onClick={() => setActiveMysticItem(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-fuchsia-600 hover:brightness-110 text-white font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Tiếp Tục Chiêm Ngưỡng
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-5xl bg-neutral-950/95 border border-neutral-800 rounded-3xl p-4 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2">
                Đài Triệu Hồi Kỳ Trân
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 font-medium">
                  {cards.length === 1
                    ? 'Quay x1'
                    : cards.length > 10
                    ? `Bốc ${cards.length} Thẻ (Thưởng +${cards.length - 10} Thẻ!)`
                    : 'Quay x10'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {!allFlipped
                  ? 'Bấm từng thẻ bài để lật mở báu vật, hoặc bấm Lật Nhanh (Skip)'
                  : 'Tất cả thẻ bài đã được khai mở!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!allFlipped && (
              <button
                onClick={handleSkipAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <FastForward className="w-4 h-4 fill-current" />
                <span>Lật Nhanh (Skip)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto py-6 px-1 my-2">
          <div
            className={`grid gap-4 sm:gap-6 justify-center ${
              cards.length === 1
                ? 'grid-cols-1 max-w-xs mx-auto'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
            }`}
          >
            {cards.map((card, idx) => {
              const cfg = RARITY_CONFIG[card.item.rarity];
              const isMystic = card.item.rarity === 'mystic';
              const isLegend = card.item.rarity === 'legend';

              return (
                <div
                  key={card.index}
                  onClick={() => handleFlipCard(card.index)}
                  className={`group relative h-64 sm:h-72 cursor-pointer perspective-1000 select-none transition-transform hover:-translate-y-1 active:scale-95`}
                >
                  {/* Card Inner Container with 3D flip */}
                  <div
                    className={`relative w-full h-full duration-500 transition-transform transform-style-3d ${
                      card.isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* CARD BACK (Face Down) */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-amber-600/40 p-3 flex flex-col items-center justify-between backface-hidden shadow-lg shadow-black/60">
                      {/* Decorative corner runes */}
                      <div className="w-full flex justify-between text-xs text-amber-500/50">
                        <span>✦</span>
                        <span>ᚲ</span>
                        <span>✦</span>
                      </div>

                      {/* Center Mystical Seal */}
                      <div className="relative flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full border border-amber-500/40 bg-neutral-900/90 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:border-amber-400 group-hover:scale-105 transition-all">
                          <div className="w-14 h-14 rounded-full border border-dashed border-amber-500/60 flex items-center justify-center animate-spin-slow">
                            <span className="text-2xl text-amber-400">❖</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-widest mt-3">
                          Thẻ #{idx + 1}
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-0.5 animate-pulse">
                          Bấm để mở
                        </span>
                      </div>

                      <div className="w-full flex justify-between text-xs text-amber-500/50">
                        <span>✦</span>
                        <span>ᛏ</span>
                        <span>✦</span>
                      </div>
                    </div>

                    {/* CARD FRONT (Revealed Item) */}
                    <div
                      className={`absolute inset-0 w-full h-full rounded-2xl border-2 p-3.5 flex flex-col justify-between backface-hidden rotate-y-180 shadow-xl overflow-hidden ${
                        cfg.borderColor
                      } ${cfg.bgColor} ${
                        isMystic
                          ? 'shadow-[0_0_35px_rgba(244,63,94,0.6)] animate-pulse'
                          : isLegend
                          ? 'shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                          : cfg.glowColor
                      }`}
                    >
                      {/* Background Aura */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-b ${cfg.auraGradient} pointer-events-none opacity-60`}
                      />

                      {/* Header Badge */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${cfg.badgeBg} border ${cfg.badgeBorder}`}
                        >
                          {cfg.shortLabel}
                        </span>
                        <span className="text-[10px] text-neutral-300/80 font-mono">
                          #{card.item.numId}
                        </span>
                      </div>

                      {/* Item Icon */}
                      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                        <div
                          className={`text-5xl sm:text-6xl filter drop-shadow-md transition-transform duration-300 hover:scale-110 ${
                            isMystic ? 'animate-bounce' : ''
                          }`}
                        >
                          {card.item.iconEmoji}
                        </div>
                        <div className="text-xs font-semibold text-neutral-300 mt-2 px-2 py-0.5 rounded bg-black/40 border border-white/5">
                          Hệ {card.item.element}
                        </div>
                      </div>

                      {/* Item Info Footer */}
                      <div className="relative z-10 text-center">
                        <h4
                          className={`text-xs sm:text-sm font-bold truncate ${cfg.textColor}`}
                          title={card.item.name}
                        >
                          {card.item.name}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5 pt-1.5 border-t border-white/10">
                          <span className="text-[10px] text-neutral-400 truncate max-w-[80px]">
                            {card.item.batchName.split(':')[0]}
                          </span>
                          <span className="text-amber-400 font-bold font-mono">
                            +{card.item.sellPrice}🪙
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions / Summary */}
        <div className="pt-4 border-t border-neutral-800/80 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Rarity Summary Counters */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start text-xs">
            <span className="text-neutral-400">Kết quả:</span>
            {countsByRarity.mystic > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-rose-300 font-bold">
                {countsByRarity.mystic} Mystic
              </span>
            )}
            {countsByRarity.legend > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 font-bold">
                {countsByRarity.legend} Legend
              </span>
            )}
            {countsByRarity.epic > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500 text-purple-300 font-semibold">
                {countsByRarity.epic} Epic
              </span>
            )}
            {countsByRarity.rare > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300">
                {countsByRarity.rare} Rare
              </span>
            )}
            {countsByRarity.common > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                {countsByRarity.common} Common
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            {/* Quick sell options once all cards revealed */}
            {allFlipped && countsByRarity.common > 0 && !soldRarities.has('common') && (
              <button
                onClick={() => {
                  onSellSelected(['common']);
                  setSoldRarities(prev => new Set(prev).add('common'));
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Bán tất cả thẻ Common vừa quay được"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Bán Common (+{commonSellTotal}🪙)
              </button>
            )}

            {allFlipped && countsByRarity.rare > 0 && !soldRarities.has('rare') && (
              <button
                onClick={() => {
                  onSellSelected(['rare']);
                  setSoldRarities(prev => new Set(prev).add('rare'));
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-200 text-xs font-semibold border border-cyan-800 transition-colors cursor-pointer"
                title="Bán tất cả thẻ Rare vừa quay được"
              >
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                Bán Rare (+{rareSellTotal}🪙)
              </button>
            )}

            {/* Re-spin buttons */}
            <button
              onClick={onSpinAgain1}
              disabled={coins < 2}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Quay Tiếp x1 (2🪙)
            </button>

            <button
              onClick={onSpinAgain10}
              disabled={coins < 20}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Quay Tiếp x10 (20🪙)
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold border border-neutral-700 transition-colors cursor-pointer"
            >
              Hoàn Tất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
