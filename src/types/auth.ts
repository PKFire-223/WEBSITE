export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  avatarId: string;
  avatarEmoji: string;
  passwordHash: string;
  salt: string;
  pinHash: string; // 4-digit PIN hash
  securityQuestion: string;
  securityAnswerHash: string;
  createdAt: string;
  lastLoginAt: string;
  autoLockMinutes?: number;
}

export interface UserGameData {
  coins: number;
  inventory: Record<string, number>;
  discoveredItemIds: string[];
  shopTierIndex: number;
  challengeStage: number;
  playerLevel: number;
  playTimeSeconds: number;
  customBio?: string;
  coreLevels?: Record<string, number>;
  activeBoonIds?: string[];
  pityCounter?: number;
}

export interface AuthState {
  isGuest: boolean;
  user: UserAccount | null;
  isLocked: boolean; // Quick locked with PIN
}

export const SECURITY_QUESTIONS = [
  'Pháp bảo hộ thân yêu thích nhất của bạn là gì?',
  'Tên sư phụ hoặc đạo quán sơ khởi của bạn?',
  'Thần thú ước định đầu tiên của bạn mang tên gì?',
  'Kỳ ngộ ma thuật đáng nhớ nhất của bạn ở đâu?',
  'Mật mã bí truyền truyền đời của gia tộc bạn?',
];

export const ACCOUNT_AVATARS = [
  { id: 'mage', name: 'Đại Pháp Sư', emoji: '🧙‍♂️', color: 'from-amber-500 to-red-600' },
  { id: 'dragon', name: 'Long Thần Cổ', emoji: '🐉', color: 'from-emerald-500 to-teal-700' },
  { id: 'phoenix', name: 'Phượng Hoàng Lửa', emoji: '🔥', color: 'from-orange-500 to-rose-600' },
  { id: 'celestial', name: 'Thần Vương Hư Không', emoji: '👑', color: 'from-purple-500 to-indigo-600' },
  { id: 'shadow', name: 'Bóng Tối Huyền Ảo', emoji: '🥷', color: 'from-slate-700 to-neutral-900' },
  { id: 'thunder', name: 'Lôi Thần Thượng Cổ', emoji: '⚡', color: 'from-yellow-400 to-amber-600' },
  { id: 'healer', name: 'Thánh Nữ Ánh Sáng', emoji: '✨', color: 'from-pink-400 to-purple-600' },
  { id: 'knight', name: 'Kỵ Sĩ Hoàng Kim', emoji: '⚔️', color: 'from-amber-400 to-yellow-600' },
];
