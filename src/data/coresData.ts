import { ArcaneCoreConfig, CoreType } from '../types/gacha';

export const ARCANE_CORES: Record<CoreType, ArcaneCoreConfig> = {
  alchemy: {
    id: 'alchemy',
    name: 'Lõi Giả Kim',
    title: 'Vạn Vật Quy Kim Luyện Đan',
    iconEmoji: '⚗️',
    themeColor: 'from-emerald-500 to-teal-400',
    auraGradient: 'from-emerald-600/30 via-teal-800/20 to-neutral-950',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/30',
    description: 'Chuyển hóa tạp chất thành tinh kim, tăng vĩnh viễn giá trị bán lại của mọi phẩm cấp báu vật!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 60,
        effectDescription: 'Tăng +20% giá bán lại cho tất cả báu vật (Common 1.2đ, Rare 4.8đ).',
        statBonus: '+20% Giá Bán',
      },
      {
        level: 2,
        cost: 180,
        effectDescription: 'Tăng +40% giá bán lại (Common 1.4đ, Rare 5.6đ, Epic 28đ).',
        statBonus: '+40% Giá Bán',
      },
      {
        level: 3,
        cost: 480,
        effectDescription: 'Tăng +65% giá bán lại (Common 1.65đ, Rare 6.6đ, Epic 33đ).',
        statBonus: '+65% Giá Bán',
      },
      {
        level: 4,
        cost: 1200,
        effectDescription: 'Tăng +90% giá bán lại (Common 1.9đ, Rare 7.6đ, Legend 380đ).',
        statBonus: '+90% Giá Bán',
      },
      {
        level: 5,
        cost: 2800,
        effectDescription: 'TỐI THƯỢNG: Tăng +120% giá bán lại! (Common 2.2đ, Rare 8.8đ, Epic 44đ, Legend 440đ, Mystic 2,200đ).',
        statBonus: '+120% Giá Bán Cực Hạn',
      },
    ],
  },

  destiny: {
    id: 'destiny',
    name: 'Lõi Vận Mệnh',
    title: 'Thiên Cung Vận Khí Tối Thượng',
    iconEmoji: '👁️',
    themeColor: 'from-amber-500 to-yellow-300',
    auraGradient: 'from-amber-600/30 via-yellow-700/20 to-neutral-950',
    borderColor: 'border-amber-500/50',
    glowColor: 'shadow-amber-500/30',
    description: 'Bóp méo xác suất tự nhiên, tăng đột biến tỉ lệ xuất hiện thẻ Huyền Thoại và Thần Thoại mà không cần dựa dẫm vào may rủi thông thường!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 75,
        effectDescription: 'Tăng +25% tỉ lệ xuất hiện thẻ Epic & Legend ở mọi bậc cửa hàng.',
        statBonus: '+25% Tỉ Lệ Epic/Legend',
      },
      {
        level: 2,
        cost: 220,
        effectDescription: 'Tăng +50% tỉ lệ Legend, TĂNG GẤP ĐÔI (2x) tỉ lệ rớt Thần Thoại (Mystic).',
        statBonus: '2x Mystic & +50% Legend',
      },
      {
        level: 3,
        cost: 550,
        effectDescription: 'Tăng +80% tỉ lệ Legend, tăng GẤP 2.8 LẦN tỉ lệ rớt Thần Thoại Mystic.',
        statBonus: '2.8x Mystic & +80% Legend',
      },
      {
        level: 4,
        cost: 1400,
        effectDescription: 'Tăng +120% tỉ lệ Legend, tăng GẤP 3.5 LẦN tỉ lệ Mystic (Shop bậc 6 đạt trên 12% Mystic!).',
        statBonus: '3.5x Mystic & +120% Legend',
      },
      {
        level: 5,
        cost: 3200,
        effectDescription: 'CHÂN MỆNH THIÊN TỬ: Tăng GẤP 4.5 LẦN Mystic, nhân đôi tỉ lệ Legend, giảm mạnh thẻ Common!',
        statBonus: '4.5x Mystic Tối Thượng',
      },
    ],
  },

  fortune: {
    id: 'fortune',
    name: 'Lõi Thần Tài',
    title: 'Kim Ngân Tụ Bảo Chiêu Tài',
    iconEmoji: '🪙',
    themeColor: 'from-yellow-400 to-amber-500',
    auraGradient: 'from-yellow-500/30 via-amber-700/20 to-neutral-950',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/30',
    description: 'Ân huệ từ Kim Thần, ban cho cơ hội quay Gacha hoàn tiền 100% hoặc kích hoạt NỔ HŨ THẦN TÀI x3 tiền thưởng!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 70,
        effectDescription: '15% cơ hội quay được Thần Tài Hoàn Tiền 100% (miễn phí lượt quay).',
        statBonus: '15% Hoàn Tiền Gacha',
      },
      {
        level: 2,
        cost: 200,
        effectDescription: '25% cơ hội quay được Thần Tài Hoàn Tiền 100%.',
        statBonus: '25% Hoàn Tiền Gacha',
      },
      {
        level: 3,
        cost: 500,
        effectDescription: '35% cơ hội quay được Thần Tài Hoàn Tiền 100%.',
        statBonus: '35% Hoàn Tiền Gacha',
      },
      {
        level: 4,
        cost: 1250,
        effectDescription: '45% cơ hội quay Hoàn Tiền + 10% cơ hội NỔ HŨ THẦN TÀI (Hoàn x2 chi phí).',
        statBonus: '45% Hoàn Tiền & 10% Nổ Hũ x2',
      },
      {
        level: 5,
        cost: 2900,
        effectDescription: 'ĐẠI THẦN TÀI HIỂN LINH: 50% Hoàn Tiền + 20% NỔ HŨ HOÀNG KIM (Nhận gấp 3 LẦN 3x tiền quay!).',
        statBonus: '50% Hoàn Tiền & 20% Nổ Hũ x3',
      },
    ],
  },

  harvester: {
    id: 'harvester',
    name: 'Lõi Bội Thu',
    title: 'Phồn Vinh Lục Đạo Sinh Sôi',
    iconEmoji: '🌾',
    themeColor: 'from-lime-400 to-emerald-600',
    auraGradient: 'from-lime-500/30 via-emerald-800/20 to-neutral-950',
    borderColor: 'border-lime-500/50',
    glowColor: 'shadow-lime-500/30',
    description: 'Bảo vật sinh sôi nảy nở, xác suất nhân đôi x2 hoặc thậm chí nhân ba x3 số lượng đồ nhận được khi bốc trúng!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 65,
        effectDescription: '18% xác suất nhân đôi x2 số lượng báu vật Common/Rare khi quay trúng.',
        statBonus: '18% x2 Drop Rate',
      },
      {
        level: 2,
        cost: 190,
        effectDescription: '32% xác suất nhân đôi x2 Common/Rare, 10% nhân đôi Epic.',
        statBonus: '32% x2 Common/Rare & 10% Epic',
      },
      {
        level: 3,
        cost: 480,
        effectDescription: '45% xác suất nhân đôi x2 Common/Rare, 20% nhân đôi Epic.',
        statBonus: '45% x2 Common/Rare & 20% Epic',
      },
      {
        level: 4,
        cost: 1150,
        effectDescription: '60% cơ hội nhân đôi x2 Common/Rare, 35% nhân đôi Epic, 12% nhân đôi Legend.',
        statBonus: '60% x2 & 12% Legend x2',
      },
      {
        level: 5,
        cost: 2700,
        effectDescription: 'VẠN VẬT BỘI THU: 75% nhân đôi x2, 25% nhân đôi Legend/Mystic, và 15% cơ hội kích hoạt NHÂN BA (x3)!',
        statBonus: '75% x2 & 15% Nhân Ba x3',
      },
    ],
  },

  order: {
    id: 'order',
    name: 'Lõi Khế Ước',
    title: 'Thánh Chỉ Hoàn Thành Đơn Hàng',
    iconEmoji: '📜',
    themeColor: 'from-orange-500 to-amber-600',
    auraGradient: 'from-orange-600/30 via-amber-800/20 to-neutral-950',
    borderColor: 'border-orange-500/50',
    glowColor: 'shadow-orange-500/30',
    description: 'Gia tăng mạnh mẽ phần thưởng kim ngân nhận được khi hoàn thành 10 Đợt Đơn Hàng Bí Chỉ cuộn giấy!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 50,
        effectDescription: 'Tăng +25% tiền thưởng khi giao nộp hoàn tất bất kỳ Đơn Hàng Bí Chỉ nào.',
        statBonus: '+25% Thưởng Bí Chỉ',
      },
      {
        level: 2,
        cost: 160,
        effectDescription: 'Tăng +50% tiền thưởng khi hoàn thành Đơn Hàng Bí Chỉ.',
        statBonus: '+50% Thưởng Bí Chỉ',
      },
      {
        level: 3,
        cost: 420,
        effectDescription: 'Tăng +80% tiền thưởng khi hoàn thành Đơn Hàng Bí Chỉ.',
        statBonus: '+80% Thưởng Bí Chỉ',
      },
      {
        level: 4,
        cost: 1000,
        effectDescription: 'Tăng +120% tiền thưởng khi hoàn thành Đơn Hàng Bí Chỉ.',
        statBonus: '+120% Thưởng Bí Chỉ',
      },
      {
        level: 5,
        cost: 2500,
        effectDescription: 'KHẾ ƯỚC HOÀNG GIA: Tăng +160% tiền thưởng Bí Chỉ (Đợt 10 nhận tới 26,000 Đồng!).',
        statBonus: '+160% Thưởng Bí Chỉ',
      },
    ],
  },

  channelling: {
    id: 'channelling',
    name: 'Lõi Pháp Điển',
    title: 'Tiết Giảm Linh Khí Chi Phí',
    iconEmoji: '⚡',
    themeColor: 'from-cyan-400 to-blue-600',
    auraGradient: 'from-cyan-600/30 via-blue-800/20 to-neutral-950',
    borderColor: 'border-cyan-500/50',
    glowColor: 'shadow-cyan-500/30',
    description: 'Luyện khí tối ưu pháp trận, giảm vĩnh viễn chi phí quay 10 lần và giảm giá nâng cấp Cửa Hàng Shop Tier!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 80,
        effectDescription: 'Giảm 10% chi phí nâng cấp Bậc Cửa Hàng Shop Tier.',
        statBonus: '-10% Giá Shop Tier',
      },
      {
        level: 2,
        cost: 240,
        effectDescription: 'Giảm chi phí quay 10 lần từ 20đ xuống 19đ; giảm 20% chi phí nâng Shop Tier.',
        statBonus: 'Quay x10 chỉ 19🪙 (-20% Shop)',
      },
      {
        level: 3,
        cost: 600,
        effectDescription: 'Giảm chi phí quay 10 lần xuống 18đ; giảm 30% chi phí nâng Shop Tier.',
        statBonus: 'Quay x10 chỉ 18🪙 (-30% Shop)',
      },
      {
        level: 4,
        cost: 1400,
        effectDescription: 'Giảm chi phí quay 10 lần xuống 16đ; giảm 40% chi phí nâng Shop Tier.',
        statBonus: 'Quay x10 chỉ 16🪙 (-40% Shop)',
      },
      {
        level: 5,
        cost: 3000,
        effectDescription: 'TIẾT KIỆM TỐI THƯỢNG: Quay 10 lần CHỈ 15 ĐỒNG (tiết kiệm 25%), giảm 50% nâng Shop Tier!',
        statBonus: 'Quay x10 CHỈ 15🪙 (-50% Shop)',
      },
    ],
  },

  miracle: {
    id: 'miracle',
    name: 'Lõi Kỳ Tích',
    title: 'Thiên Giáng Điềm Lành Bùng Nổ',
    iconEmoji: '✨',
    themeColor: 'from-purple-400 to-pink-600',
    auraGradient: 'from-purple-600/30 via-pink-800/20 to-neutral-950',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30',
    description: 'Mỗi khi bốc trúng thẻ Sử Thi (Epic), Huyền Thoại hoặc Thần Thoại, nhận ngay tiền thưởng nóng bùng nổ!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 75,
        effectDescription: 'Mỗi thẻ Epic trở lên bốc được thưởng nóng thêm +10 Đồng vào ngân khố.',
        statBonus: 'Epic+ Thưởng Nóng +10🪙',
      },
      {
        level: 2,
        cost: 220,
        effectDescription: 'Epic thưởng nóng +20 Đồng; Legend/Mystic thưởng nóng +60 Đồng.',
        statBonus: 'Epic +20🪙 | Legend +60🪙',
      },
      {
        level: 3,
        cost: 550,
        effectDescription: 'Epic thưởng nóng +35 Đồng; Legend nhận +120 Đồng; Mystic nhận +300 Đồng.',
        statBonus: 'Legend +120🪙 | Mystic +300🪙',
      },
      {
        level: 4,
        cost: 1350,
        effectDescription: 'Epic thưởng nóng +60 Đồng; Legend nhận +250 Đồng; Mystic nhận +600 Đồng.',
        statBonus: 'Legend +250🪙 | Mystic +600🪙',
      },
      {
        level: 5,
        cost: 3200,
        effectDescription: 'BÃO MA THUẬT KỲ TÍCH: Epic +100 Đồng; Legend +500 Đồng; Mystic thưởng cực đại +1,500 Đồng!',
        statBonus: 'Mystic Thưởng Nóng +1500🪙',
      },
    ],
  },

  enlighten: {
    id: 'enlighten',
    name: 'Lõi Giác Ngộ',
    title: 'Tinh Hoa Tái Sinh Đồ Trùng',
    iconEmoji: '🔮',
    themeColor: 'from-indigo-400 to-violet-600',
    auraGradient: 'from-indigo-600/30 via-violet-800/20 to-neutral-950',
    borderColor: 'border-indigo-500/50',
    glowColor: 'shadow-indigo-500/30',
    description: 'Mỗi khi bốc trúng món đã có trong kho, chuyển hóa tinh hoa đồ trùng thành tiền mặt tức thì!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 60,
        effectDescription: 'Mỗi món trùng lặp bốc trúng lập tức hoàn lại +1 Đồng.',
        statBonus: '+1🪙/món trùng',
      },
      {
        level: 2,
        cost: 180,
        effectDescription: 'Mỗi món trùng lặp bốc trúng lập tức hoàn lại +2.5 Đồng.',
        statBonus: '+2.5🪙/món trùng',
      },
      {
        level: 3,
        cost: 460,
        effectDescription: 'Mỗi món trùng lặp lập tức hoàn lại +5 Đồng (quay trúng đồ cũ luôn có lãi!).',
        statBonus: '+5🪙/món trùng (Siêu Lời)',
      },
      {
        level: 4,
        cost: 1100,
        effectDescription: 'Mỗi món trùng lặp lập tức hoàn lại +10 Đồng.',
        statBonus: '+10🪙/món trùng',
      },
      {
        level: 5,
        cost: 2600,
        effectDescription: 'GIÁC NGỘ CHÍ TÔN: Mỗi món trùng lặp lập tức hoàn lại +18 Đồng! Bốc đồ cũ thành mỏ vàng!',
        statBonus: '+18🪙/món trùng Cực Đại',
      },
    ],
  },

  treasury: {
    id: 'treasury',
    name: 'Lõi Ngân Khố',
    title: 'Càn Khôn Kim Khố Tụ Bảo',
    iconEmoji: '🏛️',
    themeColor: 'from-rose-400 to-amber-600',
    auraGradient: 'from-rose-600/30 via-amber-800/20 to-neutral-950',
    borderColor: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/30',
    description: 'Gia tăng mức Trợ Cấp Khẩn Cấp và sinh lời lãi suất thụ động sau mỗi lần quay 10 thẻ!',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: 55,
        effectDescription: 'Tăng mức nhận Trợ Cấp Khẩn Cấp từ 20đ lên 40 Đồng.',
        statBonus: 'Trợ Cấp 40🪙',
      },
      {
        level: 2,
        cost: 170,
        effectDescription: 'Tăng Trợ Cấp lên 75 Đồng; cộng thêm lãi suất thụ động +2 Đồng sau mỗi lần quay x10.',
        statBonus: 'Trợ Cấp 75🪙 (+2🪙/lần x10)',
      },
      {
        level: 3,
        cost: 440,
        effectDescription: 'Tăng Trợ Cấp lên 130 Đồng; cộng thêm lãi suất +5 Đồng sau mỗi lần quay x10.',
        statBonus: 'Trợ Cấp 130🪙 (+5🪙/lần x10)',
      },
      {
        level: 4,
        cost: 1050,
        effectDescription: 'Tăng Trợ Cấp lên 220 Đồng; cộng thêm lãi suất +10 Đồng sau mỗi lần quay x10.',
        statBonus: 'Trợ Cấp 220🪙 (+10🪙/lần x10)',
      },
      {
        level: 5,
        cost: 2500,
        effectDescription: 'KHO BÁU BẤT TẬN: Trợ Cấp lên đến 380 Đồng, lãi suất thụ động +20 Đồng sau mỗi lần quay x10!',
        statBonus: 'Trợ Cấp 380🪙 (+20🪙/lần x10)',
      },
    ],
  },
};

