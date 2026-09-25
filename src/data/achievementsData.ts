export interface Achievement {
  id: string;
  title: string;
  desc: string;
  category:
    | 'level'
    | 'typingshark'
    | 'gacha'
    | 'battleship'
    | 'profile'
    | 'artillery'
    | 'snake'
    | 'fan'
    | 'block'
    | 'master';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic';
  icon: string;
  points: number;
  rewardTitle?: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}

export interface PlayerStatsContext {
  playerLevel: number;
  totalPlaySeconds: number;
  snakeHighScore: number;
  fanHighScore: number;
  blockHighScore: number;
  artilleryWins: number;
  artilleryStreak: number;
  artilleryHighestStreak: number;
  artilleryBeatGrandmaster: boolean;
  artilleryMaxDamage: number;
  isCustomizedProfile: boolean;
  hasCustomAvatar?: boolean;
  // Typing Shark stats
  typingSharkKills?: number;
  typingSharkBosses?: number;
  typingSharkMaxWpm?: number;
  typingSharkMaxMinutes?: number;
  typingSharkGold?: number;
  typingSharkVictories?: number;
  typingSharkSkinsCount?: number;
  // Gacha stats
  gachaPulls?: number;
  gachaUrCount?: number;
  gachaItemsCount?: number;
  gachaBoonsCount?: number;
  // Battleship stats
  battleshipWins?: number;
}

export const TIER_CONFIG = {
  bronze: {
    label: 'Đồng',
    color: 'text-amber-600',
    border: 'border-amber-700/50',
    bg: 'bg-amber-950/20',
    badgeBg: 'bg-amber-900/40 text-amber-400 border-amber-600/40',
    glow: 'shadow-[0_0_15px_rgba(217,119,6,0.2)]',
  },
  silver: {
    label: 'Bạc',
    color: 'text-slate-300',
    border: 'border-slate-500/50',
    bg: 'bg-slate-900/40',
    badgeBg: 'bg-slate-800 text-slate-200 border-slate-500/40',
    glow: 'shadow-[0_0_15px_rgba(148,163,184,0.25)]',
  },
  gold: {
    label: 'Vàng',
    color: 'text-amber-300',
    border: 'border-amber-400/60',
    bg: 'bg-amber-950/30',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.35)]',
  },
  diamond: {
    label: 'Kim Cương',
    color: 'text-cyan-300',
    border: 'border-cyan-400/60',
    bg: 'bg-cyan-950/30',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
    glow: 'shadow-[0_0_25px_rgba(34,211,238,0.4)]',
  },
  mythic: {
    label: 'Huyền Thoại',
    color: 'text-purple-300',
    border: 'border-purple-400/80',
    bg: 'bg-purple-950/40',
    badgeBg: 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border-purple-400/60',
    glow: 'shadow-[0_0_30px_rgba(192,132,252,0.5)]',
  },
};

export const CATEGORY_INFO: Record<string, { label: string; icon: string }> = {
  all: { label: 'Tất Cả', icon: '🌟' },
  typingshark: { label: 'Typing Shark', icon: '🦈' },
  gacha: { label: 'Gacha Kỳ Trân', icon: '📜' },
  battleship: { label: 'Hải Chiến', icon: '🚢' },
  level: { label: 'Cấp & Thời Gian', icon: '🧙‍♂️' },
  profile: { label: 'Hồ Sơ & Danh Dự', icon: '👤' },
  artillery: { label: 'Đấu Pháo Ma Pháp', icon: '⚔️' },
  snake: { label: 'Rắn Săn Mồi', icon: '🐍' },
  fan: { label: 'OnlyaFan', icon: '🌪️' },
  block: { label: 'Xếp Khối', icon: '💎' },
  master: { label: 'Bách Khoa', icon: '👑' },
};

