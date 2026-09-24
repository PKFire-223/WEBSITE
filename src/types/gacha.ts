export type Rarity = 'common' | 'rare' | 'epic' | 'legend' | 'mystic';

export interface RarityConfig {
  label: string;
  shortLabel: string;
  sellPrice: number;
  textColor: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
  badgeBg: string;
  badgeBorder: string;
  auraGradient: string;
  hexColor: string;
}

export interface GachaItem {
  id: string;
  numId: number;
  name: string;
  rarity: Rarity;
  batch: number; // 1 to 5
  batchName: string;
  sellPrice: number; // common: 0.5, rare: 2, epic: 20, legend: 200, mystic: 1000
  iconEmoji: string;
  category: 'weapon' | 'armor' | 'potion' | 'relic' | 'beast' | 'rune';
  element: string;
  description: string;
  colorScheme: RarityConfig;
}

export interface InventoryItem {
  itemId: string;
  count: number;
  obtainedAt: number;
}

export interface ShopTier {
  tier: number; // 1 to 6
  name: string;
  subtitle: string;
  upgradeCost: number; // cost to reach next tier (tier 6 = 0)
  rates: {
    common: number;  // e.g. 70.0
    rare: number;    // e.g. 25.0
    epic: number;    // e.g. 4.49
    legend: number;  // e.g. 0.50
    mystic: number;  // e.g. 0.01
  };
  bonusDescription: string;
}

export interface OrderRequirement {
  itemId: string;
  requiredCount: number;
}

export interface ChallengeOrder {
  stage: number; // 1 to 10
  title: string;
  clientName: string;
  clientTitle: string;
  avatarEmoji: string;
  story: string;
  requirements: OrderRequirement[];
  coinReward: number;
  bonusRewardTitle: string;
  difficultyLabel: string;
}

export interface GachaCardState {
  index: number;
  item: GachaItem;
  isFlipped: boolean;
  flippedAt?: number;
}

export type CoreType =
  | 'alchemy'
  | 'destiny'
  | 'fortune'
  | 'harvester'
  | 'order'
  | 'channelling'
  | 'miracle'
  | 'enlighten'
  | 'treasury';

export interface CoreLevelBenefit {
  level: number;
  cost: number;
  effectDescription: string;
  statBonus: string;
}

export interface ArcaneCoreConfig {
  id: CoreType;
  name: string;
  title: string;
  iconEmoji: string;
  themeColor: string;
  auraGradient: string;
  borderColor: string;
  glowColor: string;
  description: string;
  maxLevel: number;
  levels: CoreLevelBenefit[];
}
