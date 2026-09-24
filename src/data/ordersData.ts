import { ChallengeOrder } from '../types/gacha';

export const CHALLENGE_ORDERS: ChallengeOrder[] = [
  {
    stage: 1,
    title: 'Đợt 1: Lệnh Do Thám Của Đội Trưởng',
    clientName: 'Đội Trưởng Lính Gác Valen',
    clientTitle: 'Tiền đồn Thung Lũng Xanh',
    avatarEmoji: '🛡️',
    story: 'Các tân binh tuần tra thiếu thốn trang bị sắt thép. Ta cần các ngươi gom gấp một số vũ khí sắt rỉ và dược thảo chữa vết thương nhỏ.',
    requirements: [
      { itemId: 'item-001', requiredCount: 2 }, // Kiếm Rỉ Sét Cổ Đại
      { itemId: 'item-049', requiredCount: 2 }, // Bình Dược Hồi Phục Nhỏ
    ],
    coinReward: 15,
    bonusRewardTitle: 'Huy Chương Tân Binh + 15 Đồng',
    difficultyLabel: 'Dễ (Khởi Đầu)',
  },
  {
    stage: 2,
    title: 'Đợt 2: Đơn Hàng Thương Lữ Rừng Sương',
    clientName: 'Thương Nhân Elric',
    clientTitle: 'Hội Buôn Đất Thấp',
    avatarEmoji: '🧳',
    story: 'Đoàn xe thương đội chuẩn bị vượt qua đầm lầy quái vật. Chúng ta cần thêm khiên gỗ bảo hộ và da thú để chuẩn bị lều trại trú bão tuyết.',
    requirements: [
      { itemId: 'item-004', requiredCount: 2 }, // Khiên Gỗ Bạch Dương
      { itemId: 'item-025', requiredCount: 3 }, // Móng Vuốt Yêu Miêu
      { itemId: 'item-051', requiredCount: 2 }, // Rễ Cây Ma Trảo Đất
    ],
    coinReward: 35,
    bonusRewardTitle: 'Túi Tiền Phồn Vinh + 35 Đồng',
    difficultyLabel: 'Cơ Bản',
  },
  {
    stage: 3,
    title: 'Đợt 3: Đội Tiên Phong Săn Ma Thú',
    clientName: 'Nữ Thợ Săn Lyra',
    clientTitle: 'Hội Săn Rừng Cấm',
    avatarEmoji: '🏹',
    story: 'Bầy dạ lang bắt đầu tràn xuống đồi phía bắc. Ta cần kiếm thép tôi luyện sắc bén cùng cung tên và lông vũ quạ đen để cảnh báo từ xa.',
    requirements: [
      { itemId: 'item-009', requiredCount: 1 }, // Trường Kiếm Tinh Thép (Rare)
      { itemId: 'item-005', requiredCount: 3 }, // Cung Tên Thợ Săn
      { itemId: 'item-026', requiredCount: 3 }, // Lông Vũ Quạ Đen Cổ
    ],
    coinReward: 70,
    bonusRewardTitle: 'Huy Hiệu Thiện Xạ + 70 Đồng',
    difficultyLabel: 'Trung Bình',
  },
  {
    stage: 4,
    title: 'Đợt 4: Lò Rèn Bí Thuật Hoàng Gia',
    clientName: 'Đại Sư Rèn Torvald',
    clientTitle: 'Viện Công Nghệ Lửa Đỏ',
    avatarEmoji: '⚒️',
    story: 'Lò rèn đang thiếu quặng lưu huỳnh núi lửa và các phiến đá phù văn để kích hoạt mạch dẫn nhiệt luyện vũ khí hiếm cho binh đoàn.',
    requirements: [
      { itemId: 'item-012', requiredCount: 1 }, // Liên Hoàn Giáp Huyền Thiết (Rare)
      { itemId: 'item-052', requiredCount: 4 }, // Bột Lưu Huỳnh Núi Lửa
      { itemId: 'item-073', requiredCount: 3 }, // Đá Khắc Phù Văn Cơ Bản
    ],
    coinReward: 150,
    bonusRewardTitle: 'Búa Vàng Rèn Thần + 150 Đồng',
    difficultyLabel: 'Trung Bình Khá',
  },
  {
    stage: 5,
    title: 'Đợt 5: Đại Lễ Tế Tự Đền Ánh Sáng',
    clientName: 'Đại Nữ Tế Seraphina',
    clientTitle: 'Thánh Điện Thái Dương',
    avatarEmoji: '✨',
    story: 'Mặt trời chuẩn bị nhật thực toàn phần. Tà khí sẽ trỗi dậy! Chúng ta cần nước thánh đại hồi phục và bảo kính cổ tự để soi rọi ma chướng.',
    requirements: [
      { itemId: 'item-057', requiredCount: 2 }, // Đại Hồi Phục Thánh Thủy (Rare)
      { itemId: 'item-018', requiredCount: 1 }, // Gương Soi Linh Hồn Cổ Tự (Epic)
      { itemId: 'item-014', requiredCount: 2 }, // Chiếc Nhẫn Ngọc Mắt Hổ (Rare)
    ],
    coinReward: 320,
    bonusRewardTitle: 'Vòng Hào Quang Thánh Điện + 320 Đồng',
    difficultyLabel: 'Thử Thách',
  },
  {
    stage: 6,
    title: 'Đợt 6: Chiêm Tinh Đài Kích Hoạt Mật Trận',
    clientName: 'Thiên Văn Trưởng Morpheus',
    clientTitle: 'Học Viện Tinh Tú Tối Cao',
    avatarEmoji: '🪐',
    story: 'Dải ngân hà dịch chuyển lệch trục 3 khắc. Cần gấp bản đồ thiên hà cổ cùng phù văn sấm sét và đồng hồ cát thời gian để căn chỉnh lại vòm trời!',
    requirements: [
      { itemId: 'item-083', requiredCount: 2 }, // Bản Đồ Thiên Hà Bạc (Rare)
      { itemId: 'item-088', requiredCount: 1 }, // Trận Đồ Cửu Cung Phong Lôi (Epic)
      { itemId: 'item-085', requiredCount: 2 }, // Đồng Hồ Cát Thời Không (Rare)
    ],
    coinReward: 650,
    bonusRewardTitle: 'Viên Ngọc Tinh Cầu + 650 Đồng',
    difficultyLabel: 'Gian Nan',
  },
  {
    stage: 7,
    title: 'Đợt 7: Binh Đoàn Diệt Long Vực Sâu',
    clientName: 'Long Kỵ Sĩ Trưởng Ignis',
    clientTitle: 'Quân Đoàn Hỏa Diễm',
    avatarEmoji: '🐲',
    story: 'Cự long thức giấc phun trào biển lửa nghìn trượng. Cần gấp trái tim rồng dung nham cùng chiến bào phượng hoàng tro để chống chọi địa hỏa!',
    requirements: [
      { itemId: 'item-040', requiredCount: 1 }, // Trái Tim Rồng Dung Nham (Epic)
      { itemId: 'item-017', requiredCount: 1 }, // Chiến Bào Phượng Hoàng Tro (Epic)
      { itemId: 'item-019', requiredCount: 1 }, // Lôi Đình Cuồng Kích Búa (Epic)
    ],
    coinReward: 1200,
    bonusRewardTitle: 'Cờ Hiệu Long Kỵ Chiến Soái + 1,200 Đồng',
    difficultyLabel: 'Khắc Nghiệt',
  },
  {
    stage: 8,
    title: 'Đợt 8: Chiếu Chỉ Triều Đình Phong Tướng',
    clientName: 'Thừa Tướng Gia Cát Vũ',
    clientTitle: 'Hoàng Cung Thượng Giới',
    avatarEmoji: '📜',
    story: 'Hoàng đế chuẩn bị phong soái xuất chinh phạt ma. Cần gom đủ Hiên Viên Hoàng Kim Kiếm trấn quốc cùng đan dược bất tử và đỉnh đồng thượng cổ!',
    requirements: [
      { itemId: 'item-022', requiredCount: 1 }, // Hiên Viên Hoàng Kim Kiếm (Legend)
      { itemId: 'item-064', requiredCount: 1 }, // Kim Đan Bất Tử Bát Quái (Epic)
      { itemId: 'item-065', requiredCount: 1 }, // Lò Luyện Đan Tử Đỉnh (Epic)
    ],
    coinReward: 2500,
    bonusRewardTitle: 'Ấn Tín Thượng Thư Thái Phó + 2,500 Đồng',
    difficultyLabel: 'Cực Khó',
  },
  {
    stage: 9,
    title: 'Đợt 9: Đại Phong Ấn Cửu Cực Thần Điện',
    clientName: 'Hư Không Giám Quản Chrono',
    clientTitle: 'Điện Thờ Vạn Niên Vô Tận',
    avatarEmoji: '⚡',
    story: 'Vết nứt không thời gian đang rách toạc nuốt chửng lục địa. Phải hiến tế đồng hồ thời gian Chronos cùng trứng Huyền Vũ thần thú và sát trận Tru Tiên để hàn gắn!',
    requirements: [
      { itemId: 'item-094', requiredCount: 1 }, // Đồng Hồ Thời Không Chronos (Legend)
      { itemId: 'item-046', requiredCount: 1 }, // Thần Thú Trứng Huyền Vũ (Legend)
      { itemId: 'item-095', requiredCount: 1 }, // Trận Đồ Tru Tiên Thượng Cổ (Legend)
    ],
    coinReward: 5000,
    bonusRewardTitle: 'Thánh Thuẫn Hư Không Vĩnh Hằng + 5,000 Đồng',
    difficultyLabel: 'Huyền Thoại Tối Thượng',
  },
  {
    stage: 10,
    title: 'Đợt 10: MẬT CHỈ VẠN CỔ CHI VƯƠNG (ĐỢT CUỐI)',
    clientName: 'Vạn Cổ Đấng Sáng Tạo',
    clientTitle: 'Chủ Nhân Của Thực Tại & Vũ Trụ',
    avatarEmoji: '👑',
    story: 'Ngươi đã vượt qua 9 kiếp nạn thử thách. Đây là thánh chiếu tối hậu: hãy dâng lên Thần Nhãn Hư Không Bất Diệt (hoặc Báu Vật Thần Thoại Mystic bất kỳ) cùng Thần Binh Tối Thượng để đắc đạo quy vị Chí Tôn Vạn Cổ!',
    requirements: [
      { itemId: 'item-116', requiredCount: 1 }, // Hư Không Thần Nhãn Bất Diệt (Mystic)
      { itemId: 'item-070', requiredCount: 1 }, // Hòn Đá Triết Gia Bất Diệt (Legend)
      { itemId: 'item-023', requiredCount: 1 }, // Long Lân Thánh Khải Quang Minh (Legend)
    ],
    coinReward: 10000,
    bonusRewardTitle: 'VƯƠNG MIỆN THẦN THOẠI CHÍ TÔN + 10,000 ĐỒNG + CHIẾN THẮNG TRỌN VẸN',
    difficultyLabel: 'TỐI HẬU THẦN THOẠI',
  },
];
