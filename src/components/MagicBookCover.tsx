import React, { useState } from 'react';
import { BookOpen, Sparkles, Volume2, VolumeX, Flame, Wand2, Star, Zap } from 'lucide-react';
import {
  playClickSound,
  playStartSound,
  playMagicSpellSound,
  playPageTurnSound,
  playSealAwakenSound,
} from '../utils/audio';

interface MagicBookCoverProps {
  onStart: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MagicBookCover: React.FC<MagicBookCoverProps> = ({ onStart, soundEnabled, onToggleSound }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [openingPhase, setOpeningPhase] = useState<'idle' | 'opening' | 'turned'>('idle');
  const [sealAwakened, setSealAwakened] = useState(false);
  const [sealTapCount, setSealTapCount] = useState(0);
  const [sealParticles, setSealParticles] = useState<Array<{ id: number; x: number; y: number; char: string }>>([]);

  // =========================================================================
  // 1. HIỆU ỨNG KHI NHẤN VÀO ẤN CHÚ PHONG ẤN (MAGIC SEAL AWAKENING)
  // =========================================================================
  const handleTapSeal = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSealAwakenSound();
    setSealAwakened(true);
    setSealTapCount((prev) => prev + 1);

    // Spawn 8 magical burst sparks/runes from seal center
    const newSparks = Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      const runes = ['✦', '★', '🔥', '⚡', '✧', 'ᚱ', 'ᛟ', '✨'];
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        char: runes[i % runes.length],
      };
    });

    setSealParticles(newSparks);
    setTimeout(() => {
      setSealParticles([]);
    }, 1200);
  };

  // =========================================================================
  // 2. HIỆU ỨNG TỪ TỪ LẬT MỞ CUỐN SÁCH 3D (3D REALISTIC BOOK OPENING)
  // =========================================================================
  const handleOpenBook = () => {
    if (isOpening) return;
    setIsOpening(true);
    setOpeningPhase('opening');

    // Phase 1: Play initial magic spell hum
    playMagicSpellSound();

    // Phase 2: Page flip swoosh sound as the heavy cover and parchment pages turn
    setTimeout(() => {
      playPageTurnSound();
    }, 450);

    // Phase 3: Second page turn flutter
    setTimeout(() => {
      playPageTurnSound();
      setOpeningPhase('turned');
    }, 1000);

    // Phase 4: Radiant chime and transition to Game Hub
    setTimeout(() => {
      playStartSound();
      onStart();
    }, 1800);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-[#07040d] font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Background mystical cosmic haze */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#3a1354_0%,#1a062b_45%,#070210_100%)] -z-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none -z-10 opacity-40" />

      {/* Floating magical orbs in background */}
      <div className="absolute top-1/4 left-1/5 -translate-x-1/2 w-80 h-80 bg-purple-600/20 blur-[120px] pointer-events-none -z-10 rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/5 translate-x-1/2 w-80 h-80 bg-amber-500/15 blur-[120px] pointer-events-none -z-10 rounded-full" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 max-w-4xl mx-auto flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30 text-xs font-mono text-amber-300 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>POLYPLAY • BẢO ĐIỂN MA THUẬT</span>
        </div>

        {/* Audio toggle */}
        <button
          onClick={() => {
            playClickSound();
            onToggleSound();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors shadow-lg text-xs font-mono cursor-pointer"
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh ma thuật'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh: BẬT' : 'Âm thanh: TẮT'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3D BOOK STAGE CONTAINER WITH PERSPECTIVE */}
      {/* ========================================================================= */}
      <div
        className="relative w-full max-w-2xl my-8 transition-transform duration-1000 ease-out"
        style={{
          perspective: '1800px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Magic Aura glow behind the book */}
        <div
          className={`absolute -inset-4 bg-gradient-to-r from-amber-500/40 via-purple-600/40 to-amber-500/40 rounded-[44px] blur-2xl transition-all duration-700 -z-10 ${
            isOpening ? 'scale-110 opacity-100' : 'opacity-70'
          }`}
        />

        {/* 3D BOOK BODY CONTAINER */}
        <div
          className="relative w-full rounded-[32px] overflow-visible shadow-[0_25px_90px_rgba(0,0,0,0.95)]"
          style={{
            transformStyle: 'preserve-3d',
            transform: isOpening ? 'rotateX(5deg) scale(1.03)' : 'rotateX(0deg) scale(1)',
            transition: 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* ===================================================================== */}
          {/* UNDERLYING INSIDE PARCHMENT PAGES (HIỂN THỊ KHI BÌA SÁCH LẬT RA) */}
          {/* ===================================================================== */}
          <div
            className="absolute inset-0 rounded-[30px] p-6 sm:p-12 overflow-hidden bg-gradient-to-br from-[#f5ecd5] via-[#ede0c2] to-[#dfceaa] text-neutral-900 border-4 border-[#b8935c] shadow-2xl flex flex-col justify-between"
            style={{
              zIndex: 1,
            }}
          >
            {/* Ancient parchment texture overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(140,90,40,0.25)_100%)] pointer-events-none" />
            
            {/* Book Crease in the middle */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#59391e]/50 to-transparent pointer-events-none" />

            {/* Glowing magical diagram on interior page */}
            <div className="relative z-10 space-y-4 text-center my-auto">
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-[#8c5a28] p-1 flex items-center justify-center animate-spin">
                <BookOpen className="w-10 h-10 text-[#8c5a28]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#5c3713] font-sans uppercase tracking-wider">
                  KHO TÀNG TRÒ CHƠI MA THUẬT
                </h3>
                <p className="text-xs font-mono text-[#8a5d30] max-w-sm mx-auto">
                  Các trang bảo điển đã được khai mở. Chào mừng Pháp Sư bước vào thế giới trò chơi PolyPlay!
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8c5a28]/15 border border-[#8c5a28]/40 text-xs font-mono font-bold text-[#5c3713]">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
                <span>ĐANG TIẾN VÀO SẢNH CHÍNH...</span>
              </div>
            </div>

            {/* Bottom Ancient Page Numbers */}
            <div className="relative z-10 flex justify-between text-[11px] font-mono text-[#8a5d30] font-bold border-t border-[#8c5a28]/30 pt-3">
              <span>Trang I • Khởi Nguyên</span>
              <span>PolyPlay Grimoire • MMXXVI</span>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* FLIPPING PARCHMENT SHEET 2 (TRANG SÁCH PHỤ LẬT RA GIỮA CHỪNG) */}
          {/* ===================================================================== */}
          <div
            className="absolute inset-0 rounded-[30px] p-6 sm:p-12 overflow-hidden bg-gradient-to-r from-[#ecdab5] to-[#f4ebd0] border-2 border-[#b8935c] shadow-xl pointer-events-none"
            style={{
              zIndex: 5,
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              transform: isOpening ? 'rotateY(-110deg)' : 'rotateY(0deg)',
              transition: 'transform 1.3s cubic-bezier(0.25, 1, 0.5, 1)',
              opacity: isOpening ? 0.95 : 0,
            }}
          >
            <div className="h-full flex flex-col justify-center items-center text-center opacity-60">
              <span className="text-xs font-mono text-[#5c3713]">✦ Giai Thoại PolyPlay ✦</span>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* THE FRONT BOOK COVER FLAP (BÌA SÁCH DA TỪ TỪ LẬT MỞ SANG TRÁI 3D) */}
          {/* ===================================================================== */}
          <div
            className="relative bg-gradient-to-r from-[#291005] via-[#1c0a03] to-[#120501] rounded-[32px] p-6 sm:p-12 border-4 border-[#6e3715] shadow-[inset_0_2px_20px_rgba(255,200,100,0.15)] overflow-hidden"
            style={{
              zIndex: 10,
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              transform: isOpening ? 'rotateY(-145deg)' : 'rotateY(0deg)',
              transition: 'transform 1.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 1.4s ease',
              boxShadow: isOpening
                ? '-30px 20px 60px rgba(0, 0, 0, 0.9), inset 0 2px 20px rgba(255, 200, 100, 0.2)'
                : '0 25px 90px rgba(0, 0, 0, 0.95), inset 0 2px 20px rgba(255, 200, 100, 0.15)',
            }}
          >
            {/* Ornate Gold Filigree Corner Brackets */}
            <div className="absolute top-3 left-3 w-14 h-14 border-t-4 border-l-4 border-amber-400/90 rounded-tl-2xl pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <div className="absolute top-3 right-3 w-14 h-14 border-t-4 border-r-4 border-amber-400/90 rounded-tr-2xl pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <div className="absolute bottom-3 left-3 w-14 h-14 border-b-4 border-l-4 border-amber-400/90 rounded-bl-2xl pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <div className="absolute bottom-3 right-3 w-14 h-14 border-b-4 border-r-4 border-amber-400/90 rounded-br-2xl pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

            {/* Golden Runic Rim Lines */}
            <div className="absolute inset-5 rounded-2xl border border-amber-500/30 pointer-events-none" />
            <div className="absolute inset-6 rounded-2xl border border-amber-500/15 pointer-events-none" />

            {/* Book Spine Texture Ribbon on Left */}
            <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-[#421d09] to-[#240e04] border-r-2 border-[#7a3e18] shadow-inner" />

            {/* Center Book Content */}
            <div className="relative z-10 text-center space-y-6 sm:space-y-7 pl-3">
              
              {/* Ancient Arcane Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono tracking-widest text-amber-300 uppercase">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>BẢO ĐIỂN PHÉP THUẬT HUYỀN THOẠI</span>
                </div>

                {/* App Name: PolyPlay */}
                <h1 className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-sans drop-shadow-[0_4px_15px_rgba(245,158,11,0.4)]">
                  POLYPLAY
                </h1>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-amber-400" />
                  <span className="text-xs font-mono text-amber-300 tracking-[0.25em] uppercase font-bold">
                    SÁCH MA THUẬT VẠN TRÒ CHƠI
                  </span>
                  <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-amber-400" />
                </div>
              </div>

              {/* ================================================================= */}
              {/* INTERACTIVE MAGIC SEAL ("ẤN CHÚ PHONG ẤN - CHẠM ĐỂ THỨC TỈNH") */}
              {/* ================================================================= */}
              <div
                onClick={handleTapSeal}
                className="relative max-w-sm mx-auto cursor-pointer group select-none active:scale-95 transition-transform"
                title="Chạm vào ấn chú để thức tỉnh ma lực!"
              >
                {/* Expanding Shockwave Rings on click */}
                {sealAwakened && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping pointer-events-none opacity-80" />
                    <div className="absolute -inset-4 rounded-full border border-yellow-400 animate-pulse pointer-events-none opacity-60" />
                  </>
                )}

                {/* Flying Sparks / Runes on tap */}
                {sealParticles.map((p) => (
                  <span
                    key={p.id}
                    className="absolute left-1/2 top-1/2 pointer-events-none text-base font-bold text-amber-300 drop-shadow-[0_0_10px_#f59e0b] animate-out fade-out zoom-out duration-1000 z-30"
                    style={{
                      transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
                    }}
                  >
                    {p.char}
                  </span>
                ))}

                {/* Outer Rotating Arcane Rune Ring */}
                <div
                  className={`relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-orange-600 p-1 transition-all duration-500 ${
                    sealAwakened
                      ? 'shadow-[0_0_80px_rgba(245,158,11,1)] scale-105'
                      : 'shadow-[0_0_50px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_70px_rgba(245,158,11,0.8)]'
                  }`}
                >
                  <div className="w-full h-full bg-[#170802] rounded-full p-2 border-2 border-dashed border-amber-400/60 flex items-center justify-center relative overflow-hidden">
                    
                    {/* Arcane Art background */}
                    <img
                      src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
                      alt="Magic Portal Art"
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                        sealAwakened ? 'opacity-60 scale-125 filter brightness-125' : 'opacity-35 group-hover:opacity-50 group-hover:scale-110'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120501] via-transparent to-transparent" />

                    {/* Center Emblem */}
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-red-600 p-0.5 shadow-lg shadow-amber-500/40 transition-transform duration-300 ${
                          sealAwakened ? 'scale-115 rotate-12' : 'group-hover:scale-110'
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-[#1c0a03] flex items-center justify-center">
                          <Flame
                            className={`w-8 h-8 text-amber-400 transition-all ${
                              sealAwakened ? 'text-yellow-200 animate-bounce scale-125' : 'animate-pulse'
                            }`}
                          />
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-amber-300 font-bold tracking-widest uppercase drop-shadow">
                        {sealAwakened ? '✨ ẤN CHÚ ĐÃ THỨC TỈNH!' : 'ẤN CHÚ PHONG ẤN'}
                      </span>

                      <span className="text-[9px] font-mono text-amber-400/80">
                        {sealAwakened ? `⚡ Ma lực bùng nổ (x${sealTapCount})` : 'Chạm để thức tỉnh'}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Floating star markers around seal */}
                <div className="absolute top-2 left-4 text-amber-400 animate-bounce">
                  <Star className="w-4 h-4 fill-current opacity-75" />
                </div>
                <div className="absolute bottom-4 right-6 text-amber-400 animate-pulse">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
              </div>

              {/* Lore / Story Text */}
              <div className="max-w-md mx-auto space-y-2">
                <p className="text-xs sm:text-sm text-amber-100/90 font-sans italic leading-relaxed">
                  "Từng trang sách phong ấn những thế giới giải trí kỳ ảo. Mở bảo điển để bắt đầu hành trình tích lũy thời gian chơi và nâng cấp Level không giới hạn!"
                </p>
                <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-amber-400/90 pt-1">
                  <span>⏱ Chơi càng lâu</span>
                  <span>•</span>
                  <span className="text-yellow-300 font-bold">⚡ Cấp độ tăng (LV +1)</span>
                  <span>•</span>
                  <span>🏆 Vinh danh cao thủ</span>
                </div>
              </div>

              {/* ================================================================= */}
              {/* THE BIG MAGICAL "MỞ SÁCH BẮT ĐẦU" BUTTON */}
              {/* ================================================================= */}
              <div className="pt-2 sm:pt-4">
                <button
                  onClick={handleOpenBook}
                  disabled={isOpening}
                  className="relative group inline-flex items-center justify-center gap-3 px-8 sm:px-14 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-600 hover:from-amber-500 hover:via-yellow-400 hover:to-orange-500 text-neutral-950 font-black text-lg sm:text-xl font-mono tracking-wider shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:shadow-[0_0_80px_rgba(245,158,11,0.9)] transform hover:-translate-y-1 active:translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden border-2 border-amber-200"
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-white/25 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  
                  <BookOpen className="w-6 h-6 text-neutral-950 fill-current" />
                  <span className="drop-shadow-sm uppercase">MỞ SÁCH BẮT ĐẦU</span>
                  <Sparkles className="w-5 h-5 text-neutral-950 animate-spin" />
                </button>
              </div>

            </div>

          </div>

          {/* Golden Radiant Light Ray bursting from between pages while opening */}
          {isOpening && (
            <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center animate-in fade-in duration-500">
              <div className="w-full h-full bg-[radial-gradient(circle_at_left_center,rgba(251,191,36,0.85)_0%,rgba(245,158,11,0.4)_50%,transparent_80%)] animate-pulse" />
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
