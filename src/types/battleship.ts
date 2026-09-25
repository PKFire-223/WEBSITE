export type DeviceType =
  | 'radar'
  | 'relocate'
  | 'salvo3'
  | 'cluster2x2'
  | 'cross_scan'
  | 'line_sonar'
  | 'double_fire'
  | 'shield'
  | 'torpedo'
  | 'diagonal3'
  | 'deep_probe'
  | 'decoy';

export type ShipOrientation = 'horizontal' | 'vertical';

export type AiDifficulty = 'easy' | 'medium' | 'hard';

export interface DeviceInfo {
  id: DeviceType;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  accentColor: string;
  borderColor: string;
  category: 'attack' | 'recon' | 'defense';
}

export interface ShipTemplate {
  id: string;
  name: string;
  size: number;
  iconEmoji: string;
  badgeColor: string;
  borderColor: string;
  accentGradient: string;
}

export interface PlacedShip {
  id: string;
  name: string;
  size: number;
  cells: Array<{ r: number; c: number }>;
  orientation: ShipOrientation;
  hits: number;
  isSunk: boolean;
  iconEmoji: string;
  badgeColor: string;
}

export interface CellState {
  r: number;
  c: number;
  shipId: string | null;
  isHit: boolean;
  isMiss: boolean;
  radarEcho: boolean; // Detected fuzzy silhouette by radar
  hasShield?: boolean; // Ironclad energy shield absorbing 1 shot
  isDecoy?: boolean; // Decoy beacon tricking radar/AI
}

export type DevicesInventory = Record<DeviceType, number>;

export interface PlayerStats {
  shotsFired: number;
  hits: number;
  shipsDestroyed: number;
  devicesUsed: number;
}

export interface PlayerBoardState {
  id: 'player' | 'ai';
  name: string;
  board: CellState[][];
  ships: PlacedShip[];
  devices: DevicesInventory;
  stats: PlayerStats;
}

export type GamePhase =
  | 'difficulty-select'
  | 'placement'
  | 'battle'
  | 'game-over';

export interface ToastAlert {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'danger' | 'warning';
}

export interface ShotEffect {
  id: string;
  r: number;
  c: number;
  type: 'hit' | 'miss' | 'sunk' | 'salvo' | 'radar';
  target: 'ai' | 'player';
  timestamp: number;
}
