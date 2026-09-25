import { SkillNode, PlayerStats, SubmarineSkin, SubmarineSkinId, BossId } from '../types/typingShark';

export interface UpgradeTreeState {
  auto_typing_speed: number;
  max_health: number;
  shield_generator: number;
  gold_multiplier: number;
  depth_bomb_capacity: number;
  cryo_slowdown: number;
  chain_lightning: number;
  life_leech: number;
  combo_frenzy: number;
  // New Skills
  support_gunboat: number;
  hyper_laser: number;
  treasure_radar: number;
  shockwave_armor: number;
  piercing_torpedo: number;
}

export const DEFAULT_UPGRADE_STATE: UpgradeTreeState = {
  auto_typing_speed: 0,
  max_health: 0,
  shield_generator: 0,
  gold_multiplier: 0,
  depth_bomb_capacity: 0,
  cryo_slowdown: 0,
  chain_lightning: 0,
  life_leech: 0,
  combo_frenzy: 0,
  support_gunboat: 0,
  hyper_laser: 0,
  treasure_radar: 0,
  shockwave_armor: 0,
  piercing_torpedo: 0,
};

export const SUBMARINE_SKINS: Record<SubmarineSkinId, SubmarineSkin> = {
  nautilus: {
    id: 'nautilus',
    name: 'Nautilus Mk-I (Mặc Định)',
    description: 'Tàu thám hiểm tiêu chuẩn thế hệ đầu, trang bị vỏ vàng viền xanh chống áp suất đáy biển.',
    unlockedAtBoss: 'default',
    bodyColor: '#f59e0b',
    trimColor: '#0284c7',
    glowColor: '#38bdf8',
    icon: '🚢',
  },
  megalodon_armor: {
    id: 'megalodon_armor',
    name: 'Megalodon Titanium (Boss 5m)',
    description: 'Rèn đúc từ hàm răng cá mập cổ đại, phủ kim loại titan chống va chạm cực tốt.',
    unlockedAtBoss: 'megalodon',
    bodyColor: '#475569',
    trimColor: '#ef4444',
    glowColor: '#f87171',
    icon: '🦈',
  },
  kraken_shadow: {
    id: 'kraken_shadow',
    name: 'Kraken Dark Tentacle (Boss 10m)',
    description: 'Vỏ tàu hợp kim tím sẫm hấp thụ ánh sáng, phủ tinh chất xúc tu dạ quang phát sáng bí ẩn.',
    unlockedAtBoss: 'kraken',
    bodyColor: '#581c87',
    trimColor: '#c084fc',
    glowColor: '#e879f9',
    icon: '🐙',
  },
  dragon_azure: {
    id: 'dragon_azure',
    name: 'Băng Long Cổ Ngữ (Boss 15m)',
    description: 'Chạm khắc vảy rồng ngọc bích từ vùng cực băng giá, phát tỏa sương lạnh làm chậm quái.',
    unlockedAtBoss: 'dragon',
    bodyColor: '#0369a1',
    trimColor: '#67e8f9',
    glowColor: '#a5f3fc',
    icon: '🐉',
  },
  poseidon_mech: {
    id: 'poseidon_mech',
    name: 'Poseidon Mech Lôi Đình (Boss 20m)',
    description: 'Cơ giáp hoàng gia biển sâu dát vàng ròng, tích trữ điện trường sấm sét biển sâu uy dũng.',
    unlockedAtBoss: 'behemoth',
    bodyColor: '#eab308',
    trimColor: '#f97316',
    glowColor: '#fde047',
    icon: '⚡',
  },
  void_leviathan: {
    id: 'void_leviathan',
    name: 'Hư Không Thần Trùng Titan (Boss 25m)',
    description: 'Tàu vũ trụ hư không tối thượng của Đấng Thống Trị Vực Thẳm. Sở hữu hào quang tinh vân vũ trụ!',
    unlockedAtBoss: 'leviathan',
    bodyColor: '#09090b',
    trimColor: '#a855f7',
    glowColor: '#38bdf8',
    icon: '👑',
  },
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  gold: 0,
  lifetimeGold: 0,
  kills: 0,
  bossesKilled: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  maxWpm: 0,
  highestMinuteSurvived: 0,
  gamesPlayed: 0,
  victories: 0,
  selectedSkin: 'nautilus',
  unlockedSkins: ['nautilus'],
};

