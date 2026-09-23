import React, { useState, useMemo } from 'react';
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
  Share2,
  Check,
  Search,
  Swords,
  Lock,
  Unlock,
  Filter,
  BarChart3,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { playClickSound, playCoinSound, playPageTurnSound, playSealAwakenSound } from '../utils/audio';
import {
  getAchievementsList,
  CATEGORY_INFO,
  TIER_CONFIG,
  Achievement,
  PlayerStatsContext
} from '../data/achievementsData';

interface ProfilePageProps {
  playerLevel: number;
  totalPlaySeconds: number;
  secondsToNextLevel: number;
  levelProgressPercent: number;
  onBackToHub: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export interface UserProfileData {
  name: string;
  avatarId: string;
  bio: string;
  joinedDate: string;
}

const AVATAR_OPTIONS = [
  { id: 'mage', name: 'Đại Pháp Sư', emoji: '🧙‍♂️', color: 'from-amber-500 to-red-600', desc: 'Bậc thầy nguyên tố huyền bí' },
  { id: 'dragon', name: 'Long Thần Cổ', emoji: '🐉', color: 'from-emerald-500 to-teal-700', desc: 'Uy lực dũng mãnh ngàn năm' },
  { id: 'phoenix', name: 'Phượng Hoàng Lửa', emoji: '🔥', color: 'from-orange-500 to-rose-600', desc: 'Bất tử và tái sinh bất diệt' },
  { id: 'snake', name: 'Xà Thần Lục Bảo', emoji: '🐍', color: 'from-lime-500 to-emerald-700', desc: 'Bậc thầy luồn lách và săn mồi' },
  { id: 'thunder', name: 'Lôi Thần Sấm Sét', emoji: '⚡', color: 'from-yellow-400 to-amber-600', desc: 'Tốc độ ánh sáng hủy diệt' },
  { id: 'fan', name: 'Phong Thần Quạt', emoji: '🌪️', color: 'from-cyan-400 to-blue-600', desc: 'Chúa tể những cơn lốc cuồng nộ' },
  { id: 'astronomer', name: 'Chiêm Tinh Tinh Vân', emoji: '🔮', color: 'from-purple-500 to-indigo-700', desc: 'Thấu thị tương lai các trò chơi' },
  { id: 'knight', name: 'Hiệp Sĩ Hoàng Gia', emoji: '⚔️', color: 'from-amber-400 to-yellow-600', desc: 'Kiên trung vững chãi bất khuất' },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  playerLevel,
  totalPlaySeconds,
  secondsToNextLevel,
  levelProgressPercent,
  onBackToHub,
  soundEnabled,
  onToggleSound,
}) => {
  // Navigation Tabs: 'overview' | 'achievements'
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');

  // Load profile from localStorage or initialize defaults
  const [profile, setProfile] = useState<UserProfileData>(() => {
    try {
      const saved = localStorage.getItem('polyplay_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Pháp Sư PolyPlay',
          avatarId: parsed.avatarId || 'mage',
          bio: parsed.bio || 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!',
          joinedDate: parsed.joinedDate || new Date().toLocaleDateString('vi-VN'),
        };
      }
    } catch {
      // fallback
    }
    return {
      name: 'Pháp Sư PolyPlay',
      avatarId: 'mage',
      bio: 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!',
      joinedDate: new Date().toLocaleDateString('vi-VN'),
    };
  });

  // Scores data from individual games
  const [snakeHighScore] = useState<number>(() => {
    try {
      const val = localStorage.getItem('polyplay_snake_high_score');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [fanHighScore] = useState<number>(() => {
    try {
      const val = localStorage.getItem('onlyafan_high_score');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [blockHighScore] = useState<number>(() => {
    try {
      const val = localStorage.getItem('polyplay_block_high_score');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Artillery Duel stats
  const [artilleryWins] = useState<number>(() => {
    try {
      const val = localStorage.getItem('artillery_total_wins');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [artilleryStreak] = useState<number>(() => {
    try {
      const val = localStorage.getItem('artillery_win_streak');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [artilleryHighestStreak] = useState<number>(() => {
    try {
      const val = localStorage.getItem('artillery_highest_streak');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [artilleryBeatGrandmaster] = useState<boolean>(() => {
    try {
      return localStorage.getItem('artillery_beat_grandmaster') === 'true';
    } catch {
      return false;
    }
  });

  const [artilleryMaxDamage] = useState<number>(() => {
    try {
      const val = localStorage.getItem('artillery_max_damage');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempBio, setTempBio] = useState(profile.bio);
  const [tempAvatarId, setTempAvatarId] = useState(profile.avatarId);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Success toast indicator
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Achievement filtering states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Save profile changes
  const handleSaveProfile = () => {
    playCoinSound();
    const updated: UserProfileData = {
      ...profile,
      name: tempName.trim() || 'Pháp Sư PolyPlay',
      bio: tempBio.trim() || 'Người chơi PolyPlay huyền thoại!',
      avatarId: tempAvatarId,
    };
    setProfile(updated);
    try {
      localStorage.setItem('polyplay_user_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setIsEditing(false);
    setShowAvatarPicker(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleCancelEdit = () => {
    playClickSound();
    setTempName(profile.name);
    setTempBio(profile.bio);
    setTempAvatarId(profile.avatarId);
    setIsEditing(false);
    setShowAvatarPicker(false);
  };

  // Format play time
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes} phút ${seconds} giây`;
  };

  // Rank title according to player level
  const getRankInfo = (level: number) => {
    if (level >= 25) return { title: 'Tôn Giả Tối Cao', color: 'text-amber-300', badge: '👑 BẬC THẦY VĨ ĐẠI' };
    if (level >= 15) return { title: 'Đại Pháp Sư Huyền Thoại', color: 'text-purple-400', badge: '🔮 HUYỀN THOẠI' };
    if (level >= 10) return { title: 'Pháp Sư Tinh Anh', color: 'text-blue-400', badge: '⚡ TINH ANH' };
    if (level >= 5) return { title: 'Pháp Sư Cấp Cao', color: 'text-emerald-400', badge: '🌿 CAO THỦ' };
    if (level >= 2) return { title: 'Pháp Đồ Triển Vọng', color: 'text-sky-300', badge: '✨ TRIỂN VỌNG' };
    return { title: 'Tập Sự Ma Pháp', color: 'text-neutral-400', badge: '🌱 KHỞI ĐẦU' };
  };

  const currentRank = getRankInfo(playerLevel);
  const selectedAvatar = AVATAR_OPTIONS.find((a) => a.id === (isEditing ? tempAvatarId : profile.avatarId)) || AVATAR_OPTIONS[0];

  // Total points calculation across all games
  const totalScorePoints = snakeHighScore + fanHighScore + blockHighScore + artilleryWins * 50;

  const isCustomizedProfile =
    profile.name !== 'Pháp Sư PolyPlay' ||
    profile.bio !== 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!' ||
    profile.avatarId !== 'mage';

  // Compute all achievements list
  const achievementsContext: PlayerStatsContext = useMemo(
    () => ({
      playerLevel,
      totalPlaySeconds,
      snakeHighScore,
      fanHighScore,
      blockHighScore,
      artilleryWins,
      artilleryStreak,
      artilleryHighestStreak,
      artilleryBeatGrandmaster,
      artilleryMaxDamage,
      isCustomizedProfile,
    }),
    [
      playerLevel,
      totalPlaySeconds,
      snakeHighScore,
      fanHighScore,
      blockHighScore,
      artilleryWins,
      artilleryStreak,
      artilleryHighestStreak,
      artilleryBeatGrandmaster,
      artilleryMaxDamage,
      isCustomizedProfile,
    ]
  );

  const achievementsList = useMemo(() => getAchievementsList(achievementsContext), [achievementsContext]);

  const unlockedAchievementsCount = useMemo(
    () => achievementsList.filter((a) => a.isUnlocked).length,
    [achievementsList]
  );
  const totalAchievementsCount = achievementsList.length;
  const achievementCompletionPercent = Math.round((unlockedAchievementsCount / totalAchievementsCount) * 100);

  const earnedPoints = useMemo(
    () => achievementsList.filter((a) => a.isUnlocked).reduce((sum, a) => sum + a.points, 0),
    [achievementsList]
  );
  const totalPossiblePoints = useMemo(
    () => achievementsList.reduce((sum, a) => sum + a.points, 0),
    [achievementsList]
  );

  // Filtered achievements for display
  const filteredAchievements = useMemo(() => {
    return achievementsList.filter((ach) => {
      if (categoryFilter !== 'all' && ach.category !== categoryFilter) {
        return false;
      }
      if (statusFilter === 'unlocked' && !ach.isUnlocked) {
        return false;
      }
      if (statusFilter === 'locked' && ach.isUnlocked) {
        return false;
      }
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchTitle = ach.title.toLowerCase().includes(query);
        const matchDesc = ach.desc.toLowerCase().includes(query);
        const matchReward = ach.rewardTitle?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchDesc && !matchReward) {
          return false;
        }
      }
      return true;
    });
  }, [achievementsList, categoryFilter, statusFilter, searchKeyword]);

  // Copy shareable player card
  const handleCopySummary = () => {
    playSealAwakenSound();
    const summary = `🎮 [HỒ SƠ PHÁP SƯ POLYPLAY] 🎮\n👤 Pháp Danh: ${profile.name}\n⭐ Cấp Độ: LV.${playerLevel} (${currentRank.title})\n⏱ Tổng Thời Gian Chơi: ${formatTime(totalPlaySeconds)}\n🏆 Thành Tựu Mở Khóa: ${unlockedAchievementsCount}/${totalAchievementsCount} (${achievementCompletionPercent}%)\n✨ Danh Vọng: ${earnedPoints}/${totalPossiblePoints} AP\n⚔️ Đấu Pháo: ${artilleryWins} Thắng (Kỷ lục sát thương: ${artilleryMaxDamage} HP)\n🐍 Kỷ Lục Rắn: ${snakeHighScore} điểm\n🌪️ Kỷ Lục OnlyaFan: ${fanHighScore} điểm\n💎 Kỷ Lục Xếp Khối: ${blockHighScore} điểm\n🎖️ Tổng Điểm Tích Lũy: ${totalScorePoints} điểm`;
    navigator.clipboard?.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="relative min-h-screen bg-[#07040d] text-neutral-100 font-sans p-3 sm:p-6 lg:p-8 selection:bg-amber-500 selection:text-neutral-950">
      {/* Background mystical cosmic haze */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,#32104a_0%,#150524_50%,#070210_100%)] -z-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10 opacity-30" />

      {/* Floating magic glows */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 blur-[130px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 blur-[150px] pointer-events-none -z-10 rounded-full" />

      {/* Toast notification on save */}
      {showSaveToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-sans text-sm font-bold shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Đã lưu thành công thông tin hồ sơ của bạn!</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={() => {
            playPageTurnSound();
            onBackToHub();
          }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-400 text-xs font-mono font-bold text-amber-200 transition-all shadow-md group cursor-pointer w-fit"
          title="Quay về Sảnh Game Ma Thuật"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
          <span>VỀ SẢNH GAME</span>
        </button>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono transition-colors shadow cursor-pointer"
            title="Sao chép tóm tắt hồ sơ & thành tựu"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
            <span>{copiedSummary ? 'ĐÃ SAO CHÉP!' : 'CHIA SẺ HỒ SƠ'}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onToggleSound();
            }}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN PROFILE CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Page Title & Grimoire Ribbon Card */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#210c04] via-[#140602] to-[#1c0803] border-2 border-amber-600/60 shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Ornate Corner filigree */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left: Avatar & Identity details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
              
              {/* Magic Avatar Circle */}
              <div className="relative shrink-0 group">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr ${selectedAvatar.color} p-1 shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-transform group-hover:scale-105`}
                >
                  <div className="w-full h-full bg-[#120501] rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden border border-amber-300/40">
                    <span className="text-4xl sm:text-5xl select-none animate-pulse">
                      {selectedAvatar.emoji}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-amber-300/80 uppercase tracking-tighter mt-1">
                      {selectedAvatar.name}
                    </span>
                  </div>
                </div>

                {/* Edit avatar button */}
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarPicker((prev) => !prev)}
                    className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[10px] font-mono shadow-lg cursor-pointer flex items-center gap-1 border border-white"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>ĐỔI</span>
                  </button>
                )}
              </div>

              {/* Identity & Status */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {currentRank.badge}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Gia nhập: {profile.joinedDate}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-1 max-w-sm">
                    <div>
                      <label className="text-[10px] font-mono text-amber-300/80 uppercase">Tên Pháp Sư:</label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        maxLength={25}
                        placeholder="Nhập tên của bạn..."
                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-amber-500/50 text-amber-200 font-sans font-bold text-base focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-amber-300/80 uppercase">Khẩu Hiệu / Tiểu Sử:</label>
                      <input
                        type="text"
                        value={tempBio}
                        onChange={(e) => setTempBio(e.target.value)}
                        maxLength={80}
                        placeholder="Nhập châm ngôn hoặc tiểu sử..."
                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-amber-500/50 text-neutral-300 font-sans text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-sans truncate">
                      {profile.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-sans text-neutral-300 italic max-w-md">
                      "{profile.bio}"
                    </p>
                  </>
                )}

                <div className="text-xs font-mono pt-1 text-amber-400 font-semibold flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Danh Hiệu: <strong className={currentRank.color}>{currentRank.title}</strong></span>
                  </div>
                  <span className="text-neutral-600">•</span>
                  <div className="flex items-center gap-1 text-purple-300">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span>Thành Tựu: <strong>{unlockedAchievementsCount}/{totalAchievementsCount}</strong></span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Edit / Save Actions & Level Quick Badge */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono border border-neutral-800 cursor-pointer"
                  >
                    HỦY
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 text-xs font-mono font-black shadow-lg shadow-amber-500/30 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>LƯU HỒ SƠ</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    playClickSound();
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>CHỈNH SỬA HỒ SƠ</span>
                </button>
              )}

              {/* Big Level Emblem */}
              <div className="flex items-center gap-2 bg-neutral-950/80 px-4 py-2 rounded-2xl border border-amber-500/40 shadow-inner">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 font-black text-sm font-mono flex items-center justify-center shadow">
                  LV.{playerLevel}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-neutral-400">CẤP ĐỘ</div>
                  <div className="text-xs font-mono text-amber-400 font-bold">{playerLevel}</div>
                </div>
              </div>
            </div>

          </div>

          {/* AVATAR PICKER DRAWER */}
          {isEditing && showAvatarPicker && (
            <div className="mt-6 pt-5 border-t border-amber-500/30 animate-in fade-in duration-200">
              <div className="text-xs font-mono text-amber-300 font-bold uppercase mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>CHỌN PHÙ HIỆU ĐẠI DIỆN:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => {
                      playClickSound();
                      setTempAvatarId(av.id);
                    }}
                    className={`p-2.5 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      tempAvatarId === av.id
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{av.name}</div>
                      <div className="text-[9px] font-mono text-neutral-400 truncate">{av.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* PROFILE NAVIGATION TABS (TỔNG QUAN vs ĐIỆN THỜ THÀNH TỰU) */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3 p-1.5 bg-neutral-950/80 rounded-2xl border border-neutral-800">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('overview');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>TỔNG QUAN & KỶ LỤC</span>
          </button>

          <button
            onClick={() => {
              playSealAwakenSound();
              setActiveTab('achievements');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>ĐIỆN THỜ THÀNH TỰU</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'achievements'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-purple-900/50 text-purple-300 border border-purple-600/40'
              }`}
            >
              {unlockedAchievementsCount}/{totalAchievementsCount}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & RECORDS (TỔNG QUAN & KỶ LỤC) */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Card 1: Tổng điểm tích lũy */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-amber-500/30 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">TỔNG ĐIỂM TÍCH LŨY</div>
                  <div className="text-2xl font-black text-amber-400 font-sans">{totalScorePoints} ĐIỂM</div>
                  <div className="text-[10px] font-mono text-amber-300/80">Từ 4 trò chơi trong thư viện</div>
                </div>
              </div>

              {/* Card 2: Thời gian đã chơi */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-sky-500/30 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">THỜI GIAN TRẢI NGHIỆM</div>
                  <div className="text-xl sm:text-2xl font-black text-sky-300 font-sans">{formatTime(totalPlaySeconds)}</div>
                  <div className="text-[10px] font-mono text-sky-400/80">Tự động tích lũy từng giây</div>
                </div>
              </div>

              {/* Card 3: Tiến trình thăng cấp */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-emerald-500/30 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>TIẾN TRÌNH LV.{playerLevel + 1}</span>
                    <strong className="text-emerald-400">{levelProgressPercent}%</strong>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full my-1 overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-300"
                      style={{ width: `${levelProgressPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 truncate">
                    Còn <strong className="text-white">{formatTime(secondsToNextLevel)}</strong> để thăng cấp
                  </div>
                </div>
              </div>

            </div>

            {/* ACHIEVEMENTS HIGHLIGHT BANNER TEASER */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#180829] to-indigo-950/60 border border-purple-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/40 shrink-0 text-2xl">
                  🏆
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">Điện Thờ Thành Tựu Ma Pháp</h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30">
                      {totalAchievementsCount} Thành Tựu
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    Bạn đã mở khóa <strong className="text-amber-400">{unlockedAchievementsCount}</strong> thành tựu ({achievementCompletionPercent}%) và thu thập <strong className="text-purple-300">{earnedPoints} AP</strong> điểm danh vọng.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playSealAwakenSound();
                  setActiveTab('achievements');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0"
              >
                <span>XEM TRANG THÀNH TỰU</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* ALL 4 GAMES PERFORMANCE DATA CARDS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-amber-300 font-sans uppercase tracking-wide flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>DỮ LIỆU ĐIỂM SỐ 4 TRÒ CHƠI MA THUẬT</span>
                </h3>
                <span className="text-xs font-mono text-neutral-400">Tự động đồng bộ và lưu trữ</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* GAME 1: ARTILLERY DUEL (ĐẤU PHÁO MA PHÁP) */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#240a33] to-[#0e0417] border border-purple-500/50 shadow-xl overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 text-3xl opacity-15 select-none">⚔️</div>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 p-0.5 shadow-lg shrink-0">
                      <div className="w-full h-full bg-[#160424] rounded-[14px] flex items-center justify-center">
                        <span className="text-2xl">⚔️</span>
                      </div>
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-purple-300">TRÒ CHƠI MỚI NHẤT</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                          HOT • ĐỐI KHÁNG AI
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white font-sans truncate">
                        Đấu Pháo Ma Pháp (Artillery Duel)
                      </h4>
                      <p className="text-xs font-mono text-neutral-400">
                        Căn góc, đo lực, khắc chế gió 2D & địa hình dốc lượn sóng
                      </p>
                    </div>
                  </div>

                  {/* Score Highlight Box */}
                  <div className="mt-4 p-3.5 rounded-xl bg-neutral-950/90 border border-purple-900/60 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">SỐ TRẬN THẮNG</span>
                      <div className="text-xl font-black text-amber-400 font-sans">{artilleryWins} <span className="text-xs font-normal text-neutral-500">TRẬN</span></div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">CHUỖI THẮNG</span>
                      <div className="text-xl font-black text-emerald-400 font-sans">{artilleryHighestStreak} <span className="text-xs font-normal text-neutral-500">TRẬN</span></div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">SÁT THƯƠNG MAX</span>
                      <div className="text-xl font-black text-rose-400 font-sans">{artilleryMaxDamage} <span className="text-xs font-normal text-neutral-500">HP</span></div>
                    </div>
                  </div>
                </div>

                {/* GAME 2: OnlyaFan */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#1c120c] to-[#0d0704] border border-amber-500/40 shadow-xl overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 text-3xl opacity-15 select-none">🌪️</div>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shrink-0">
                      <div className="w-full h-full bg-[#170802] rounded-[14px] flex items-center justify-center">
                        <span className="text-2xl">🌪️</span>
                      </div>
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400">TRÒ CHƠI SỐ 02</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          ĐANG HOẠT ĐỘNG
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white font-sans truncate">
                        OnlyaFan (Quạt Mát Mùa Hè)
                      </h4>
                      <p className="text-xs font-mono text-neutral-400">
                        Bấm quạt cật lực, nhặt vật phẩm gió & sét thần tốc
                      </p>
                    </div>
                  </div>

                  {/* Score Highlight Box */}
                  <div className="mt-4 p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">ĐIỂM KỶ LỤC CAO NHẤT</span>
                      <div className="text-2xl font-black text-amber-400 font-sans">
                        {fanHighScore} <span className="text-xs font-mono font-normal text-neutral-400">ĐIỂM</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">HẠNG MỤC</span>
                      <div className="text-xs font-mono font-bold text-sky-400">
                        {fanHighScore >= 200 ? '⚡ Siêu Cấp Cuồng Phong' : fanHighScore >= 80 ? '🌪️ Bão Táp' : '💨 Gió Nhẹ'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* GAME 3: Snake Game */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#0c180f] to-[#040d06] border border-emerald-500/40 shadow-xl overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 text-3xl opacity-15 select-none">🐍</div>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-500 p-0.5 shadow-lg shrink-0">
                      <div className="w-full h-full bg-[#051408] rounded-[14px] flex items-center justify-center">
                        <span className="text-2xl">🐍</span>
                      </div>
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400">TRÒ CHƠI SỐ 03</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          ĐANG HOẠT ĐỘNG
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white font-sans truncate">
                        Rắn Săn Mồi Ma Thuật
                      </h4>
                      <p className="text-xs font-mono text-neutral-400">
                        Né bom, tránh đá, vượt ải phong tỏa tường & chớp tối
                      </p>
                    </div>
                  </div>

                  {/* Score Highlight Box */}
                  <div className="mt-4 p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">ĐIỂM KỶ LỤC CAO NHẤT</span>
                      <div className="text-2xl font-black text-emerald-400 font-sans">
                        {snakeHighScore} <span className="text-xs font-mono font-normal text-neutral-400">ĐIỂM</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">HẠNG MỤC</span>
                      <div className="text-xs font-mono font-bold text-lime-400">
                        {snakeHighScore >= 150 ? '🐉 Long Xà Thượng Thừa' : snakeHighScore >= 60 ? '🐍 Mãng Xà Tinh Anh' : '🌿 Rắn Con Mới Nở'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* GAME 4: Block Puzzle Game */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#1b0a2a] to-[#0d0415] border border-purple-500/40 shadow-xl overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 text-3xl opacity-15 select-none">💎</div>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-lg shrink-0">
                      <div className="w-full h-full bg-[#11051c] rounded-[14px] flex items-center justify-center">
                        <span className="text-2xl">💎</span>
                      </div>
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-purple-400">TRÒ CHƠI SỐ 04</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                          ĐANG HOẠT ĐỘNG
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white font-sans truncate">
                        Xếp Khối Ma Thuật (Block Puzzle)
                      </h4>
                      <p className="text-xs font-mono text-neutral-400">
                        Xếp khối ngọc trên bàn 8x8, kích nổ hàng và cột tan biến & tạo siêu combo
                      </p>
                    </div>
                  </div>

                  {/* Score Highlight Box */}
                  <div className="mt-4 p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">ĐIỂM KỶ LỤC CAO NHẤT</span>
                      <div className="text-2xl font-black text-purple-400 font-sans">
                        {blockHighScore} <span className="text-xs font-mono font-normal text-neutral-400">ĐIỂM</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">HẠNG MỤC</span>
                      <div className="text-xs font-mono font-bold text-pink-400">
                        {blockHighScore >= 300 ? '👑 Huyền Thoại Phá Khối' : blockHighScore >= 100 ? '⚡ Đại Sư Xếp Khối' : '🌱 Tập Sự Phá Khối'}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ACHIEVEMENTS HALL (TRANG THÀNH TỰU ĐẦY ĐỦ) */}
        {/* ========================================================================= */}
        {activeTab === 'achievements' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* ACHIEVEMENTS HERO SUMMARY BANNER */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#1d0a33] via-[#120625] to-[#250d44] border-2 border-purple-500/50 shadow-[0_15px_40px_rgba(0,0,0,0.7)] overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-7xl opacity-10 select-none pointer-events-none">
                🏆
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Left: Overall Completion */}
                <div className="md:col-span-2 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>HỆ THỐNG THÀNH TỰU TOÀN DIỆN</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                    BẢO TÀNG DANH VỌNG MA THUẬT
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
                    Chinh phục các thử thách cam go trên khắp 4 thế giới trò chơi để thu thập Huy Hiệu Danh Vọng và mở khóa danh xưng tôn quý nhất.
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1 max-w-lg">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-300">Tiến trình mở khóa thành tựu:</span>
                      <strong className="text-amber-400 font-bold">{unlockedAchievementsCount} / {totalAchievementsCount} ({achievementCompletionPercent}%)</strong>
                    </div>
                    <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-purple-900/60 p-0.5 shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                        style={{ width: `${achievementCompletionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Achievement Points (AP) Big Card */}
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-amber-500/40 text-center space-y-2 shadow-lg">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">ĐIỂM DANH VỌNG (AP)</div>
                  <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-sans">
                    {earnedPoints} <span className="text-xs text-neutral-400 font-mono font-normal">/ {totalPossiblePoints} AP</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã mở {unlockedAchievementsCount} mục tiêu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTERS CONTROLS */}
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                  const isSelected = categoryFilter === key;
                  const count =
                    key === 'all'
                      ? achievementsList.length
                      : achievementsList.filter((a) => a.category === key).length;

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        playClickSound();
                        setCategoryFilter(key);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-900/90 text-neutral-300 hover:text-white border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span>{info.icon}</span>
                      <span>{info.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status Filter & Search Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start">
                  <button
                    onClick={() => {
                      playClickSound();
                      setStatusFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Tất cả ({achievementsList.length})
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      setStatusFilter('unlocked');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'unlocked'
                        ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'text-neutral-400 hover:text-emerald-300'
                    }`}
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Đã mở ({unlockedAchievementsCount})</span>
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      setStatusFilter('locked');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'locked'
                        ? 'bg-rose-950 text-rose-300 font-bold border border-rose-500/30'
                        : 'text-neutral-400 hover:text-rose-300'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Chưa mở ({totalAchievementsCount - unlockedAchievementsCount})</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm tên hoặc mô tả thành tựu..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {searchKeyword && (
                    <button
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ACHIEVEMENTS GRID */}
            {filteredAchievements.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <span className="text-4xl">🔍</span>
                <h4 className="text-base font-bold text-neutral-300">Không tìm thấy thành tựu phù hợp</h4>
                <p className="text-xs text-neutral-500">Hãy thử đổi danh mục hoặc bỏ bộ lọc tìm kiếm</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((ach) => {
                  const tier = TIER_CONFIG[ach.tier];
                  const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

                  return (
                    <div
                      key={ach.id}
                      className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                        ach.isUnlocked
                          ? `${tier.bg} ${tier.border} ${tier.glow} hover:scale-[1.01]`
                          : 'bg-neutral-950/60 border-neutral-800/80 opacity-75 hover:opacity-95'
                      }`}
                    >
                      {/* Top Header: Icon + Title + Tier Badge */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                                ach.isUnlocked
                                  ? 'bg-neutral-900 border-amber-400/50 shadow-md'
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-500 grayscale'
                              }`}
                            >
                              <span>{ach.icon}</span>
                            </div>

                            <div className="min-w-0">
                              <h4
                                className={`text-sm font-bold truncate leading-tight ${
                                  ach.isUnlocked ? 'text-white' : 'text-neutral-300'
                                }`}
                              >
                                {ach.title}
                              </h4>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {CATEGORY_INFO[ach.category]?.label || 'Ma Pháp'}
                              </span>
                            </div>
                          </div>

                          {/* Tier Badge */}
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase ${tier.badgeBg}`}
                          >
                            {tier.label}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-neutral-300 leading-snug mb-3">
                          {ach.desc}
                        </p>
                      </div>

                      {/* Bottom Details: Reward Title, AP Points & Progress Bar */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          {ach.rewardTitle ? (
                            <span className="text-amber-300 font-bold truncate max-w-[170px]" title={ach.rewardTitle}>
                              👑 "{ach.rewardTitle}"
                            </span>
                          ) : (
                            <span className="text-neutral-500">Mục tiêu danh vọng</span>
                          )}

                          <span className="text-amber-400 font-bold shrink-0">
                            +{ach.points} AP
                          </span>
                        </div>

                        {/* Progress or Unlocked Banner */}
                        {ach.isUnlocked ? (
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between text-[10px] font-mono text-emerald-300 font-bold">
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>ĐÃ HOÀN THÀNH</span>
                            </span>
                            <span>{ach.maxProgress > 1 ? `${ach.maxProgress}/${ach.maxProgress}` : '100%'}</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                              <span className="flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5 text-neutral-500" />
                                <span>Tiến độ:</span>
                              </span>
                              <span>
                                {ach.progress} / {ach.maxProgress} ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                              <div
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
