import React from 'react';
import { ShopTier, ChallengeOrder, CoreType } from '../types/gacha';
import { Sparkles, Zap, Scroll, Store, Gift, Coins } from 'lucide-react';
import { getCoreBonusMultiplier } from '../data/coresData';

interface SummoningAltarProps {
  coins: number;
  currentTier: ShopTier;
  currentStage: number;
  currentOrder: ChallengeOrder;
  isOrderReady: boolean;
  onSpin1: () => void;
  onSpin10: () => void;
  onOpenOrderModal: () => void;
  onOpenShopModal: () => void;
  onOpenCoresModal: () => void;
  onClaimDailyCoins: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  coreLevels: Record<CoreType, number>;
  commonItemsCount: number;
  rareItemsCount: number;
  commonSellVal: number;
  rareSellVal: number;
  onQuickSellCommon: () => void;
  onQuickSellRare: () => void;
  spin10Cost?: number;
  grantAmount?: number;
}

export const SummoningAltar: React.FC<SummoningAltarProps> = ({
  coins,
  currentTier,
  currentStage,
  currentOrder,
  isOrderReady,
  onSpin1,
  onSpin10,
  onOpenOrderModal,
  onOpenShopModal,
  onOpenCoresModal,
  onClaimDailyCoins,
  soundEnabled,
  onToggleSound,
  coreLevels,
  commonItemsCount,
  rareItemsCount,
  commonSellVal,
  rareSellVal,
  onQuickSellCommon,
  onQuickSellRare,
  spin10Cost = 20,
  grantAmount = 20,
}) => {
  const totalCoresLevel = Object.values(coreLevels).reduce((a, b) => a + b, 0);

  // Core indicators for UI
  const destinyLv = coreLevels.destiny || 0;
  const alchemyLv = coreLevels.alchemy || 0;
  const fortuneLv = coreLevels.fortune || 0;
  const channellingLv = coreLevels.channelling || 0;

  const destinyMysticMult =
    destinyLv >= 5
      ? 4.5
      : destinyLv >= 4
      ? 3.5
      : destinyLv >= 3
      ? 2.8
      : destinyLv >= 2
      ? 2.0
      : destinyLv >= 1
      ? 1.4
      : 1.0;

  const alchemyBonusPercent = Math.round(getCoreBonusMultiplier('alchemy', alchemyLv) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-neutral-950 border border-neutral-800 p-4 sm:p-7 shadow-2xl">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR: Shop Tier, Arcane Cores, and Parchment Orders */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 pb-5 border-b border-neutral-800">
        {/* Shop Tier Badge */}
        <button
          onClick={onOpenShopModal}
          className="flex items-center gap-3 p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-850 border border-purple-500/40 hover:border-purple-400 transition-all text-left group cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-300">
                {currentTier.name.split(':')[0]}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-600 text-purple-200">
                Mystic: {currentTier.rates.mystic}%
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate">
              {currentTier.name.split(':')[1] || currentTier.name} • Đổi bậc ➜
            </p>
          </div>
        </button>

        {/* Arcane Cores (9 Lõi Ma Pháp) */}
        <button
          onClick={onOpenCoresModal}
          className="flex items-center gap-3 p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-neutral-900/90 hover:from-amber-900/40 border border-amber-500/40 hover:border-amber-400 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 group-hover:scale-110 transition-transform">
            <span className="text-lg">🔮</span>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                9 Lõi Thượng Cổ
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                {totalCoresLevel}/45 Cấp
              </span>
            </div>
            <p className="text-[11px] text-amber-200/70 truncate">
              Nâng cấp Giả Kim, Vận Mệnh, Thần Tài... ➜
            </p>
          </div>
        </button>

        {/* Central Parchment Order Callout */}
        <button
          onClick={onOpenOrderModal}
          className={`flex items-center gap-3 p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl border transition-all cursor-pointer group ${
            isOrderReady
              ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse'
              : 'bg-neutral-900/80 border-amber-800/40 hover:border-amber-600'
          }`}
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
            <Scroll className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300">
                Bí Chỉ: Đợt {currentStage}/10
              </span>
              {isOrderReady && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-neutral-950 font-black">
                  GIAO ĐƯỢC
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 truncate">
              {currentOrder.title} • Thưởng {currentOrder.coinReward}🪙 ➜
            </p>
          </div>
        </button>
      </div>

      {/* ACTIVE CORES RESONANCE BANNER (Pure Boosted Stats, No Pity) */}
      <div className="relative z-10 my-4 p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-300">
          <span className="text-base">⚡</span>
          <span className="font-bold text-white uppercase">Cộng Hưởng Thượng Cổ:</span>
          <span className="text-neutral-400">
            {destinyLv > 0 ? (
              <span className="text-amber-300 font-bold mr-2">Mystic x{destinyMysticMult}</span>
            ) : null}
            {alchemyLv > 0 ? (
              <span className="text-emerald-300 font-bold mr-2">Bán +{alchemyBonusPercent}%</span>
            ) : null}
            {fortuneLv > 0 ? (
              <span className="text-yellow-300 font-bold mr-2">Thần Tài Cấp {fortuneLv}</span>
            ) : null}
            {channellingLv > 0 ? (
              <span className="text-cyan-300 font-bold">Quay x10 chỉ {spin10Cost}🪙</span>
            ) : null}
            {totalCoresLevel === 0 && (
              <span className="text-neutral-500 italic">Chưa kích hoạt lõi ma pháp</span>
            )}
          </span>
        </div>

        <button
          onClick={onOpenCoresModal}
          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
        >
          Nâng Cấp Thêm Lõi ➜
        </button>
      </div>

      {/* MYSTICAL ALTAR CIRCLE */}
      <div className="relative z-10 flex flex-col items-center justify-center my-6 sm:my-8">
        {/* Concentric Rotating Runes Rings */}
        <div className="relative w-60 h-60 sm:w-76 sm:h-76 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30 animate-spin-very-slow" />
          {/* Middle Hexagon Ring */}
          <div className="absolute inset-4 rounded-full border border-purple-500/40 animate-reverse-spin" />
          {/* Runes Ring */}
          <div className="absolute inset-10 rounded-full border border-amber-400/20 flex items-center justify-center">
            <span className="absolute top-1 text-amber-500/60 text-xs font-mono">᚛ ᚱ ᚢ ᚾ ᚜</span>
            <span className="absolute bottom-1 text-amber-500/60 text-xs font-mono">᚛ ᛗ ᚨ ᚷ ᚜</span>
            <span className="absolute left-1 text-amber-500/60 text-xs font-mono">✦</span>
            <span className="absolute right-1 text-amber-500/60 text-xs font-mono">✦</span>
          </div>

          {/* Central Glowing Crystal Core */}
          <div
            onClick={onSpin10}
            className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 flex flex-col items-center justify-center backdrop-blur-sm group hover:scale-105 transition-all cursor-pointer bg-gradient-to-br from-amber-500/20 via-purple-600/30 to-rose-600/20 border-amber-400/60 shadow-[0_0_50px_rgba(245,158,11,0.35)]"
            title="Bấm để kích hoạt Triệu Hồi x10"
          >
            <div className="text-4xl sm:text-5xl animate-pulse filter drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
              🔮
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 mt-1">
              PHÁP TRẬN
            </span>
          </div>
        </div>

        {/* Summoning Prompt Subtitle */}
        <div className="text-center mt-5">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Triệu Hồi Vạn Cổ Kỳ Trân
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md">
            Quay x1: <strong className="text-amber-400 font-bold font-mono">2 Đồng</strong> | Quay x10: <strong className="text-amber-400 font-bold font-mono">{spin10Cost} Đồng</strong> (Lật nhanh Skip 10 thẻ).
          </p>
        </div>
      </div>

      {/* QUICK SELL STRIP: Sell all Common & Rare for instant coins */}
      {(commonItemsCount > 0 || rareItemsCount > 0) && (
        <div className="relative z-10 mb-4 p-2.5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Bán nhanh thu hồi vốn ngân khố:</span>
          </div>
          <div className="flex items-center gap-2">
            {commonItemsCount > 0 && (
              <button
                onClick={onQuickSellCommon}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all cursor-pointer"
                title={`Bán tất cả ${commonItemsCount} vật phẩm Common`}
              >
                <span>⚡ Bán {commonItemsCount} Common</span>
                <span className="text-amber-400">+{commonSellVal.toLocaleString()}🪙</span>
              </button>
            )}

            {rareItemsCount > 0 && (
              <button
                onClick={onQuickSellRare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-700 text-xs font-mono font-bold transition-all cursor-pointer"
                title={`Bán tất cả ${rareItemsCount} vật phẩm Rare`}
              >
                <span>💎 Bán {rareItemsCount} Rare</span>
                <span className="text-cyan-300">+{rareSellVal.toLocaleString()}🪙</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ACTION PULL BUTTONS (x1 & x10) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-neutral-800">
        {/* Spin x1 Button */}
        <button
          onClick={onSpin1}
          disabled={coins < 2}
          className="w-full sm:w-60 py-3.5 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-850 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-neutral-700 hover:border-amber-500 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>Quay 1 Lần</span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono">
            2🪙
          </span>
        </button>

        {/* Spin x10 Button */}
        <button
          onClick={onSpin10}
          disabled={coins < spin10Cost}
          className="w-full sm:w-72 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 group active:scale-95 cursor-pointer ring-2 ring-amber-300/60"
        >
          <Zap className="w-5 h-5 fill-neutral-950 group-hover:scale-110 transition-transform" />
          <span>Quay 10 Lần (Skip)</span>
          <span className="px-2 py-0.5 rounded-lg bg-neutral-950/80 text-amber-300 text-xs font-mono">
            {spin10Cost}🪙
          </span>
        </button>

        {/* Trợ cấp khẩn cấp */}
        <button
          onClick={onClaimDailyCoins}
          className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer"
          title={`Tiếp tế ngân khố thêm ${grantAmount} Đồng`}
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span>Trợ Cấp (+{grantAmount}🪙)</span>
        </button>
      </div>
    </div>
  );
};
