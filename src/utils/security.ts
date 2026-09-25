import { UserAccount, UserGameData, ACCOUNT_AVATARS } from '../types/auth';

// Web Crypto API SHA-256
export async function sha256(message: string, salt: string = ''): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(message + '::polyplay_salt::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Password strength analyzer
export function evaluatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: string;
  color: string;
  barWidth: string;
} {
  if (!password) {
    return { score: 0, label: 'Chưa nhập', color: 'bg-neutral-600', barWidth: '0%' };
  }

  let points = 0;
  if (password.length >= 6) points += 1;
  if (password.length >= 10) points += 1;
  if (/[0-9]/.test(password)) points += 1;
  if (/[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password)) points += 1;

  switch (points) {
    case 1:
      return { score: 1, label: 'Yếu', color: 'bg-red-500', barWidth: '25%' };
    case 2:
      return { score: 2, label: 'Trung Bình', color: 'bg-yellow-500', barWidth: '50%' };
    case 3:
      return { score: 3, label: 'Mạnh', color: 'bg-emerald-500', barWidth: '75%' };
    case 4:
      return { score: 4, label: 'Cực Kỳ An Toàn', color: 'bg-cyan-400', barWidth: '100%' };
    default:
      return { score: 0, label: 'Rất Yếu (< 6 ký tự)', color: 'bg-rose-700', barWidth: '15%' };
  }
}

// Pre-seeded Tester Account (Username: Tester123 / Password: Password123@ / PIN: 1234)
export const SEED_TESTER_USER: UserAccount = {
  id: 'user_tester_123',
  username: 'Tester123',
  displayName: 'Tester123 (VIP)',
  avatarId: 'celestial',
  avatarEmoji: '👑',
  passwordHash: '4be6eb188d662373b2f91374d93e834720d394e49ec6eda2e93a079d2751b2b6',
  salt: 'seed_salt_tester123',
  pinHash: '8aa3616e8e7034c126d9fea91fc7c9eade7e2d2303f7ba7e1c608c286d9349a2',
  securityQuestion: 'Pháp bảo hộ thân yêu thích nhất của bạn là gì?',
  securityAnswerHash: 'cde982ae895aa03672d538c3c82b55a4ea888ae27adec6efe34d96c49e9b9fd8',
  createdAt: '24/09/2026',
  lastLoginAt: '24/09/2026',
};

// Users Database stored in localStorage
const USERS_DB_KEY = 'polyplay_secure_users_db_v1';
const ACTIVE_USER_ID_KEY = 'polyplay_active_auth_uid';

export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    let users: UserAccount[] = raw ? JSON.parse(raw) : [];
    
    // Auto-seed Tester123 if not present
    if (!users.some(u => u.username.toLowerCase() === 'tester123')) {
      users = [SEED_TESTER_USER, ...users];
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return [SEED_TESTER_USER];
  }
}

export function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export function updateUserAccount(updatedUser: UserAccount): void {
  const users = getAllUsers();
  const nextUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
  saveUsers(nextUsers);
}

export function findUserByUsername(username: string): UserAccount | undefined {
  const users = getAllUsers();
  const normalized = username.trim().toLowerCase();
  return users.find(u => u.username.toLowerCase() === normalized);
}

export function findUserById(id: string): UserAccount | undefined {
  const users = getAllUsers();
  return users.find(u => u.id === id);
}

export function getActiveUserId(): string | null {
  return localStorage.getItem(ACTIVE_USER_ID_KEY);
}

export function setActiveUserId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_USER_ID_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
  }
}

