import React from 'react';
import confetti from 'canvas-confetti';
import { ShopTier } from '../types/gacha';
import { SHOP_TIERS } from '../data/shopTiers';
import { gachaAudio } from '../utils/gachaAudio';
import { Store, ArrowUpCircle, Check, Sparkles, X, Coins, ShieldCheck } from 'lucide-react';

interface ShopUpgradeModalProps {
  currentTierIndex: number; // 0 to 5 (corresponds to Bậc 1 to 6)
  coins: number;
  shopDiscountPercent?: number;
  onUpgradeTier: (nextTierIndex: number, cost: number) => void;
  onClose: () => void;
}

export const ShopUpgradeModal: React.FC<ShopUpgradeModalProps> = ({
  currentTierIndex,
  coins,
  shopDiscountPercent = 0,
  onUpgradeTier,
  onClose,
}) => {
  const currentTier = SHOP_TIERS[currentTierIndex];
  const isMaxTier = currentTierIndex >= 5;
  const nextTier = !isMaxTier ? SHOP_TIERS[currentTierIndex + 1] : null;
  const rawCost = currentTier.upgradeCost;
  const effectiveCost = Math.max(1, Math.round(rawCost * (1 - shopDiscountPercent)));
  const canAfford = nextTier ? coins >= effectiveCost : false;

  const handleUpgrade = () => {
    if (!nextTier || !canAfford) return;

    gachaAudio.playTierUpSound();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#fbbf24', '#38bdf8'],
    });

    onUpgradeTier(currentTierIndex + 1, effectiveCost);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Nâng Cấp Kỳ Các (Cửa Hàng)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/50 text-purple-200 text-xs font-bold">
                  Bậc {currentTier.tier} / 6
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Nâng cấp bậc cửa hàng gia tăng mạnh tỉ lệ rớt Thần Thoại (Mystic) & Huyền Thoại (Legend)!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current & Next Tier Preview Banner */}
        <div className="py-4 shrink-0">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-amber-950/40 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Trạng Thái Hiện Tại
              </span>
              <h3 className="text-lg font-black text-amber-300">
                {currentTier.name}
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5">
                {currentTier.bonusDescription}
              </p>
            </div>

            {!isMaxTier && nextTier ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase">
                    Chi phí nâng cấp
                  </span>
                  <div className="text-sm font-black text-amber-400 font-mono">
                    {currentTier.upgradeCost.toLocaleString()} Đồng
                  </div>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={!canAfford}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 active:scale-95 animate-pulse'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>
                    {canAfford
                      ? `Lên Bậc ${nextTier.tier} (-${currentTier.upgradeCost.toLocaleString()}🪙)`
                      : `Cần ${currentTier.upgradeCost.toLocaleString()} Đồng`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>ĐÃ ĐẠT BẬC TỐI ĐA (BẬC 6)</span>
              </div>
            )}
          </div>
        </div>

        {/* 6-Tier Comparison Table */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Bảng Tra Cứu Tỉ Lệ Xác Suất Toàn Bộ 6 Bậc:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SHOP_TIERS.map((tier, idx) => {
              const isCurrent = idx === currentTierIndex;
              const isPassed = idx < currentTierIndex;
              const isNext = idx === currentTierIndex + 1;

              return (
                <div
                  key={tier.tier}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.15)] ring-1 ring-amber-500/50'
                      : isNext
                      ? 'bg-purple-950/20 border-purple-500/50 hover:border-purple-400'
                      : isPassed
                      ? 'bg-neutral-900/50 border-neutral-800 opacity-70'
                      : 'bg-neutral-900/30 border-neutral-800/80 opacity-50'
                  }`}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                        isCurrent
                          ? 'bg-amber-500 text-neutral-950'
                          : isNext
                          ? 'bg-purple-600 text-white'
                          : isPassed
                          ? 'bg-neutral-800 text-emerald-400'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {tier.name.split(':')[0]}
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Đang dùng
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã mở
                      </span>
                    )}
                    {isNext && (
                      <span className="text-[10px] text-purple-300 font-bold">
                        Bậc kế tiếp
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">
                    {tier.name.split(':')[1] || tier.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mb-3 min-h-[32px]">
                    {tier.subtitle}
                  </p>

                  {/* Rates Bars */}
                  <div className="space-y-1.5 text-[11px] pt-2 border-t border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                        Mystic:
                      </span>
                      <span className="font-mono font-black text-rose-300">
                        {tier.rates.mystic}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        Legend:
                      </span>
                      <span className="font-mono font-bold text-amber-300">
                        {tier.rates.legend}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                        Epic:
                      </span>
                      <span className="font-mono text-purple-300">
                        {tier.rates.epic}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                        Rare:
                      </span>
                      <span className="font-mono text-cyan-300">
                        {tier.rates.rare}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                        Common:
                      </span>
                      <span className="font-mono text-slate-400">
                        {tier.rates.common}%
                      </span>
                    </div>
                  </div>

                  {/* Upgrade cost button inside next tier */}
                  {isNext && (
                    <button
                      onClick={handleUpgrade}
                      disabled={!canAfford}
                      className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        canAfford
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nâng Bậc ({effectiveCost.toLocaleString()}🪙)</span>
                      {shopDiscountPercent > 0 && (
                        <span className="text-[10px] text-emerald-300 font-mono">
                          (-{Math.round(shopDiscountPercent * 100)}%)
                        </span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-neutral-800 shrink-0 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1 text-amber-400">
            <Coins className="w-4 h-4" />
            <span>Số dư của bạn: <strong>{coins.toLocaleString()} Đồng</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
