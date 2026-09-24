import React, { useState, useMemo } from 'react';
import { GachaItem, Rarity } from '../types/gacha';
import { GACHA_ITEMS, RARITY_CONFIG, BATCH_NAMES } from '../data/gachaItems';
import { gachaAudio } from '../utils/gachaAudio';
import { Package, Search, Coins, Filter, Trash2, ArrowUpDown, Sparkles, Check } from 'lucide-react';

interface InventoryViewProps {
  inventory: Record<string, number>;
  coins: number;
  alchemyBonusMultiplier?: number;
  onSellItem: (itemId: string, count: number, pricePerUnit: number) => void;
  onBulkSell: (rarity: Rarity, preserveOne: boolean) => void;
  onBulkSellDuplicates: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  coins,
  alchemyBonusMultiplier = 0,
  onSellItem,
  onBulkSell,
  onBulkSellDuplicates,
}) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all');
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sellingItem, setSellingItem] = useState<{ item: GachaItem; count: number } | null>(null);
  const [sellQuantity, setSellQuantity] = useState(1);

  const priceMult = 1 + alchemyBonusMultiplier;

  // Calculate owned items list
  const ownedItemsWithData = useMemo(() => {
    return GACHA_ITEMS.filter(it => (inventory[it.id] || 0) > 0).map(it => ({
      item: it,
      count: inventory[it.id],
    }));
  }, [inventory]);

  // Totals calculations
  const totalOwnedCount = useMemo(() => {
    return Object.values(inventory).reduce((acc, c) => acc + c, 0);
  }, [inventory]);

  const uniqueCollectedCount = ownedItemsWithData.length;

  // Filtered items
  const filteredList = useMemo(() => {
    return ownedItemsWithData.filter(({ item }) => {
      if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
      if (selectedBatch !== 'all' && item.batch !== selectedBatch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchElement = item.element.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        if (!matchName && !matchElement && !matchCategory) return false;
      }
      return true;
    });
  }, [ownedItemsWithData, selectedRarity, selectedBatch, searchQuery]);

  // Bulk sell valuations
  const commonStats = useMemo(() => {
    let count = 0;
    let duplicateCount = 0;
    GACHA_ITEMS.filter(it => it.rarity === 'common').forEach(it => {
      const owned = inventory[it.id] || 0;
      count += owned;
      if (owned > 1) duplicateCount += owned - 1;
    });
    return {
      count,
      val: Math.round(count * RARITY_CONFIG.common.sellPrice * priceMult * 10) / 10,
      dupCount: duplicateCount,
      dupVal: Math.round(duplicateCount * RARITY_CONFIG.common.sellPrice * priceMult * 10) / 10,
    };
  }, [inventory, priceMult]);

  const rareStats = useMemo(() => {
    let count = 0;
    let duplicateCount = 0;
    GACHA_ITEMS.filter(it => it.rarity === 'rare').forEach(it => {
      const owned = inventory[it.id] || 0;
      count += owned;
      if (owned > 1) duplicateCount += owned - 1;
    });
    return {
      count,
      val: Math.round(count * RARITY_CONFIG.rare.sellPrice * priceMult * 10) / 10,
      dupCount: duplicateCount,
      dupVal: Math.round(duplicateCount * RARITY_CONFIG.rare.sellPrice * priceMult * 10) / 10,
    };
  }, [inventory, priceMult]);

  const allDuplicatesValue = useMemo(() => {
    let totalVal = 0;
    let totalDups = 0;
    GACHA_ITEMS.forEach(it => {
      const owned = inventory[it.id] || 0;
      if (owned > 1) {
        const dups = owned - 1;
        totalDups += dups;
        const basePrice = RARITY_CONFIG[it.rarity].sellPrice;
        totalVal += dups * (basePrice * priceMult);
      }
    });
    return { totalDups, totalVal: Math.round(totalVal * 10) / 10 };
  }, [inventory, priceMult]);

  // Handle selling specific item modal
  const handleOpenSell = (item: GachaItem, currentCount: number) => {
    setSellingItem({ item, count: currentCount });
    setSellQuantity(1);
  };

  const handleConfirmSell = () => {
    if (!sellingItem) return;
    gachaAudio.playCoinsSound();
    const basePrice = RARITY_CONFIG[sellingItem.item.rarity].sellPrice;
    const finalPricePerUnit = Math.round(basePrice * priceMult * 10) / 10;
    onSellItem(sellingItem.item.id, sellQuantity, finalPricePerUnit);
    setSellingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Individual Sell Modal */}
      {sellingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-4xl shadow-inner">
                {sellingItem.item.iconEmoji}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Bán {sellingItem.item.name}
                </h3>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${sellingItem.item.colorScheme.badgeBg}`}>
                  {sellingItem.item.rarity.toUpperCase()} • Giá: {(RARITY_CONFIG[sellingItem.item.rarity].sellPrice * priceMult).toFixed(1)}🪙/món
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 mb-4">
              Hiện bạn đang có <strong className="text-white">{sellingItem.count}</strong> món này trong túi. Chọn số lượng muốn bán:
            </p>

            <div className="flex items-center gap-3 mb-4">
              <input
                type="range"
                min="1"
                max={sellingItem.count}
                value={sellQuantity}
                onChange={e => setSellQuantity(parseInt(e.target.value, 10))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="w-12 text-center font-mono font-bold text-amber-400 text-sm py-1 bg-neutral-900 rounded-lg border border-neutral-800">
                {sellQuantity}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs mb-6">
              <span className="text-neutral-300">Tổng tiền nhận được:</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                +{Math.round(sellQuantity * sellingItem.item.sellPrice * priceMult * 10) / 10} Đồng
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSellingItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSell}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black shadow transition-transform active:scale-95 cursor-pointer"
              >
                Xác Nhận Bán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP CONTROL BAR: Stats & Bulk Sell */}
      <div className="p-4 sm:p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 uppercase font-bold">Tổng Vật Phẩm</span>
              <div className="text-lg font-black text-white font-mono">
                {totalOwnedCount} <span className="text-xs text-neutral-400 font-normal">món</span>
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-neutral-800 hidden sm:block" />

          <div>
            <span className="text-[11px] text-neutral-400 uppercase font-bold">Đã Sưu Tập Bộ</span>
            <div className="text-lg font-black text-amber-400 font-mono">
              {uniqueCollectedCount} / 120 <span className="text-xs text-neutral-400 font-normal">({Math.round((uniqueCollectedCount / 120) * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* Right: Fast Bulk Sell Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Smart clean duplicate items */}
          <button
            onClick={() => {
              if (allDuplicatesValue.totalDups > 0) {
                gachaAudio.playCoinsSound();
                onBulkSellDuplicates();
              }
            }}
            disabled={allDuplicatesValue.totalDups === 0}
            className="flex-1 sm:flex-initial flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/40 disabled:opacity-40 disabled:cursor-not-allowed text-purple-200 text-xs font-bold transition-all shadow cursor-pointer"
            title="Giữ lại 1 bản cho mỗi món để hoàn thành bộ sưu tập 120 món, bán toàn bộ các bản trùng lặp"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>
              Bán Đồ Thừa Trùng Lặp (+{allDuplicatesValue.totalVal.toLocaleString()}🪙)
            </span>
          </button>

          {/* Sell Common */}
          <button
            onClick={() => {
              if (commonStats.count > 0) {
                gachaAudio.playCoinsSound();
                onBulkSell('common', false);
              }
            }}
            disabled={commonStats.count === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            title="Bán tất cả vật phẩm Common với giá 0.5 đồng/món"
          >
            <Coins className="w-3.5 h-3.5 text-slate-400" />
            <span>Bán Hết Common ({commonStats.val}🪙)</span>
          </button>

          {/* Sell Rare */}
          <button
            onClick={() => {
              if (rareStats.count > 0) {
                gachaAudio.playCoinsSound();
                onBulkSell('rare', false);
              }
            }}
            disabled={rareStats.count === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-200 text-xs font-semibold transition-all cursor-pointer"
            title="Bán tất cả vật phẩm Rare với giá 2 đồng/món"
          >
            <Coins className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bán Hết Rare ({rareStats.val}🪙)</span>
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Rarity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedRarity('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedRarity === 'all'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Tất Cả
          </button>
          {(['mystic', 'legend', 'epic', 'rare', 'common'] as Rarity[]).map(r => {
            const cfg = RARITY_CONFIG[r];
            const isSel = selectedRarity === r;
            return (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? `${cfg.badgeBg} shadow`
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cfg.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Search input & Batch selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả đợt tạo (Đợt 1-5)</option>
            {BATCH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm vật phẩm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-300">
            Chưa có vật phẩm phù hợp trong túi đồ
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Hãy vào phòng Triệu Hồi (Gacha) để quay thêm báu vật hoặc thay đổi bộ lọc tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredList.map(({ item, count }) => {
            const cfg = RARITY_CONFIG[item.rarity];
            const isMystic = item.rarity === 'mystic';
            const isLegend = item.rarity === 'legend';

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl border-2 p-3 flex flex-col justify-between transition-all group hover:-translate-y-1 ${
                  cfg.borderColor
                } ${cfg.bgColor} ${
                  isMystic
                    ? 'shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    : isLegend
                    ? 'shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : ''
                }`}
              >
                {/* Header Badge & Quantity Counter */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${cfg.badgeBg}`}>
                    {cfg.shortLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black font-mono">
                    x{count}
                  </span>
                </div>

                {/* Emoji Icon */}
                <div className="text-5xl text-center my-2 filter drop-shadow group-hover:scale-110 transition-transform">
                  {item.iconEmoji}
                </div>

                {/* Item Info */}
                <div className="mt-2 text-center">
                  <h4 className={`text-xs font-bold truncate ${cfg.textColor}`} title={item.name}>
                    {item.name}
                  </h4>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Hệ: {item.element} • #{item.numId}
                  </div>
                </div>

                {/* Sell Action Button */}
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 font-mono">
                    +{Math.round(cfg.sellPrice * priceMult * 10) / 10}🪙
                  </span>
                  <button
                    onClick={() => handleOpenSell(item, count)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-600 hover:text-neutral-950 text-neutral-300 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Bán
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
