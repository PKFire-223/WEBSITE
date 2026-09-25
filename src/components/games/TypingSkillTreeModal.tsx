import React, { useState } from 'react';
import {
  UpgradeTreeState,
  SKILL_DEFINITIONS,
  getSkillUpgradeCost,
  SUBMARINE_SKINS,
} from '../../data/typingSkills';
import { PlayerStats, SubmarineSkinId } from '../../types/typingShark';
import { playSkillUpgradeSound } from '../../utils/typingSharkAudio';
import {
  Sparkles,
  Shield,
  Zap,
  X,
  Trophy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface TypingSkillTreeModalProps {
  upgrades: UpgradeTreeState;
  stats: PlayerStats;
  onUpgrade: (skillKey: keyof UpgradeTreeState, cost: number) => void;
  onClose: () => void;
  onStartGame?: () => void;
  onSelectSkin?: (skinId: SubmarineSkinId) => void;
  onHardReset?: () => void;
  isGameOverContext?: boolean;
}

export const TypingSkillTreeModal: React.FC<TypingSkillTreeModalProps> = ({
  upgrades,
  stats,
  onUpgrade,
  onClose,
  onStartGame,
  onSelectSkin,
  onHardReset,
  isGameOverContext = false,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'skins'>('skills');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'auto' | 'fleet' | 'defense' | 'offense' | 'economy'
  >('all');
  const [upgradeMultiplier, setUpgradeMultiplier] = useState<1 | 5>(1);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const categories = [
    { id: 'all', label: 'Tất Cả Kỹ Năng', icon: '🌟' },
    { id: 'auto', label: '🤖 Trợ Thủ AI Tự Gõ', icon: '🤖' },
    { id: 'fleet', label: '🚢 Hạm Đội Yểm Trợ', icon: '🚢' },
    { id: 'defense', label: '🛡️ Giáp & Phản Sóng', icon: '🛡️' },
    { id: 'offense', label: '⚡ Pháo Laser & Bom', icon: '⚡' },
    { id: 'economy', label: '🪙 Nam Châm & Thùng Gỗ', icon: '🪙' },
  ];

  const handleBuy = (key: keyof UpgradeTreeState) => {
    const currentLevel = upgrades[key];
    const def = SKILL_DEFINITIONS[key];
    if (currentLevel >= def.maxLevel) return;

    if (upgradeMultiplier === 1) {
      const cost = getSkillUpgradeCost(key, currentLevel);
      if (stats.gold >= cost) {
        playSkillUpgradeSound();
        onUpgrade(key, cost);
      }
    } else {
      let totalCost = 0;
      let times = 0;
      for (let i = 0; i < 5; i++) {
        const stepCost = getSkillUpgradeCost(key, currentLevel + i);
        if (stats.gold >= totalCost + stepCost && currentLevel + i < def.maxLevel) {
          totalCost += stepCost;
          times++;
        } else {
          break;
        }
      }
      if (times > 0) {
        playSkillUpgradeSound();
        for (let i = 0; i < times; i++) {
          const stepCost = getSkillUpgradeCost(key, currentLevel + i);
          onUpgrade(key, stepCost);
        }
      }
    }
  };

  const skillKeys = Object.keys(SKILL_DEFINITIONS) as Array<keyof UpgradeTreeState>;

  const filteredKeys = skillKeys.filter((key) => {
    if (selectedCategory === 'all') return true;
    return SKILL_DEFINITIONS[key].category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-neutral-950/95 border-2 border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-neutral-100 font-sans">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/80 via-neutral-900 to-blue-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl shadow-inner">
              🔱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 tracking-wide uppercase">
                  Tiến Hóa Cây Kỹ Năng & Skin Tàu
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold">
                  EXPONENTIAL ROGUELIKE
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-mono mt-0.5">
                Cày vàng diệt quái, nâng cấp sức mạnh leo tới Boss phút 25!
              </p>
            </div>
          </div>

          {/* Gold Counter & Multiplier */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-xl border border-amber-500/40 shadow-inner">
              <span className="text-xl">🪙</span>
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Kho Tiền Vàng</div>
                <div className="text-lg font-black text-amber-300 font-mono">
                  {stats.gold.toLocaleString()} <span className="text-xs text-amber-400 font-normal">Vàng</span>
                </div>
              </div>
            </div>

            {activeTab === 'skills' && (
              <div className="flex items-center bg-neutral-900 border border-cyan-500/30 rounded-xl p-1 text-xs font-mono font-bold">
                <button
                  onClick={() => setUpgradeMultiplier(1)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    upgradeMultiplier === 1 ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  +1 Cấp
                </button>
                <button
                  onClick={() => setUpgradeMultiplier(5)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    upgradeMultiplier === 5 ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  +5 Cấp
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
              title="Đóng bảng kỹ năng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Tabs (Kỹ Năng / Skin Thuyền) */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-2 border-b-2 font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'skills'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              🌳 Cây Kỹ Năng Vô Tận ({skillKeys.length} Kỹ Năng)
            </button>
            <button
              onClick={() => setActiveTab('skins')}
              className={`px-4 py-2 border-b-2 font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'skins'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              🚢 Skin Thuyền Diệt Boss ({stats.unlockedSkins.length}/6 Đã Mở)
            </button>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chơi Lại Từ Đầu</span>
          </button>
        </div>

        {/* Sub-Category Filter if Skills Tab */}
        {activeTab === 'skills' && (
          <div className="flex items-center gap-2 p-2.5 px-5 border-b border-neutral-800/80 bg-neutral-900/40 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-400/50'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* TAB 1: SKILLS GRID */}
        {activeTab === 'skills' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKeys.map((key) => {
                const def = SKILL_DEFINITIONS[key];
                const currentLvl = upgrades[key];
                const cost = getSkillUpgradeCost(key, currentLvl);
                const canAfford = stats.gold >= cost;
                const isMax = currentLvl >= def.maxLevel;
                const isSpecial = key === 'auto_typing_speed' || key === 'support_gunboat' || key === 'hyper_laser';

                return (
                  <div
                    key={key}
                    className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 ${
                      isSpecial
                        ? 'bg-gradient-to-b from-cyan-950/40 via-neutral-950 to-neutral-900/80 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'bg-neutral-900/60 hover:bg-neutral-900/90 border-neutral-800/80 hover:border-cyan-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-cyan-500/30 flex items-center justify-center text-xl shadow-inner">
                            {def.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight flex items-center gap-1">
                              {def.name}
                            </h4>
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                              {def.category.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-cyan-500/30 text-right">
                          <div className="text-[9px] font-mono text-neutral-400">CẤP ĐỘ</div>
                          <div className="text-xs font-black text-cyan-300 font-mono">
                            LV.{currentLvl} {currentLvl >= 10 && '🔥'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed font-sans min-h-[38px]">
                        {def.description}
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs font-mono">
                        <div className="flex justify-between items-center text-neutral-400 text-[11px] mb-1">
                          <span>Hiện tại:</span>
                          <span className="font-bold text-cyan-300">
                            {def.getFormattedValue(currentLvl)}
                          </span>
                        </div>
                        {!isMax && (
                          <div className="flex justify-between items-center text-emerald-400 text-[11px] pt-1 border-t border-neutral-900">
                            <span>Nâng cấp:</span>
                            <span className="font-bold">
                              ➔ {def.getFormattedValue(currentLvl + 1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono text-neutral-400 uppercase">Chi phí</div>
                        <div className="text-sm font-black text-amber-300 font-mono flex items-center gap-1">
                          <span>🪙</span>
                          <span>{isMax ? 'Tối Đa' : cost.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuy(key)}
                        disabled={isMax || !canAfford}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isMax
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                            : canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 shadow-md shadow-amber-500/20 active:scale-95'
                            : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isMax ? 'Đạt Max' : canAfford ? 'Nâng Cấp' : 'Thiếu Vàng'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SKINS SELECTION */}
        {activeTab === 'skins' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(SUBMARINE_SKINS).map((skin) => {
                const isUnlocked = stats.unlockedSkins.includes(skin.id);
                const isSelected = stats.selectedSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`relative p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : isUnlocked
                        ? 'bg-neutral-900/70 border-neutral-700 hover:border-neutral-500'
                        : 'bg-neutral-950/60 border-neutral-900 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{skin.icon}</span>
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-neutral-950 text-[10px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> ĐANG DÙNG
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
                            ĐÃ MỞ KHÓA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-300 text-[10px] font-mono">
                            CHƯA MỞ
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white">{skin.name}</h4>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed font-sans min-h-[38px]">
                        {skin.description}
                      </p>

                      <div className="mt-3 p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400">
                        {skin.unlockedAtBoss === 'default'
                          ? 'Mở sẵn khởi đầu'
                          : `Yêu cầu: Đánh bại Boss ${skin.unlockedAtBoss.toUpperCase()}`}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800">
                      <button
                        onClick={() => onSelectSkin && isUnlocked && onSelectSkin(skin.id)}
                        disabled={!isUnlocked || isSelected}
                        className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-800 text-neutral-400 cursor-default'
                            : isUnlocked
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-md'
                            : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                        }`}
                      >
                        {isSelected ? 'Đang Sử Dụng' : isUnlocked ? 'Trang Bị Skin' : 'Chưa Mở Khóa'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950">
          <div className="text-xs font-mono text-neutral-400">
            Kỷ lục: <strong className="text-cyan-300">{stats.highestMinuteSurvived} phút</strong> | Kills: <strong className="text-amber-300">{stats.kills}</strong> | Tốc độ đỉnh: <strong className="text-emerald-300">{stats.maxWpm} WPM</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            {onStartGame && (
              <button
                onClick={() => {
                  onClose();
                  onStartGame();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-neutral-950 shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <span>🚀</span>
                <span>{isGameOverContext ? 'Tái Xuất Trận Mới' : 'Bắt Đầu Chinh Phạt'}</span>
              </button>
            )}
          </div>
        </div>

        {/* RESET CONFIRMATION MODAL */}
        {showResetConfirm && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border-2 border-red-500/60 rounded-2xl p-6 max-w-md w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center mx-auto text-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black font-mono text-red-300 uppercase">
                Xác Nhận Khởi Tạo Lại Từ Đầu?
              </h3>
              <p className="text-xs text-neutral-300 font-mono leading-relaxed">
                Hành động này sẽ xóa toàn bộ số vàng, cấp độ kỹ năng và skin đã mở khóa của Typing Shark để bắt đầu lại cuộc hành trình từ đầu.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    if (onHardReset) onHardReset();
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-black bg-red-600 hover:bg-red-500 text-white cursor-pointer uppercase tracking-wider shadow-lg shadow-red-600/30"
                >
                  Xóa Hết & Bắt Đầu Lại
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
