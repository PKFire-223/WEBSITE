import React, { useState } from 'react';
import { ArcaneCoreConfig, CoreType } from '../types/gacha';
import { ARCANE_CORES, CORE_TYPES } from '../data/coresData';
import { playClickSound, playSealAwakenSound } from '../utils/audio';
import { X, Sparkles, Coins, Zap, CheckCircle, ArrowUp, Info, Lock, Unlock, Dices } from 'lucide-react';

interface ArcaneCoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  currentStage: number; // 1 to 10
  coreLevels: Record<CoreType, number>;
  onUpgradeCore: (coreType: CoreType, cost: number) => void;
}

export const ArcaneCoresModal: React.FC<ArcaneCoresModalProps> = ({
  isOpen,
  onClose,
  coins,
  currentStage,
  coreLevels,
  onUpgradeCore,
}) => {
  const [filterType, setFilterType] = useState<
    'all' | 'roll' | 'unlocked' | 'locked' | 'economy' | 'element' | 'mastery'
  >('all');

  if (!isOpen) return null;

  const totalCoreLevels = CORE_TYPES.reduce((acc, t) => acc + (coreLevels[t] || 0), 0);
  const maxPossibleLevels = CORE_TYPES.length * 5;

  const unlockedCount = CORE_TYPES.filter(type => ARCANE_CORES[type].requiredStage <= currentStage).length;
  const lockedCount = CORE_TYPES.length - unlockedCount;

  const filteredCores = CORE_TYPES.filter(type => {
    const core = ARCANE_CORES[type];
    const isUnlocked = core.requiredStage <= currentStage;

    if (filterType === 'roll') return core.category === 'roll';
    if (filterType === 'unlocked') return isUnlocked;
    if (filterType === 'locked') return !isUnlocked;
    if (filterType === 'economy') return core.category === 'economy';
    if (filterType === 'element') return core.category === 'element';
    if (filterType === 'mastery') return core.category === 'mastery' || core.category === 'ultimate';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-neutral-950 border-2 border-amber-500/50 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-amber-500/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/80 gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-2xl">
                🔮
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-mono tracking-wide uppercase">
                  30 Lõi Ma Pháp Thượng Cổ
                </h3>
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {totalCoreLevels}/{maxPossibleLevels} Cấp Độ
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Đã Mở: {unlockedCount}/30 Lõi (Đợt {currentStage}/10)
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Khai mở theo từng Đợt Bí Chỉ: Tăng thêm lượt roll miễn phí, bùng nổ tỉ lệ hiếm, ngũ hành và kinh tế tối thượng!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Coins Balance */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black font-mono">{coins.toLocaleString()} 🪙</span>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FILTER CATEGORY PILLS */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900/40 border-b border-neutral-800/80 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
            }`}
          >
            Tất Cả (30 Lõi)
          </button>
          <button
            onClick={() => setFilterType('roll')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'roll'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-neutral-950 shadow-sm'
                : 'text-cyan-300 hover:text-white bg-cyan-950/40 border border-cyan-700/50'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>🎲 Tăng Lượt Roll (Tụ Khí, Thiên Lực, Cuồng Nộ)</span>
          </button>
          <button
            onClick={() => setFilterType('unlocked')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterType === 'unlocked'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-emerald-400 hover:text-white bg-neutral-900 border border-neutral-800'
            }`}
          >
            <Unlock className="w-3 h-3" />
            <span>Đã Mở Khóa ({unlockedCount})</span>
          </button>
          <button
            onClick={() => setFilterType('locked')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterType === 'locked'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300 bg-neutral-900 border border-neutral-800'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Chờ Mở Khóa ({lockedCount})</span>
          </button>
          <button
            onClick={() => setFilterType('economy')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'economy'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
            }`}
          >
            🪙 Kinh Tế & Giá Bán
          </button>
          <button
            onClick={() => setFilterType('element')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'element'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
            }`}
          >
            ⚡ Ngũ Hành & Nguyên Tố
          </button>
          <button
            onClick={() => setFilterType('mastery')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'mastery'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
            }`}
          >
            ⚔️ Chuyên Môn & Chí Tôn
          </button>
        </div>

        {/* CORE CARDS GRID */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCores.map(type => {
              const core = ARCANE_CORES[type];
              const curLevel = coreLevels[type] || 0;
              const isMax = curLevel >= core.maxLevel;
              const isUnlocked = currentStage >= core.requiredStage;
              const nextBenefit = !isMax ? core.levels[curLevel] : null;
              const canAfford = nextBenefit ? coins >= nextBenefit.cost : false;

              return (
                <div
                  key={type}
                  className={`relative rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                    !isUnlocked
                      ? 'bg-neutral-950/80 border-neutral-850 opacity-60'
                      : isMax
                      ? 'bg-gradient-to-b from-amber-950/40 to-neutral-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : curLevel > 0
                      ? 'bg-neutral-900/80 border-neutral-700 hover:border-amber-500/60'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    {/* Top info */}
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-11 h-11 rounded-2xl bg-neutral-950 border flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                            isUnlocked ? 'border-neutral-800' : 'border-rose-900/40 text-neutral-600'
                          }`}
                        >
                          {core.iconEmoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-white font-mono truncate">{core.name}</h4>
                            {isUnlocked ? (
                              <span
                                className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-md ${
                                  isMax
                                    ? 'bg-amber-500 text-neutral-950'
                                    : curLevel > 0
                                    ? 'bg-purple-900/80 text-purple-200 border border-purple-600'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {isMax ? 'MAX (CẤP 5)' : `CẤP ${curLevel}/${core.maxLevel}`}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-rose-950/80 border border-rose-700/60 text-rose-300 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>ĐỢT {core.requiredStage}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-amber-400/90 font-mono italic truncate">{core.title}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                      {core.description}
                    </p>

                    {/* Level Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mb-1">
                        <span>Cấp độ lõi</span>
                        <span className="text-amber-400 font-bold">{curLevel * 20}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 flex gap-0.5 p-0.5">
                        {[1, 2, 3, 4, 5].map(step => (
                          <div
                            key={step}
                            className={`flex-1 rounded-sm transition-all duration-300 ${
                              curLevel >= step
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                                : 'bg-neutral-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-1.5 mb-3 bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800 text-xs">
                      <div className="text-[11px] font-mono">
                        <span className="text-neutral-500">Hiệu lực hiện tại: </span>
                        {curLevel > 0 ? (
                          <span className="text-emerald-400 font-bold">
                            {core.levels[curLevel - 1].statBonus}
                          </span>
                        ) : (
                          <span className="text-neutral-500 italic">Chưa kích hoạt</span>
                        )}
                      </div>

                      {!isMax && nextBenefit && (
                        <div className="text-[10.5px] font-mono text-amber-300 pt-1.5 border-t border-neutral-800 flex items-start gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-yellow-200">Cấp {nextBenefit.level}:</strong>{' '}
                            {nextBenefit.effectDescription}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upgrade / Unlock Action */}
                  <div className="pt-1">
                    {!isUnlocked ? (
                      <div className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center flex items-center justify-center gap-1.5 text-xs font-mono text-neutral-400">
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>Mở khóa khi đạt Đợt {core.requiredStage}</span>
                      </div>
                    ) : isMax ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-center flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>ĐẠT CỰC HẠN (MAX)</span>
                      </div>
                    ) : nextBenefit ? (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            playSealAwakenSound();
                            onUpgradeCore(type, nextBenefit.cost);
                          } else {
                            playClickSound();
                            alert(`Bạn cần thêm ${(nextBenefit.cost - coins).toLocaleString()} Đồng để nâng cấp lõi này!`);
                          }
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-between transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 shadow-md shadow-amber-500/20 transform hover:-translate-y-0.5 active:translate-y-0'
                            : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Zap className={`w-3.5 h-3.5 ${canAfford ? 'text-neutral-950' : 'text-neutral-500'}`} />
                          <span>Lên Cấp {nextBenefit.level}</span>
                        </div>
                        <div className="flex items-center gap-1 font-black">
                          <span>{nextBenefit.cost.toLocaleString()} 🪙</span>
                          <ArrowUp className="w-3 h-3" />
                        </div>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Mỗi đợt hoàn thành Đơn Hàng Bí Chỉ sẽ tự động khai mở 3 Lõi Ma Pháp Thượng Cổ tương ứng!
            </span>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer transition-colors"
          >
            Đóng Lại
          </button>
        </div>
      </div>
    </div>
  );
};
