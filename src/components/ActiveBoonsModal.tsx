import React from 'react';
import { AncientBoon } from '../types/boon';
import { getBoonById } from '../data/boonsData';
import { playClickSound } from '../utils/audio';
import { X, Sparkles, Zap, Award } from 'lucide-react';

interface ActiveBoonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBoonIds: string[];
}

export const ActiveBoonsModal: React.FC<ActiveBoonsModalProps> = ({
  isOpen,
  onClose,
  activeBoonIds,
}) => {
  if (!isOpen) return null;

  const boons: AncientBoon[] = activeBoonIds
    .map(id => getBoonById(id))
    .filter((b): b is AncientBoon => b !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl flex flex-col bg-neutral-950 border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-xl">
                🌟
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 font-mono tracking-wide uppercase">
                Thượng Cổ Thần Lực Đã Tiếp Nhận ({boons.length})
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Các chúc phúc ngẫu nhiên được ban tặng khi hoàn thành Đơn Hàng Bí Chỉ
              </p>
            </div>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {boons.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 font-mono">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-neutral-400">Chưa có Thần Lực nào được tiếp nhận</p>
              <p className="text-xs mt-1 text-neutral-500">
                Hãy hoàn thành các Đợt Đơn Hàng Bí Chỉ cuộn giấy để chọn 1 trong 3 Thần Lực Thượng Cổ!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {boons.map(boon => (
                <div
                  key={boon.id}
                  className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/50 transition-all flex items-start gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {boon.iconEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {boon.rarity}
                      </span>
                      <h4 className="text-xs font-bold text-white font-mono truncate">
                        {boon.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                      {boon.description}
                    </p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>{boon.shortEffect}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Tổng số 80 Thần Lực Thượng Cổ trong vũ trụ</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
