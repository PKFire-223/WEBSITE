import { UserAccount, UserGameData } from '../types/auth';

/**
 * ============================================================================
 * DỮ LIỆU MẪU (SEED / MOCK DATA) CHO POLYPLAY & SẴN SÀNG CHO MONGODB
 * ============================================================================
 * File này chứa toàn bộ dữ liệu mẫu ban đầu:
 * - Tài khoản người dùng mẫu (kèm Gmail, mật khẩu băm SHA-256, muối salt, mã PIN)
 * - Dữ liệu game khởi tạo ban đầu (Cấp độ, thời gian chơi, vật phẩm kỳ trân)
 * - Hàm đẩy dữ liệu mẫu vào MongoDB (khi cấu hình MongoDB URI hoặc API Backend)
 * - Hàm xuất dữ liệu ra file JSON để import trực tiếp vào MongoDB Compass
 *
 * LƯU Ý THEO YÊU CẦU CỦA BẠN:
 * File này đã được tách biệt độc lập hoàn toàn. Khi hệ thống đã đẩy dữ liệu vào
 * MongoDB thành công và hoạt động thực tế, bạn chỉ cần XÓA file này đi mà không
 * cần phải tìm kiếm hay chỉnh sửa nhiều nơi khác!
 * ============================================================================
 */

export const MOCK_SEED_USERS: UserAccount[] = [
  {
    id: 'user_tester_123',
    username: 'Tester123',
    email: 'buiquang0123@gmail.com', // Gmail chính của Tester/Admin
    displayName: 'Tester123 (VIP)',
    avatarId: 'celestial',
    avatarEmoji: '👑',
    avatarBorder: 'gold',
    customTitle: 'Thánh Hoàng Bất Diệt',
    passwordHash: '4be6eb188d662373b2f91374d93e834720d394e49ec6eda2e93a079d2751b2b6', // Password123@
    salt: 'seed_salt_tester123',
    pinHash: '8aa3616e8e7034c126d9fea91fc7c9eade7e2d2303f7ba7e1c608c286d9349a2', // PIN: 1234
    securityQuestion: 'Pháp bảo hộ thân yêu thích nhất của bạn là gì?',
    securityAnswerHash: 'cde982ae895aa03672d538c3c82b55a4ea888ae27adec6efe34d96c49e9b9fd8',
    createdAt: '24/09/2026',
    lastLoginAt: '25/09/2026',
  },
  {
    id: 'user_polyplay_master',
    username: 'polyplay',
    email: 'polyplay@gmail.com',
    displayName: 'Đại Pháp Sư PolyPlay',
    avatarId: 'mage',
    avatarEmoji: '🧙‍♂️',
    avatarBorder: 'cyan',
    customTitle: 'Vua Trò Chơi PolyPlay',
    passwordHash: '4be6eb188d662373b2f91374d93e834720d394e49ec6eda2e93a079d2751b2b6', // Password123@
    salt: 'seed_salt_tester123',
    pinHash: '8aa3616e8e7034c126d9fea91fc7c9eade7e2d2303f7ba7e1c608c286d9349a2', // PIN: 1234
    securityQuestion: 'Tên sư phụ hoặc đạo quán sơ khởi của bạn?',
    securityAnswerHash: 'cde982ae895aa03672d538c3c82b55a4ea888ae27adec6efe34d96c49e9b9fd8',
    createdAt: '25/09/2026',
    lastLoginAt: '25/09/2026',
  },
];

export const MOCK_SEED_INITIAL_GAME_DATA: UserGameData = {
  coins: 500,
  inventory: {
    item_001: 1,
    item_005: 1,
  },
  discoveredItemIds: ['item_001', 'item_005'],
  shopTierIndex: 0,
  challengeStage: 0,
  playerLevel: 1,
  playTimeSeconds: 0,
  customBio: 'Chinh phục vạn trò chơi trong Bảo Điển Ma Thuật!',
  customAvatarBorder: 'gold',
  customTitle: 'Tân Thủ Nhập Môn',
};

