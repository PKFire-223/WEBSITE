import React, { useState, useMemo, useRef } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Clock,
  Zap,
  Edit3,
  Save,
  CheckCircle2,
  ArrowLeft,
  Flame,
  Volume2,
  VolumeX,
  Target,
  Check,
  Search,
  Swords,
  Lock,
  Filter,
  BarChart3,
  Shield,
  ShieldCheck,
  Upload,
  Camera,
  Trash2,
  Image as ImageIcon,
  KeyRound,
  Gamepad2,
  CheckCheck,
} from 'lucide-react';
import {
  playClickSound,
  playCoinSound,
  playPageTurnSound,
  playSealAwakenSound,
} from '../utils/audio';
import {
  getAchievementsList,
  CATEGORY_INFO,
  TIER_CONFIG,
  Achievement,
  PlayerStatsContext,
} from '../data/achievementsData';
import { UserAccount } from '../types/auth';
import { calculateAccountSecurityRating, updateUserAccount } from '../utils/security';
import { loadSavedStats as loadTypingSharkStats } from '../data/typingSkills';
import {
  AVATAR_OPTIONS,
  AVATAR_BORDERS,
  getBorderClass,
  getAvatarOption,
} from '../data/avatarConfig';
import { TitleSelectorModal } from './TitleSelectorModal';

interface ProfilePageProps {
  playerLevel: number;
  totalPlaySeconds: number;
  secondsToNextLevel: number;
  levelProgressPercent: number;
  onBackToHub: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register' | 'security') => void;
}