// Skill Definitions with Steep Exponential Cost Scaling as Requested:
// Level 0 -> 1: ~500 - 800
// Level 1 -> 2: ~2,500 - 3,500
// Level 2 -> 3: ~8,000 - 12,000
// Level 3 -> 4: ~25,000 - 35,000
// Level 4 -> 5: ~70,000 - 100,000
// Level 5+: Multiplies heavily
export const SKILL_DEFINITIONS: Record<keyof UpgradeTreeState, Omit<SkillNode, 'level'>> = {
  auto_typing_speed: {
    id: 'auto_typing_speed',
    name: 'Trợ Thủ AI Sóng Âm (Auto-Typing Drone)',
    category: 'auto',
    description: 'Trợ thủ bay tự động gõ chữ hộ bạn vào quái vật nguy hiểm nhất. Nâng cấp tăng tốc độ gõ tự động liên thanh!',
    baseCost: 650,
    costMultiplier: 3.1,
    maxLevel: 25,
    icon: '🤖',
    unit: 'ký tự / giây',
    getCurrentValue: (lvl: number) => {
      if (lvl <= 0) return 0;
      if (lvl === 1) return 0.5; // 1 chữ mỗi 2s
      if (lvl === 2) return 1.0; // 1s gõ 1 chữ
      if (lvl === 3) return 1.8;
      if (lvl === 4) return 2.6;
      if (lvl === 5) return 3.8;
      if (lvl === 6) return 5.0;
      if (lvl === 7) return 6.5;
      if (lvl === 8) return 8.0;
      if (lvl === 9) return 9.5;
      if (lvl === 10) return 11.0; // 1s gõ >10 chữ
      return 11.0 + (lvl - 10) * 1.5;
    },
    getFormattedValue: (lvl: number) => {
      if (lvl <= 0) return 'Chưa kích hoạt (0/s)';
      if (lvl === 1) return '0.5 chữ/s (1 chữ / 2s)';
      if (lvl === 2) return '1.0 chữ/s (1 chữ / 1s)';
      if (lvl >= 10) return `⚡ ${(SKILL_DEFINITIONS.auto_typing_speed.getCurrentValue(lvl)).toFixed(1)} chữ/s (Thần Tốc!)`;
      return `${(SKILL_DEFINITIONS.auto_typing_speed.getCurrentValue(lvl)).toFixed(1)} chữ/s`;
    }
  },

  support_gunboat: {
    id: 'support_gunboat',
    name: 'Tàu Chiến Vệ Tinh Phụ (Support Wingman)',
    category: 'fleet',
    description: 'Triệu hồi thêm 1-3 tàu ngầm mini bơi tuần tra quanh tàu chính, tự động bắn phá hỗ trợ!',
    baseCost: 800,
    costMultiplier: 3.3,
    maxLevel: 5,
    icon: '🚢',
    unit: 'Tàu hộ tống',
    getCurrentValue: (lvl: number) => lvl,
    getFormattedValue: (lvl: number) => lvl === 0 ? 'Chưa mở' : `+${lvl} Tàu Mini Yểm Trợ`
  },

  max_health: {
    id: 'max_health',
    name: 'Vỏ Thép Hợp Kim Titan (Hull Armor)',
    category: 'defense',
    description: 'Tăng lượng Máu tối đa của tàu ngầm giúp sống sót trước va đập của cá mập và quái vật khổng lồ.',
    baseCost: 500,
    costMultiplier: 2.8,
    maxLevel: 30,
    icon: '🛡️',
    unit: 'HP',
    getCurrentValue: (lvl: number) => 100 + lvl * 50,
    getFormattedValue: (lvl: number) => `${100 + lvl * 50} HP`
  },

  shield_generator: {
    id: 'shield_generator',
    name: 'Lá Chắn Năng Lượng Từ Trường (Energy Shield)',
    category: 'defense',
    description: 'Tạo lớp khiên bảo vệ hấp thụ toàn bộ sát thương. Tự động sạc lại sau 5 giây không bị trúng đòn!',
    baseCost: 750,
    costMultiplier: 3.0,
    maxLevel: 25,
    icon: '🔮',
    unit: 'Khiên',
    getCurrentValue: (lvl: number) => (lvl === 0 ? 0 : 50 + (lvl - 1) * 40),
    getFormattedValue: (lvl: number) => (lvl === 0 ? '0 (Chưa mở)' : `${50 + (lvl - 1) * 40} Khiên`)
  },

  gold_multiplier: {
    id: 'gold_multiplier',
    name: 'Máy Hút Vàng & Trân Châu (Gold Greed Magnet)',
    category: 'economy',
    description: 'Hút vàng từ xa và nhân thêm lượng tiền vàng nhận được từ quái vật biển sâu.',
    baseCost: 600,
    costMultiplier: 2.9,
    maxLevel: 25,
    icon: '🪙',
    unit: 'Hệ số',
    getCurrentValue: (lvl: number) => 1.0 + lvl * 0.25,
    getFormattedValue: (lvl: number) => `x${(1.0 + lvl * 0.25).toFixed(2)} Tiền Vàng`
  },

  depth_bomb_capacity: {
    id: 'depth_bomb_capacity',
    name: 'Ngư Lôi Sóng Chấn Động (Depth Charge Bomb)',
    category: 'offense',
    description: 'Nhấn [SPACEBAR] giải phóng sóng xung kích hủy diệt quái vật thường và gây sát thương cực lớn lên Boss!',
    baseCost: 850,
    costMultiplier: 3.2,
    maxLevel: 10,
    icon: '💣',
    unit: 'Quả bom',
    getCurrentValue: (lvl: number) => 1 + lvl,
    getFormattedValue: (lvl: number) => `${1 + lvl} Lần Kích Hoạt`
  },

  cryo_slowdown: {
    id: 'cryo_slowdown',
    name: 'Ngư Lôi Băng Hàn Cực Đới (Cryo Slowdown)',
    category: 'offense',
    description: 'Phát tỏa sóng làm lạnh nước biển sâu, giảm tốc độ bơi của tất cả quái vật tiến về tàu ngầm.',
    baseCost: 700,
    costMultiplier: 3.0,
    maxLevel: 15,
    icon: '❄️',
    unit: '% Giảm tốc',
    getCurrentValue: (lvl: number) => Math.min(0.55, lvl * 0.035),
    getFormattedValue: (lvl: number) => `Làm chậm ${(Math.min(55, lvl * 3.5)).toFixed(1)}%`
  },

  hyper_laser: {
    id: 'hyper_laser',
    name: 'Pháo Laser Hội Tụ Xuyên Thấu (Hyper Piercing Laser)',
    category: 'offense',
    description: 'Khi đạt chuỗi combo 5+, tàu tự động bắn chùm laser siêu dẫn xuyên thấu qua toàn bộ hàng quái vật!',
    baseCost: 900,
    costMultiplier: 3.2,
    maxLevel: 10,
    icon: '⚡',
    unit: 'Cấp Pháo',
    getCurrentValue: (lvl: number) => lvl,
    getFormattedValue: (lvl: number) => lvl === 0 ? 'Chưa mở' : `Laser Combo Lv.${lvl}`
  },

  treasure_radar: {
    id: 'treasure_radar',
    name: 'Radar Dò Thùng Gỗ May Mắn (Treasure Hunter Radar)',
    category: 'economy',
    description: 'Tăng tỷ lệ xuất hiện thùng gỗ bí ẩn và kéo dài thời gian hiệu lực của Siêu Buff thêm giây!',
    baseCost: 650,
    costMultiplier: 2.85,
    maxLevel: 15,
    icon: '📦',
    unit: 'Tỷ lệ & Thời gian',
    getCurrentValue: (lvl: number) => lvl * 2, // extra seconds of buff
    getFormattedValue: (lvl: number) => lvl === 0 ? 'Chưa mở' : `+${lvl * 15}% Thùng, +${lvl * 2}s Buff`
  },

  shockwave_armor: {
    id: 'shockwave_armor',
    name: 'Giáp Phản Xạ Xung Kích (Shockwave Reactive Armor)',
    category: 'defense',
    description: 'Khi bị va chạm, giải phóng sóng chấn động đẩy lùi kẻ địch xung quanh và phản sát thương!',
    baseCost: 750,
    costMultiplier: 2.9,
    maxLevel: 15,
    icon: '💥',
    unit: 'Phản đòn',
    getCurrentValue: (lvl: number) => lvl * 0.15,
    getFormattedValue: (lvl: number) => lvl === 0 ? 'Chưa mở' : `Phản đòn ${Math.round(lvl * 15)}% & Đẩy lùi`
  },

  piercing_torpedo: {
    id: 'piercing_torpedo',
    name: 'Ngư Lôi Xuyên Giáp Tầm Nhiệt (Armor-Piercing)',
    category: 'offense',
    description: 'Tăng sát thương ngư lôi lên quái giáp dày, quái tinh anh và gây thêm sát thương lên Boss!',
    baseCost: 800,
    costMultiplier: 3.0,
    maxLevel: 15,
    icon: '🎯',
    unit: 'Sát thương Boss',
    getCurrentValue: (lvl: number) => 1 + lvl * 0.2,
    getFormattedValue: (lvl: number) => lvl === 0 ? 'Chưa mở' : `+${Math.round(lvl * 20)}% Sát thương Boss/Giáp`
  },

  chain_lightning: {
    id: 'chain_lightning',
    name: 'Tia Sét Âm Thấu Lan Truyền (Chain Lightning Burst)',
    category: 'offense',
    description: 'Mỗi khi gõ hoàn thành 1 từ, phóng điện lan sang các quái vật lân cận, xóa bớt ký tự của chúng.',
    baseCost: 800,
    costMultiplier: 3.0,
    maxLevel: 15,
    icon: '🌩️',
    unit: 'Sát thương lan',
    getCurrentValue: (lvl: number) => (lvl === 0 ? 0 : 1 + Math.floor(lvl / 2)),
    getFormattedValue: (lvl: number) => (lvl === 0 ? 'Chưa mở' : `Nổ lan ${1 + Math.floor(lvl / 2)} mục tiêu`)
  },

  life_leech: {
    id: 'life_leech',
    name: 'Nanobot Sửa Chữa Tàu (Nanobot Life Leech)',
    category: 'defense',
    description: 'Mỗi khi tiêu diệt 1 quái vật, nanobot tự động sửa chữa phục hồi Máu và Khiên cho tàu.',
    baseCost: 700,
    costMultiplier: 2.9,
    maxLevel: 20,
    icon: '🧪',
    unit: 'Hồi phục',
    getCurrentValue: (lvl: number) => lvl * 3,
    getFormattedValue: (lvl: number) => (lvl === 0 ? 'Chưa mở' : `+${lvl * 3} HP/Khiên mỗi quái`)
  },

  combo_frenzy: {
    id: 'combo_frenzy',
    name: 'Chế Độ Cuồng Nộ Sóng Âm (Combo Overdrive)',
    category: 'offense',
    description: 'Gõ đúng liên tục không mắc lỗi tích lũy thanh Overdrive. Đạt mốc sẽ tăng tốc độ Drone và tiền thưởng!',
    baseCost: 850,
    costMultiplier: 3.1,
    maxLevel: 20,
    icon: '🔥',
    unit: 'Hệ số nộ',
    getCurrentValue: (lvl: number) => 1 + lvl * 0.2,
    getFormattedValue: (lvl: number) => `Cuồng nộ +${Math.round(lvl * 20)}% uy lực`
  }
};

