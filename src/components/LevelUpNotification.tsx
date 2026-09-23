import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Trophy, Check, X } from 'lucide-react';
import { playLevelUpSound } from '../utils/audio';

interface LevelUpNotificationProps {
  level: number | null;
  onClose: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({ level, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isClosing, setIsClosing] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const activeLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (!level) {
      activeLevelRef.current = null;
      setIsClosing(false);
      return;
    }

    // Only initiate animation if it's a new level celebration
    if (activeLevelRef.current === level) {
      return;
    }
    activeLevelRef.current = level;

    setIsClosing(false);
    setProgress(100);
    playLevelUpSound();

    const TOTAL_DURATION_MS = 3500; // 3.5 seconds display time
    const startTime = Date.now();

    // Smooth progress countdown
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / TOTAL_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= TOTAL_DURATION_MS) {
        clearInterval(interval);
        // Start exit animation
        setIsClosing(true);
        setTimeout(() => {
          onCloseRef.current();
        }, 300); // Allow slide-out animation to complete
      }
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, [level]); // Strictly depend ONLY on level, never on re-rendered callbacks!

  const handleManualClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCloseRef.current();
    }, 250);
  };

  if (!level) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4 transition-all duration-300 pointer-events-auto ${
        isClosing
          ? 'opacity-0 -translate-y-8 scale-95'
          : 'animate-in fade-in slide-in-from-top-6 duration-300'
      }`}
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-neutral-950 p-4 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.85)] border-2 border-white/90 flex items-center justify-between gap-3.5">
        
        {/* Glowing Badge */}
        <div className="w-12 h-12 rounded-xl bg-neutral-950 text-amber-400 font-black text-lg font-mono flex items-center justify-center shadow-lg border border-amber-400 shrink-0">
          LV.{level}
        </div>

        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider text-neutral-900">
            <Trophy className="w-4 h-4 fill-current shrink-0" />
            <span className="truncate">THĂNG CẤP THÀNH CÔNG!</span>
            <Sparkles className="w-4 h-4 animate-spin text-amber-900 shrink-0" />
          </div>
          <p className="text-sm font-black text-neutral-950 font-sans truncate">
            Chúc mừng bạn đã đạt Cấp Độ {level}!
          </p>
          <div className="text-[10px] font-mono text-neutral-900/80">
            Tự động đóng trong 3.5s • Tiếp tục phát huy!
          </div>
        </div>

        <button
          onClick={handleManualClose}
          className="shrink-0 p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-amber-400 text-xs font-mono font-bold transition-transform active:scale-95 cursor-pointer shadow flex items-center gap-1"
          title="Đóng ngay"
        >
          <Check className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Countdown Progress Bar (Uninterrupted smooth drainage) */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-950/25">
          <div
            className="h-full bg-neutral-950 transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