export const CORE_TYPES: CoreType[] = [
  'alchemy',
  'destiny',
  'fortune',
  'harvester',
  'order',
  'channelling',
  'miracle',
  'enlighten',
  'treasury',
];

/**
 * Returns numeric bonus value for each core at given level
 */
export function getCoreBonusMultiplier(type: CoreType, level: number): number {
  if (level <= 0) return 0;
  const clamped = Math.min(5, Math.max(0, level));

  switch (type) {
    case 'alchemy': {
      // +20%, +40%, +65%, +90%, +120%
      const bonuses = [0, 0.20, 0.40, 0.65, 0.90, 1.20];
      return bonuses[clamped];
    }
    case 'destiny': {
      // Destiny rate multiplier: +25%, +50%, +80%, +120%, +180%
      const bonuses = [0, 0.25, 0.50, 0.80, 1.20, 1.80];
      return bonuses[clamped];
    }
    case 'fortune': {
      // Refund chance: 15%, 25%, 35%, 45%, 50%
      const chances = [0, 0.15, 0.25, 0.35, 0.45, 0.50];
      return chances[clamped];
    }
    case 'harvester': {
      // Double drop chance: 18%, 32%, 45%, 60%, 75%
      const chances = [0, 0.18, 0.32, 0.45, 0.60, 0.75];
      return chances[clamped];
    }
    case 'order': {
      // Order bonus reward multiplier: +25%, +50%, +80%, +120%, +160%
      const bonuses = [0, 0.25, 0.50, 0.80, 1.20, 1.60];
      return bonuses[clamped];
    }
    case 'channelling': {
      // Discount on 10-pull: 0, 1🪙, 2🪙, 4🪙, 5🪙
      const discounts = [0, 0, 1, 2, 4, 5];
      return discounts[clamped];
    }
    case 'miracle': {
      // Base bonus gold on high rarity hits
      const bonuses = [0, 10, 20, 35, 60, 100];
      return bonuses[clamped];
    }
    case 'enlighten': {
      // Bonus coins per duplicate item
      const coinsPerDup = [0, 1, 2.5, 5, 10, 18];
      return coinsPerDup[clamped];
    }
    case 'treasury': {
      // Grant amount: 20 (base), 40, 75, 130, 220, 380
      const grants = [20, 40, 75, 130, 220, 380];
      return grants[clamped];
    }
    default:
      return 0;
  }
}