export function getSkillUpgradeCost(skillKey: keyof UpgradeTreeState, currentLevel: number): number {
  const def = SKILL_DEFINITIONS[skillKey];
  if (!def) return 999999;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
}

const STORAGE_KEY_UPGRADES = 'typing_shark_upgrades_v2';
const STORAGE_KEY_STATS = 'typing_shark_stats_v2';

export function loadSavedUpgrades(): UpgradeTreeState {
  try {
    const data = localStorage.getItem(STORAGE_KEY_UPGRADES);
    if (data) {
      return { ...DEFAULT_UPGRADE_STATE, ...JSON.parse(data) };
    }
    // Fallback to v1 if present
    const oldData = localStorage.getItem('typing_shark_upgrades_v1');
    if (oldData) {
      const parsed = JSON.parse(oldData);
      const migrated = { ...DEFAULT_UPGRADE_STATE, ...parsed };
      saveUpgrades(migrated);
      return migrated;
    }
  } catch (e) {
    // fallback
  }
  return { ...DEFAULT_UPGRADE_STATE };
}

export function saveUpgrades(upgrades: UpgradeTreeState) {
  try {
    localStorage.setItem(STORAGE_KEY_UPGRADES, JSON.stringify(upgrades));
  } catch (e) {
    // ignore
  }
}

