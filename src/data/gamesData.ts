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
  gameType?: 'only-a-fan' | 'snake' | 'block-puzzle' | 'artillery-duel' | 'canvas' | 'iframe' | 'custom';
}

export const INITIAL_GAMES: GameItem[] = [
  {
    id: 'only-a-fan',
    title: 'OnlyaFan',
    genre: 'Sinh tồn • Phản xạ',
    thumbnail: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
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
    thumbnail: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=800&q=80',
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
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
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
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
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
