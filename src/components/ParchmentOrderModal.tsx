import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ChallengeOrder, InventoryItem } from '../types/gacha';
import { CHALLENGE_ORDERS } from '../data/ordersData';
import { GACHA_ITEMS, RARITY_CONFIG } from '../data/gachaItems';
import { gachaAudio } from '../utils/gachaAudio';
import { Scroll, CheckCircle2, AlertCircle, Coins, Award, Trophy, ChevronRight, X, Sparkles } from 'lucide-react';

interface ParchmentOrderModalProps {
  currentStage: number; // 1 to 10
  inventory: Record<string, number>;
  orderBonusMultiplier?: number;
  onCompleteStage: (stage: number, rewardCoins: number) => void;
  onClose: () => void;
  onGoToGacha: () => void;
}

export const ParchmentOrderModal: React.FC<ParchmentOrderModalProps> = ({
  currentStage,
  inventory,
  orderBonusMultiplier = 0,
  onCompleteStage,
  onClose,
  onGoToGacha,
}) => {
  const [isUnfurling, setIsUnfurling] = useState(true);
  const [selectedStageIndex, setSelectedStageIndex] = useState(Math.min(currentStage - 1, 9));
  const [showVictoryCelebration, setShowVictoryCelebration] = useState(false);

  const activeOrder: ChallengeOrder = CHALLENGE_ORDERS[selectedStageIndex] || CHALLENGE_ORDERS[0];
  const isCurrentActiveStage = selectedStageIndex === currentStage - 1;
  const isStageAlreadyCleared = selectedStageIndex < currentStage - 1;

  const finalCoinReward = Math.round(activeOrder.coinReward * (1 + orderBonusMultiplier));

  // Sound effect of parchment unrolling on appear
  useEffect(() => {
    gachaAudio.playParchmentSound();
    const t = setTimeout(() => {
      setIsUnfurling(false);
    }, 450);
    return () => clearTimeout(t);
  }, []);

  // Check requirement satisfaction for active stage
  const requirementsStatus = activeOrder.requirements.map(req => {
    const item = GACHA_ITEMS.find(it => it.id === req.itemId);
    const owned = inventory[req.itemId] || 0;
    const isMet = owned >= req.requiredCount;
    return {
      ...req,
      item,
      owned,
      isMet,
    };
  });

  const canComplete = isCurrentActiveStage && requirementsStatus.every(r => r.isMet);

  const handleDeliverOrder = () => {
    if (!canComplete) return;

    // Victory audio + coin sound
    gachaAudio.playCoinsSound();
    gachaAudio.playTierUpSound();

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#a855f7'],
    });

    if (currentStage === 10) {
      setShowVictoryCelebration(true);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
      });
    }

    onCompleteStage(currentStage, finalCoinReward);
    // automatically select next stage if available
    if (selectedStageIndex < 9) {
      setSelectedStageIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Victory modal if stage 10 cleared */}
      {showVictoryCelebration && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-scaleUp">
          <div className="max-w-md w-full bg-gradient-to-b from-amber-950/90 via-neutral-900 to-black border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(251,191,36,0.6)]">
            <div className="text-7xl mb-4 animate-bounce">👑</div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 mb-2">
              CHIẾN THẮNG TỐI HẬU!
            </h2>
            <p className="text-amber-200/90 text-sm font-semibold mb-4">
              Chúc mừng bạn đã hoàn thành xuất sắc toàn bộ 10 đợt thử thách của Cuộn Bí Chỉ Vạn Cổ!
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-6">
              <p className="font-bold text-amber-200 text-sm mb-1">Danh Hiệu: VẠN CỔ CHÍ TÔN</p>
              <p>Phần thưởng 100,000 Đồng đã được chuyển vào ngân khố của bạn.</p>
            </div>
            <button
              onClick={() => setShowVictoryCelebration(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:brightness-110 text-neutral-950 font-black text-sm shadow-xl transition-transform active:scale-95 cursor-pointer"
            >
              Tiếp Tục Phiêu Lưu & Sưu Tập
            </button>
          </div>
        </div>
      )}

      {/* Main Parchment Outer Container with Roll Effect */}
      <div
        className={`relative w-full max-w-4xl bg-gradient-to-b from-amber-100 via-amber-50 to-stone-200 text-neutral-900 rounded-2xl shadow-2xl border-4 border-amber-800/80 flex flex-col max-h-[92vh] transition-all duration-500 overflow-hidden ${
          isUnfurling ? 'scale-95 opacity-80 -translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* TOP WOODEN SCROLL BAR */}
        <div className="relative h-7 bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 border-b-2 border-amber-900 flex items-center justify-between px-4 shadow-md shrink-0">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 border border-amber-300 shadow-inner" />
          <div className="flex items-center gap-2 text-amber-200 text-[11px] font-bold tracking-widest uppercase">
            <Scroll className="w-3.5 h-3.5 text-amber-300" />
            <span>Thánh Chỉ Đơn Hàng Bí Truyền • 10 Đợt Thử Thách</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 border border-amber-300 shadow-inner" />
        </div>

        {/* PARCHMENT HEADER & CLOSE BUTTON */}
        <div className="px-6 pt-5 pb-3 border-b border-amber-900/20 flex items-center justify-between shrink-0 bg-amber-200/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-900/10 border border-amber-900/30 flex items-center justify-center text-3xl shadow-inner">
              {activeOrder.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-800 text-amber-100 text-xs font-bold uppercase tracking-wider">
                  Đợt {activeOrder.stage} / 10
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/15 text-amber-950 font-semibold">
                  Độ khó: {activeOrder.difficultyLabel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950 mt-0.5 font-serif">
                {activeOrder.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STAGES SELECTOR RIBBON (1 to 10) */}
        <div className="px-4 py-2 bg-amber-900/10 border-b border-amber-900/20 overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-none">
          {CHALLENGE_ORDERS.map((ord, idx) => {
            const isCompleted = idx < currentStage - 1;
            const isCurrent = idx === currentStage - 1;
            const isSelected = idx === selectedStageIndex;

            return (
              <button
                key={ord.stage}
                onClick={() => setSelectedStageIndex(idx)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-800 text-amber-100 shadow-md ring-2 ring-amber-600'
                    : isCompleted
                    ? 'bg-emerald-800/20 text-emerald-900 hover:bg-emerald-800/30'
                    : isCurrent
                    ? 'bg-amber-500/30 text-amber-950 border border-amber-600/50 hover:bg-amber-500/40'
                    : 'bg-amber-900/5 text-amber-900/60 hover:bg-amber-900/15'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                ) : isCurrent ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                ) : (
                  <span>#{ord.stage}</span>
                )}
                <span>Đợt {ord.stage}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN BODY OF PARCHMENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* CLIENT STORY LETTER BOX */}
          <div className="relative p-4 sm:p-5 rounded-2xl bg-amber-100/70 border-2 border-dashed border-amber-900/30 shadow-sm">
            {/* Wax Seal in top right corner */}
            <div className="absolute -top-3.5 -right-2 px-3 py-1 rounded-full bg-rose-800 text-rose-100 font-serif font-black text-xs shadow-md border border-rose-600 flex items-center gap-1 rotate-3">
              <span>💮</span>
              <span>ẤN TÍN HOÀNG GIA</span>
            </div>

            <div className="text-xs font-bold text-amber-900/70 uppercase tracking-wider mb-1">
              Người Phát Lệnh: {activeOrder.clientName} ({activeOrder.clientTitle})
            </div>
            <p className="text-amber-950 text-sm italic font-serif leading-relaxed">
              "{activeOrder.story}"
            </p>
          </div>

          {/* REQUIREMENTS LIST */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>Vật Phẩm Cần Thu Thập ({requirementsStatus.filter(r => r.isMet).length}/{requirementsStatus.length})</span>
              </h3>
              <span className="text-xs text-amber-900/80 font-medium">
                Quay Gacha để tìm đúng vật phẩm
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {requirementsStatus.map(req => {
                const item = req.item;
                if (!item) return null;
                const cfg = RARITY_CONFIG[item.rarity];
                const progressPct = Math.min(100, (req.owned / req.requiredCount) * 100);

                return (
                  <div
                    key={req.itemId}
                    className={`p-3.5 rounded-xl border-2 transition-all shadow-sm flex flex-col justify-between ${
                      req.isMet
                        ? 'bg-emerald-50 border-emerald-500/80'
                        : 'bg-white/80 border-amber-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-inner shrink-0">
                        {item.iconEmoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${cfg.badgeBg}`}
                          >
                            {cfg.shortLabel}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            #{item.numId}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate mt-0.5" title={item.name}>
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-neutral-600 truncate">
                          {item.batchName.split(':')[0]}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Status */}
                    <div className="mt-3 pt-2 border-t border-black/5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-neutral-600 font-medium">Tiến độ:</span>
                        <span
                          className={`font-bold font-mono ${
                            req.isMet ? 'text-emerald-700' : 'text-amber-800'
                          }`}
                        >
                          {req.owned} / {req.requiredCount} {req.isMet ? '✅' : ''}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            req.isMet ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REWARDS SUMMARY */}
          <div className="p-4 rounded-2xl bg-amber-900/10 border border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-900">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-900/70 uppercase">Phần Thưởng Đợt {activeOrder.stage}</span>
                <div className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                  <span className="text-amber-700 flex items-center gap-1">
                    <Coins className="w-5 h-5 fill-amber-500" />
                    +{finalCoinReward.toLocaleString()} Đồng
                  </span>
                  {orderBonusMultiplier > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-700 text-white font-mono font-bold">
                      +{Math.round(orderBonusMultiplier * 100)}% Lõi
                    </span>
                  )}
                  <span className="text-xs text-amber-900/80 font-normal">
                    • {activeOrder.bonusRewardTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            {isStageAlreadyCleared ? (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã Hoàn Thành Đợt Này</span>
              </div>
            ) : isCurrentActiveStage ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDeliverOrder}
                  disabled={!canComplete}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm shadow-xl transition-all cursor-pointer ${
                    canComplete
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white active:scale-95 animate-pulse'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <Scroll className="w-4 h-4" />
                  <span>
                    {canComplete
                      ? `Giao Nộp & Nhận +${activeOrder.coinReward.toLocaleString()} Đồng`
                      : 'Chưa Đủ Vật Phẩm'}
                  </span>
                </button>

                {!canComplete && (
                  <button
                    onClick={() => {
                      onClose();
                      onGoToGacha();
                    }}
                    className="px-4 py-3 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-100 text-xs font-bold transition-all shadow cursor-pointer shrink-0"
                  >
                    Quay Thêm Thẻ ➜
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 font-semibold italic">
                Cần vượt qua Đợt {currentStage} trước
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM WOODEN SCROLL BAR */}
        <div className="relative h-7 bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 border-t-2 border-amber-900 flex items-center justify-between px-4 shadow-md shrink-0">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 border border-amber-300 shadow-inner" />
          <span className="text-[10px] text-amber-300/80 font-serif">
            Mật lệnh hoàng thất • Đợt {currentStage}/10 Đang Tiến Hành
          </span>
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 border border-amber-300 shadow-inner" />
        </div>
      </div>
    </div>
  );
};