export function loadSavedStats(): PlayerStats {
  try {
    const data = localStorage.getItem(STORAGE_KEY_STATS);
    if (data) {
      return { ...DEFAULT_PLAYER_STATS, ...JSON.parse(data) };
    }
    // Fallback to v1 if present so player retains their gold!
    const oldData = localStorage.getItem('typing_shark_stats_v1');
    if (oldData) {
      const parsed = JSON.parse(oldData);
      const migrated = { ...DEFAULT_PLAYER_STATS, ...parsed };
      saveStats(migrated);
      return migrated;
    }
  } catch (e) {
    // fallback
  }
  return { ...DEFAULT_PLAYER_STATS };
}

export function saveStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (e) {
    // ignore
  }
}

export function hardResetProgress(): { upgrades: UpgradeTreeState; stats: PlayerStats } {
  try {
    localStorage.removeItem(STORAGE_KEY_UPGRADES);
    localStorage.removeItem(STORAGE_KEY_STATS);
    localStorage.removeItem('typing_shark_upgrades_v1');
    localStorage.removeItem('typing_shark_stats_v1');
  } catch (e) {
    // ignore
  }
  return {
    upgrades: { ...DEFAULT_UPGRADE_STATE },
    stats: { ...DEFAULT_PLAYER_STATS },
  };
}
