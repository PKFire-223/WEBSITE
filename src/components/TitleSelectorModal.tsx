import React, { useState, useMemo } from 'react';
import { TITLES_LIST, TitleItem } from '../data/titlesData';
import { PlayerStatsContext, TIER_CONFIG } from '../data/achievementsData';
import { playClickSound, playCoinSound } from '../utils/audio';
import {
  X,
  Sparkles,
  Trophy,
  Check,
  Lock,
  Search,
  Edit3,
  Award,
} from 'lucide-react';

interface TitleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onSelectTitle: (newTitle: string) => void;
  statsContext: PlayerStatsContext;
}

export const TitleSelectorModal: React.FC<TitleSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  onSelectTitle,
  statsContext,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Evaluate unlock status for each title
  const evaluatedTitles = useMemo(() => {
    return TITLES_LIST.map((item) => ({
      ...item,
      isUnlocked: item.checkUnlocked(statsContext),
      isEquipped: item.title.trim().toLowerCase() === currentTitle.trim().toLowerCase(),
    }));
  }, [statsContext, currentTitle]);

  const categories = [
    { key: 'all', label: 'Tất Cả', icon: '🌟' },
    { key: 'level', label: 'Tu Vi & Cấp Độ', icon: '🧙‍♂️' },
    { key: 'shark', label: 'Typing Shark', icon: '🦈' },
    { key: 'gacha', label: 'Gacha Kỳ Trân', icon: '📜' },
    { key: 'battleship', label: 'Hải Chiến', icon: '🚢' },
    { key: 'arcade', label: 'Arcade Classics', icon: '🕹️' },
    { key: 'master', label: 'Bách Khoa', icon: '👑' },
  ];

  const filteredTitles = useMemo(() => {
    return evaluatedTitles.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [evaluatedTitles, selectedCategory, searchQuery]);

  const unlockedCount = useMemo(
    () => evaluatedTitles.filter((t) => t.isUnlocked).length,
    [evaluatedTitles]
  );

  if (!isOpen) return null;

  const handleApplyTitle = (titleToApply: string) => {
    if (!titleToApply.trim()) return;
    playCoinSound();
    onSelectTitle(titleToApply.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-[#13091f] via-[#0d0615] to-[#08030d] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#120501] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-mono tracking-wide">
                  KHO DANH HIỆU VINH QUANG
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  {unlockedCount}/{evaluatedTitles.length} Mở Khóa
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Chọn danh hiệu hiển thị cạnh hình Avatar cả bên ngoài sảnh game lẫn trong hồ sơ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Equipped Banner */}
        <div className="px-4 sm:px-6 py-3 bg-amber-950/20 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 text-xs font-mono min-w-0 flex-1">
            <span className="text-neutral-400 shrink-0">Danh hiệu hiện tại:</span>
            <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/30 to-yellow-400/30 border border-amber-400/60 text-amber-200 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-md">{currentTitle}</span>
            </span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setIsCustomMode(!isCustomMode);
            }}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isCustomMode ? 'Xem danh hiệu có sẵn' : 'Tự đặt danh hiệu riêng'}</span>
          </button>
        </div>

        {/* Custom Input Mode */}
        {isCustomMode && (
          <div className="p-4 bg-neutral-900/90 border-b border-cyan-500/30 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full flex-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Nhập danh hiệu ma thuật độc nhất của bạn (tối đa 30 ký tự)..."
                maxLength={30}
                className="w-full px-4 py-2 rounded-xl bg-black border border-cyan-500/50 text-sm text-cyan-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <button
              onClick={() => handleApplyTitle(customInput)}
              disabled={!customInput.trim()}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-neutral-950 font-bold text-xs font-mono disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap shadow-md"
            >
              Áp Dụng Danh Hiệu Này
            </button>
          </div>
        )}

        {/* Category Filter Pills & Search */}
        <div className="p-3 sm:p-4 border-b border-neutral-800/80 bg-neutral-950/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(c.key);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === c.key
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 shadow-md font-black'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm danh hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Titles Scrollable List */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] space-y-3">
          {filteredTitles.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 font-mono text-sm">
              Không tìm thấy danh hiệu phù hợp với từ khóa!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTitles.map((item) => {
                const tierConf = TIER_CONFIG[item.tier];

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      item.isEquipped
                        ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : item.isUnlocked
                        ? `${tierConf.bg} border-neutral-800 hover:border-amber-500/50`
                        : 'bg-neutral-950/50 border-neutral-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                        {item.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-mono leading-tight truncate">
                            {item.title}
                          </h4>
                          {item.isEquipped && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold">
                              ĐANG DÙNG
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-neutral-300 font-sans mt-0.5 leading-snug">
                          {item.desc}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${tierConf.badgeBg}`}>
                            {tierConf.label.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                            {item.isUnlocked ? (
                              <span className="text-emerald-400 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Đã mở khóa
                              </span>
                            ) : (
                              <span className="text-neutral-500 flex items-center gap-0.5">
                                <Lock className="w-3 h-3" /> {item.unlockCondition}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-center">
                      {item.isEquipped ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : item.isUnlocked ? (
                        <button
                          onClick={() => handleApplyTitle(item.title)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-yellow-400 text-neutral-950 font-black text-xs font-mono uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          Chọn
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-600 flex items-center justify-center" title={item.unlockCondition}>
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/80 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>⚡ Danh hiệu được cập nhật đồng bộ toàn bộ giao diện</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
