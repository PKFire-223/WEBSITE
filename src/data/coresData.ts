import { ArcaneCoreConfig, CoreType } from '../types/gacha';

export const ARCANE_CORES: Record<CoreType, ArcaneCoreConfig> = {
  // ==========================================
  // STAGE 1 (3 Cores) - MỞ KHÓA TỪ ĐẦU
  // ==========================================
  alchemy: {
    id: 'alchemy',
    name: 'Lõi Giả Kim',
    title: 'Vạn Vật Quy Kim Luyện Đan',
    iconEmoji: '⚗️',
    themeColor: 'from-emerald-500 to-teal-400',
    auraGradient: 'from-emerald-600/30 via-teal-800/20 to-neutral-950',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/30',
    description: 'Chuyển hóa tạp chất thành tinh kim, tăng vĩnh viễn giá trị bán lại của mọi phẩm cấp báu vật!',
    maxLevel: 5,
    requiredStage: 1,
    category: 'economy',
    levels: [
      { level: 1, cost: 60, effectDescription: 'Tăng +20% giá bán lại cho tất cả báu vật (Common 1.2đ, Rare 4.8đ).', statBonus: '+20% Giá Bán' },
      { level: 2, cost: 180, effectDescription: 'Tăng +40% giá bán lại (Common 1.4đ, Rare 5.6đ, Epic 28đ).', statBonus: '+40% Giá Bán' },
      { level: 3, cost: 480, effectDescription: 'Tăng +65% giá bán lại (Common 1.65đ, Rare 6.6đ, Epic 33đ).', statBonus: '+65% Giá Bán' },
      { level: 4, cost: 1200, effectDescription: 'Tăng +90% giá bán lại (Common 1.9đ, Rare 7.6đ, Legend 380đ).', statBonus: '+90% Giá Bán' },
      { level: 5, cost: 2800, effectDescription: 'TỐI THƯỢNG: Tăng +120% giá bán lại! (Common 2.2đ, Rare 8.8đ, Epic 44đ, Legend 440đ, Mystic 2,200đ).', statBonus: '+120% Giá Bán Cực Hạn' },
    ],
  },

  destiny: {
    id: 'destiny',
    name: 'Lõi Vận Mệnh',
    title: 'Thiên Cung Vận Khí Tối Thượng',
    iconEmoji: '👁️',
    themeColor: 'from-amber-500 to-yellow-300',
    auraGradient: 'from-amber-600/30 via-yellow-700/20 to-neutral-950',
    borderColor: 'border-amber-500/50',
    glowColor: 'shadow-amber-500/30',
    description: 'Bóp méo xác suất tự nhiên, tăng đột biến tỉ lệ xuất hiện thẻ Huyền Thoại và Thần Thoại mà không cần dựa dẫm vào may rủi thông thường!',
    maxLevel: 5,
    requiredStage: 1,
    category: 'drop',
    levels: [
      { level: 1, cost: 75, effectDescription: 'Tăng +25% tỉ lệ xuất hiện thẻ Epic & Legend ở mọi bậc cửa hàng.', statBonus: '+25% Tỉ Lệ Epic/Legend' },
      { level: 2, cost: 220, effectDescription: 'Tăng +50% tỉ lệ Legend, TĂNG GẤP ĐÔI (2x) tỉ lệ rớt Thần Thoại (Mystic).', statBonus: '2x Mystic & +50% Legend' },
      { level: 3, cost: 550, effectDescription: 'Tăng +80% tỉ lệ Legend, tăng GẤP 2.8 LẦN tỉ lệ rớt Thần Thoại Mystic.', statBonus: '2.8x Mystic & +80% Legend' },
      { level: 4, cost: 1400, effectDescription: 'Tăng +120% tỉ lệ Legend, tăng GẤP 3.5 LẦN tỉ lệ Mystic (Shop bậc 6 đạt trên 12% Mystic!).', statBonus: '3.5x Mystic & +120% Legend' },
      { level: 5, cost: 3200, effectDescription: 'CHÂN MỆNH THIÊN TỬ: Tăng GẤP 4.5 LẦN Mystic, nhân đôi tỉ lệ Legend, giảm mạnh thẻ Common!', statBonus: '4.5x Mystic Tối Thượng' },
    ],
  },

  fortune: {
    id: 'fortune',
    name: 'Lõi Thần Tài',
    title: 'Kim Ngân Tụ Bảo Chiêu Tài',
    iconEmoji: '🪙',
    themeColor: 'from-yellow-400 to-amber-500',
    auraGradient: 'from-yellow-500/30 via-amber-700/20 to-neutral-950',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/30',
    description: 'Ân huệ từ Kim Thần, ban cho cơ hội quay Gacha hoàn tiền 100% hoặc kích hoạt NỔ HŨ THẦN TÀI x3 tiền thưởng!',
    maxLevel: 5,
    requiredStage: 1,
    category: 'economy',
    levels: [
      { level: 1, cost: 70, effectDescription: '15% cơ hội quay được Thần Tài Hoàn Tiền 100% (miễn phí lượt quay).', statBonus: '15% Hoàn Tiền Gacha' },
      { level: 2, cost: 200, effectDescription: '25% cơ hội quay được Thần Tài Hoàn Tiền 100%.', statBonus: '25% Hoàn Tiền Gacha' },
      { level: 3, cost: 500, effectDescription: '35% cơ hội quay được Thần Tài Hoàn Tiền 100%.', statBonus: '35% Hoàn Tiền Gacha' },
      { level: 4, cost: 1250, effectDescription: '45% cơ hội quay Hoàn Tiền + 10% cơ hội NỔ HŨ THẦN TÀI (Hoàn x2 chi phí).', statBonus: '45% Hoàn Tiền & 10% Nổ Hũ x2' },
      { level: 5, cost: 2900, effectDescription: 'ĐẠI THẦN TÀI HIỂN LINH: 50% Hoàn Tiền + 20% NỔ HŨ HOÀNG KIM (Nhận gấp 3 LẦN 3x tiền quay!).', statBonus: '50% Hoàn Tiền & 20% Nổ Hũ x3' },
    ],
  },

  // ==========================================
  // STAGE 2 (3 Cores) - MỞ KHÓA TẠI ĐỢT 2
  // ==========================================
  roll_surge: {
    id: 'roll_surge',
    name: 'Lõi Tụ Khí Roll',
    title: 'Khí Hải Đột Phá Thêm Thẻ Bốc',
    iconEmoji: '🌀',
    themeColor: 'from-cyan-400 to-indigo-500',
    auraGradient: 'from-cyan-600/30 via-indigo-800/20 to-neutral-950',
    borderColor: 'border-cyan-500/50',
    glowColor: 'shadow-cyan-500/30',
    description: 'TĂNG TRỰC TIẾP LƯỢT ROLL! Khi quay 10 lần, tự động bốc thêm từ 1 đến 5 thẻ hoàn toàn miễn phí mà không tốn thêm đồng nào!',
    maxLevel: 5,
    requiredStage: 2,
    category: 'roll',
    levels: [
      { level: 1, cost: 90, effectDescription: 'Quay 10 lần được bốc 11 thẻ (Tặng thêm +1 thẻ bốc miễn phí).', statBonus: 'Quay 10 nhận 11 thẻ (+1)' },
      { level: 2, cost: 260, effectDescription: 'Quay 10 lần được bốc 12 thẻ (Tặng thêm +2 thẻ bốc miễn phí).', statBonus: 'Quay 10 nhận 12 thẻ (+2)' },
      { level: 3, cost: 650, effectDescription: 'Quay 10 lần được bốc 13 thẻ (Tặng thêm +3 thẻ bốc miễn phí).', statBonus: 'Quay 10 nhận 13 thẻ (+3)' },
      { level: 4, cost: 1500, effectDescription: 'Quay 10 lần được bốc 14 thẻ (Tặng thêm +4 thẻ bốc miễn phí).', statBonus: 'Quay 10 nhận 14 thẻ (+4)' },
      { level: 5, cost: 3200, effectDescription: 'ĐẠI TỤ KHÍ CỰC HẠN: Quay 10 lần được bốc tới 15 THẺ! (Tặng miễn phí 5 thẻ, tiết kiệm 50% chi phí).', statBonus: 'Quay 10 nhận 15 THẺ (+5)' },
    ],
  },

  harvester: {
    id: 'harvester',
    name: 'Lõi Bội Thu',
    title: 'Phồn Vinh Lục Đạo Sinh Sôi',
    iconEmoji: '🌾',
    themeColor: 'from-lime-400 to-emerald-600',
    auraGradient: 'from-lime-500/30 via-emerald-800/20 to-neutral-950',
    borderColor: 'border-lime-500/50',
    glowColor: 'shadow-lime-500/30',
    description: 'Bảo vật sinh sôi nảy nở, xác suất nhân đôi x2 hoặc thậm chí nhân ba x3 số lượng đồ nhận được khi bốc trúng!',
    maxLevel: 5,
    requiredStage: 2,
    category: 'drop',
    levels: [
      { level: 1, cost: 65, effectDescription: '18% xác suất nhân đôi x2 số lượng báu vật Common/Rare khi quay trúng.', statBonus: '18% x2 Drop Rate' },
      { level: 2, cost: 190, effectDescription: '32% xác suất nhân đôi x2 Common/Rare, 10% nhân đôi Epic.', statBonus: '32% x2 Common/Rare & 10% Epic' },
      { level: 3, cost: 480, effectDescription: '45% xác suất nhân đôi x2 Common/Rare, 20% nhân đôi Epic.', statBonus: '45% x2 Common/Rare & 20% Epic' },
      { level: 4, cost: 1150, effectDescription: '60% cơ hội nhân đôi x2 Common/Rare, 35% nhân đôi Epic, 12% nhân đôi Legend.', statBonus: '60% x2 & 12% Legend x2' },
      { level: 5, cost: 2700, effectDescription: 'VẠN VẬT BỘI THU: 75% nhân đôi x2, 25% nhân đôi Legend/Mystic, và 15% cơ hội kích hoạt NHÂN BA (x3)!', statBonus: '75% x2 & 15% Nhân Ba x3' },
    ],
  },

  order: {
    id: 'order',
    name: 'Lõi Khế Ước',
    title: 'Thánh Chỉ Hoàn Thành Đơn Hàng',
    iconEmoji: '📜',
    themeColor: 'from-orange-500 to-amber-600',
    auraGradient: 'from-orange-600/30 via-amber-800/20 to-neutral-950',
    borderColor: 'border-orange-500/50',
    glowColor: 'shadow-orange-500/30',
    description: 'Gia tăng mạnh mẽ phần thưởng kim ngân nhận được khi hoàn thành 10 Đợt Đơn Hàng Bí Chỉ cuộn giấy!',
    maxLevel: 5,
    requiredStage: 2,
    category: 'economy',
    levels: [
      { level: 1, cost: 50, effectDescription: 'Tăng +25% tiền thưởng khi giao nộp hoàn tất bất kỳ Đơn Hàng Bí Chỉ nào.', statBonus: '+25% Thưởng Bí Chỉ' },
      { level: 2, cost: 160, effectDescription: 'Tăng +50% tiền thưởng khi hoàn thành Đơn Hàng Bí Chỉ.', statBonus: '+50% Thưởng Bí Chỉ' },
      { level: 3, cost: 420, effectDescription: 'Tăng +80% tiền thưởng khi hoàn thành Đơn Hàng Bí Chỉ.', statBonus: '+80% Thưởng Bí Chỉ' },
      { level: 4, cost: 1000, effectDescription: 'Tăng +120% tiền thưởng khi hoàn thành Đơn Hàng Bí Chỉ.', statBonus: '+120% Thưởng Bí Chỉ' },
      { level: 5, cost: 2500, effectDescription: 'KHẾ ƯỚC HOÀNG GIA: Tăng +160% tiền thưởng Bí Chỉ (Đợt 10 nhận tới 26,000 Đồng!).', statBonus: '+160% Thưởng Bí Chỉ' },
    ],
  },

  // ==========================================
  // STAGE 3 (3 Cores) - MỞ KHÓA TẠI ĐỢT 3
  // ==========================================
  free_roll: {
    id: 'free_roll',
    name: 'Lõi Thiên Lực',
    title: 'Thiên Đạo Ban Tặng Roll Miễn Phí',
    iconEmoji: '🎫',
    themeColor: 'from-sky-400 to-blue-500',
    auraGradient: 'from-sky-600/30 via-blue-800/20 to-neutral-950',
    borderColor: 'border-sky-500/50',
    glowColor: 'shadow-sky-500/30',
    description: 'Tặng thêm lượt quay miễn phí liên hoàn! Mỗi lần quay thẻ có tỉ lệ kích hoạt Thiên Lực ban tặng thêm 1 đến 3 thẻ quay miễn phí lập tức!',
    maxLevel: 5,
    requiredStage: 3,
    category: 'roll',
    levels: [
      { level: 1, cost: 100, effectDescription: '15% cơ hội mỗi lần quay được tặng thêm 1 thẻ quay miễn phí lập tức.', statBonus: '15% Tặng +1 Thẻ Roll' },
      { level: 2, cost: 280, effectDescription: '25% cơ hội được tặng thêm 1 thẻ quay miễn phí.', statBonus: '25% Tặng +1 Thẻ Roll' },
      { level: 3, cost: 700, effectDescription: '35% cơ hội được tặng thêm 1-2 thẻ quay miễn phí.', statBonus: '35% Tặng +1~2 Thẻ Roll' },
      { level: 4, cost: 1600, effectDescription: '45% cơ hội được tặng thêm 2 thẻ quay miễn phí.', statBonus: '45% Tặng +2 Thẻ Roll' },
      { level: 5, cost: 3400, effectDescription: 'THIÊN LỰC VÔ TẬN: 55% tặng 2 thẻ, 20% kích hoạt SIÊU VÒNG QUAY tặng thêm 5 THẺ bốc miễn phí!', statBonus: '55% Tặng +2~5 Thẻ Roll' },
    ],
  },

  channelling: {
    id: 'channelling',
    name: 'Lõi Pháp Điển',
    title: 'Tiết Giảm Linh Khí Chi Phí',
    iconEmoji: '⚡',
    themeColor: 'from-cyan-400 to-blue-600',
    auraGradient: 'from-cyan-600/30 via-blue-800/20 to-neutral-950',
    borderColor: 'border-cyan-500/50',
    glowColor: 'shadow-cyan-500/30',
    description: 'Luyện khí tối ưu pháp trận, giảm vĩnh viễn chi phí quay 10 lần và giảm giá nâng cấp Cửa Hàng Shop Tier!',
    maxLevel: 5,
    requiredStage: 3,
    category: 'economy',
    levels: [
      { level: 1, cost: 80, effectDescription: 'Giảm 10% chi phí nâng cấp Bậc Cửa Hàng Shop Tier.', statBonus: '-10% Giá Shop Tier' },
      { level: 2, cost: 240, effectDescription: 'Giảm chi phí quay 10 lần từ 20đ xuống 19đ; giảm 20% chi phí nâng Shop Tier.', statBonus: 'Quay x10 chỉ 19🪙 (-20% Shop)' },
      { level: 3, cost: 600, effectDescription: 'Giảm chi phí quay 10 lần xuống 18đ; giảm 30% chi phí nâng Shop Tier.', statBonus: 'Quay x10 chỉ 18🪙 (-30% Shop)' },
      { level: 4, cost: 1400, effectDescription: 'Giảm chi phí quay 10 lần xuống 16đ; giảm 40% chi phí nâng Shop Tier.', statBonus: 'Quay x10 chỉ 16🪙 (-40% Shop)' },
      { level: 5, cost: 3000, effectDescription: 'TIẾT KIỆM TỐI THƯỢNG: Quay 10 lần CHỈ 15 ĐỒNG (tiết kiệm 25%), giảm 50% nâng Shop Tier!', statBonus: 'Quay x10 CHỈ 15🪙 (-50% Shop)' },
    ],
  },

  miracle: {
    id: 'miracle',
    name: 'Lõi Kỳ Tích',
    title: 'Thiên Giáng Điềm Lành Bùng Nổ',
    iconEmoji: '✨',
    themeColor: 'from-purple-400 to-pink-600',
    auraGradient: 'from-purple-600/30 via-pink-800/20 to-neutral-950',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30',
    description: 'Mỗi khi bốc trúng thẻ Sử Thi (Epic), Huyền Thoại hoặc Thần Thoại, nhận ngay tiền thưởng nóng bùng nổ!',
    maxLevel: 5,
    requiredStage: 3,
    category: 'drop',
    levels: [
      { level: 1, cost: 75, effectDescription: 'Mỗi thẻ Epic trở lên bốc được thưởng nóng thêm +10 Đồng vào ngân khố.', statBonus: 'Epic+ Thưởng Nóng +10🪙' },
      { level: 2, cost: 220, effectDescription: 'Epic thưởng nóng +20 Đồng; Legend/Mystic thưởng nóng +60 Đồng.', statBonus: 'Epic +20🪙 | Legend +60🪙' },
      { level: 3, cost: 550, effectDescription: 'Epic thưởng nóng +35 Đồng; Legend nhận +120 Đồng; Mystic nhận +300 Đồng.', statBonus: 'Legend +120🪙 | Mystic +300🪙' },
      { level: 4, cost: 1350, effectDescription: 'Epic thưởng nóng +60 Đồng; Legend nhận +250 Đồng; Mystic nhận +600 Đồng.', statBonus: 'Legend +250🪙 | Mystic +600🪙' },
      { level: 5, cost: 3200, effectDescription: 'BÃO MA THUẬT KỲ TÍCH: Epic +100 Đồng; Legend +500 Đồng; Mystic thưởng cực đại +1,500 Đồng!', statBonus: 'Mystic Thưởng Nóng +1500🪙' },
    ],
  },

  // ==========================================
  // STAGE 4 (3 Cores) - MỞ KHÓA TẠI ĐỢT 4
  // ==========================================
  enlighten: {
    id: 'enlighten',
    name: 'Lõi Giác Ngộ',
    title: 'Tinh Hoa Tái Sinh Đồ Trùng',
    iconEmoji: '🔮',
    themeColor: 'from-indigo-400 to-violet-600',
    auraGradient: 'from-indigo-600/30 via-violet-800/20 to-neutral-950',
    borderColor: 'border-indigo-500/50',
    glowColor: 'shadow-indigo-500/30',
    description: 'Mỗi khi bốc trúng món đã có trong kho, chuyển hóa tinh hoa đồ trùng thành tiền mặt tức thì!',
    maxLevel: 5,
    requiredStage: 4,
    category: 'economy',
    levels: [
      { level: 1, cost: 60, effectDescription: 'Mỗi món trùng lặp bốc trúng lập tức hoàn lại +1 Đồng.', statBonus: '+1🪙/món trùng' },
      { level: 2, cost: 180, effectDescription: 'Mỗi món trùng lặp bốc trúng lập tức hoàn lại +2.5 Đồng.', statBonus: '+2.5🪙/món trùng' },
      { level: 3, cost: 460, effectDescription: 'Mỗi món trùng lặp lập tức hoàn lại +5 Đồng (quay trúng đồ cũ luôn có lãi!).', statBonus: '+5🪙/món trùng (Siêu Lời)' },
      { level: 4, cost: 1100, effectDescription: 'Mỗi món trùng lặp lập tức hoàn lại +10 Đồng.', statBonus: '+10🪙/món trùng' },
      { level: 5, cost: 2600, effectDescription: 'GIÁC NGỘ CHÍ TÔN: Mỗi món trùng lặp lập tức hoàn lại +18 Đồng! Bốc đồ cũ thành mỏ vàng!', statBonus: '+18🪙/món trùng Cực Đại' },
    ],
  },

  treasury: {
    id: 'treasury',
    name: 'Lõi Ngân Khố',
    title: 'Càn Khôn Kim Khố Tụ Bảo',
    iconEmoji: '🏛️',
    themeColor: 'from-rose-400 to-amber-600',
    auraGradient: 'from-rose-600/30 via-amber-800/20 to-neutral-950',
    borderColor: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/30',
    description: 'Gia tăng mức Trợ Cấp Khẩn Cấp và sinh lời lãi suất thụ động sau mỗi lần quay 10 thẻ!',
    maxLevel: 5,
    requiredStage: 4,
    category: 'economy',
    levels: [
      { level: 1, cost: 55, effectDescription: 'Tăng mức nhận Trợ Cấp Khẩn Cấp từ 20đ lên 40 Đồng.', statBonus: 'Trợ Cấp 40🪙' },
      { level: 2, cost: 170, effectDescription: 'Tăng Trợ Cấp lên 75 Đồng; cộng thêm lãi suất thụ động +2 Đồng sau mỗi lần quay x10.', statBonus: 'Trợ Cấp 75🪙 (+2🪙/lần x10)' },
      { level: 3, cost: 440, effectDescription: 'Tăng Trợ Cấp lên 130 Đồng; cộng thêm lãi suất +5 Đồng sau mỗi lần quay x10.', statBonus: 'Trợ Cấp 130🪙 (+5🪙/lần x10)' },
      { level: 4, cost: 1050, effectDescription: 'Tăng Trợ Cấp lên 220 Đồng; cộng thêm lãi suất +10 Đồng sau mỗi lần quay x10.', statBonus: 'Trợ Cấp 220🪙 (+10🪙/lần x10)' },
      { level: 5, cost: 2500, effectDescription: 'KHO BÁU BẤT TẬN: Trợ Cấp lên đến 380 Đồng, lãi suất thụ động +20 Đồng sau mỗi lần quay x10!', statBonus: 'Trợ Cấp 380🪙 (+20🪙/lần x10)' },
    ],
  },

  codex_master: {
    id: 'codex_master',
    name: 'Lõi Bách Khoa',
    title: 'Đăng Lục Vạn Cổ Thần Tích',
    iconEmoji: '📖',
    themeColor: 'from-amber-400 to-emerald-500',
    auraGradient: 'from-amber-600/30 via-emerald-800/20 to-neutral-950',
    borderColor: 'border-amber-400/50',
    glowColor: 'shadow-amber-400/30',
    description: 'Mỗi khi thu thập thành công 1 món báu vật mới trong 120 món Bách Khoa, nhận ngay thưởng lớn ngân khố và tăng vĩnh viễn tỉ lệ thẻ hiếm!',
    maxLevel: 5,
    requiredStage: 4,
    category: 'mastery',
    levels: [
      { level: 1, cost: 80, effectDescription: 'Mỗi món mới trong 120 món thưởng ngay +20 Đồng.', statBonus: '+20🪙/món mới' },
      { level: 2, cost: 230, effectDescription: 'Mỗi món mới thưởng ngay +50 Đồng.', statBonus: '+50🪙/món mới' },
      { level: 3, cost: 580, effectDescription: 'Mỗi món mới thưởng ngay +100 Đồng.', statBonus: '+100🪙/món mới' },
      { level: 4, cost: 1350, effectDescription: 'Mỗi món mới thưởng ngay +220 Đồng; tăng vĩnh viễn +0.5% tỉ lệ Legend.', statBonus: '+220🪙 & +0.5% Legend' },
      { level: 5, cost: 3000, effectDescription: 'ĐẠI THƯ VIỆN CỔ TÍCH: Thưởng +400 Đồng mỗi món mới; tăng vĩnh viễn +1.5% Legend và +0.3% Mystic!', statBonus: '+400🪙 & +0.3% Mystic' },
    ],
  },

  // ==========================================
  // STAGE 5 (3 Cores) - MỞ KHÓA TẠI ĐỢT 5
  // ==========================================
  weapon_master: {
    id: 'weapon_master',
    name: 'Lõi Tinh Kiếm',
    title: 'Bách Binh Chi Thủ Thần Khí',
    iconEmoji: '⚔️',
    themeColor: 'from-red-500 to-orange-400',
    auraGradient: 'from-red-600/30 via-orange-800/20 to-neutral-950',
    borderColor: 'border-red-500/50',
    glowColor: 'shadow-red-500/30',
    description: 'Chuyên môn hóa Vũ Khí (Weapon). Tăng mạnh giá bán lại của mọi loại vũ khí và tăng tỉ lệ bốc trúng kiếm, thương, cung thần!',
    maxLevel: 5,
    requiredStage: 5,
    category: 'mastery',
    levels: [
      { level: 1, cost: 95, effectDescription: 'Tăng +30% giá bán lại cho tất cả báu vật Vũ Khí.', statBonus: '+30% Giá Bán Vũ Khí' },
      { level: 2, cost: 260, effectDescription: 'Tăng +60% giá bán lại Vũ Khí; tăng +20% tỉ lệ rơi Vũ Khí.', statBonus: '+60% Giá Vũ Khí' },
      { level: 3, cost: 650, effectDescription: 'Tăng +100% (gấp đôi) giá bán lại Vũ Khí; tăng +40% tỉ lệ rơi.', statBonus: '2x Giá Bán Vũ Khí' },
      { level: 4, cost: 1550, effectDescription: 'Tăng +150% giá bán Vũ Khí; mỗi vũ khí bán đi thưởng thêm +15 Đồng.', statBonus: '2.5x Giá Vũ Khí' },
      { level: 5, cost: 3400, effectDescription: 'VÔ THƯỢNG KIẾM TÔN: Tăng +200% (gấp 3 lần) giá bán Vũ Khí, tăng 60% tỉ lệ rơi Vũ Khí!', statBonus: '3x Giá Bán Vũ Khí' },
    ],
  },

  armor_master: {
    id: 'armor_master',
    name: 'Lõi Giáp Trụ',
    title: 'Kim Thân Bất Hoại Trọng Khôi',
    iconEmoji: '🛡️',
    themeColor: 'from-blue-500 to-cyan-400',
    auraGradient: 'from-blue-600/30 via-cyan-800/20 to-neutral-950',
    borderColor: 'border-blue-500/50',
    glowColor: 'shadow-blue-500/30',
    description: 'Chuyên môn hóa Giáp Trụ (Armor). Tăng mạnh giá bán của áo giáp, khiên thuẫn và tăng tỉ lệ xuất hiện phòng cụ cao cấp!',
    maxLevel: 5,
    requiredStage: 5,
    category: 'mastery',
    levels: [
      { level: 1, cost: 95, effectDescription: 'Tăng +30% giá bán lại cho Giáp Trụ & Khiên.', statBonus: '+30% Giá Bán Giáp Trụ' },
      { level: 2, cost: 260, effectDescription: 'Tăng +60% giá bán lại Giáp Trụ.', statBonus: '+60% Giá Giáp Trụ' },
      { level: 3, cost: 650, effectDescription: 'Tăng +100% (gấp đôi) giá bán lại Giáp Trụ; tăng +40% tỉ lệ rơi Giáp.', statBonus: '2x Giá Bán Giáp' },
      { level: 4, cost: 1550, effectDescription: 'Tăng +150% giá bán lại Giáp Trụ; hoàn trả 20% tiền khi bốc trúng Giáp Trụ.', statBonus: '2.5x Giá Giáp Trụ' },
      { level: 5, cost: 3400, effectDescription: 'KIM CƯƠNG BẤT HOẠI: GẤP 3 LẦN (3x) giá bán Giáp Trụ, bốc Giáp Trụ thưởng nóng +40 Đồng!', statBonus: '3x Giá Bán Giáp Trụ' },
    ],
  },

  potion_master: {
    id: 'potion_master',
    name: 'Lõi Tiên Dược',
    title: 'Thần Nông Linh Dược Khởi Tử',
    iconEmoji: '🧪',
    themeColor: 'from-emerald-400 to-lime-500',
    auraGradient: 'from-emerald-600/30 via-lime-800/20 to-neutral-950',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/30',
    description: 'Chuyên môn hóa Bình Thuốc & Tiên Dược (Potion). Đan dược thượng thừa tăng vọt giá trị trao đổi kim ngân!',
    maxLevel: 5,
    requiredStage: 5,
    category: 'mastery',
    levels: [
      { level: 1, cost: 90, effectDescription: 'Tăng +35% giá bán lại cho Tiên Dược & Bình Thuốc.', statBonus: '+35% Giá Bán Thuốc' },
      { level: 2, cost: 250, effectDescription: 'Tăng +70% giá bán lại Tiên Dược.', statBonus: '+70% Giá Tiên Dược' },
      { level: 3, cost: 620, effectDescription: 'Tăng +110% giá bán lại Tiên Dược; tăng 40% tỉ lệ rơi.', statBonus: '2.1x Giá Tiên Dược' },
      { level: 4, cost: 1500, effectDescription: 'Tăng +160% giá bán lại Tiên Dược; bán Tiên Dược hoàn trả 1 thẻ roll.', statBonus: '2.6x Giá Tiên Dược' },
      { level: 5, cost: 3300, effectDescription: 'VẠN ĐAN HOÀNG ĐẾ: Tăng GẤP 3.2 LẦN giá bán Tiên Dược (bình thuốc Common bán được trên 4 Đồng)!', statBonus: '3.2x Giá Bán Dược' },
    ],
  },

  // ==========================================
  // STAGE 6 (3 Cores) - MỞ KHÓA TẠI ĐỢT 6
  // ==========================================
  relic_master: {
    id: 'relic_master',
    name: 'Lõi Cổ Vật',
    title: 'Thượng Cổ Thần Vật Trấn Sơn',
    iconEmoji: '🏺',
    themeColor: 'from-purple-400 to-indigo-500',
    auraGradient: 'from-purple-600/30 via-indigo-800/20 to-neutral-950',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30',
    description: 'Chuyên môn hóa Cổ Vật (Relic). Cổ vật nghìn năm tích tụ linh khí mang lại giá trị bán cực đại!',
    maxLevel: 5,
    requiredStage: 6,
    category: 'mastery',
    levels: [
      { level: 1, cost: 110, effectDescription: 'Tăng +40% giá bán lại cho Cổ Vật Thượng Cổ.', statBonus: '+40% Giá Cổ Vật' },
      { level: 2, cost: 300, effectDescription: 'Tăng +80% giá bán lại Cổ Vật; tăng 30% tỉ lệ bốc trúng Cổ Vật.', statBonus: '+80% Giá Cổ Vật' },
      { level: 3, cost: 750, effectDescription: 'Tăng +120% giá bán lại Cổ Vật (Common 2.2đ, Rare 8.8đ).', statBonus: '2.2x Giá Cổ Vật' },
      { level: 4, cost: 1800, effectDescription: 'Tăng +175% giá bán lại Cổ Vật; Cổ Vật Epic/Legend bán nhận thêm +50 Đồng.', statBonus: '2.75x Giá Cổ Vật' },
      { level: 5, cost: 3800, effectDescription: 'THẦN KHÍ TRẤN THẾ: Tăng GẤP 3.5 LẦN (3.5x) giá bán Cổ Vật, bốc trúng Cổ Vật thưởng nóng +60 Đồng!', statBonus: '3.5x Giá Bán Cổ Vật' },
    ],
  },

  beast_master: {
    id: 'beast_master',
    name: 'Lõi Linh Thú',
    title: 'Vạn Thú Chi Vương Ngự Linh',
    iconEmoji: '🐉',
    themeColor: 'from-teal-400 to-cyan-500',
    auraGradient: 'from-teal-600/30 via-cyan-800/20 to-neutral-950',
    borderColor: 'border-teal-500/50',
    glowColor: 'shadow-teal-500/30',
    description: 'Chuyên môn hóa Thú Cưỡi & Linh Thú (Beast). Khi bốc trúng Linh Thú, tự động nhận thêm số lượng và nhân đôi giá bán!',
    maxLevel: 5,
    requiredStage: 6,
    category: 'mastery',
    levels: [
      { level: 1, cost: 110, effectDescription: 'Bốc trúng Linh Thú có 30% xác suất nhận thêm +1 con.', statBonus: '30% Tặng +1 Linh Thú' },
      { level: 2, cost: 300, effectDescription: '50% xác suất nhận thêm +1 Linh Thú; tăng +50% giá bán Linh Thú.', statBonus: '50% +1 Con & +50% Giá' },
      { level: 3, cost: 750, effectDescription: '75% xác suất nhận thêm +1 Linh Thú; tăng +100% (2x) giá bán Linh Thú.', statBonus: '75% +1 Con & 2x Giá' },
      { level: 4, cost: 1800, effectDescription: '100% TẤT CẢ Linh Thú bốc trúng ĐƯỢC NHÂN ĐÔI số lượng (+1 con chắc chắn)!', statBonus: '100% Nhân Đôi Linh Thú' },
      { level: 5, cost: 3800, effectDescription: 'LONG PHƯỢNG CHÍ TÔN: Tự động bốc x3 Linh Thú và tăng GẤP 3 LẦN (3x) giá bán mọi Linh Thú!', statBonus: 'x3 Số Lượng & 3x Giá' },
    ],
  },

  rune_master: {
    id: 'rune_master',
    name: 'Lõi Cổ Phù',
    title: 'Thái Cực Bùa Chú Khai Quang',
    iconEmoji: '📿',
    themeColor: 'from-violet-400 to-fuchsia-500',
    auraGradient: 'from-violet-600/30 via-fuchsia-800/20 to-neutral-950',
    borderColor: 'border-violet-500/50',
    glowColor: 'shadow-violet-500/30',
    description: 'Chuyên môn hóa Phù Hiệu & Bùa Chú (Rune). Mỗi chiếc bùa mang lại pháp lực hoàn tiền và bán giá siêu cao!',
    maxLevel: 5,
    requiredStage: 6,
    category: 'mastery',
    levels: [
      { level: 1, cost: 105, effectDescription: 'Bốc trúng Bùa Chú thưởng nóng ngay +15 Đồng; tăng 35% giá bán Bùa.', statBonus: '+15🪙 & +35% Giá Bùa' },
      { level: 2, cost: 290, effectDescription: 'Bốc trúng Bùa thưởng nóng +30 Đồng; tăng 70% giá bán Bùa.', statBonus: '+30🪙 & +70% Giá Bùa' },
      { level: 3, cost: 720, effectDescription: 'Bốc trúng Bùa thưởng nóng +60 Đồng; tăng 110% giá bán Bùa.', statBonus: '+60🪙 & 2.1x Giá Bùa' },
      { level: 4, cost: 1750, effectDescription: 'Bốc trúng Bùa thưởng nóng +100 Đồng; tăng 160% giá bán Bùa.', statBonus: '+100🪙 & 2.6x Giá Bùa' },
      { level: 5, cost: 3700, effectDescription: 'THẦN PHÙ BÁCH THẮNG: Thưởng nóng +200 Đồng mỗi thẻ Bùa và tăng GẤP 3.5 LẦN giá bán Bùa!', statBonus: '+200🪙 & 3.5x Giá Bùa' },
    ],
  },

  // ==========================================
  // STAGE 7 (3 Cores) - MỞ KHÓA TẠI ĐỢT 7
  // ==========================================
  roll_frenzy: {
    id: 'roll_frenzy',
    name: 'Lõi Cuồng Nộ Roll',
    title: 'Ma Thần Bạo Liệt Bốc Thêm Thẻ',
    iconEmoji: '🔥',
    themeColor: 'from-rose-500 to-red-600',
    auraGradient: 'from-rose-600/30 via-red-800/20 to-neutral-950',
    borderColor: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/30',
    description: 'SIÊU TĂNG LƯỢT BỐC THẺ! Khi quay 10 lần, có xác suất bùng nổ Cuồng Nộ bốc thêm từ 3 đến 8 thẻ hoàn toàn MIỄN PHÍ!',
    maxLevel: 5,
    requiredStage: 7,
    category: 'roll',
    levels: [
      { level: 1, cost: 150, effectDescription: '18% cơ hội kích hoạt Cuồng Nộ: Khi quay 10 lần bốc thêm +3 thẻ (tổng 13+ thẻ).', statBonus: '18% Bốc thêm +3 Thẻ' },
      { level: 2, cost: 420, effectDescription: '28% cơ hội kích hoạt Cuồng Nộ bốc thêm +4 thẻ (tổng 14+ thẻ).', statBonus: '28% Bốc thêm +4 Thẻ' },
      { level: 3, cost: 1050, effectDescription: '38% cơ hội kích hoạt Cuồng Nộ bốc thêm +5 thẻ (tổng 15+ thẻ).', statBonus: '38% Bốc thêm +5 Thẻ' },
      { level: 4, cost: 2400, effectDescription: '48% cơ hội kích hoạt Cuồng Nộ bốc thêm +6 thẻ (tổng 16+ thẻ).', statBonus: '48% Bốc thêm +6 Thẻ' },
      { level: 5, cost: 4900, effectDescription: 'BÃO CUỒNG PHONG BỐC THẺ: 55% kích hoạt bốc thêm +8 THẺ MIỄN PHÍ! (Quay 10 bốc tới 23 thẻ cùng lúc!).', statBonus: '55% Bốc Thêm +8 THẺ' },
    ],
  },

  element_metal: {
    id: 'element_metal',
    name: 'Lõi Kim Tinh',
    title: 'Canh Kim Bạch Hổ Tối Thượng',
    iconEmoji: '🪙',
    themeColor: 'from-yellow-400 to-amber-600',
    auraGradient: 'from-yellow-500/30 via-amber-800/20 to-neutral-950',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/30',
    description: 'Thần lực Hệ Kim (Metal). Tăng mạnh tỉ lệ rơi và giá bán của toàn bộ báu vật thuộc tính Kim trong 120 món!',
    maxLevel: 5,
    requiredStage: 7,
    category: 'element',
    levels: [
      { level: 1, cost: 130, effectDescription: 'Tăng +40% giá bán và +30% tỉ lệ rơi báu vật Hệ Kim.', statBonus: '+40% Giá Hệ Kim' },
      { level: 2, cost: 350, effectDescription: 'Tăng +80% giá bán Hệ Kim; bốc trúng Hệ Kim thưởng nóng +20 Đồng.', statBonus: '+80% Giá & +20🪙' },
      { level: 3, cost: 880, effectDescription: 'Tăng +120% giá bán Hệ Kim (Common 2.2đ, Rare 8.8đ).', statBonus: '2.2x Giá Hệ Kim' },
      { level: 4, cost: 2100, effectDescription: 'Tăng +180% giá bán Hệ Kim; tăng 60% tỉ lệ rơi đồ Hệ Kim.', statBonus: '2.8x Giá Hệ Kim' },
      { level: 5, cost: 4400, effectDescription: 'BẠCH HỔ THÁNH THẦN: Tăng GẤP 3.5 LẦN (3.5x) giá bán báu vật Hệ Kim, nhận thêm +60 Đồng mỗi món!', statBonus: '3.5x Giá Hệ Kim Cực Hạn' },
    ],
  },

  element_wood: {
    id: 'element_wood',
    name: 'Lõi Mộc Linh',
    title: 'Thanh Long Tinh Hoa Trường Sinh',
    iconEmoji: '🌿',
    themeColor: 'from-emerald-400 to-green-600',
    auraGradient: 'from-emerald-500/30 via-green-800/20 to-neutral-950',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/30',
    description: 'Thần lực Hệ Mộc (Wood). Sinh khí tràn đầy giúp sinh sôi báu vật Hệ Mộc và tăng vọt giá trị trao đổi!',
    maxLevel: 5,
    requiredStage: 7,
    category: 'element',
    levels: [
      { level: 1, cost: 130, effectDescription: 'Tăng +40% giá bán và +30% tỉ lệ rơi báu vật Hệ Mộc.', statBonus: '+40% Giá Hệ Mộc' },
      { level: 2, cost: 350, effectDescription: 'Tăng +80% giá bán Hệ Mộc; 25% nhân đôi số lượng khi bốc trúng.', statBonus: '+80% Giá & 25% x2' },
      { level: 3, cost: 880, effectDescription: 'Tăng +120% giá bán Hệ Mộc; tăng 50% tỉ lệ rơi đồ Hệ Mộc.', statBonus: '2.2x Giá Hệ Mộc' },
      { level: 4, cost: 2100, effectDescription: 'Tăng +180% giá bán Hệ Mộc; 50% nhân đôi số lượng khi bốc trúng.', statBonus: '2.8x Giá & 50% x2' },
      { level: 5, cost: 4400, effectDescription: 'THANH LONG TỐI THƯỢNG: Tăng GẤP 3.5 LẦN giá bán Hệ Mộc và 100% NHÂN ĐÔI số lượng nhận!', statBonus: '3.5x Giá & 100% x2 Mộc' },
    ],
  },

  // ==========================================
  // STAGE 8 (3 Cores) - MỞ KHÓA TẠI ĐỢT 8
  // ==========================================
  element_water: {
    id: 'element_water',
    name: 'Lõi Thủy Triều',
    title: 'Huyền Vũ Băng Thủy Cuộn Trào',
    iconEmoji: '🌊',
    themeColor: 'from-blue-400 to-cyan-600',
    auraGradient: 'from-blue-500/30 via-cyan-800/20 to-neutral-950',
    borderColor: 'border-blue-500/50',
    glowColor: 'shadow-blue-500/30',
    description: 'Thần lực Hệ Thủy (Water). Thủy triều cuồn cuộn mang lại tỉ lệ rơi báu vật Thủy cực cao và hoàn tiền dạt dào!',
    maxLevel: 5,
    requiredStage: 8,
    category: 'element',
    levels: [
      { level: 1, cost: 150, effectDescription: 'Tăng +40% giá bán và +35% tỉ lệ rơi báu vật Hệ Thủy.', statBonus: '+40% Giá Hệ Thủy' },
      { level: 2, cost: 400, effectDescription: 'Tăng +80% giá bán Hệ Thủy; hoàn lại 10 Đồng khi bốc trúng đồ Thủy.', statBonus: '+80% Giá & +10🪙' },
      { level: 3, cost: 1000, effectDescription: 'Tăng +125% giá bán Hệ Thủy; tăng 60% tỉ lệ xuất hiện đồ Thủy.', statBonus: '2.25x Giá Hệ Thủy' },
      { level: 4, cost: 2350, effectDescription: 'Tăng +190% giá bán Hệ Thủy; hoàn lại 25 Đồng khi bốc trúng.', statBonus: '2.9x Giá & +25🪙' },
      { level: 5, cost: 4800, effectDescription: 'HUYỀN VŨ ĐẠI HẢI: Tăng GẤP 3.6 LẦN giá bán Hệ Thủy, mỗi báu vật Thủy thưởng nóng +60 Đồng!', statBonus: '3.6x Giá Hệ Thủy' },
    ],
  },

  element_fire: {
    id: 'element_fire',
    name: 'Lõi Hỏa Diệm',
    title: 'Chu Tước Hỏa Diễm Bùng Cháy',
    iconEmoji: '🔥',
    themeColor: 'from-orange-500 to-red-600',
    auraGradient: 'from-orange-500/30 via-red-800/20 to-neutral-950',
    borderColor: 'border-orange-500/50',
    glowColor: 'shadow-orange-500/30',
    description: 'Thần lực Hệ Hỏa (Fire). Ngọn lửa thiêu đốt nhân giá trị báu vật Hỏa lên gấp bội và kích nổ tiền thưởng!',
    maxLevel: 5,
    requiredStage: 8,
    category: 'element',
    levels: [
      { level: 1, cost: 150, effectDescription: 'Tăng +40% giá bán và +35% tỉ lệ rơi báu vật Hệ Hỏa.', statBonus: '+40% Giá Hệ Hỏa' },
      { level: 2, cost: 400, effectDescription: 'Tăng +80% giá bán Hệ Hỏa; bốc trúng đồ Hỏa thưởng nóng +15 Đồng.', statBonus: '+80% Giá & +15🪙' },
      { level: 3, cost: 1000, effectDescription: 'Tăng +125% giá bán Hệ Hỏa; tăng 60% tỉ lệ rơi đồ Hỏa.', statBonus: '2.25x Giá Hệ Hỏa' },
      { level: 4, cost: 2350, effectDescription: 'Tăng +190% giá bán Hệ Hỏa; thưởng nóng +35 Đồng khi bốc trúng.', statBonus: '2.9x Giá & +35🪙' },
      { level: 5, cost: 4800, effectDescription: 'CHU TƯỚC NIẾT BÀN: Tăng GẤP 3.6 LẦN giá bán Hệ Hỏa, kích nổ thưởng nóng +80 Đồng mỗi món!', statBonus: '3.6x Giá Hệ Hỏa' },
    ],
  },

  element_earth: {
    id: 'element_earth',
    name: 'Lõi Địa Mạch',
    title: 'Kỳ Lân Trọng Thổ Uy Nghiêm',
    iconEmoji: '⛰️',
    themeColor: 'from-amber-600 to-stone-500',
    auraGradient: 'from-amber-600/30 via-stone-800/20 to-neutral-950',
    borderColor: 'border-amber-600/50',
    glowColor: 'shadow-amber-600/30',
    description: 'Thần lực Hệ Thổ (Earth). Địa mạch kiên cố giữ vững ngân khố, báu vật Hệ Thổ bán được giá vững chắc nhất!',
    maxLevel: 5,
    requiredStage: 8,
    category: 'element',
    levels: [
      { level: 1, cost: 140, effectDescription: 'Tăng +40% giá bán và +35% tỉ lệ rơi báu vật Hệ Thổ.', statBonus: '+40% Giá Hệ Thổ' },
      { level: 2, cost: 380, effectDescription: 'Tăng +80% giá bán Hệ Thổ; tăng mức Trợ Cấp thêm +20 Đồng.', statBonus: '+80% Giá & +20 Trợ Cấp' },
      { level: 3, cost: 950, effectDescription: 'Tăng +125% giá bán Hệ Thổ; tăng 60% tỉ lệ rơi đồ Thổ.', statBonus: '2.25x Giá Hệ Thổ' },
      { level: 4, cost: 2250, effectDescription: 'Tăng +190% giá bán Hệ Thổ; tăng mức Trợ Cấp thêm +50 Đồng.', statBonus: '2.9x Giá Hệ Thổ' },
      { level: 5, cost: 4600, effectDescription: 'KỲ LÂN ĐẠI ĐỊA: Tăng GẤP 3.6 LẦN giá bán Hệ Thổ, biến đồ Common Thổ bán trên 5 Đồng!', statBonus: '3.6x Giá Hệ Thổ' },
    ],
  },

  // ==========================================
  // STAGE 9 (3 Cores) - MỞ KHÓA TẠI ĐỢT 9
  // ==========================================
  element_wind: {
    id: 'element_wind',
    name: 'Lõi Phong Lôi',
    title: 'Cửu Thiên Thần Lôi Phong Cuồng',
    iconEmoji: '⚡',
    themeColor: 'from-yellow-300 to-indigo-500',
    auraGradient: 'from-yellow-400/30 via-indigo-800/20 to-neutral-950',
    borderColor: 'border-yellow-400/50',
    glowColor: 'shadow-yellow-400/30',
    description: 'Thần lực Phong & Lôi (Wind & Thunder). Tốc độ sấm sét gia tăng tỉ lệ rơi và giá bán của các báu vật mang sấm sét và cuồng phong!',
    maxLevel: 5,
    requiredStage: 9,
    category: 'element',
    levels: [
      { level: 1, cost: 180, effectDescription: 'Tăng +45% giá bán và +40% tỉ lệ rơi báu vật Phong & Lôi.', statBonus: '+45% Giá Phong Lôi' },
      { level: 2, cost: 480, effectDescription: 'Tăng +90% giá bán Phong Lôi; bốc trúng thưởng nóng +25 Đồng.', statBonus: '+90% Giá & +25🪙' },
      { level: 3, cost: 1200, effectDescription: 'Tăng +140% giá bán Phong Lôi; tăng 70% tỉ lệ rơi.', statBonus: '2.4x Giá Phong Lôi' },
      { level: 4, cost: 2800, effectDescription: 'Tăng +200% (3x) giá bán Phong Lôi; thưởng nóng +60 Đồng.', statBonus: '3x Giá Phong Lôi' },
      { level: 5, cost: 5500, effectDescription: 'CỬU THIÊN THẦN LÔI: Tăng GẤP 4 LẦN (4x) giá bán Phong & Lôi, bốc trúng thưởng +120 Đồng!', statBonus: '4x Giá Phong Lôi' },
    ],
  },

  element_ice: {
    id: 'element_ice',
    name: 'Lõi Băng Phách',
    title: 'Vạn Niên Hàn Băng Tuyệt Địa',
    iconEmoji: '❄️',
    themeColor: 'from-cyan-300 to-blue-400',
    auraGradient: 'from-cyan-400/30 via-blue-800/20 to-neutral-950',
    borderColor: 'border-cyan-400/50',
    glowColor: 'shadow-cyan-400/30',
    description: 'Thần lực Hệ Băng (Ice). Đóng băng chi phí hao tổn, báu vật Băng Phách mang lại giá trị bán cao và cơ hội bảo tồn tiền tệ!',
    maxLevel: 5,
    requiredStage: 9,
    category: 'element',
    levels: [
      { level: 1, cost: 180, effectDescription: 'Tăng +45% giá bán và +40% tỉ lệ rơi báu vật Hệ Băng.', statBonus: '+45% Giá Băng' },
      { level: 2, cost: 480, effectDescription: 'Tăng +90% giá bán Hệ Băng; 15% quay không trừ tiền.', statBonus: '+90% Giá & 15% Free' },
      { level: 3, cost: 1200, effectDescription: 'Tăng +140% giá bán Hệ Băng; tăng 70% tỉ lệ rơi.', statBonus: '2.4x Giá Hệ Băng' },
      { level: 4, cost: 2800, effectDescription: 'Tăng +200% (3x) giá bán Hệ Băng; 25% quay không trừ tiền.', statBonus: '3x Giá Hệ Băng' },
      { level: 5, cost: 5500, effectDescription: 'VẠN NIÊN HÀN BĂNG: Tăng GẤP 4 LẦN (4x) giá bán Hệ Băng, 35% cơ hội quay thẻ HOÀN TOÀN MIỄN PHÍ!', statBonus: '4x Giá & 35% Quay Miễn Phí' },
    ],
  },

  void_abyss: {
    id: 'void_abyss',
    name: 'Lõi Hư Không Vực',
    title: 'Thái Hư Hỗn Độn Chi Nhãn',
    iconEmoji: '🌌',
    themeColor: 'from-purple-500 to-indigo-900',
    auraGradient: 'from-purple-600/30 via-indigo-900/40 to-neutral-950',
    borderColor: 'border-purple-400/60',
    glowColor: 'shadow-purple-500/40',
    description: 'Thần lực Hư Không (Void). Tăng GẤP BA (3x) tỉ lệ rớt báu vật Hư Không Cực Phẩm (toàn bộ là Huyền Thoại và Thần Thoại vô giá)!',
    maxLevel: 5,
    requiredStage: 9,
    category: 'drop',
    levels: [
      { level: 1, cost: 220, effectDescription: 'Tăng +50% tỉ lệ rơi báu vật Hư Không và tăng +50% giá bán.', statBonus: '+50% Tỉ Lệ Hư Không' },
      { level: 2, cost: 600, effectDescription: 'TĂNG GẤP ĐÔI (2x) tỉ lệ rơi báu vật Hư Không; tăng +100% giá bán.', statBonus: '2x Tỉ Lệ Hư Không' },
      { level: 3, cost: 1500, effectDescription: 'TĂNG GẤP 2.5 LẦN tỉ lệ rơi Hư Không; mỗi món Hư Không bốc được thưởng nóng +200 Đồng.', statBonus: '2.5x Hư Không & +200🪙' },
      { level: 4, cost: 3400, effectDescription: 'TĂNG GẤP 3 LẦN tỉ lệ rơi Hư Không; tăng 200% giá bán Hư Không.', statBonus: '3x Tỉ Lệ Hư Không' },
      { level: 5, cost: 6800, effectDescription: 'HỖN ĐỘN CHI CHỦ: TĂNG GẤP 4 LẦN tỉ lệ rơi Hư Không, mỗi món Hư Không bốc trúng thưởng +800 Đồng!', statBonus: '4x Hư Không & +800🪙' },
    ],
  },

  // ==========================================
  // STAGE 10 (3 Ultimate Cores) - MỞ KHÓA TẠI ĐỢT 10
  // ==========================================
  divine_light: {
    id: 'divine_light',
    name: 'Lõi Quang Minh',
    title: 'Hạo Nhiên Chính Khí Thái Dương',
    iconEmoji: '☀️',
    themeColor: 'from-amber-200 to-yellow-400',
    auraGradient: 'from-yellow-400/40 via-amber-600/30 to-neutral-950',
    borderColor: 'border-yellow-300/70',
    glowColor: 'shadow-yellow-300/40',
    description: 'Thần lực Quang Minh (Light). Ánh sáng thánh thần thanh tẩy vận mệnh, có tỉ lệ tự động thăng cấp phẩm chất báu vật khi quay trúng!',
    maxLevel: 5,
    requiredStage: 10,
    category: 'ultimate',
    levels: [
      { level: 1, cost: 300, effectDescription: 'Tăng +60% giá bán báu vật Quang Minh; 10% thẻ Common tự thăng cấp lên Rare.', statBonus: '+60% Giá & 10% Thăng Cấp' },
      { level: 2, cost: 800, effectDescription: 'Tăng +120% giá bán Quang Minh; 20% thẻ Common tự thăng cấp lên Rare, 10% Rare lên Epic.', statBonus: '2.2x Giá & 20% Thăng Cấp' },
      { level: 3, cost: 2000, effectDescription: 'Tăng +180% giá bán Quang Minh; 30% Common lên Rare, 18% Rare lên Epic.', statBonus: '2.8x Giá & 30% Thăng Cấp' },
      { level: 4, cost: 4500, effectDescription: 'Tăng +250% giá bán Quang Minh; 40% Common lên Rare, 25% Rare lên Epic, 10% Epic lên Legend!', statBonus: '3.5x Giá & Đột Phá Thẻ' },
      { level: 5, cost: 9000, effectDescription: 'QUANG MINH CHÍ THẦN: Tăng GẤP 4.5 LẦN giá bán báu vật Quang Minh, 50% thăng cấp thẻ và bốc trúng thẻ hiếm thưởng nóng +1,000 Đồng!', statBonus: '4.5x Giá & 50% Thăng Cấp' },
    ],
  },

  dark_shadow: {
    id: 'dark_shadow',
    name: 'Lõi Ám Ảnh',
    title: 'U Minh Hắc Ám Dạ Xoa',
    iconEmoji: '🌑',
    themeColor: 'from-purple-900 to-neutral-950',
    auraGradient: 'from-purple-950/60 via-neutral-900/60 to-neutral-950',
    borderColor: 'border-purple-600/60',
    glowColor: 'shadow-purple-700/40',
    description: 'Thần lực Hắc Ám (Dark). Hấp thu bóng đêm bóp méo quy luật, hoàn trả 50% chi phí khi quay ra toàn thẻ thường!',
    maxLevel: 5,
    requiredStage: 10,
    category: 'ultimate',
    levels: [
      { level: 1, cost: 300, effectDescription: 'Tăng +60% giá bán báu vật Hắc Ám; hoàn 20% tiền khi lượt quay không có Epic/Legend.', statBonus: '+60% Giá & 20% Hoàn Thất Bại' },
      { level: 2, cost: 800, effectDescription: 'Tăng +120% giá bán Hắc Ám; hoàn 30% tiền khi quay không có Epic+.', statBonus: '2.2x Giá & 30% Hoàn' },
      { level: 3, cost: 2000, effectDescription: 'Tăng +180% giá bán Hắc Ám; hoàn 40% tiền khi quay không có Epic+.', statBonus: '2.8x Giá & 40% Hoàn' },
      { level: 4, cost: 4500, effectDescription: 'Tăng +250% giá bán Hắc Ám; hoàn 50% tiền khi quay không có Epic+.', statBonus: '3.5x Giá & 50% Hoàn' },
      { level: 5, cost: 9000, effectDescription: 'DẠ MA HOÀNG ĐẾ: Tăng GẤP 4.5 LẦN giá bán Hắc Ám, hoàn trả 65% chi phí mọi lượt quay thường!', statBonus: '4.5x Giá & 65% Bảo Hiểm' },
    ],
  },

  omnipresence: {
    id: 'omnipresence',
    name: 'Lõi Vạn Tượng',
    title: 'Càn Khôn Chí Tôn Vạn Tượng Thiên Đạo',
    iconEmoji: '👑',
    themeColor: 'from-yellow-300 via-amber-400 to-rose-500',
    auraGradient: 'from-amber-500/40 via-purple-700/30 to-neutral-950',
    borderColor: 'border-amber-300 ring-2 ring-amber-500/40',
    glowColor: 'shadow-amber-400/50',
    description: 'LÕI TỐI THƯỢNG THỨ 30! Kết tinh toàn bộ 30 đại năng: tăng vĩnh viễn +30% TOÀN BỘ chỉ số giá bán, tỉ lệ hiếm, tiền thưởng Bí Chỉ, và giảm chi phí quay!',
    maxLevel: 5,
    requiredStage: 10,
    category: 'ultimate',
    levels: [
      { level: 1, cost: 500, effectDescription: 'Tăng +15% TOÀN BỘ chỉ số: giá bán, tỉ lệ hiếm, tiền thưởng nhiệm vụ.', statBonus: '+15% Toàn Bộ Chỉ Số' },
      { level: 2, cost: 1200, effectDescription: 'Tăng +30% TOÀN BỘ chỉ số; giảm thêm -1 Đồng chi phí quay 10 lần.', statBonus: '+30% Toàn Bộ Chỉ Số' },
      { level: 3, cost: 3000, effectDescription: 'Tăng +50% TOÀN BỘ chỉ số; tăng gấp đôi tỉ lệ rơi thẻ Thần Thoại Mystic.', statBonus: '+50% All & 2x Mystic' },
      { level: 4, cost: 7000, effectDescription: 'Tăng +75% TOÀN BỘ chỉ số; giảm thêm -2 Đồng chi phí quay 10 lần.', statBonus: '+75% Toàn Bộ Chỉ Số' },
      { level: 5, cost: 15000, effectDescription: 'THIÊN ĐẠO CHÍ TÔN: Tăng +100% (GẤP ĐÔI) TOÀN BỘ GIÁ BÁN & THƯỞNG, TĂNG GẤP 3 LẦN TỈ LỆ MYSTIC!', statBonus: '2x TOÀN DIỆN CỰC HẠN' },
    ],
  },
};

