import React, { useState, useMemo, useEffect } from 'react';
import { GameItem } from '../data/gamesData';
import { UserAccount } from '../types/auth';
import { calculateAccountSecurityRating } from '../utils/security';
import { getAvatarOption, getBorderClass } from '../data/avatarConfig';
import { TitleSelectorModal } from './TitleSelectorModal';
import { PlayerStatsContext } from '../data/achievementsData';
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
  const [isTitleModalOpen, setIsTitleModalOpen] = useState<boolean>(false);

  // Load and keep user profile in sync with ProfilePage and localStorage
  const [userProfile, setUserProfile] = useState<{
    name: string;
    avatarId: string;
    avatarUrl?: string;
    avatarBorder?: string;
    customTitle?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('polyplay_user_profile');
      if (saved) {
        const p = JSON.parse(saved);
        return {
          name: p.name || currentUser?.displayName || 'Pháp Sư PolyPlay',
          avatarId: p.avatarId || currentUser?.avatarId || 'mage',
          avatarUrl: p.avatarUrl || currentUser?.avatarUrl || '',
          avatarBorder: p.avatarBorder || currentUser?.avatarBorder || 'gold',
          customTitle: p.customTitle || currentUser?.customTitle || 'Tân Thủ Nhập Môn',
        };
      }
    } catch {}
    return {
      name: currentUser?.displayName || 'Pháp Sư PolyPlay',
      avatarId: currentUser?.avatarId || 'mage',
      avatarUrl: currentUser?.avatarUrl || '',
      avatarBorder: currentUser?.avatarBorder || 'gold',
      customTitle: currentUser?.customTitle || 'Tân Thủ Nhập Môn',
    };
  });

  useEffect(() => {
    const syncProfile = () => {
      try {
        const saved = localStorage.getItem('polyplay_user_profile');
        if (saved) {
          const p = JSON.parse(saved);
          setUserProfile({
            name: p.name || currentUser?.displayName || 'Pháp Sư PolyPlay',
            avatarId: p.avatarId || currentUser?.avatarId || 'mage',
            avatarUrl: p.avatarUrl || currentUser?.avatarUrl || '',
            avatarBorder: p.avatarBorder || currentUser?.avatarBorder || 'gold',
            customTitle: p.customTitle || currentUser?.customTitle || 'Tân Thủ Nhập Môn',
          });
        }
      } catch {}
    };

    syncProfile();
    window.addEventListener('storage', syncProfile);
    window.addEventListener('focus', syncProfile);
    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('focus', syncProfile);
    };
  }, [currentUser]);

  const handleSelectTitle = (newTitle: string) => {
    setUserProfile((prev) => {
      const updated = { ...prev, customTitle: newTitle };
      try {
        const saved = localStorage.getItem('polyplay_user_profile');
        const obj = saved ? JSON.parse(saved) : {};
        localStorage.setItem(
          'polyplay_user_profile',
          JSON.stringify({ ...obj, customTitle: newTitle })
        );
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return updated;
    });
  };

  // Compile statsContext for Title unlock requirements
  const statsContext = useMemo<PlayerStatsContext>(() => {
    let snakeHighScore = 0;
    let fanHighScore = 0;
    let blockHighScore = 0;
    let artilleryWins = 0;
    let battleshipWins = 0;
    let gachaPulls = 0;
    let gachaItemsCount = 0;
    let typingSharkStats: any = {};

    try {
      snakeHighScore = parseInt(localStorage.getItem('polyplay_snake_high_score') || '0', 10);
      fanHighScore = parseInt(localStorage.getItem('onlyafan_high_score') || '0', 10);
      blockHighScore = parseInt(localStorage.getItem('polyplay_block_high_score') || '0', 10);
      artilleryWins = parseInt(localStorage.getItem('artillery_total_wins') || '0', 10);
      battleshipWins = parseInt(localStorage.getItem('polyplay_battleship_wins') || '0', 10);

      const gachaRaw = localStorage.getItem('van_co_ky_tran_save');
      if (gachaRaw) {
        const p = JSON.parse(gachaRaw);
        gachaPulls = p.totalPulls || 0;
        gachaItemsCount = p.discoveredItemIds?.length || 0;
      }

      const sharkRaw = localStorage.getItem('polyplay_typingshark_stats');
      if (sharkRaw) {
        typingSharkStats = JSON.parse(sharkRaw);
      }
    } catch {}

    return {
      playerLevel,
      totalPlaySeconds: playTimeSeconds,
      snakeHighScore,
      fanHighScore,
      blockHighScore,
      artilleryWins,
      artilleryStreak: 0,
      artilleryHighestStreak: 0,
      artilleryBeatGrandmaster: false,
      artilleryMaxDamage: 0,
      isCustomizedProfile: true,
      hasCustomAvatar: Boolean(userProfile.avatarUrl),
      typingSharkKills: typingSharkStats.kills || 0,
      typingSharkBosses: typingSharkStats.bossesKilled || 0,
      typingSharkMaxWpm: typingSharkStats.maxWpm || 0,
      typingSharkMaxMinutes: typingSharkStats.highestMinuteSurvived || 0,
      typingSharkGold: typingSharkStats.lifetimeGold || 0,
      typingSharkVictories: typingSharkStats.victories || 0,
      gachaPulls,
      gachaItemsCount,
      battleshipWins,
    };
  }, [playerLevel, playTimeSeconds, userProfile.avatarUrl]);

  const currentAvatarObj = getAvatarOption(userProfile.avatarId);
  const currentBorderClass = getBorderClass(userProfile.avatarBorder);

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
    <div className="relative min-h-screen bg-[#07040d] text-neutral-100 p-2 sm:p-5 lg:p-8 font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Mystical Background Lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#2b0e3e_0%,#110419_60%,#05010a_100%)] pointer-events-none -z-20" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none -z-10 opacity-50" />

      {/* ========================================================================= */}
      {/* ORNATE MAGIC FRAME AROUND THE HUB CONTENT ("TRANG TRÍ KHUNG XUNG QUANH") */}
      {/* ========================================================================= */}
      <div className="relative max-w-7xl mx-auto rounded-2xl sm:rounded-[36px] lg:rounded-[44px] border-2 sm:border-4 border-amber-500/50 bg-[#0d0714]/90 shadow-[0_0_80px_rgba(245,158,11,0.25),inset_0_0_50px_rgba(0,0,0,0.9)] p-3 sm:p-6 lg:p-8 overflow-hidden">
        
        {/* Frame Arcane Gold Corner Filigrees */}
        <div className="absolute top-1.5 left-1.5 w-7 h-7 sm:w-14 sm:h-14 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-amber-400 rounded-tl-xl sm:rounded-tl-2xl pointer-events-none z-20 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
        <div className="absolute top-1.5 right-1.5 w-7 h-7 sm:w-14 sm:h-14 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-amber-400 rounded-tr-xl sm:rounded-tr-2xl pointer-events-none z-20 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
        <div className="absolute bottom-1.5 left-1.5 w-7 h-7 sm:w-14 sm:h-14 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-amber-400 rounded-bl-xl sm:rounded-bl-2xl pointer-events-none z-20 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
        <div className="absolute bottom-1.5 right-1.5 w-7 h-7 sm:w-14 sm:h-14 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-amber-400 rounded-br-xl sm:rounded-br-2xl pointer-events-none z-20 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />

        {/* Inner Golden Runic Border Line */}
        <div className="absolute inset-1.5 sm:inset-2.5 rounded-xl sm:rounded-[30px] border border-amber-500/20 pointer-events-none -z-0" />

        {/* ========================================================================= */}
        {/* TOP HEADER: BRAND, LEVEL TRACKER & LEVEL UP PROGRESS */}
        {/* ========================================================================= */}
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b-2 border-neutral-800/80 mb-5 sm:mb-6 w-full min-w-0">
          
          {/* Back to Magic Book & PolyPlay Title */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => {
                playClickSound();
                onBackToCover();
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-400 text-xs font-mono font-bold text-amber-200 transition-all shadow-md group shrink-0 cursor-pointer"
              title="Gấp sách và quay lại trang bìa ma thuật"
            >
              <BookOpen className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Đóng Sách</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                <div className="w-full h-full bg-[#120501] rounded-[14px] flex items-center justify-center">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-serif tracking-wide truncate">
                    POLYPLAY
                  </h1>
                  <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-semibold shrink-0">
                    SẢNH GAME
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-mono text-neutral-400 truncate max-w-[240px] sm:max-w-md">
                  Chọn trò chơi bất kỳ • Cứ đủ thời gian chơi là Cấp độ tăng (LV +1)
                </p>
              </div>
            </div>
          </div>

          {/* PLAYER AVATAR, TITLE, LEVEL & REAL-TIME PROGRESS BAR */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 bg-neutral-950/90 p-2 sm:p-3 rounded-2xl border-2 border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.2)] w-full xl:w-auto min-w-0 overflow-hidden">
            
            {/* AVATAR + LEVEL DOCKED CREST */}
            <div
              onClick={() => {
                playClickSound();
                onOpenProfile();
              }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 flex-1"
              title="Nhấp để vào Hồ Sơ Cá Nhân"
            >
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border-2 flex items-center justify-center transition-all duration-300 ${currentBorderClass} bg-gradient-to-tr ${currentAvatarObj.color} group-hover:scale-105`}
                >
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl select-none leading-none">
                      {currentAvatarObj.emoji}
                    </span>
                  )}
                </div>

                {/* Level Tag pinned neatly to bottom-right corner of avatar */}
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 text-neutral-950 font-black text-[9px] sm:text-[10px] font-mono shadow-md border border-neutral-950 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  <span>LV.{playerLevel}</span>
                </div>
              </div>

              {/* NAME, TITLE (CLICKABLE TO CHANGE), AND PLAY TIME */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="font-bold text-white text-xs sm:text-sm font-sans truncate max-w-[120px] sm:max-w-[150px] group-hover:text-amber-200 transition-colors">
                    {userProfile.name}
                  </span>
                </div>

                {/* Clickable Title Badge */}
                <div className="mt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      setIsTitleModalOpen(true);
                    }}
                    className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 max-w-full"
                    title="Bấm để chọn danh hiệu"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[100px] sm:max-w-[130px]">{userProfile.customTitle || 'Tân Thủ Nhập Môn'}</span>
                    <span className="text-[9px] text-amber-400/80 font-normal underline shrink-0">[Đổi]</span>
                  </button>
                </div>

                {/* Time Played */}
                <div className="text-[9px] sm:text-[11px] font-mono text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                  <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
                  <span className="truncate">Đã chơi: <strong className="text-neutral-200">{formatTime(playTimeSeconds)}</strong></span>
                </div>
              </div>
            </div>

            {/* Level Progress Gauge */}
            <div className="flex flex-col justify-center min-w-[110px] max-w-full md:max-w-[150px] w-full md:w-36 space-y-1 md:pl-3 md:border-l md:border-neutral-800 shrink-0">
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono">
                <span className="text-neutral-400">Lên Cấp {playerLevel + 1}:</span>
                <span className="text-amber-300 font-bold">{levelProgressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full border border-neutral-700 overflow-hidden relative shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
              <div className="text-[9px] font-mono text-amber-400/80 text-right truncate">
                ⚡ Còn <strong className="text-white">{formatTime(secondsToNextLevel)}</strong>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 md:pl-3 md:border-l md:border-neutral-800/80 justify-between md:justify-end w-full md:w-auto">
              {/* Profile Page Button */}
              <button
                onClick={() => {
                  playClickSound();
                  onOpenProfile();
                }}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs font-mono font-bold transition-all shadow hover:shadow-amber-500/20 cursor-pointer shrink-0"
                title="Xem hồ sơ cá nhân và 108 thành tựu"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="whitespace-nowrap">Hồ Sơ (108)</span>
              </button>

              {/* Account & Security Button */}
              {currentUser ? (
                <button
                  onClick={() => {
                    playClickSound();
                    onOpenAuth?.('security');
                  }}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-amber-500/40 text-[10px] sm:text-xs font-mono transition-all cursor-pointer shrink-0"
                  title="Quản trị bảo mật tài khoản"
                >
                  {userProfile.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="avatar" className="w-4 h-4 rounded-full object-cover border border-amber-400" />
                  ) : (
                    <span className="text-base leading-none">{currentUser.avatarEmoji || currentAvatarObj.emoji}</span>
                  )}
                  <span className="font-bold truncate max-w-[65px] sm:max-w-[80px]">{currentUser.displayName}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    playClickSound();
                    onOpenAuth?.('login');
                  }}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                  title="Đăng nhập hoặc tạo tài khoản để bảo lưu dữ liệu"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Tài Khoản</span>
                  <span className="sm:hidden">TK / Bảo Mật</span>
                </button>
              )}

              {/* Audio Toggle Button */}
              <button
                onClick={() => {
                  playClickSound();
                  onToggleSound();
                }}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  soundEnabled
                    ? 'bg-neutral-900/90 text-amber-400 border-amber-500/40 hover:bg-neutral-800'
                    : 'bg-neutral-900 text-neutral-600 border-neutral-800 hover:text-neutral-400'
                }`}
                title={soundEnabled ? 'Tắt âm thanh PolyPlay' : 'Bật âm thanh PolyPlay'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* ACCOUNT STATUS & GUEST SECURITY WARNING BANNER */}
        {/* ========================================================================= */}
        {!currentUser ? (
          <div className="relative z-10 mb-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-red-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-lg min-w-0">
            <div className="flex items-center gap-2.5 text-amber-200 min-w-0 flex-1">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <span className="break-words min-w-0">
                <strong className="text-amber-300 uppercase">Chế độ Khách vãng lai:</strong> Dữ liệu (Cấp độ, Điểm số, Xu & Kho đồ Gacha) <strong className="text-red-300 underline">sẽ không lưu lại khi bạn thoát hoặc đóng trang web</strong>!
              </span>
            </div>
            <button
              onClick={() => onOpenAuth?.('register')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all shadow whitespace-nowrap cursor-pointer shrink-0"
            >
              Đăng Ký Lưu Vĩnh Viễn →
            </button>
          </div>
        ) : (
          <div className="relative z-10 mb-4 p-2.5 sm:p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-emerald-200 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="break-words min-w-0">
                Đang bảo vệ dữ liệu cho <strong>{currentUser.displayName}</strong> (@{currentUser.username}) • Cấp bảo mật: <strong className="text-cyan-300">{calculateAccountSecurityRating(currentUser).level}</strong>
              </span>
            </div>
            <button
              onClick={() => onOpenAuth?.('security')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer shrink-0 whitespace-nowrap"
            >
              Quản Trị Bảo Mật
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTITLE & INSTRUCTION NOTIFICATION */}
        <div className="relative z-10 mb-6 p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-amber-200 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span className="break-words min-w-0">
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
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5 lg:gap-6">
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
                  className="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden bg-neutral-950 border-2 border-amber-500/40 hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-[0_12px_35px_rgba(245,158,11,0.35)] flex flex-col justify-between p-2.5 sm:p-4 active:scale-95"
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
                  <div className="relative z-20 flex items-center justify-between w-full gap-1">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30 truncate max-w-[80%]">
                      {game.genre || `Slot #${slotNumber}`}
                    </span>
                    {game.badge && (
                      <span className="text-[8px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded bg-red-600 text-white shrink-0">
                        {game.badge}
                      </span>
                    )}
                  </div>

                  {/* Center Play Icon on hover / touch */}
                  <div className="relative z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-xl shadow-amber-500/50 transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="relative z-20 bg-black/75 backdrop-blur-md p-2 sm:p-2.5 rounded-xl border border-neutral-800">
                    <h3 className="text-xs sm:text-sm font-bold text-white font-mono truncate group-hover:text-amber-400 transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-neutral-400 mt-0.5 sm:mt-1">
                      <span className="hidden xs:inline">Bấm chơi</span>
                      <span className="xs:hidden">Chơi</span>
                      <span className="text-amber-400 truncate">LV +1 ▶</span>
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
                className="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden bg-neutral-950/90 border-2 border-dashed border-amber-500/35 hover:border-amber-400/90 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(245,158,11,0.25)] flex flex-col justify-between p-2.5 sm:p-4 active:scale-95"
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

      {/* Global Title Selector Modal */}
      <TitleSelectorModal
        isOpen={isTitleModalOpen}
        onClose={() => setIsTitleModalOpen(false)}
        currentTitle={userProfile.customTitle || 'Tân Thủ Nhập Môn'}
        onSelectTitle={handleSelectTitle}
        statsContext={statsContext}
      />
    </div>
  );
};