export function getAchievementsList(stats: PlayerStatsContext): Achievement[] {
  const totalScore = stats.snakeHighScore + stats.fanHighScore + stats.blockHighScore;
  const highestStreak = Math.max(stats.artilleryStreak, stats.artilleryHighestStreak);
  const gamesPlayedCount =
    (stats.snakeHighScore > 0 ? 1 : 0) +
    (stats.fanHighScore > 0 ? 1 : 0) +
    (stats.blockHighScore > 0 ? 1 : 0) +
    (stats.artilleryWins > 0 || stats.artilleryMaxDamage > 0 ? 1 : 0) +
    ((stats.typingSharkKills || 0) > 0 ? 1 : 0) +
    ((stats.gachaPulls || 0) > 0 ? 1 : 0);

  const sharkKills = stats.typingSharkKills || 0;
  const sharkBosses = stats.typingSharkBosses || 0;
  const sharkWpm = stats.typingSharkMaxWpm || 0;
  const sharkMinutes = stats.typingSharkMaxMinutes || 0;
  const sharkGold = stats.typingSharkGold || 0;
  const sharkVictories = stats.typingSharkVictories || 0;
  const sharkSkins = stats.typingSharkSkinsCount || 1;

  const gachaPulls = stats.gachaPulls || 0;
  const gachaUr = stats.gachaUrCount || 0;
  const gachaItems = stats.gachaItemsCount || 0;
  const gachaBoons = stats.gachaBoonsCount || 0;

  const rawAchievements: Achievement[] = [
    // ==========================================
    // NHÓM 1: TYPING SHARK - VỰC SÂU THẦN HẢI (MỚI & PHONG PHÚ)
    // ==========================================
    {
      id: 'shark_hunter_init',
      title: 'Ngư Dân Biển Sâu',
      desc: 'Bắn hạ 10 quái vật biển đầu tiên trong Typing Shark',
      category: 'typingshark',
      tier: 'bronze',
      icon: '🐟',
      points: 15,
      rewardTitle: 'Ngư Dân Sơ Khởi',
      progress: Math.min(sharkKills, 10),
      maxProgress: 10,
      isUnlocked: sharkKills >= 10,
    },
    {
      id: 'shark_slayer_100',
      title: 'Kẻ Săn Cá Mập Tinh Nhuệ',
      desc: 'Tiêu diệt 100 quái vật và cá mập hung tợn dưới đáy biển',
      category: 'typingshark',
      tier: 'silver',
      icon: '🦈',
      points: 60,
      rewardTitle: 'Thợ Săn Thủy Quái',
      progress: Math.min(sharkKills, 100),
      maxProgress: 100,
      isUnlocked: sharkKills >= 100,
    },
    {
      id: 'shark_exterminator_500',
      title: 'Hủy Diệt Vực Thẳm',
      desc: 'Xác lập chiến tích tiêu diệt 500 quái vật biển sâu',
      category: 'typingshark',
      tier: 'gold',
      icon: '⚡',
      points: 180,
      rewardTitle: 'Thần Diệt Hải Quái',
      progress: Math.min(sharkKills, 500),
      maxProgress: 500,
      isUnlocked: sharkKills >= 500,
    },
    {
      id: 'shark_boss_megalodon',
      title: 'Đả Bại Megalodon Thượng Cổ',
      desc: 'Sống sót qua 5 phút và hạ gục Megalodon Hàm Răng Thép',
      category: 'typingshark',
      tier: 'bronze',
      icon: '🗡️',
      points: 40,
      rewardTitle: 'Sát Thủ Megalodon',
      progress: sharkMinutes >= 5 || sharkBosses >= 1 ? 1 : 0,
      maxProgress: 1,
      isUnlocked: sharkMinutes >= 5 || sharkBosses >= 1,
    },
    {
      id: 'shark_boss_kraken',
      title: 'Chém Đứt Mực Ma Kraken',
      desc: 'Vượt qua 10 phút và đánh bại Ma Thần Xúc Tu Kraken Vực Thẳm',
      category: 'typingshark',
      tier: 'silver',
      icon: '🐙',
      points: 80,
      rewardTitle: 'Thần Xuyên Mực Đen',
      progress: sharkMinutes >= 10 || sharkBosses >= 2 ? 1 : 0,
      maxProgress: 1,
      isUnlocked: sharkMinutes >= 10 || sharkBosses >= 2,
    },
    {
      id: 'shark_boss_dragon',
      title: 'Đồ Băng Long Cổ Đại',
      desc: 'Bẻ gãy bão tuyết và hạ gục Rồng Biển Băng Cổ Đới ở phút 15',
      category: 'typingshark',
      tier: 'gold',
      icon: '🐉',
      points: 150,
      rewardTitle: 'Dũng Sĩ Băng Long',
      progress: sharkMinutes >= 15 || sharkBosses >= 3 ? 1 : 0,
      maxProgress: 1,
      isUnlocked: sharkMinutes >= 15 || sharkBosses >= 3,
    },
    {
      id: 'shark_boss_behemoth',
      title: 'Công Phá Poseidon Mech',
      desc: 'Đập tan giáp titan của Cự Thần Cơ Giới Biển Sâu ở phút 20',
      category: 'typingshark',
      tier: 'diamond',
      icon: '🤖',
      points: 300,
      rewardTitle: 'Đại Phá Cơ Thần',
      progress: sharkMinutes >= 20 || sharkBosses >= 4 ? 1 : 0,
      maxProgress: 1,
      isUnlocked: sharkMinutes >= 20 || sharkBosses >= 4,
    },
    {
      id: 'shark_boss_leviathan',
      title: 'Bá Chủ Thống Trị Hư Không 25 Phút',
      desc: 'Công phá hoàn toàn Chúa Tể Leviathan Prime ở phút 25 - Chiến Thắng Tuyệt Đối!',
      category: 'typingshark',
      tier: 'mythic',
      icon: '👑',
      points: 600,
      rewardTitle: 'Vua Đáy Biển Vực Thẳm',
      progress: sharkVictories >= 1 || sharkMinutes >= 25 ? 1 : 0,
      maxProgress: 1,
      isUnlocked: sharkVictories >= 1 || sharkMinutes >= 25,
    },
    {
      id: 'shark_wpm_50',
      title: 'Đôi Bàn Tay Nhanh Nhẹn',
      desc: 'Đạt tốc độ gõ phím trên 50 WPM trong chiến trường Typing Shark',
      category: 'typingshark',
      tier: 'bronze',
      icon: '⌨️',
      points: 30,
      rewardTitle: 'Ngón Tay Lướt Phím',
      progress: Math.min(sharkWpm, 50),
      maxProgress: 50,
      isUnlocked: sharkWpm >= 50,
    },
    {
      id: 'shark_wpm_80',
      title: 'Bão Điện Siêu Thanh',
      desc: 'Đạt tốc độ gõ phím trên 80 WPM uy lực thần tốc',
      category: 'typingshark',
      tier: 'silver',
      icon: '⚡',
      points: 90,
      rewardTitle: 'Tốc Độ Siêu Thanh',
      progress: Math.min(sharkWpm, 80),
      maxProgress: 80,
      isUnlocked: sharkWpm >= 80,
    },
    {
      id: 'shark_wpm_120',
      title: 'Hư Không Thần Tốc (120+ WPM)',
      desc: 'Vượt cảnh giới gõ phím với tốc độ siêu phàm 120 WPM!',
      category: 'typingshark',
      tier: 'mythic',
      icon: '🌠',
      points: 500,
      rewardTitle: 'Thần Tốc Bàn Phím Vũ Trụ',
      progress: Math.min(sharkWpm, 120),
      maxProgress: 120,
      isUnlocked: sharkWpm >= 120,
    },
    {
      id: 'shark_gold_10000',
      title: 'Đại Gia Vực Thẳm',
      desc: 'Tích lũy tổng cộng 10,000 vàng từ việc cày diệt quái biển sâu',
      category: 'typingshark',
      tier: 'silver',
      icon: '🪙',
      points: 75,
      rewardTitle: 'Nhà Tài Phiệt Đáy Biển',
      progress: Math.min(sharkGold, 10000),
      maxProgress: 10000,
      isUnlocked: sharkGold >= 10000,
    },
    {
      id: 'shark_gold_100000',
      title: 'Kho Tàng Biển Cả (100k Vàng)',
      desc: 'Thu thập hơn 100,000 vàng để tiến hóa cây kỹ năng tối thượng',
      category: 'typingshark',
      tier: 'diamond',
      icon: '💰',
      points: 350,
      rewardTitle: 'Chúa Tể Kho Báu Hải Dương',
      progress: Math.min(sharkGold, 100000),
      maxProgress: 100000,
      isUnlocked: sharkGold >= 100000,
    },
    {
      id: 'shark_skins_collector',
      title: 'Bộ Sưu Tập Chiến Hạm Hư Không',
      desc: 'Mở khóa từ 4 Skin Thuyền Ngầm trở lên bằng cách diệt các đại Boss',
      category: 'typingshark',
      tier: 'gold',
      icon: '🚢',
      points: 200,
      rewardTitle: 'Đô Đốc Hạm Đội Thần Bí',
      progress: Math.min(sharkSkins, 4),
      maxProgress: 4,
      isUnlocked: sharkSkins >= 4,
    },

    // ==========================================
    // NHÓM 2: VẠN CỔ KỲ TRÂN (GACHA & BÍ CHỈ)
    // ==========================================
    {
      id: 'gacha_first_summon',
      title: 'Chạm Vào Vận Mệnh',
      desc: 'Thực hiện lần triệu hồi bảo vật đầu tiên trong Vạn Cổ Kỳ Trân',
      category: 'gacha',
      tier: 'bronze',
      icon: '🔮',
      points: 20,
      rewardTitle: 'Khai Môn Vận Mệnh',
      progress: Math.min(gachaPulls, 1),
      maxProgress: 1,
      isUnlocked: gachaPulls >= 1,
    },
    {
      id: 'gacha_pulls_30',
      title: 'Đại Trận Cầu Cơ',
      desc: 'Thực hiện tích lũy 30 lần rút thẻ tầm bảo',
      category: 'gacha',
      tier: 'silver',
      icon: '📜',
      points: 60,
      rewardTitle: 'Đạo Nhân Khát Vọng',
      progress: Math.min(gachaPulls, 30),
      maxProgress: 30,
      isUnlocked: gachaPulls >= 30,
    },
    {
      id: 'gacha_pulls_100',
      title: 'Vạn Bảo Quy Tông',
      desc: 'Thực hiện 100 lần triệu hồi, khuấy đảo bảo khố cổ đại',
      category: 'gacha',
      tier: 'gold',
      icon: '✨',
      points: 180,
      rewardTitle: 'Kẻ Đoạt Hồn Thần Binh',
      progress: Math.min(gachaPulls, 100),
      maxProgress: 100,
      isUnlocked: gachaPulls >= 100,
    },
    {
      id: 'gacha_ur_artifact',
      title: 'Thiên Địa Dị Tượng (Thần Vật UR)',
      desc: 'Khai mở thành công ít nhất 1 Thần Vật phẩm cấp UR Hoàng Kim',
      category: 'gacha',
      tier: 'diamond',
      icon: '🌟',
      points: 300,
      rewardTitle: 'Thần Khí Thủ Hộ',
      progress: Math.min(gachaUr, 1),
      maxProgress: 1,
      isUnlocked: gachaUr >= 1,
    },
    {
      id: 'gacha_parchment_master',
      title: 'Bậc Thầy Cuộn Bí Chỉ',
      desc: 'Kích hoạt từ 3 Bí Chỉ Cổ Đại để hưởng phúc lợi vĩnh viễn',
      category: 'gacha',
      tier: 'gold',
      icon: '📜',
      points: 150,
      rewardTitle: 'Hiền Giả Bí Truyền',
      progress: Math.min(gachaBoons, 3),
      maxProgress: 3,
      isUnlocked: gachaBoons >= 3,
    },
    {
      id: 'gacha_codex_full',
      title: 'Bách Khoa Cổ Vật Toàn Thư',
      desc: 'Khám phá và thu thập trên 15 chủng loại bảo vật khác nhau trong Bách Khoa Toàn Thư',
      category: 'gacha',
      tier: 'diamond',
      icon: '📖',
      points: 350,
      rewardTitle: 'Giám Định Sư Tối Thượng',
      progress: Math.min(gachaItems, 15),
      maxProgress: 15,
      isUnlocked: gachaItems >= 15,
    },

    // ==========================================
    // NHÓM 3: HỒ SƠ & DANH DỰ (PROFILE & AVATAR)
    // ==========================================
    {
      id: 'profile_new_look',
      title: 'Diện Mạo Độc Bản (Ảnh Avatar)',
      desc: 'Thay đổi hoặc tải lên ảnh đại diện Avatar mới cho Hồ Sơ Pháp Sư',
      category: 'profile',
      tier: 'bronze',
      icon: '🖼️',
      points: 25,
      rewardTitle: 'Người Tạo Phong Cách',
      progress: stats.hasCustomAvatar || stats.isCustomizedProfile ? 1 : 0,
      maxProgress: 1,
      isUnlocked: Boolean(stats.hasCustomAvatar || stats.isCustomizedProfile),
    },
    {
      id: 'profile_bio_writer',
      title: 'Tiểu Sử Anh Hùng',
      desc: 'Soạn thảo phương châm chiến đấu và tiểu sử độc bản của riêng bạn',
      category: 'profile',
      tier: 'bronze',
      icon: '✍️',
      points: 25,
      progress: stats.isCustomizedProfile ? 1 : 0,
      maxProgress: 1,
      isUnlocked: stats.isCustomizedProfile,
    },
    {
      id: 'profile_shield_guardian',
      title: 'Lá Chắn Mật Mã Vững Chắc',
      desc: 'Đăng ký tài khoản và thiết lập câu hỏi bảo mật bảo vệ hồ sơ',
      category: 'profile',
      tier: 'silver',
      icon: '🛡️',
      points: 50,
      rewardTitle: 'Hộ Pháp Uy Tín',
      progress: stats.hasCustomAvatar ? 1 : 1, // Available to all who customize
      maxProgress: 1,
      isUnlocked: true,
    },
    {
      id: 'profile_legend_reputation',
      title: 'Danh Danh Bốn Bể (Huy Hoàng)',
      desc: 'Đạt cấp độ LV.15 và sở hữu danh hiệu Pháp Sư Tinh Anh',
      category: 'profile',
      tier: 'gold',
      icon: '🎖️',
      points: 120,
      rewardTitle: 'Đại Danh Hào',
      progress: Math.min(stats.playerLevel, 15),
      maxProgress: 15,
      isUnlocked: stats.playerLevel >= 15,
    },

    // ==========================================
    // NHÓM 4: ĐẲNG CẤP & THỜI GIAN (LEVEL & TIME)
    // ==========================================
    {
      id: 'lvl_origin',
      title: 'Khởi Nguyên Ma Pháp',
      desc: 'Đặt chân vào thế giới PolyPlay và thức tỉnh ma lực',
      category: 'level',
      tier: 'bronze',
      icon: '🌱',
      points: 10,
      rewardTitle: 'Tân Binh Pháp Thuật',
      progress: Math.min(stats.playerLevel, 1),
      maxProgress: 1,
      isUnlocked: true,
    },
    {
      id: 'lvl_adept_5',
      title: 'Pháp Đồ Rèn Giũa',
      desc: 'Tích lũy kinh nghiệm chiến đấu và đạt cấp độ LV.5',
      category: 'level',
      tier: 'bronze',
      icon: '✨',
      points: 25,
      rewardTitle: 'Pháp Đồ Cần Mẫn',
      progress: Math.min(stats.playerLevel, 5),
      maxProgress: 5,
      isUnlocked: stats.playerLevel >= 5,
    },
    {
      id: 'lvl_sorcerer_10',
      title: 'Pháp Sư Tinh Nhuệ',
      desc: 'Vượt qua nhiều trận chiến để chạm mốc cấp độ LV.10',
      category: 'level',
      tier: 'silver',
      icon: '🌿',
      points: 50,
      rewardTitle: 'Pháp Sư Cấp Cao',
      progress: Math.min(stats.playerLevel, 10),
      maxProgress: 10,
      isUnlocked: stats.playerLevel >= 10,
    },
    {
      id: 'lvl_archmage_20',
      title: 'Đại Pháp Sư Trận Địa',
      desc: 'Khẳng định tài năng xuất chúng khi vươn tới cấp độ LV.20',
      category: 'level',
      tier: 'silver',
      icon: '⚡',
      points: 100,
      rewardTitle: 'Đại Pháp Sư Trận Địa',
      progress: Math.min(stats.playerLevel, 20),
      maxProgress: 20,
      isUnlocked: stats.playerLevel >= 20,
    },
    {
      id: 'lvl_grand_35',
      title: 'Bậc Thầy Nguyên Tố',
      desc: 'Uy lực chấn động các cõi giới với cấp độ LV.35',
      category: 'level',
      tier: 'gold',
      icon: '🔮',
      points: 200,
      rewardTitle: 'Bậc Thầy Nguyên Tố',
      progress: Math.min(stats.playerLevel, 35),
      maxProgress: 35,
      isUnlocked: stats.playerLevel >= 35,
    },
    {
      id: 'lvl_mythic_50',
      title: 'Tôn Giả Bất Diệt',
      desc: 'Chạm tới ngưỡng sức mạnh thần thánh tối thượng tại cấp độ LV.50',
      category: 'level',
      tier: 'diamond',
      icon: '👑',
      points: 400,
      rewardTitle: 'Tôn Giả Bất Diệt',
      progress: Math.min(stats.playerLevel, 50),
      maxProgress: 50,
      isUnlocked: stats.playerLevel >= 50,
    },
    {
      id: 'time_warmup_300',
      title: 'Tập Luyện Kiên Trì',
      desc: 'Dành tối thiểu 5 phút (300 giây) khám phá thế giới trò chơi',
      category: 'level',
      tier: 'bronze',
      icon: '⏳',
      points: 20,
      progress: Math.min(stats.totalPlaySeconds, 300),
      maxProgress: 300,
      isUnlocked: stats.totalPlaySeconds >= 300,
    },
    {
      id: 'time_marathon_3600',
      title: 'Kẻ Canh Giữ Thời Gian',
      desc: 'Cống hiến tròn 1 giờ đồng hồ (3600 giây) chinh phục thư viện trò chơi',
      category: 'level',
      tier: 'gold',
      icon: '🪐',
      points: 150,
      rewardTitle: 'Du Khách Thời Không',
      progress: Math.min(stats.totalPlaySeconds, 3600),
      maxProgress: 3600,
      isUnlocked: stats.totalPlaySeconds >= 3600,
    },

    // ==========================================
    // NHÓM 5: ĐẤU PHÁO MA PHÁP (ARTILLERY DUEL)
    // ==========================================
    {
      id: 'artillery_first_blood',
      title: 'Hỏa Lực Đầu Tiên',
      desc: 'Giành chiến thắng 1 trận trong Đấu Pháo Ma Pháp',
      category: 'artillery',
      tier: 'bronze',
      icon: '💥',
      points: 20,
      progress: Math.min(stats.artilleryWins, 1),
      maxProgress: 1,
      isUnlocked: stats.artilleryWins >= 1,
    },
    {
      id: 'artillery_sniper_5',
      title: 'Pháo Thủ Thiện Xạ',
      desc: 'Thắng liên tiếp 3 trận không để đối thủ lật ngược',
      category: 'artillery',
      tier: 'silver',
      icon: '🎯',
      points: 70,
      progress: Math.min(highestStreak, 3),
      maxProgress: 3,
      isUnlocked: highestStreak >= 3,
    },
    {
      id: 'artillery_grandmaster',
      title: 'Đánh Bại AI Đại Kiện Tướng',
      desc: 'Hạ gục pháo thủ AI Grandmaster trong chế độ khó nhất',
      category: 'artillery',
      tier: 'diamond',
      icon: '🏆',
      points: 250,
      rewardTitle: 'Thần Pháo Bất Khả Chiến Bại',
      progress: stats.artilleryBeatGrandmaster ? 1 : 0,
      maxProgress: 1,
      isUnlocked: stats.artilleryBeatGrandmaster,
    },

    // ==========================================
    // NHÓM 6: RẮN SĂN MỒI MA THUẬT (SNAKE)
    // ==========================================
    {
      id: 'snake_apprentice_100',
      title: 'Thợ Săn Mồi Sơ Cấp',
      desc: 'Ăn táo ma thuật và cán mốc 100 điểm',
      category: 'snake',
      tier: 'bronze',
      icon: '🍎',
      points: 25,
      progress: Math.min(stats.snakeHighScore, 100),
      maxProgress: 100,
      isUnlocked: stats.snakeHighScore >= 100,
    },
    {
      id: 'snake_expert_300',
      title: 'Xà Thần Lục Bảo',
      desc: 'Kéo dài thân rắn vượt qua 300 điểm ngoạn mục',
      category: 'snake',
      tier: 'silver',
      icon: '🐍',
      points: 80,
      progress: Math.min(stats.snakeHighScore, 300),
      maxProgress: 300,
      isUnlocked: stats.snakeHighScore >= 300,
    },
    {
      id: 'snake_legend_600',
      title: 'Mãng Xà Thần Thoại (600 Điểm)',
      desc: 'Luyện rắn đạt 600 điểm, thân hình uốn lượn phủ kín bàn cờ',
      category: 'snake',
      tier: 'gold',
      icon: '👑',
      points: 200,
      rewardTitle: 'Chúa Tể Mãng Xà',
      progress: Math.min(stats.snakeHighScore, 600),
      maxProgress: 600,
      isUnlocked: stats.snakeHighScore >= 600,
    },

    // ==========================================
    // NHÓM 7: QUẠT GIÓ ONLYAFAN
    // ==========================================
    {
      id: 'fan_breeze_50',
      title: 'Làn Gió Đầu Tiên',
      desc: 'Điều khiển quạt giữ giấy bay lơ lửng đạt 50 điểm',
      category: 'fan',
      tier: 'bronze',
      icon: '💨',
      points: 25,
      progress: Math.min(stats.fanHighScore, 50),
      maxProgress: 50,
      isUnlocked: stats.fanHighScore >= 50,
    },
    {
      id: 'fan_storm_200',
      title: 'Cơn Lốc Cuồng Nộ',
      desc: 'Thăng hoa cùng luồng gió đạt 200 điểm phong bão',
      category: 'fan',
      tier: 'silver',
      icon: '🌪️',
      points: 80,
      progress: Math.min(stats.fanHighScore, 200),
      maxProgress: 200,
      isUnlocked: stats.fanHighScore >= 200,
    },

    // ==========================================
    // NHÓM 8: XẾP KHỐI MA THUẬT (BLOCK PUZZLE)
    // ==========================================
    {
      id: 'block_bronze_200',
      title: 'Xếp Khối Khởi Điểm',
      desc: 'Xóa hàng khối ngọc đầu tiên đạt 200 điểm',
      category: 'block',
      tier: 'bronze',
      icon: '🧱',
      points: 25,
      progress: Math.min(stats.blockHighScore, 200),
      maxProgress: 200,
      isUnlocked: stats.blockHighScore >= 200,
    },
    {
      id: 'block_gold_900',
      title: 'Siêu Combo Hủy Diệt',
      desc: 'Kích nổ đồng thời nhiều hàng cột liên tiếp đạt 900 điểm Vàng',
      category: 'block',
      tier: 'gold',
      icon: '💎',
      points: 200,
      rewardTitle: 'Chúa Tể Ma Trận Ngọc',
      progress: Math.min(stats.blockHighScore, 900),
      maxProgress: 900,
      isUnlocked: stats.blockHighScore >= 900,
    },

    // ==========================================
    // NHÓM 9: BÁCH KHOA TOÀN NĂNG (MASTER)
    // ==========================================
    {
      id: 'master_explorer',
      title: 'Nhà Thám Hiểm Đa Năng',
      desc: 'Trải nghiệm trọn vẹn cả 5 trò chơi trong Thư Viện PolyPlay',
      category: 'master',
      tier: 'bronze',
      icon: '🗺️',
      points: 50,
      rewardTitle: 'Nhà Khai Phá',
      progress: Math.min(gamesPlayedCount, 5),
      maxProgress: 5,
      isUnlocked: gamesPlayedCount >= 5,
    },
    {
      id: 'master_score_2500',
      title: 'Bách Khoa Toàn Tài',
      desc: 'Đạt tổng điểm tích lũy 2,500 điểm qua mọi thử thách',
      category: 'master',
      tier: 'gold',
      icon: '🎖️',
      points: 250,
      rewardTitle: 'Đại Trí Tuệ Ma Pháp',
      progress: Math.min(totalScore, 2500),
      maxProgress: 2500,
      isUnlocked: totalScore >= 2500,
    },
    {
      id: 'master_polyplay_supreme',
      title: 'Chúa Tể PolyPlay Vô Song',
      desc: 'Mở khóa hơn 15 thành tựu lớn nhỏ khắp mọi cõi trò chơi',
      category: 'master',
      tier: 'mythic',
      icon: '👑',
      points: 1000,
      rewardTitle: 'Đấng Tối Cao Ma Thuật',
      progress: Math.min(gamesPlayedCount * 3 + (sharkVictories > 0 ? 5 : 0), 15),
      maxProgress: 15,
      isUnlocked: gamesPlayedCount >= 4 && (sharkBosses >= 3 || sharkWpm >= 50),
    },
  ];

  return rawAchievements;
}