export interface UserProfileData {
  name: string;
  avatarId: string;
  avatarUrl?: string; // Custom uploaded avatar base64
  avatarBorder?: string; // Selected frame
  customTitle?: string;
  bio: string;
  joinedDate: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  playerLevel,
  totalPlaySeconds,
  secondsToNextLevel,
  levelProgressPercent,
  onBackToHub,
  soundEnabled,
  onToggleSound,
  currentUser,
  onOpenAuth,
}) => {
  // Navigation Tabs: 'overview' | 'achievements' | 'customize'
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'customize'>('overview');
  const [isTitleModalOpen, setIsTitleModalOpen] = useState<boolean>(false);

  // Load profile from localStorage
  const [profile, setProfile] = useState<UserProfileData>(() => {
    try {
      const saved = localStorage.getItem('polyplay_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || currentUser?.displayName || 'Pháp Sư PolyPlay',
          avatarId: parsed.avatarId || currentUser?.avatarId || 'mage',
          avatarUrl: parsed.avatarUrl || currentUser?.avatarUrl || '',
          avatarBorder: parsed.avatarBorder || currentUser?.avatarBorder || 'gold',
          customTitle: parsed.customTitle || currentUser?.customTitle || 'Tân Thủ Nhập Môn',
          bio: parsed.bio || 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!',
          joinedDate: parsed.joinedDate || new Date().toLocaleDateString('vi-VN'),
        };
      }
    } catch {
      // fallback
    }
    return {
      name: currentUser?.displayName || 'Pháp Sư PolyPlay',
      avatarId: currentUser?.avatarId || 'mage',
      avatarUrl: currentUser?.avatarUrl || '',
      avatarBorder: 'gold',
      customTitle: 'Tân Thủ Nhập Môn',
      bio: 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!',
      joinedDate: new Date().toLocaleDateString('vi-VN'),
    };
  });

  // Edit form states
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editTitle, setEditTitle] = useState(profile.customTitle || 'Tân Thủ Nhập Môn');
  const [selectedAvatarId, setSelectedAvatarId] = useState(profile.avatarId);
  const [selectedBorder, setSelectedBorder] = useState(profile.avatarBorder || 'gold');
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string>(profile.avatarUrl || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Stats from games
  const typingSharkStats = useMemo(() => loadTypingSharkStats(), []);

  const snakeHighScore = useMemo(() => {
    try {
      const val = localStorage.getItem('polyplay_snake_high_score');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  const fanHighScore = useMemo(() => {
    try {
      const val = localStorage.getItem('onlyafan_high_score');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  const blockHighScore = useMemo(() => {
    try {
      const val = localStorage.getItem('polyplay_block_high_score');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  const artilleryWins = useMemo(() => {
    try {
      const val = localStorage.getItem('artillery_total_wins');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  const battleshipWins = useMemo(() => {
    try {
      const val = localStorage.getItem('polyplay_battleship_wins');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  const gachaPulls = useMemo(() => {
    try {
      const saved = localStorage.getItem('van_co_ky_tran_save');
      if (saved) {
        const p = JSON.parse(saved);
        return p.totalPulls || 0;
      }
    } catch {}
    return 0;
  }, []);

  const gachaItemsCount = useMemo(() => {
    try {
      const saved = localStorage.getItem('van_co_ky_tran_save');
      if (saved) {
        const p = JSON.parse(saved);
        return p.discoveredItemIds?.length || 0;
      }
    } catch {}
    return 0;
  }, []);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs} giờ ${remMins} phút ${secs} giây`;
    }
    return `${mins} phút ${secs} giây`;
  };

  // Compile full player stats context for achievements
  const statsContext: PlayerStatsContext = useMemo(() => {
    return {
      playerLevel,
      totalPlaySeconds,
      snakeHighScore,
      fanHighScore,
      blockHighScore,
      artilleryWins,
      artilleryStreak: 0,
      artilleryHighestStreak: 0,
      artilleryBeatGrandmaster: false,
      artilleryMaxDamage: 0,
      isCustomizedProfile: Boolean(profile.bio !== 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!'),
      hasCustomAvatar: Boolean(profile.avatarUrl),
      typingSharkKills: typingSharkStats.kills,
      typingSharkBosses: typingSharkStats.bossesKilled,
      typingSharkMaxWpm: typingSharkStats.maxWpm,
      typingSharkMaxMinutes: typingSharkStats.highestMinuteSurvived,
      typingSharkGold: typingSharkStats.lifetimeGold,
      typingSharkVictories: typingSharkStats.victories,
      typingSharkSkinsCount: typingSharkStats.unlockedSkins?.length || 1,
      gachaPulls,
      gachaUrCount: gachaItemsCount > 2 ? 1 : 0,
      gachaItemsCount,
      gachaBoonsCount: 2,
      battleshipWins,
    };
  }, [playerLevel, totalPlaySeconds, snakeHighScore, fanHighScore, blockHighScore, artilleryWins, battleshipWins, profile, typingSharkStats, gachaPulls, gachaItemsCount]);

  // Compute Achievements List
  const achievements = useMemo(() => getAchievementsList(statsContext), [statsContext]);

  // Achievement Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAchievements = useMemo(() => {
    return achievements.filter((ach) => {
      if (selectedCategory !== 'all' && ach.category !== selectedCategory) return false;
      if (selectedTier !== 'all' && ach.tier !== selectedTier) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return ach.title.toLowerCase().includes(q) || ach.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [achievements, selectedCategory, selectedTier, searchQuery]);

  const unlockedCount = useMemo(() => achievements.filter((a) => a.isUnlocked).length, [achievements]);
  const totalPoints = useMemo(
    () => achievements.filter((a) => a.isUnlocked).reduce((sum, a) => sum + a.points, 0),
    [achievements]
  );
  const completionPercentage = Math.round((unlockedCount / achievements.length) * 100);

  // Avatar Upload Handler with Canvas Downscaling (Prevents localStorage quota overflow)
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WebP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Canvas compression to 180x180 max
        const canvas = document.createElement('canvas');
        const size = 180;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Center crop to square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCustomAvatarPreview(dataUrl);
          playCoinSound();
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Changes
  const handleSaveProfile = () => {
    playSealAwakenSound();
    const updated: UserProfileData = {
      ...profile,
      name: editName.trim() || 'Pháp Sư PolyPlay',
      bio: editBio.trim() || 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!',
      customTitle: editTitle.trim() || 'Tân Thủ Nhập Môn',
      avatarId: selectedAvatarId,
      avatarBorder: selectedBorder,
      avatarUrl: customAvatarPreview,
    };

    setProfile(updated);
    try {
      localStorage.setItem('polyplay_user_profile', JSON.stringify(updated));
      if (currentUser) {
        currentUser.displayName = updated.name;
        currentUser.avatarUrl = updated.avatarUrl;
        currentUser.avatarBorder = updated.avatarBorder;
        currentUser.customTitle = updated.customTitle;
        updateUserAccount(currentUser);
      }
    } catch (e) {
      console.warn('Storage save notice', e);
    }

    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
    setActiveTab('overview');
  };

  const handleSelectTitleFromModal = (newTitle: string) => {
    setEditTitle(newTitle);
    setProfile((prev) => {
      const updated = { ...prev, customTitle: newTitle };
      try {
        localStorage.setItem('polyplay_user_profile', JSON.stringify(updated));
        if (currentUser) {
          currentUser.customTitle = newTitle;
          updateUserAccount(currentUser);
        }
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return updated;
    });
  };

  const currentAvatarObj = AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];
  const currentBorderObj = AVATAR_BORDERS.find((b) => b.id === profile.avatarBorder) || AVATAR_BORDERS[0];

  return (
    <div className="relative min-h-screen bg-[#07030d] text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950 p-3 sm:p-6 lg:p-8">
      {/* Background Lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#2b0e3e_0%,#110419_55%,#05010a_100%)] pointer-events-none -z-20" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none -z-10 opacity-40" />

      {/* TOP NAVIGATION BAR */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => {
            playClickSound();
            onBackToHub();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Kho Game</span>
        </button>

        {/* Tab Switchers */}
        <div className="flex items-center bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800 shadow-inner">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('overview');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Tổng Quan</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('achievements');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Thành Tựu ({unlockedCount}/{achievements.length})</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('customize');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'customize'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Đổi Avatar & Hồ Sơ</span>
          </button>
        </div>

        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ========================================================================= */}
        {/* HERO PROFILE CARD (With Custom Avatar, Title & Level Gauge) */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950/85 border-2 border-amber-500/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* AVATAR DISPLAY (Custom Image or Selected Emoji Preset) */}
            <div className="relative group shrink-0">
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 flex items-center justify-center transition-all duration-300 ${currentBorderObj.class} bg-gradient-to-tr ${currentAvatarObj.color}`}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-[20px]"
                  />
                ) : (
                  <span className="text-5xl sm:text-6xl select-none leading-none">
                    {currentAvatarObj.emoji}
                  </span>
                )}
              </div>

              {/* Quick Avatar Change Button */}
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('customize');
                }}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold text-xs shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border border-neutral-900"
                title="Thay đổi ảnh đại diện Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* PROFILE INFO & EXP PROGRESS */}
            <div className="flex-1 text-center md:text-left space-y-2.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wide truncate max-w-full">
                  {profile.name}
                </h1>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsTitleModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer group max-w-full"
                  title="Bấm để mở kho danh hiệu và chọn danh hiệu yêu thích"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{profile.customTitle || 'Tân Thủ Nhập Môn'}</span>
                  <span className="text-[10px] text-amber-400/80 underline font-normal shrink-0">[Đổi Danh Hiệu]</span>
                </button>
                {currentUser && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Đã Xác Thực</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 font-sans max-w-xl italic">
                "{profile.bio}"
              </p>

              {/* LEVEL & PROGRESS BAR */}
              <div className="pt-2 max-w-lg">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>ĐẲNG CẤP LV.{playerLevel}</span>
                  </span>
                  <span className="text-neutral-400">
                    Tiến trình lên Cấp {playerLevel + 1}: <strong className="text-amber-300">{levelProgressPercent}%</strong>
                  </span>
                </div>
                <div className="w-full h-3 bg-neutral-900 rounded-full border border-neutral-800 overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${levelProgressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mt-1">
                  <span>Tổng thời gian: <strong className="text-white">{formatTime(totalPlaySeconds)}</strong></span>
                  <span className="text-amber-400">Còn {Math.ceil(secondsToNextLevel / 60)} phút chơi để thăng cấp</span>
                </div>
              </div>
            </div>

            {/* QUICK STATS CARDS */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0 w-full sm:w-auto">
              <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Thành Tựu</div>
                <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                  {unlockedCount} <span className="text-xs text-neutral-500">/ {achievements.length}</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Điểm Vinh Danh</div>
                <div className="text-lg font-black text-cyan-300 font-mono mt-0.5">
                  {totalPoints} <span className="text-xs text-cyan-400 font-normal">pts</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD (Game Highlights & Records) */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Typing Shark Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-neutral-950 border border-cyan-500/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🦈</span>
                    <h3 className="font-bold text-sm text-cyan-300 uppercase tracking-wider font-mono">
                      Typing Shark: Vực Sâu
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
                    ROGUELIKE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono my-3">
                  <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400 text-[10px]">Kỷ lục sống</div>
                    <div className="font-bold text-cyan-300 mt-0.5">{typingSharkStats.highestMinuteSurvived} ph</div>
                  </div>
                  <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400 text-[10px]">Tốc độ WPM</div>
                    <div className="font-bold text-emerald-300 mt-0.5">{typingSharkStats.maxWpm} WPM</div>
                  </div>
                  <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400 text-[10px]">Boss diệt</div>
                    <div className="font-bold text-amber-300 mt-0.5">{typingSharkStats.bossesKilled} Boss</div>
                  </div>
                </div>

                <div className="text-xs font-mono text-neutral-400 flex justify-between pt-2 border-t border-neutral-900">
                  <span>Tổng vàng kiếm được:</span>
                  <strong className="text-amber-300 font-bold">+{typingSharkStats.lifetimeGold.toLocaleString()}🪙</strong>
                </div>
              </div>

              {/* Vạn Cổ Kỳ Trân Gacha Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-neutral-950 border border-purple-500/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📜</span>
                    <h3 className="font-bold text-sm text-purple-300 uppercase tracking-wider font-mono">
                      Vạn Cổ Kỳ Trân
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-[10px] font-mono text-purple-400">
                    GACHA
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono my-3">
                  <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400 text-[10px]">Lượt Triệu Hồi</div>
                    <div className="font-bold text-purple-300 mt-0.5">{gachaPulls} lần</div>
                  </div>
                  <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400 text-[10px]">Bảo Vật Thu Thập</div>
                    <div className="font-bold text-amber-300 mt-0.5">{gachaItemsCount} món</div>
                  </div>
                </div>

                <div className="text-xs font-mono text-neutral-400 flex justify-between pt-2 border-t border-neutral-900">
                  <span>Trạng thái Bí Chỉ:</span>
                  <strong className="text-emerald-400 font-bold">Đã Kích Hoạt</strong>
                </div>
              </div>

              {/* Arcade Classics Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-neutral-950 border border-amber-500/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🕹️</span>
                    <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wider font-mono">
                      Kỷ Lục Arcade
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/30 text-[10px] font-mono text-amber-400">
                    CLASSIC
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">🐍 Rắn Săn Mồi:</span>
                    <span className="font-bold text-emerald-300">{snakeHighScore} điểm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">🌪️ OnlyaFan:</span>
                    <span className="font-bold text-cyan-300">{fanHighScore} điểm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">💎 Xếp Khối Ma Thuật:</span>
                    <span className="font-bold text-purple-300">{blockHighScore} điểm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">⚔️ Thắng Đấu Pháo:</span>
                    <span className="font-bold text-amber-300">{artilleryWins} trận</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">🚢 Thắng Hải Chiến:</span>
                    <span className="font-bold text-sky-300">{battleshipWins} trận</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Link to Achievements */}
            <div className="p-6 rounded-3xl bg-neutral-950/70 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Kho Thành Tựu Mở Khóa ({unlockedCount}/{achievements.length})</span>
                </h4>
                <p className="text-xs text-neutral-400 font-sans mt-1">
                  Khám phá danh hiệu, điểm vinh danh và hàng chục nhiệm vụ thử thách trong toàn bộ các tựa game!
                </p>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('achievements');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-black text-xs font-mono uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Xem Toàn Bộ Thành Tựu
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ACHIEVEMENTS HUB (Expansive, Categorized, Filterable) */}
        {/* ========================================================================= */}
        {activeTab === 'achievements' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Search & Category Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      playClickSound();
                      setSelectedCategory(key);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedCategory === key
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 shadow-md font-black'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm thành tựu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((ach) => {
                const tierConf = TIER_CONFIG[ach.tier];
                const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

                return (
                  <div
                    key={ach.id}
                    className={`relative p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                      ach.isUnlocked
                        ? `${tierConf.bg} ${tierConf.border} ${tierConf.glow}`
                        : 'bg-neutral-950/70 border-neutral-900 opacity-65'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Icon, Title & Tier Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-2xl shadow-inner shrink-0">
                            {ach.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight">
                              {ach.title}
                            </h4>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border inline-block mt-1 font-bold ${tierConf.badgeBg}`}>
                              {tierConf.label.toUpperCase()} (+{ach.points} pts)
                            </span>
                          </div>
                        </div>

                        {ach.isUnlocked ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-neutral-300 mt-3 font-sans leading-relaxed min-h-[36px]">
                        {ach.desc}
                      </p>

                      {ach.rewardTitle && (
                        <div className="mt-2 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                          <span>🎖️ Danh hiệu:</span>
                          <strong>{ach.rewardTitle}</strong>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/80">
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mb-1">
                        <span>Tiến độ:</span>
                        <span className="font-bold text-neutral-200">
                          {ach.progress} / {ach.maxProgress} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 rounded-full border border-neutral-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            ach.isUnlocked
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-amber-600 to-yellow-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CUSTOMIZE AVATAR & PROFILE (Upload photo, change borders, bio) */}
        {/* ========================================================================= */}
        {activeTab === 'customize' && (
          <div className="bg-neutral-950/85 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
            <div className="border-b border-neutral-800 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span>Tùy Biến Diện Mạo & Ảnh Đại Diện Avatar</span>
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Tải lên ảnh cá nhân từ máy hoặc chọn bộ hình đại diện ma pháp độc quyền.
                </p>
              </div>

              {isSavedRecently && (
                <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-bounce">
                  <CheckCheck className="w-4 h-4" />
                  <span>Đã Lưu Thành Công!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* PREVIEW BOX */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-xs font-mono text-neutral-400 uppercase">Xem Trước Avatar</div>
                
                <div
                  className={`w-32 h-32 rounded-3xl overflow-hidden border-4 flex items-center justify-center transition-all ${
                    AVATAR_BORDERS.find((b) => b.id === selectedBorder)?.class
                  } bg-gradient-to-tr ${
                    AVATAR_OPTIONS.find((a) => a.id === selectedAvatarId)?.color
                  }`}
                >
                  {customAvatarPreview ? (
                    <img
                      src={customAvatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-[20px]"
                    />
                  ) : (
                    <span className="text-6xl leading-none">
                      {AVATAR_OPTIONS.find((a) => a.id === selectedAvatarId)?.emoji}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm text-white font-mono">{editName || 'Pháp Sư'}</div>
                  <div className="text-xs text-amber-300 font-mono font-bold">{editTitle}</div>
                </div>

                {/* Upload or Remove custom avatar */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Lên</span>
                  </button>

                  {customAvatarPreview && (
                    <button
                      onClick={() => {
                        setCustomAvatarPreview('');
                        playClickSound();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                      title="Xóa ảnh tự tải và dùng lại emoji mặc định"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa Ảnh</span>
                    </button>
                  )}
                </div>
              </div>

              {/* EDIT FORM DETAILS */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Name & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase mb-1">
                      Tên Hiển Thị (Display Name)
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={24}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono text-neutral-300 uppercase">
                        Danh Hiệu (Title)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setIsTitleModalOpen(true);
                        }}
                        className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trophy className="w-3 h-3" />
                        <span>Kho Danh Hiệu</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={30}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setIsTitleModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold text-xs font-mono shrink-0 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                      >
                        Chọn
                      </button>
                    </div>

                    {/* Quick Select Title Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        'Tân Thủ Nhập Môn',
                        'Pháp Sư Tinh Anh',
                        'Đại Pháp Sư Hoàng Gia',
                        'Ngư Dân Biển Đêm',
                        'Thợ Săn Cự Thú',
                        'Đại Đô Đốc Biển Sâu',
                        'Âm Tốc Thần Vương',
                        'Đứa Con Của Thần May Mắn',
                        'Thuyền Trưởng Bão Táp',
                        'Pháo Vương Bất Diệt',
                        'Thánh Trí Tuệ Ma Trận',
                        'Vua Trò Chơi PolyPlay',
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setEditTitle(t);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                            editTitle === t
                              ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                              : 'bg-neutral-800/80 text-neutral-400 hover:text-amber-200 border border-neutral-700/50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase mb-1">
                    Tiểu Sử / Phương Châm Chiến Đấu
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={2}
                    maxLength={120}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-200 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Avatar Border Frame Options */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase mb-2">
                    Khung Hiệu Ứng Avatar (Frames)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVATAR_BORDERS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBorder(b.id);
                          playClickSound();
                        }}
                        className={`p-2 rounded-xl border text-xs font-mono text-left transition-all cursor-pointer ${
                          selectedBorder === b.id
                            ? 'bg-neutral-800 border-amber-400 text-amber-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase mb-2">
                    Bộ Hình Đại Diện Preset
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {AVATAR_OPTIONS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSelectedAvatarId(a.id);
                          playClickSound();
                        }}
                        className={`p-2.5 rounded-2xl border text-2xl flex items-center justify-center transition-all cursor-pointer ${
                          selectedAvatarId === a.id && !customAvatarPreview
                            ? 'bg-neutral-800 border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        }`}
                        title={a.name}
                      >
                        {a.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      playClickSound();
                      setActiveTab('overview');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-mono font-bold cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Thay Đổi</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      {/* Global Title Selector Modal */}
      <TitleSelectorModal
        isOpen={isTitleModalOpen}
        onClose={() => setIsTitleModalOpen(false)}
        currentTitle={profile.customTitle || 'Tân Thủ Nhập Môn'}
        onSelectTitle={handleSelectTitleFromModal}
        statsContext={statsContext}
      />
    </div>
  );
};
