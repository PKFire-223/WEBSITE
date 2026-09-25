export interface GameItem {
  id: string;
  title: string;
  genre?: string;
  thumbnail?: string;
  rating?: number;
  playersCount?: string;
  description?: string;
  badge?: string;
  releaseYear?: string;
  controls?: string[];
  iframeUrl?: string;
  gameType?: 'only-a-fan' | 'snake' | 'block-puzzle' | 'artillery-duel' | 'gacha' | 'battleship' | 'canvas' | 'iframe' | 'custom';
}

export const INITIAL_GAMES: GameItem[] = [
  {
    id: 'battleship-game',
    title: 'Hải Chiến Bắn Tàu: Naval Command',
    genre: 'Chiến thuật hải quân • Đấu AI / 2 Người',
    thumbnail: '/covers/battleship.svg',
    rating: 5.0,
    playersCount: '64.2k',
    description: 'Bắn tàu chiến thuật hải quân đỉnh cao! Đấu AI thông minh hoặc 2 người chung máy. Mỗi bên 4 tàu ngẫu nhiên cùng kích cỡ. Sở hữu 3 siêu thiết bị: Radar quét 3x3, Đổi vị trí cơ động tàu, Oanh tạc 3 ô! Bắn chìm 1 tàu thưởng ngay +1 thiết bị ngẫu nhiên. Bấm phím R để xoay tàu.',
    badge: 'MỚI RA MẮT',
    releaseYear: '2026',
    controls: [
      'Click chọn tọa độ bắn ô',
      'Phím R / Nút Xoay: Đổi chiều ngang/dọc',
      'Radar: Quét 3x3 phát hiện tàu mờ',
      'Đổi Vị Trí: Cơ động tàu chưa trúng đạn',
      'Oanh Tạc: Bắn 3 ô ngang hoặc dọc liên tiếp',
      'Hạ 1 tàu: Thưởng +1 thiết bị ngẫu nhiên'
    ],
    gameType: 'battleship'
  },
  {
    id: 'gacha-game',
    title: 'Vạn Cổ Kỳ Trân: Gacha Bí Chỉ',
    genre: 'Gacha 120 Vật Phẩm • Đơn Hàng Thử Thách',
    thumbnail: '/covers/gacha.svg',
    rating: 5.0,
    playersCount: '98.6k',
    description: 'Vòng quay kỳ trân 120 bảo vật từ Common đến Mystic Thần Thoại! Quay x1 chỉ 2đ, x10 20đ. Nâng cấp cửa hàng 6 bậc, hoàn thành 10 đợt chiếu chỉ cuộn giấy nhận quà khủng.',
    badge: 'MỚI CỰC HOT',
    releaseYear: '2026',
    controls: ['Quay x1: 2 Đồng', 'Quay x10: 20 Đồng', 'Nút Lật Nhanh (Skip 10 thẻ)', 'Rút Cuộn Giấy: 10 Đợt Đơn Hàng Thử Thách', 'Nâng Cấp Cửa Hàng 6 Bậc'],
    gameType: 'gacha'
  },
  {
    id: 'only-a-fan',
    title: 'OnlyaFan',
    genre: 'Sinh tồn • Phản xạ',
    thumbnail: '/covers/onlyafan.svg',
    rating: 5.0,
    playersCount: '15.2k',
    description: 'Duy trì năng lượng cho cây quạt quay giữa trung tâm. Nhấp vào Gió và Sét kịp thời trong 4 giây để nạp thời gian trước khi quạt ngừng quay!',
    badge: 'HOT',
    releaseYear: '2026',
    controls: ['Click chuột vào Gió (+10đ, +20s)', 'Click chuột vào Sét (+20đ, +40s)', 'Quạt quay: +1đ/giây'],
    gameType: 'only-a-fan'
  },
  {
    id: 'snake-game',
    title: 'Rắn Săn Mồi',
    genre: 'Cổ điển • Chiến thuật',
    thumbnail: '/covers/snake.svg',
    rating: 4.9,
    playersCount: '28.4k',
    description: 'Điều khiển rắn săn táo trên bàn cờ. Sau 30 giây sẽ có bom, đá, tường phong tỏa và chớp tối màn hình đầy kịch tính!',
    badge: 'MỚI',
    releaseYear: '2026',
    controls: ['Phím Mũi tên / W-A-S-D để di chuyển', 'Ăn Táo: Tăng điểm & độ dài', 'Né Bom & Đá!'],
    gameType: 'snake'
  },
  {
    id: 'block-puzzle',
    title: 'Xếp Khối Ma Thuật',
    genre: 'Giải đố • Xếp khối nổ dòng',
    thumbnail: '/covers/blockpuzzle.svg',
    rating: 5.0,
    playersCount: '32.1k',
    description: 'Xếp các khối ngọc ma thuật lên bàn cờ 8x8. Lấp đầy bất kỳ cột hoặc hàng nào để kích nổ tan biến và tạo chuỗi Combo ghi điểm kỷ lục!',
    badge: 'SIÊU HOT',
    releaseYear: '2026',
    controls: ['Chạm chọn khối bên dưới', 'Chạm vào vị trí ô trên bàn cờ để đặt', 'Lấp đầy cả hàng hoặc cả cột để nổ!'],
    gameType: 'block-puzzle'
  },
  {
    id: 'artillery-duel',
    title: 'Đấu Pháo Ma Pháp: AI Duel',
    genre: 'Bắn tọa độ theo lượt • Huấn luyện AI',
    thumbnail: '/covers/artilleryduel.svg',
    rating: 5.0,
    playersCount: '45.8k',
    description: 'Đại chiến ném pháo ma thuật theo lượt! Căn góc, chỉnh lực và tính hướng gió để ném đạn parabol sang hạ gục đối thủ AI được huấn luyện thuật toán!',
    badge: 'ĐỐI ĐẦU AI',
    releaseYear: '2026',
    controls: ['Kéo chuột / Phím mũi tên chỉnh góc & lực', 'Chọn vũ khí ma pháp', 'Ném đạn theo lượt, ai hết máu trước thì thua!'],
    gameType: 'artillery-duel'
  }
];

export const TOTAL_DEFAULT_SLOTS = 8;