// Security Shield Calculation for an account
export function calculateAccountSecurityRating(user: UserAccount | null): {
  level: 'Khách' | 'Cơ Bản' | 'Tiêu Chuẩn' | 'Tối Cao (Kim Cương)';
  percent: number;
  color: string;
  shieldDesc: string;
  badges: string[];
} {
  if (!user) {
    return {
      level: 'Khách',
      percent: 15,
      color: 'text-amber-500',
      shieldDesc: 'Chế độ tạm thời - Dữ liệu không lưu khi đóng trang web.',
      badges: ['Chưa xác thực', 'Tạm thời'],
    };
  }

  let score = 50; // Registered with password
  const badges = ['Đã Đăng Ký', 'Mật Khẩu Mã Hóa'];

  if (user.pinHash) {
    score += 25;
    badges.push('Mã PIN 4 Số');
  }

  if (user.securityQuestion && user.securityAnswerHash) {
    score += 25;
    badges.push('Câu Hỏi Phục Hồi');
  }

  if (score >= 100) {
    return {
      level: 'Tối Cao (Kim Cương)',
      percent: 100,
      color: 'text-cyan-400',
      shieldDesc: 'Tài khoản được bảo vệ toàn diện với Mật mã, Mã PIN và Câu hỏi cứu hộ.',
      badges,
    };
  } else if (score >= 75) {
    return {
      level: 'Tiêu Chuẩn',
      percent: 75,
      color: 'text-emerald-400',
      shieldDesc: 'Tài khoản được bảo vệ tốt. Bổ sung thêm mã PIN hoặc câu hỏi bảo mật để đạt tối đa.',
      badges,
    };
  } else {
    return {
      level: 'Cơ Bản',
      percent: 50,
      color: 'text-yellow-400',
      shieldDesc: 'Bảo mật cơ bản. Khuyến nghị thiết lập thêm mã PIN 4 số.',
      badges,
    };
  }
}

// =========================================================================
// GUEST VS REGISTERED GAME DATA STORAGE
// "Khách chơi cũng được nhưng khi thoát trang web không lưu lại gì hết"
// =========================================================================

const GUEST_SESSION_KEY = 'polyplay_guest_transient_data';

export const DEFAULT_INITIAL_GAME_DATA: UserGameData = {
  coins: 100,
  inventory: {},
  discoveredItemIds: [],
  shopTierIndex: 0,
  challengeStage: 1,
  playerLevel: 1,
  playTimeSeconds: 0,
  customBio: 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!',
  coreLevels: {
    alchemy: 0,
    destiny: 0,
    fortune: 0,
    harvester: 0,
    order: 0,
    channelling: 0,
    miracle: 0,
    enlighten: 0,
    treasury: 0,
  },
  activeBoonIds: [],
};

// Clear guest data completely on page exit
if (typeof window !== 'undefined') {
  const clearGuestOnExit = () => {
    // If currently not logged in as registered user, clear any guest traces
    if (!getActiveUserId()) {
      sessionStorage.removeItem(GUEST_SESSION_KEY);
      // Clean temporary keys if any
      sessionStorage.clear();
    }
  };

  window.addEventListener('beforeunload', clearGuestOnExit);
  window.addEventListener('pagehide', clearGuestOnExit);
}

// Load Game Data based on whether registered user or guest
export function loadGameData(user: UserAccount | null): UserGameData {
  if (user) {
    // Registered user: persistent in localStorage
    try {
      const saved = localStorage.getItem(`polyplay_user_data_${user.id}`);
      if (saved) {
        return { ...DEFAULT_INITIAL_GAME_DATA, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_INITIAL_GAME_DATA };
  } else {
    // Guest user: ONLY in sessionStorage for the active session, will NOT survive exit!
    try {
      const saved = sessionStorage.getItem(GUEST_SESSION_KEY);
      if (saved) {
        return { ...DEFAULT_INITIAL_GAME_DATA, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_INITIAL_GAME_DATA };
  }
}

// Save Game Data (supports partial updates)
export function saveGameData(user: UserAccount | null, partialData: Partial<UserGameData>): void {
  const current = loadGameData(user);
  const updated: UserGameData = { ...current, ...partialData };
  if (user) {
    // Registered user: save permanently
    localStorage.setItem(`polyplay_user_data_${user.id}`, JSON.stringify(updated));
  } else {
    // Guest user: save ONLY in sessionStorage for the current tab session
    sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));
  }
}

// Purge guest session immediately
export function purgeGuestData(): void {
  sessionStorage.removeItem(GUEST_SESSION_KEY);
}

export const clearGuestTransientData = purgeGuestData;
