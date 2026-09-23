import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Zap, Sparkles, Shield, Trophy, RotateCcw } from 'lucide-react';
import { GameItem } from '../data/gamesData';
import { OnlyaFanGame } from './games/OnlyaFanGame';
import { SnakeGame } from './games/SnakeGame';
import { BlockPuzzleGame } from './games/BlockPuzzleGame';
import { ArtilleryDuelGame } from './games/ArtilleryDuelGame';
import { playClickSound, playCoinSound, stopFanGameBGM, stopSnakeGameBGM } from '../utils/audio';

interface GameModalProps {
  game: GameItem | null;
  slotNumber: number | null;
  playerLevel: number;
  sessionSeconds: number;
  secondsToNextLevel: number;
  levelProgressPercent: number;
  onClose: () => void;
  onForceLevelUp?: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  game,
  slotNumber,
  playerLevel,
  sessionSeconds,
  secondsToNextLevel,
  levelProgressPercent,
  onClose,
  onForceLevelUp,
}) => {
  const isOnlyAFan = game?.id === 'only-a-fan' || game?.gameType === 'only-a-fan';
  const isSnake = game?.id === 'snake-game' || game?.gameType === 'snake';
  const isBlockPuzzle = game?.id === 'block-puzzle' || game?.gameType === 'block-puzzle';
  const isArtillery = game?.id === 'artillery-duel' || game?.gameType === 'artillery-duel';

  // Ensure music stops if modal unmounts
  useEffect(() => {
    return () => {
      stopFanGameBGM();
      stopSnakeGameBGM();
    };
  }, []);

  const handleClose = () => {
    stopFanGameBGM();
    stopSnakeGameBGM();
    playClickSound();
    onClose();
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const title = game?.title || `Ô Trò Chơi #${slotNumber ? (slotNumber < 10 ? `0${slotNumber}` : slotNumber) : '01'}`;
  const genre = game?.genre || 'PolyPlay Mini Game';

  // Generic fallback canvas if playing an empty slot
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [genericScore, setGenericScore] = useState(0);

  useEffect(() => {
    if (isOnlyAFan) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let playerX = canvas.width / 2;
    let targetX = playerX;
    let lasers: Array<{ x: number; y: number }> = [];
    let enemies: Array<{ x: number; y: number; speed: number }> = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = Math.max(20, Math.min(canvas.width - 20, e.clientX - rect.left));
    };

    const handleClick = () => {
      lasers.push({ x: playerX, y: canvas.height - 35 });
      playClickSound();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const render = () => {
      ctx.fillStyle = '#07030d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      playerX += (targetX - playerX) * 0.2;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(playerX, canvas.height - 35);
      ctx.lineTo(playerX - 14, canvas.height - 15);
      ctx.lineTo(playerX + 14, canvas.height - 15);
      ctx.closePath();
      ctx.fill();

      // Lasers
      ctx.fillStyle = '#38bdf8';
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.y -= 7;
        ctx.fillRect(l.x - 2, l.y, 4, 12);
        if (l.y < 0) lasers.splice(i, 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [isOnlyAFan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[96vh] overflow-y-auto bg-[#0d0714] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.3)] p-4 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ornate Golden Corners */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-xl pointer-events-none" />

        {/* HEADER: TITLE + 10-MINUTE LEVEL TRACKER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {genre}
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Phiên chơi: {formatTime(sessionSeconds)}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans flex items-center gap-2">
              <span>{title}</span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time 10-Minute Level Tracker */}
            <div className="flex items-center gap-2.5 bg-neutral-950 px-3.5 py-2 rounded-xl border border-amber-500/30 shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-black text-xs font-mono">
                LV.{playerLevel}
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-amber-300 font-bold">
                  Còn {formatTime(secondsToNextLevel)} lên LV.{playerLevel + 1}
                </div>
                <div className="w-28 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                    style={{ width: `${levelProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
              title="Đóng game và quay lại sảnh"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ACTIVE GAME VIEWPORT */}
        <div className="relative rounded-2xl bg-neutral-950 border-2 border-neutral-800 overflow-hidden shadow-inner">
          {isOnlyAFan ? (
            <OnlyaFanGame />
          ) : isSnake ? (
            <SnakeGame />
          ) : isBlockPuzzle ? (
            <BlockPuzzleGame />
          ) : isArtillery ? (
            <ArtilleryDuelGame />
          ) : (
            <div className="relative w-full h-[360px] bg-[#07030d] flex items-center justify-center">
              <canvas ref={canvasRef} width={760} height={360} className="w-full h-full block" />
              <div className="absolute top-4 left-4 bg-neutral-900/90 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-300">
                Slot Game đang chờ bạn cập nhật mã nguồn (MongoDB)
              </div>
            </div>
          )}
        </div>

        {/* GAME INSTRUCTIONS & LEVEL UP EXPLANATION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
          <div className="md:col-span-7 space-y-1.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Cơ chế tích lũy thời gian: 10 phút = +1 Level</span>
            </h4>
            <p className="text-xs text-neutral-300 font-mono leading-relaxed">
              Bạn đang tích lũy thời gian chơi thực tế. Cứ mỗi <strong>10 phút (600 giây)</strong> trải nghiệm trò chơi, nhân vật của bạn sẽ được <strong>tăng 1 Cấp Độ (LV +1)</strong> không giới hạn!
            </p>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>
                {isOnlyAFan
                  ? 'Quy tắc OnlyaFan'
                  : isSnake
                  ? 'Quy tắc Rắn Săn Mồi'
                  : isBlockPuzzle
                  ? 'Quy tắc Xếp Khối Ma Thuật'
                  : isArtillery
                  ? 'Quy tắc Đấu Pháo AI Duel'
                  : 'Quy tắc trò chơi'}
              </span>
            </h4>
            <div className="space-y-1 text-xs font-mono text-neutral-300">
              {isOnlyAFan ? (
                <>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Quạt quay 1 giây = <strong>+1 điểm</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Nhấp Gió = <strong>+10đ, +20s</strong> | Nhấp Sét = <strong>+20đ, +40s</strong> (Tối đa 60s)
                  </div>
                </>
              ) : isSnake ? (
                <>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Điều khiển W-A-S-D hoặc Mũi tên ăn táo tăng điểm.
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Cẩn thận chướng ngại vật xuất hiện và các đợt chớp tắt bất ngờ!
                  </div>
                </>
              ) : isBlockPuzzle ? (
                <>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Kéo thả hoặc nhấp chọn khối đặt lên bàn cờ 8x8.
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Bấm <strong>Phím R hoặc Space</strong> (hoặc nút 🔄) để <strong>Xoay Khối 90°</strong>!
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Dùng <strong>Bùa Đổi Khối [D]</strong> và <strong>Bùa Sấm Sét [F]</strong> phá ô giải cứu bàn cờ!
                  </div>
                </>
              ) : isArtillery ? (
                <>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Kéo chuột hoặc thanh trượt chỉnh <strong>Góc (Angle) & Lực (Power)</strong>, bấm <strong>SPACE</strong> để bắn!
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • Canh <strong>Sức Gió</strong> từng hiệp. Chọn vũ khí: Hỏa Cầu, Sao Băng, 3 Tia Sét hoặc Khiên Thánh!
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                    • <strong>Đối thủ AI được huấn luyện thuật toán Monte Carlo</strong>, tự học hỏi bù sai số. Bên nào cạn 100 HP trước sẽ thua!
                  </div>
                </>
              ) : (
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                  • Di chuyển chuột để né tránh thiên thạch và ghi điểm.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <div className="text-xs font-mono text-neutral-400">
            Tiến độ Level: <strong className="text-amber-400">{levelProgressPercent}%</strong> (Cấp {playerLevel})
          </div>

          <div className="flex items-center gap-2">
            {onForceLevelUp && (
              <button
                onClick={() => {
                  playCoinSound();
                  onForceLevelUp();
                }}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 text-xs font-mono transition-colors"
                title="Thử nghiệm tăng nhanh 1 cấp độ"
              >
                +1 Cấp (Test)
              </button>
            )}

            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Rời Game & Về Sảnh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
