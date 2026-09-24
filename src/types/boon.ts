import { Rarity } from './gacha';

export type BoonRarity = 'rare' | 'epic' | 'legend' | 'mystic';

export type BoonCategory =
  | 'shop'       // Gia cường cửa hàng & bậc shop
  | 'element'    // Tăng tỉ lệ hệ nguyên tố
  | 'wealth'     // Tăng tiền, % tiền hiện tại, lãi suất
  | 'core'       // Nâng cấp lõi ma pháp
  | 'category'   // Chuyên môn hóa vũ khí, giáp, dược, cổ vật
  | 'transmute'  // Biến đổi thẻ, thăng cấp thẻ
  | 'discount'   // Giảm giá quay, miễn phí quay
  | 'ultimate';  // Thần thoại, vạn cổ chi vương

export interface AncientBoon {
  id: string;
  name: string;
  title: string;
  rarity: BoonRarity;
  category: BoonCategory;
  iconEmoji: string;
  description: string;
  shortEffect: string;
  instantCoinPercent?: number; // e.g. 0.20 for +20% current coins
  instantCoinsFlat?: number;    // e.g. 150, 300, 500
  instantCoreUpgrade?: string; // CoreType to level up +1 for free
  freeShopTierUpgrade?: boolean;
  freeSpinsGranted?: number;
}