// Seed tester user reference
export const SEED_TESTER_USER: UserAccount = MOCK_SEED_USERS[0];

/**
 * Lấy danh sách tài khoản khởi tạo mẫu (dùng làm fallback khi chưa có MongoDB)
 */
export function getInitialSeedUsers(): UserAccount[] {
  return [...MOCK_SEED_USERS];
}

/**
 * Xuất dữ liệu mẫu ra định dạng JSON sẵn sàng để Import vào MongoDB Compass hoặc mongoimport CLI
 */
export function exportSeedDataAsJSON(): {
  usersJson: string;
  gameDataJson: string;
} {
  return {
    usersJson: JSON.stringify(MOCK_SEED_USERS, null, 2),
    gameDataJson: JSON.stringify(MOCK_SEED_INITIAL_GAME_DATA, null, 2),
  };
}

/**
 * Tải file JSON dữ liệu mẫu về máy tính để Import vào MongoDB Compass
 */
export function downloadSeedDataForMongo(): void {
  const data = {
    database: 'polyplay_db',
    collections: {
      users: MOCK_SEED_USERS,
      initial_game_data: MOCK_SEED_INITIAL_GAME_DATA,
    },
    exportedAt: new Date().toISOString(),
    instruction: 'Import trực tiếp file JSON này vào MongoDB Compass (Collection: users). Sau khi import thành công, bạn có thể xóa file mockSeedData.ts.',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `polyplay_mongodb_seed_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Hàm đẩy dữ liệu mẫu lên MongoDB
 * Hỗ trợ kết nối API Proxy `/api/mongo/seed` hoặc cấu hình chuỗi kết nối MongoDB URI.
 * Nếu chưa có MongoDB URI, hệ thống sẽ tiếp tục sử dụng Dữ liệu tạm (LocalStorage) an toàn.
 */
export async function pushSeedDataToMongoDB(
  options: {
    mongoUri?: string;
    databaseName?: string;
  } = {}
): Promise<{ success: boolean; message: string; seededCount: number; isFallback: boolean }> {
  const uri = options.mongoUri || (typeof process !== 'undefined' ? process.env?.MONGODB_URI : undefined);
  const dbName = options.databaseName || 'polyplay_db';

  if (!uri) {
    // Nếu chưa có kết nối MongoDB, hoạt động ở chế độ Fallback Dữ liệu tạm (LocalStorage)
    console.info(
      `[SeedData] Chưa có MONGODB_URI. Sử dụng dữ liệu tạm LocalStorage (${MOCK_SEED_USERS.length} tài khoản mẫu).`
    );
    return {
      success: true,
      message: `Đang lưu trữ dữ liệu tạm (Fallback LocalStorage). Đã nạp sẵn ${MOCK_SEED_USERS.length} tài khoản mẫu kèm Gmail. Khi có MongoDB URI, bạn có thể đẩy thẳng vào database!`,
      seededCount: MOCK_SEED_USERS.length,
      isFallback: true,
    };
  }

  try {
    console.info(`[SeedData] Đang kết nối tới MongoDB: ${dbName}...`);
    // Gửi request tới backend API proxy seed
    const res = await fetch('/api/mongo/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mongoUri: uri,
        databaseName: dbName,
        users: MOCK_SEED_USERS,
        initialGameData: MOCK_SEED_INITIAL_GAME_DATA,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: 'Đã đẩy dữ liệu mẫu thành công vào MongoDB! Giờ bạn có thể xóa file mockSeedData.ts mà không cần tìm kiếm gì nữa.',
        seededCount: data.insertedCount || MOCK_SEED_USERS.length,
        isFallback: false,
      };
    }

    return {
      success: false,
      message: 'Không thể kết nối API seed MongoDB. Hệ thống tiếp tục dùng dữ liệu tạm.',
      seededCount: 0,
      isFallback: true,
    };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi kết nối MongoDB: ${err instanceof Error ? err.message : String(err)}. Hệ thống tiếp tục dùng dữ liệu tạm.`,
      seededCount: 0,
      isFallback: true,
    };
  }
}
