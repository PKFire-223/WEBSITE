export type FishType =
  | 'piranha'
  | 'shark'
  | 'hammerhead'
  | 'pufferfish'
  | 'mine'
  | 'squid'
  | 'eel'
  | 'stingray'
  | 'jellyfish'
  | 'crab'
  | 'swordfish'
  | 'ghost_shark'
  | 'anglerfish'
  | 'mantis_shrimp'
  | 'sea_dragon'
  | 'barrel'
  | 'elite_miniboss'
  | 'boss_minion'
  | 'boss_tentacle';

export interface WordTarget {
  id: string;
  word: string;
  typedIndex: number; // How many chars have been typed so far
  x: number;
  y: number;
  targetY: number;
  speed: number;
  type: FishType;
  maxHp: number;
  hp: number;
  goldValue: number;
  radius: number;
  color: string;
  isFrozen?: boolean;
  freezeTimer?: number;
  wobbleOffset: number;
  tailAngle: number;
  isBossPart?: boolean;
  isElite?: boolean;
  eliteName?: string;
  // Special properties
  pufferScale?: number;
  ghostAlpha?: number;
  secondaryWord?: string; // For armored/multi-word targets
  hasShield?: boolean;
}

export type BossId = 'megalodon' | 'kraken' | 'dragon' | 'behemoth' | 'leviathan';

export interface BossState {
  active: boolean;
  bossId: BossId;
  name: string;
  title: string;
  maxHp: number;
  currentHp: number;
  x: number;
  y: number;
  targetY: number;
  phase: number;
  attackTimer: number;
  specialTimer: number;
  isEnraged: boolean;
  wordsPool: string[];
  activeWords: { id: string; word: string; typedIndex: number; offsetX: number; offsetY: number }[];
  shieldActive: boolean;
  shieldWords?: { id: string; word: string; typedIndex: number }[];
  inkActive?: boolean; // Kraken ink cloud
  inkOpacity?: number;
  vortexActive?: boolean; // Leviathan vortex
  iceStormActive?: boolean; // Dragon blizzard
  laserCharging?: boolean; // Behemoth charge
}

export type SubmarineSkinId =
  | 'nautilus'
  | 'megalodon_armor'
  | 'kraken_shadow'
  | 'dragon_azure'
  | 'poseidon_mech'
  | 'void_leviathan';

export interface SubmarineSkin {
  id: SubmarineSkinId;
  name: string;
  description: string;
  unlockedAtBoss: BossId | 'default';
  bodyColor: string;
  trimColor: string;
  glowColor: string;
  icon: string;
}

export type BuffType =
  | 'freeze'
  | 'drone_overclock'
  | 'torpedo_salvo'
  | 'gold_rush'
  | 'invincible_shield'
  | 'bomb_barrage';

export interface ActiveBuff {
  type: BuffType;
  name: string;
  icon: string;
  duration: number; // remaining seconds
  maxDuration: number;
  color: string;
}

export interface OceanZone {
  id: number;
  name: string;
  title: string;
  depthStr: string;
  bgGradTop: string;
  bgGradMid: string;
  bgGradBottom: string;
  causticColor: string;
  causticAlpha: number;
  bubbleColor: string;
}

export interface SkillNode {
  id: string;
  name: string;
  category: 'auto' | 'defense' | 'economy' | 'offense' | 'fleet';
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  maxLevel: number; // 999 for infinite
  icon: string;
  unit: string;
  getCurrentValue: (lvl: number) => number;
  getFormattedValue: (lvl: number) => string;
}

export interface PlayerStats {
  gold: number;
  lifetimeGold: number;
  kills: number;
  bossesKilled: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  maxWpm: number;
  highestMinuteSurvived: number;
  gamesPlayed: number;
  victories: number;
  selectedSkin: SubmarineSkinId;
  unlockedSkins: SubmarineSkinId[];
}

export interface Projectile {
  id: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  targetId: string;
  targetX: number;
  targetY: number;
  speed: number;
  color: string;
  type: 'torpedo' | 'laser' | 'emp' | 'chain' | 'salvo' | 'wingman';
  isAutoDrone?: boolean;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface Bubble {
  x: number;
  y: number;
  speed: number;
  radius: number;
  opacity: number;
  swingOffset: number;
}
