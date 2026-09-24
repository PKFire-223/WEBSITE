import { ShopTier } from '../types/gacha';

export const SHOP_TIERS: ShopTier[] = [
  {
    tier: 1,
    name: 'Bậc 1: Sơ Kỳ Tạp Hóa Các',
    subtitle: 'Cửa tiệm kỳ môn sơ khai, cơ may huyền diệu hé mở',
    upgradeCost: 25, // Đã giảm tương ứng với lượt quay x1: 2đ, x10: 20đ
    rates: {
      mystic: 0.01,  // Bậc 1 có 0.01% Mystic
      legend: 0.50,
      epic: 4.49,
      rare: 25.00,
      common: 70.00,
    },
    bonusDescription: 'Tỉ lệ cơ bản ban đầu: 0.01% Thần Thoại (Mystic), 0.50% Huyền Thoại (Legend).',
  },
  {
    tier: 2,
    name: 'Bậc 2: Huyền Quang Bảo Phủ',
    subtitle: 'Linh khí tụ hội, ánh sáng kỳ trân dần phát tích',
    upgradeCost: 80, // Đã giảm tương ứng
    rates: {
      mystic: 0.05,
      legend: 1.45,
      epic: 8.50,
      rare: 30.00,
      common: 60.00,
    },
    bonusDescription: 'Tăng gấp 5 lần tỉ lệ Mystic (0.05%) & gấp 3 lần tỉ lệ Legend (1.45%).',
  },
  {
    tier: 3,
    name: 'Bậc 3: Tử Vi Các Thượng Phẩm',
    subtitle: 'Các viện bói toán chiêm tinh thượng cổ hộ pháp',
    upgradeCost: 200, // Đã giảm tương ứng
    rates: {
      mystic: 0.20,
      legend: 3.80,
      epic: 15.00,
      rare: 36.00,
      common: 45.00,
    },
    bonusDescription: 'Tỉ lệ Mystic đạt 0.20%, Epic bứt phá 15%, giảm mạnh rác Common xuống 45%.',
  },
  {
    tier: 4,
    name: 'Bậc 4: Thái Cổ Kỳ Trân Lâu',
    subtitle: 'Nơi quy tụ binh khí linh vật từ ngàn vạn năm trước',
    upgradeCost: 500, // Đã giảm tương ứng
    rates: {
      mystic: 0.60,
      legend: 7.40,
      epic: 22.00,
      rare: 38.00,
      common: 32.00,
    },
    bonusDescription: 'Tỉ lệ Mystic lên 0.60%, Legend lên 7.40%, cơ hội đồ xịn vượt trội.',
  },
  {
    tier: 5,
    name: 'Bậc 5: Cửu Trọng Thiên Cung',
    subtitle: 'Cung điện chư thần ngự trị trên đỉnh mây cửu tiêu',
    upgradeCost: 1200, // Đã giảm tương ứng
    rates: {
      mystic: 1.50,
      legend: 12.50,
      epic: 28.00,
      rare: 38.00,
      common: 20.00,
    },
    bonusDescription: 'Tỉ lệ Mystic chạm mốc 1.50%, Legend 12.50%, đồ Rare & Epic áp đảo hoàn toàn.',
  },
  {
    tier: 6,
    name: 'Bậc 6: Vạn Giới Thần Vực (Cực Phẩm Tối Đa)',
    subtitle: 'Cảnh giới chí tôn vô thượng, thần khí giáng lâm vạn cổ',
    upgradeCost: 0, // Đạt bậc tối đa
    rates: {
      mystic: 3.50,
      legend: 18.50,
      epic: 34.00,
      rare: 32.00,
      common: 12.00,
    },
    bonusDescription: 'Bậc tối đa! Mystic đạt 3.50%, Legend chạm 18.50%, tỉ lệ bốc trúng báu vật cực đại.',
  },
];
