import React, { useState, useMemo } from 'react';
import { GameItem } from '../data/gamesData';
import { UserAccount } from '../types/auth';
import { calculateAccountSecurityRating } from '../utils/security';
import {
  Sparkles,
  Star,
  Play,
  ArrowLeft,
  Volume2,
  VolumeX,
  Flame,
  Wand2,
  Trophy,
  Clock,
  Zap,
  BookOpen,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
} from 'lucide-react';
import { playClickSound, playCoinSound } from '../utils/audio';

interface GameHubProps {
  games: GameItem[];
  playerLevel: number;
  playTimeSeconds: number;
  secondsToNextLevel: number;
  levelProgressPercent: number;
  onSelectGame: (game: GameItem) => void;
  onSelectEmptySlot: (slotNumber: number) => void;
  onBackToCover: () => void;
  onOpenProfile: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register' | 'security') => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  games,
  playerLevel,
  playTimeSeconds,
  secondsToNextLevel,
  levelProgressPercent,
  onSelectGame,
  onSelectEmptySlot,
  onBackToCover,
  onOpenProfile,
  soundEnabled,
  onToggleSound,
  currentUser,
  onOpenAuth,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');

  // Load custom avatar if exists
  const customAvatar = useMemo(() => {
    if (currentUser?.avatarUrl) return currentUser.avatarUrl;
    try {
      const saved = localStorage.getItem('polyplay_user_profile');
      if (saved) {
        const p = JSON.parse(saved);
        return p.avatarUrl || null;
      }
    } catch {}
    return null;
  }, [currentUser]);

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const getRankTitle = (lvl: number) => {
    if (lvl >= 50) return 'Đại Pháp Sư Tối Thượng';
    if (lvl >= 25) return 'Bậc Thầy Ma Thuật';
    if (lvl >= 10) return 'Pháp Sư Tinh Anh';
    if (lvl >= 5) return 'Pháp Sư PolyPlay';
    if (lvl >= 2) return 'Học Viên Ma Pháp';
    return 'Tân Thủ Nhập Môn';
  };

  // We ensure at least 8 square slots are shown
  const totalSlotsCount = Math.max(8, games.length);
  const slots = Array.from({ length: totalSlotsCount }, (_, idx) => {
    const game = games[idx];
    return {
      slotNumber: idx + 1,
      game: game || null,
    };
  });