export const CORE_TYPES: CoreType[] = [
  // Stage 1
  'alchemy',
  'destiny',
  'fortune',
  // Stage 2
  'roll_surge',
  'harvester',
  'order',
  // Stage 3
  'free_roll',
  'channelling',
  'miracle',
  // Stage 4
  'enlighten',
  'treasury',
  'codex_master',
  // Stage 5
  'weapon_master',
  'armor_master',
  'potion_master',
  // Stage 6
  'relic_master',
  'beast_master',
  'rune_master',
  // Stage 7
  'roll_frenzy',
  'element_metal',
  'element_wood',
  // Stage 8
  'element_water',
  'element_fire',
  'element_earth',
  // Stage 9
  'element_wind',
  'element_ice',
  'void_abyss',
  // Stage 10
  'divine_light',
  'dark_shadow',
  'omnipresence',
];

/**
 * Returns numeric bonus value for each core at given level
 */
export function getCoreBonusMultiplier(type: CoreType, level: number): number {
  if (level <= 0) return 0;
  const clamped = Math.min(5, Math.max(0, level));

  switch (type) {
    case 'alchemy': {
      const bonuses = [0, 0.20, 0.40, 0.65, 0.90, 1.20];
      return bonuses[clamped];
    }
    case 'destiny': {
      const bonuses = [0, 0.25, 0.50, 0.80, 1.20, 1.80];
      return bonuses[clamped];
    }
    case 'fortune': {
      const chances = [0, 0.15, 0.25, 0.35, 0.45, 0.50];
      return chances[clamped];
    }
    case 'roll_surge': {
      // Extra cards on 10-pull: +1, +2, +3, +4, +5
      const extraCards = [0, 1, 2, 3, 4, 5];
      return extraCards[clamped];
    }
    case 'harvester': {
      const chances = [0, 0.18, 0.32, 0.45, 0.60, 0.75];
      return chances[clamped];
    }
    case 'order': {
      const bonuses = [0, 0.25, 0.50, 0.80, 1.20, 1.60];
      return bonuses[clamped];
    }
    case 'free_roll': {
      // Free roll chance: 15%, 25%, 35%, 45%, 55%
      const chances = [0, 0.15, 0.25, 0.35, 0.45, 0.55];
      return chances[clamped];
    }
    case 'channelling': {
      const discounts = [0, 0, 1, 2, 4, 5];
      return discounts[clamped];
    }
    case 'miracle': {
      const bonuses = [0, 10, 20, 35, 60, 100];
      return bonuses[clamped];
    }
    case 'enlighten': {
      const coinsPerDup = [0, 1, 2.5, 5, 10, 18];
      return coinsPerDup[clamped];
    }
    case 'treasury': {
      const grants = [20, 40, 75, 130, 220, 380];
      return grants[clamped];
    }
    case 'codex_master': {
      // Coin bonus per new discovered item
      const coinPerNew = [0, 20, 50, 100, 220, 400];
      return coinPerNew[clamped];
    }
    case 'roll_frenzy': {
      // Frenzy trigger chance: 18%, 28%, 38%, 48%, 55%
      const chances = [0, 0.18, 0.28, 0.38, 0.48, 0.55];
      return chances[clamped];
    }
    case 'omnipresence': {
      // Universal boost: +15%, +30%, +50%, +75%, +100%
      const boosts = [0, 0.15, 0.30, 0.50, 0.75, 1.00];
      return boosts[clamped];
    }
    default:
      return 0;
  }
}
