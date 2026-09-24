import React, { useState, useMemo } from 'react';
import { GachaItem, Rarity } from '../types/gacha';
import { GACHA_ITEMS, RARITY_CONFIG, BATCH_NAMES, getRarityStats } from '../data/gachaItems';
import { BookOpen, Search, Eye, Sparkles, CheckCircle, Lock, X } from 'lucide-react';

interface CodexViewProps {
  inventory: Record<string, number>;
  discoveredIds: Set<string>;
}

export const CodexView: React.FC<CodexViewProps> = ({ inventory, discoveredIds }) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all');
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectItem, setInspectItem] = useState<GachaItem | null>(null);

  const stats = useMemo(() => getRarityStats(), []);
  const discoveredCount = discoveredIds.size;
  const totalCount = GACHA_ITEMS.length;

  const filteredItems = useMemo(() => {
    return GACHA_ITEMS.filter(it => {
      if (selectedRarity !== 'all' && it.rarity !== selectedRarity) return false;
      if (selectedBatch !== 'all' && it.batch !== selectedBatch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = it.name.toLowerCase().includes(q);
        const matchDesc = it.description.toLowerCase().includes(q);
        const matchElement = it.element.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchElement) return false;
      }
      return true;
    });
  }, [selectedRarity, selectedBatch, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Detail inspect modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setInspectItem(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-4xl shadow-inner">
                {inspectItem.iconEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${inspectItem.colorScheme.badgeBg}`}>
                    {inspectItem.rarity.toUpperCase()}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">#{inspectItem.numId}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {inspectItem.name}
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between p-2.5 rounded-xl bg-neutral-900">
                <span className="text-neutral-400">Thuộc Đợt Tạo:</span>
                <span className="font-semibold text-neutral-200">{inspectItem.batchName}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-neutral-900">
                <span className="text-neutral-400">Nguyên Tố:</span>
                <span className="font-semibold text-amber-400">Hệ {inspectItem.element}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-neutral-900">
                <span className="text-neutral-400">Giá Bán Lại:</span>
                <span className="font-bold text-amber-300 font-mono">+{inspectItem.sellPrice} Đồng</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-neutral-900">
                <span className="text-neutral-400">Số Lượng Trong Túi:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {inventory[inspectItem.id] || 0} món
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 italic leading-relaxed">
              "{inspectItem.description}"
            </div>
          </div>
        </div>
      )}

      {/* Progress banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Bách Khoa Toàn Thư Kỳ Trân (120 Vật Phẩm)
              </h3>
              <p className="text-xs text-neutral-400">
                Đã mở khóa: <strong className="text-amber-400 font-mono">{discoveredCount}</strong> / {totalCount} vật phẩm ({Math.round((discoveredCount / totalCount) * 100)}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-300 font-bold">
              5 Mystic
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-300 font-bold">
              12 Legend
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-600 text-purple-300 font-semibold">
              28 Epic
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-600 text-cyan-300">
              35 Rare
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
              40 Common
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-3 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 transition-all duration-500"
            style={{ width: `${(discoveredCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedRarity('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedRarity === 'all'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Tất Cả (120)
          </button>
          {(['mystic', 'legend', 'epic', 'rare', 'common'] as Rarity[]).map(r => {
            const cfg = RARITY_CONFIG[r];
            const isSel = selectedRarity === r;
            const count = stats[r];
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
                {cfg.shortLabel} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả đợt (1-5)</option>
            {BATCH_NAMES.map((name, idx) => (
              <option key={idx} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tra cứu tên / hệ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of 120 items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredItems.map(item => {
          const isDiscovered = discoveredIds.has(item.id);
          const ownedCount = inventory[item.id] || 0;
          const cfg = RARITY_CONFIG[item.rarity];

          if (!isDiscovered) {
            return (
              <div
                key={item.id}
                className="relative rounded-2xl border border-neutral-800 bg-neutral-900/30 p-3 flex flex-col items-center justify-center min-h-[160px] text-center opacity-60"
              >
                <div className="text-3xl text-neutral-600 mb-2">❓</div>
                <span className="text-[10px] text-neutral-500 font-mono">#{item.numId}</span>
                <span className="text-xs font-semibold text-neutral-500 mt-1">Chưa Mở Khóa</span>
                <span className="text-[9px] text-neutral-600 mt-0.5">{cfg.shortLabel}</span>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => setInspectItem(item)}
              className={`relative rounded-2xl border-2 p-3 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 ${
                cfg.borderColor
              } ${cfg.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${cfg.badgeBg}`}>
                  {cfg.shortLabel}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">#{item.numId}</span>
              </div>

              <div className="text-4xl text-center my-2 filter drop-shadow">
                {item.iconEmoji}
              </div>

              <div className="text-center">
                <h4 className={`text-xs font-bold truncate ${cfg.textColor}`} title={item.name}>
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1 pt-1 border-t border-white/5">
                  <span>Hệ {item.element}</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {ownedCount > 0 ? `x${ownedCount}` : '0'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
