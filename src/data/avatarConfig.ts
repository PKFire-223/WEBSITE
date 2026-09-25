export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
  desc: string;
}

export interface AvatarBorderOption {
  id: string;
  name: string;
  class: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'mage', name: 'Đại Pháp Sư', emoji: '🧙‍♂️', color: 'from-amber-500 to-red-600', desc: 'Bậc thầy nguyên tố huyền bí' },
  { id: 'shark', name: 'Thợ Săn Vực Thẳm', emoji: '🦈', color: 'from-cyan-500 to-blue-700', desc: 'Chinh phục quái vật biển sâu' },
  { id: 'dragon', name: 'Long Thần Cổ', emoji: '🐉', color: 'from-emerald-500 to-teal-700', desc: 'Uy lực dũng mãnh ngàn năm' },
  { id: 'phoenix', name: 'Phượng Hoàng Lửa', emoji: '🔥', color: 'from-orange-500 to-rose-600', desc: 'Bất tử và tái sinh bất diệt' },
  { id: 'kraken', name: 'Chúa Tể Hư Không', emoji: '👑', color: 'from-purple-500 to-indigo-700', desc: 'Thống trị bóng tối vô tận' },
  { id: 'cyber', name: 'Cơ Thần Lôi Đình', emoji: '⚡', color: 'from-yellow-400 to-amber-600', desc: 'Tốc độ ánh sáng hủy diệt' },
  { id: 'snake', name: 'Xà Thần Lục Bảo', emoji: '🐍', color: 'from-lime-500 to-emerald-700', desc: 'Bậc thầy luồn lách và săn mồi' },
  { id: 'knight', name: 'Hiệp Sĩ Hoàng Gia', emoji: '⚔️', color: 'from-amber-400 to-yellow-600', desc: 'Kiên trung vững chãi bất khuất' },
];

export const AVATAR_BORDERS: AvatarBorderOption[] = [
  { id: 'gold', name: 'Hoàng Kim Cổ Điển', class: 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)]' },
  { id: 'cyan', name: 'Neon Cyberpunk', class: 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.55)]' },
  { id: 'purple', name: 'Hư Không Tử Quang', class: 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.55)]' },
  { id: 'ice', name: 'Băng Tinh Cực Đới', class: 'border-sky-300 shadow-[0_0_20px_rgba(186,230,253,0.55)]' },
  { id: 'fire', name: 'Hỏa Diệm Phượng Hoàng', class: 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.55)]' },
];

export function getBorderClass(borderId?: string): string {
  const found = AVATAR_BORDERS.find((b) => b.id === borderId);
  return found?.class || AVATAR_BORDERS[0].class;
}

export function getAvatarOption(avatarId?: string): AvatarOption {
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found || AVATAR_OPTIONS[0];
}