  return (
    <div className="relative min-h-screen bg-[#07040d] text-neutral-100 p-3 sm:p-6 lg:p-8 font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Mystical Background Lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#2b0e3e_0%,#110419_60%,#05010a_100%)] pointer-events-none -z-20" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none -z-10 opacity-50" />

      {/* ========================================================================= */}
      {/* ORNATE MAGIC FRAME AROUND THE HUB CONTENT ("TRANG TRÍ KHUNG XUNG QUANH") */}
      {/* ========================================================================= */}
      <div className="relative max-w-7xl mx-auto rounded-[32px] sm:rounded-[44px] border-4 border-amber-500/50 bg-[#0d0714]/90 shadow-[0_0_80px_rgba(245,158,11,0.25),inset_0_0_50px_rgba(0,0,0,0.9)] p-4 sm:p-8 overflow-hidden">
        
        {/* Frame Arcane Gold Corner Filigrees */}
        <div className="absolute top-2.5 left-2.5 w-10 h-10 sm:w-16 sm:h-16 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl pointer-events-none z-20 shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
        <div className="absolute top-2.5 right-2.5 w-10 h-10 sm:w-16 sm:h-16 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl pointer-events-none z-20 shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
        <div className="absolute bottom-2.5 left-2.5 w-10 h-10 sm:w-16 sm:h-16 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl pointer-events-none z-20 shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
        <div className="absolute bottom-2.5 right-2.5 w-10 h-10 sm:w-16 sm:h-16 border-b-4 border-r-4 border-amber-400 rounded-br-2xl pointer-events-none z-20 shadow-[0_0_20px_rgba(245,158,11,0.6)]" />

        {/* Inner Golden Runic Border Line */}
        <div className="absolute inset-2 sm:inset-3 rounded-[26px] sm:rounded-[36px] border border-amber-500/20 pointer-events-none -z-0" />

        {/* ========================================================================= */}
        {/* TOP HEADER: BRAND, LEVEL TRACKER & LEVEL UP PROGRESS */}
        {/* ========================================================================= */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b-2 border-neutral-800/80 mb-8">
          
          {/* Back to Magic Book & PolyPlay Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                onBackToCover();
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-400 text-xs font-mono font-bold text-amber-200 transition-all shadow-md group shrink-0"
              title="Gấp sách và quay lại trang bìa ma thuật"
            >
              <BookOpen className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Đóng Sách</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                <div className="w-full h-full bg-[#120501] rounded-[14px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-serif tracking-wide">
                    POLYPLAY
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                    SẢNH GAME MA THUẬT
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-400">
                  Chọn trò chơi bất kỳ • Cứ đủ thời gian chơi là Cấp độ tăng (LV +1)
                </p>
              </div>
            </div>
          </div>

          {/* PLAYER LEVEL & REAL-TIME PROGRESS BAR (REQUIREMENT: "cứ đủ thời gian là lv +1") */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-neutral-950/80 p-3 sm:p-3.5 rounded-2xl border border-amber-500/30 shadow-lg">
            
            {/* Level Badge */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 font-black text-base font-mono shadow-md shadow-amber-500/30">
                <Zap className="w-3.5 h-3.5 text-neutral-950 absolute -top-1 -right-1 fill-current" />
                <span>LV.{playerLevel}</span>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>{getRankTitle(playerLevel)}</span>
                </div>
                <div className="text-xs font-mono text-neutral-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>Đã chơi: <strong>{formatTime(playTimeSeconds)}</strong></span>
                </div>
              </div>
            </div>

            {/* Level Progress Gauge */}
            <div className="flex flex-col justify-center min-w-[180px] sm:min-w-[210px] space-y-1 sm:pl-3 sm:border-l sm:border-neutral-800">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-neutral-400">Tiến trình lên Cấp {playerLevel + 1}:</span>
                <span className="text-amber-300 font-bold">{levelProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-900 rounded-full border border-neutral-700 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
              <div className="text-[9px] font-mono text-amber-400/80 text-right">
                ⚡ Còn <strong className="text-white">{formatTime(secondsToNextLevel)}</strong> chơi để LV +1
              </div>
            </div>

            {/* Profile Page Button */}
            <button
              onClick={() => {
                playClickSound();
                onOpenProfile();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all shadow hover:shadow-amber-500/20 cursor-pointer shrink-0 self-center sm:self-auto"
              title="Xem hồ sơ cá nhân và bảng thành tựu"
            >
              {customAvatar ? (
                <img src={customAvatar} alt="avatar" className="w-4 h-4 rounded-full object-cover border border-amber-400" />
              ) : (
                <User className="w-4 h-4 text-amber-400" />
              )}
              <span>Hồ Sơ</span>
            </button>

            {/* Account & Security Button */}
            {currentUser ? (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuth?.('security');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-amber-500/40 text-xs font-mono transition-all cursor-pointer shrink-0 self-center sm:self-auto"
                title="Quản trị bảo mật tài khoản"
              >
                {customAvatar ? (
                  <img src={customAvatar} alt="avatar" className="w-4 h-4 rounded-full object-cover border border-amber-400" />
                ) : (
                  <span className="text-base leading-none">{currentUser.avatarEmoji || '🧙‍♂️'}</span>
                )}
                <span className="font-bold hidden sm:inline max-w-[90px] truncate">{currentUser.displayName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuth?.('login');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all cursor-pointer shrink-0 self-center sm:self-auto"
                title="Đăng nhập hoặc tạo tài khoản để bảo lưu dữ liệu"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Tài Khoản / Bảo Mật</span>
                <span className="sm:hidden">Đăng Nhập</span>
              </button>
            )}

            {/* Audio Toggle Button */}
            <button
              onClick={() => {
                playClickSound();
                onToggleSound();
              }}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors self-center sm:self-auto cursor-pointer"
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* ACCOUNT STATUS & GUEST SECURITY WARNING BANNER */}
        {/* ========================================================================= */}
        {!currentUser ? (
          <div className="relative z-10 mb-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-red-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-lg">
            <div className="flex items-center gap-2.5 text-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <span>
                <strong className="text-amber-300 uppercase">Chế độ Khách vãng lai:</strong> Dữ liệu (Cấp độ, Điểm số, Xu & Kho đồ Gacha) <strong className="text-red-300 underline">sẽ không lưu lại khi bạn thoát hoặc đóng trang web</strong>!
              </span>
            </div>
            <button
              onClick={() => onOpenAuth?.('register')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all shadow whitespace-nowrap cursor-pointer"
            >
              Đăng Ký Lưu Vĩnh Viễn →
            </button>
          </div>
        ) : (
          <div className="relative z-10 mb-4 p-2.5 sm:p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs font-mono text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Đang bảo vệ dữ liệu cho <strong>{currentUser.displayName}</strong> (@{currentUser.username}) • Cấp bảo mật: <strong className="text-cyan-300">{calculateAccountSecurityRating(currentUser).level}</strong>
              </span>
            </div>
            <button
              onClick={() => onOpenAuth?.('security')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              Quản Trị Bảo Mật
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTITLE & INSTRUCTION NOTIFICATION */}
        <div className="relative z-10 mb-6 p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-amber-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span>
              <strong>Chế độ PolyPlay:</strong> Nhấp vào bất kỳ ô vuông trò chơi nào để mở màn hình chơi. Hệ thống sẽ tự động tính thời gian và tăng cấp độ <strong>(LV +1)</strong> cho bạn!
            </span>
          </div>
          <span className="text-[10px] text-amber-400/70 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/20 whitespace-nowrap">
            Quy tắc: 10 phút chơi = 1 Cấp độ (LV +1)
          </span>
        </div>

        {/* ========================================================================= */}
        {/* SQUARE TILES GRID ("CÁC Ô VUÔNG CHỨA GAME TƯƠNG ỨNG BẤM VÀO SẼ MỞ GAME") */}
        {/* ========================================================================= */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {slots.map((slot) => {
            const { slotNumber, game } = slot;

            if (game) {
              // Populated game tile
              return (
                <div
                  key={game.id || slotNumber}
                  onClick={() => {
                    playCoinSound();
                    onSelectGame(game);
                  }}
                  className="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden bg-neutral-950 border-2 border-amber-500/40 hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-[0_12px_35px_rgba(245,158,11,0.35)] flex flex-col justify-between p-4"
                >
                  {game.thumbnail && (
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out z-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-black/40 group-hover:from-neutral-950/70 transition-all duration-300 z-10" />

                  {/* Top info */}
                  <div className="relative z-20 flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30">
                      {game.genre || `Slot #${slotNumber}`}
                    </span>
                    {game.badge && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                        {game.badge}
                      </span>
                    )}
                  </div>

                  {/* Center Play Icon on hover */}
                  <div className="relative z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-xl shadow-amber-500/50 transform group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="relative z-20 bg-black/70 backdrop-blur-md p-2.5 rounded-xl border border-neutral-800">
                    <h3 className="text-sm font-bold text-white font-mono truncate group-hover:text-amber-400 transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-1">
                      <span>Bấm để chơi</span>
                      <span className="text-amber-400">Tích lũy LV ▶</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Empty slot tile ready for user's game (chờ user thêm game)
            return (
              <div
                key={`empty-slot-${slotNumber}`}
                onClick={() => {
                  playClickSound();
                  onSelectEmptySlot(slotNumber);
                }}
                className="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden bg-neutral-950/90 border-2 border-dashed border-amber-500/35 hover:border-amber-400/90 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(245,158,11,0.25)] flex flex-col justify-between p-4"
              >
                {/* Subtle runic grid inside empty square */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] group-hover:bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] transition-colors" />

                {/* Top Slot Index */}
                <div className="relative z-20 flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-neutral-900 border border-amber-500/30 text-amber-300">
                    Ô GAME #{slotNumber < 10 ? `0${slotNumber}` : slotNumber}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                    TRỐNG
                  </span>
                </div>

                {/* Center Magic Seal / Plus placeholder */}
                <div className="relative z-20 flex flex-col items-center justify-center space-y-2 py-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-amber-500/40 group-hover:border-amber-400 group-hover:bg-amber-500/10 flex items-center justify-center text-amber-400/70 group-hover:text-amber-300 transition-all transform group-hover:scale-110 shadow-inner">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-neutral-300 group-hover:text-amber-300 transition-colors">
                      Chờ Thêm Trò Chơi
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500">
                      Nhấp để mở & thử nghiệm LV+1
                    </div>
                  </div>
                </div>

                {/* Bottom slot status bar */}
                <div className="relative z-20 bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-neutral-400">Sẵn sàng kết nối</span>
                  <span className="text-amber-400 group-hover:underline">Vào chơi thử ▶</span>
                </div>

                {/* Bottom glowing line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* Footer info inside the ornate frame */}
        <div className="relative z-10 mt-10 pt-5 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>PolyPlay Engine • Đã sẵn sàng cho cấu trúc MongoDB</span>
          </div>
          <div className="text-[11px] text-amber-400/80">
            Cơ chế: Mở game để tính giờ tăng Cấp Độ (Level +1)
          </div>
        </div>

      </div>
    </div>
  );
};
