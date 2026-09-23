import React, { useState, useEffect, useRef } from 'react';
import { Wind, Zap, RotateCcw, Trophy, AlertTriangle, Music, VolumeX, Sparkles } from 'lucide-react';
import {
  playWindSound,
  playLightningSound,
  playGameOverSound,
  playCoinSound,
  startFanGameBGM,
  stopFanGameBGM,
} from '../../utils/audio';

interface PowerUp {
  id: string;
  type: 'wind' | 'lightning';
  x: number; // Percentage 15% - 85%
  y: number; // Percentage 18% - 78%
  secondsLeft: number; // Strictly 4s lifetime
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const OnlyaFanGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [fanTimeLeft, setFanTimeLeft] = useState(60); // Starting at 60s
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('onlyafan_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Strictly ONE single active power-up at a time
  const [activePowerUp, setActivePowerUp] = useState<PowerUp | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Next spawn time: random between 10s and 15s (internal countdown, hidden from user)
  const getNextInterval = () => Math.floor(Math.random() * 6) + 10;
  const spawnCooldownRef = useRef(getNextInterval());

  // Fan oscillation and blade spinning animation state
  const [oscillateAngle, setOscillateAngle] = useState(0); // in degrees: -32deg to +32deg
  const [bladeAngle, setBladeAngle] = useState(0); // 0 to 360 continuous

  // Start background music when game mounts or restarts
  useEffect(() => {
    if (isMusicPlaying && !isGameOver) {
      startFanGameBGM();
    } else {
      stopFanGameBGM();
    }
    return () => {
      stopFanGameBGM();
    };
  }, [isMusicPlaying, isGameOver]);

  const toggleMusic = () => {
    playCoinSound();
    setIsMusicPlaying((prev) => !prev);
  };

  // High score tracking
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('onlyafan_high_score', score.toString());
      } catch {
        // ignore
      }
    }
  }, [score, highScore]);

  // Restart Game
  const restartGame = () => {
    playCoinSound();
    setScore(0);
    setFanTimeLeft(60);
    setIsGameOver(false);
    setActivePowerUp(null);
    setFloatingTexts([]);
    spawnCooldownRef.current = getNextInterval();
    if (isMusicPlaying) startFanGameBGM();
  };

  // Main 1-second game timer loop
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      // 1s quay = +1 điểm
      setScore((prev) => prev + 1);

      // Fan survival timer countdown (loss at 0s)
      setFanTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          playGameOverSound();
          stopFanGameBGM();
          return 0;
        }
        return prev - 1;
      });

      // Age active power-up (STRICTLY 4 SECONDS LIFETIME)
      setActivePowerUp((current) => {
        if (!current) return null;
        if (current.secondsLeft <= 1) {
          // 4 seconds expired, disappears!
          return null;
        }
        return { ...current, secondsLeft: current.secondsLeft - 1 };
      });

      // Internal cooldown for next spawn (10 - 15s)
      spawnCooldownRef.current -= 1;
      if (spawnCooldownRef.current <= 0) {
        // Spawn EXACTLY ONE item: Gió or Sét (50/50 chance)
        const type: 'wind' | 'lightning' = Math.random() < 0.5 ? 'wind' : 'lightning';

        // Pick random coordinate away from center fan
        let rx = Math.floor(Math.random() * 65) + 18;
        let ry = Math.floor(Math.random() * 60) + 20;

        // Push away from center fan body (38% - 62% x, 30% - 70% y)
        if (rx > 36 && rx < 64 && ry > 28 && ry < 72) {
          rx = rx < 50 ? 20 : 80;
        }

        setActivePowerUp({
          id: `powerup-${Date.now()}`,
          type,
          x: rx,
          y: ry,
          secondsLeft: 4, // Exists for strictly 4 seconds
        });

        // Set next interval between 10s and 15s
        spawnCooldownRef.current = getNextInterval();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver]);

  // High-framerate animation loop: fan blades spin & fan head oscillates smoothly
  useEffect(() => {
    if (isGameOver) return;

    let animId: number;
    let startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // 1. Blade spinning: fast rotation (~720 deg/sec)
      setBladeAngle((prev) => (prev + 24) % 360);

      // 2. Continuous smooth left-and-right oscillation (-32° to +32°)
      // Uses sine wave with period ~3.5 seconds
      const osc = Math.sin(elapsed * 1.8) * 32;
      setOscillateAngle(osc);

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver]);

  // Click handler for collecting Gió (Wind) or Sét (Lightning)
  const handleCollectPowerUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activePowerUp || isGameOver) return;

    const p = activePowerUp;
    let addedScore = 0;
    let addedTime = 0;
    let color = '';

    if (p.type === 'wind') {
      playWindSound();
      addedScore = 10;
      addedTime = 20;
      color = '#38bdf8';
    } else {
      playLightningSound();
      addedScore = 20;
      addedTime = 40;
      color = '#facc15';
    }

    // Add Score
    setScore((prev) => prev + addedScore);

    // Add Fan Time with STRICT CAP AT 60s
    let reachedCap = false;
    setFanTimeLeft((prev) => {
      const nextTime = prev + addedTime;
      if (nextTime >= 60) {
        reachedCap = true;
        return 60;
      }
      return nextTime;
    });

    // Remove the collected item immediately
    setActivePowerUp(null);

    // Floating text label
    const label = p.type === 'wind' ? '+10đ • +20s GIÓ' : '+20đ • +40s SÉT';
    const capNote = reachedCap ? ' (Max 60s!)' : '';

    const floatId = `float-${Date.now()}`;
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: floatId,
        text: `${label}${capNote}`,
        x: p.x,
        y: p.y,
        color,
      },
    ]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => f.id !== floatId));
    }, 1200);
  };

  // Color logic for 60s timer gauge
  const getGaugeColor = () => {
    if (fanTimeLeft > 35) return 'from-emerald-500 to-teal-400';
    if (fanTimeLeft > 15) return 'from-amber-500 to-yellow-400';
    return 'from-red-600 to-orange-500 animate-pulse';
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[530px] rounded-2xl overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* 1. GAME ROOM BACKGROUND IMAGE ("Hình làm hình nền game") */}
      {/* ========================================================================= */}
      <img
        src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80"
        alt="Arcade Room Background"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.38] contrast-125 pointer-events-none"
      />
      {/* Ambient dark vignette & cyber grid */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_20%,#05010a_95%] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none opacity-40" />

      {/* ========================================================================= */}
      {/* 2. TOP HUD: SCORE, 60s TIMER (CAP: 60s), MUSIC TOGGLE */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-3 bg-neutral-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-xl">
        
        {/* Score & High Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">ĐIỂM:</span>
            <span className="text-2xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              {score}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-neutral-400 pl-3 border-l border-neutral-800">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Kỷ lục: <strong className="text-yellow-300">{highScore}</strong></span>
          </div>
        </div>

        {/* 60s Fan Countdown & Progress Bar (No spawn countdown shown!) */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <span className="text-neutral-300">THỜI GIAN QUẠT:</span>
              <span
                className={`text-base font-black font-mono ${
                  fanTimeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-amber-300'
                }`}
              >
                {fanTimeLeft}s / 60s
              </span>
            </div>
            {/* Progress gauge */}
            <div className="w-32 sm:w-44 h-2.5 bg-neutral-900 rounded-full border border-neutral-700 overflow-hidden mt-1 shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${getGaugeColor()} transition-all duration-300`}
                style={{ width: `${(fanTimeLeft / 60) * 100}%` }}
              />
            </div>
          </div>

          {/* Royalty-free Arcade BGM Toggle Button */}
          <button
            onClick={toggleMusic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all shadow-md ${
              isMusicPlaying
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
            title={isMusicPlaying ? 'Tắt nhạc nền Arcade' : 'Bật nhạc nền Arcade'}
          >
            {isMusicPlaying ? <Music className="w-3.5 h-3.5 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isMusicPlaying ? 'Nhạc: BẬT' : 'Nhạc: TẮT'}</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CENTRAL ELECTRIC STANDING FAN ("CÂY QUẠT Ở TRUNG TÂM QUAY QUA QUAY LẠI") */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        
        {/* Fan Assembly Container */}
        <div className="relative w-72 h-96 flex flex-col items-center justify-end pb-4">
          
          {/* Floor Shadow */}
          <div className="w-48 h-8 bg-black/75 rounded-full blur-md" />

          {/* Sturdy Circular Base */}
          <div className="absolute bottom-6 w-44 h-12 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 border-2 border-amber-500/80 shadow-[0_10px_30px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(245,158,11,0.5)] flex items-center justify-center">
            {/* Speed Control Buttons: 0, 1, 2, 3 */}
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-700 shadow" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-700 shadow" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-700 shadow" />
            </div>
          </div>

          {/* Metallic Telescopic Stand Pole */}
          <div className="absolute bottom-16 w-5 h-44 bg-gradient-to-r from-neutral-700 via-neutral-300 to-neutral-700 border border-neutral-800 shadow-lg rounded-t-sm">
            {/* Height adjustment collar */}
            <div className="absolute top-16 -left-1.5 w-8 h-4 bg-amber-500 rounded border border-amber-300 shadow" />
          </div>

          {/* ===================================================================== */}
          {/* OSCILLATING FAN HEAD (QUAY QUA QUAY LẠI LIÊN TỤC TRÁI - PHẢI) */}
          {/* ===================================================================== */}
          <div
            className="absolute top-4 w-64 h-64 flex items-center justify-center transition-transform duration-75 ease-linear"
            style={{
              transform: `rotate(${oscillateAngle}deg)`,
              transformOrigin: '50% 85%', // Pivots at the neck joint
            }}
          >
            {/* Motor Housing Box at rear */}
            <div className="absolute w-20 h-16 bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 rounded-2xl border-2 border-neutral-700 shadow-2xl -z-10 -translate-y-2">
              {/* Oscillation Knob at top of motor */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-5 bg-amber-500 rounded-t border border-amber-300 shadow animate-pulse" />
            </div>

            {/* Glowing Wind Aura surrounding the fan head */}
            {!isGameOver && (
              <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-xl pointer-events-none animate-pulse" />
            )}

            {/* Rear Cage Wire Net */}
            <div className="absolute w-56 h-56 rounded-full border-2 border-neutral-700 bg-black/40 backdrop-blur-[2px] shadow-inner" />

            {/* ================================================================= */}
            {/* ROTATING 3-BLADE FAN ROTOR (QUAY TÍT TẮP LIÊN TỤC) */}
            {/* ================================================================= */}
            <div
              className="absolute w-52 h-52 flex items-center justify-center transition-transform duration-75 ease-linear"
              style={{
                transform: `rotate(${bladeAngle}deg)`,
              }}
            >
              {/* Blade 1 (0 deg) */}
              <div
                className="absolute top-3 w-14 h-24 rounded-full bg-gradient-to-b from-sky-300 via-sky-500 to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-sky-200/50"
                style={{ transformOrigin: '50% 100%' }}
              />
              {/* Blade 2 (120 deg) */}
              <div
                className="absolute top-3 w-14 h-24 rounded-full bg-gradient-to-b from-sky-300 via-sky-500 to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-sky-200/50"
                style={{ transform: 'rotate(120deg)', transformOrigin: '50% 100%' }}
              />
              {/* Blade 3 (240 deg) */}
              <div
                className="absolute top-3 w-14 h-24 rounded-full bg-gradient-to-b from-sky-300 via-sky-500 to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-sky-200/50"
                style={{ transform: 'rotate(240deg)', transformOrigin: '50% 100%' }}
              />
            </div>

            {/* Front Protective Wire Cage & Concentric Rings */}
            <div className="absolute w-60 h-60 rounded-full border-4 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center">
              {/* Concentric Wire Rings */}
              <div className="w-44 h-44 rounded-full border border-amber-500/40" />
              <div className="absolute w-28 h-28 rounded-full border border-amber-500/30" />

              {/* Radial Spokes */}
              <div className="absolute w-full h-0.5 bg-amber-400/40" />
              <div className="absolute w-0.5 h-full bg-amber-400/40" />
              <div className="absolute w-full h-0.5 bg-amber-400/40 rotate-45" />
              <div className="absolute w-full h-0.5 bg-amber-400/40 -rotate-45" />

              {/* Center Metallic Hub Cap with "ONLYAFAN" Brand */}
              <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-600 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.8)] border border-amber-200 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#120501] flex flex-col items-center justify-center">
                  <span className="text-[7.5px] font-mono font-black text-amber-300 tracking-tighter">ONLY</span>
                  <span className="text-[7.5px] font-mono font-black text-yellow-400 tracking-tighter">A-FAN</span>
                </div>
              </div>

              {/* Fluttering Wind Ribbon attached to front grill */}
              {!isGameOver && (
                <div
                  className="absolute bottom-6 left-12 w-14 h-2.5 bg-gradient-to-r from-red-500 to-rose-400 rounded-full shadow-md animate-pulse"
                  style={{
                    transform: `rotate(${Math.sin(oscillateAngle) * 20 - 15}deg)`,
                    transformOrigin: '0% 50%',
                  }}
                />
              )}
            </div>

            {/* Dynamic Breeze Wave Arc */}
            {!isGameOver && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-48 h-8 border-t-2 border-sky-300/60 rounded-t-full animate-ping pointer-events-none" />
            )}

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. EXACTLY ONE POWER-UP AT A TIME (GIÓ OR SÉT - LIFETIME: 4s) */}
      {/* ========================================================================= */}
      {activePowerUp && !isGameOver && (
        <button
          onClick={handleCollectPowerUp}
          style={{ left: `${activePowerUp.x}%`, top: `${activePowerUp.y}%` }}
          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 group cursor-pointer p-3 sm:p-4 rounded-3xl border-2 transition-all transform hover:scale-125 active:scale-95 duration-200 animate-bounce shadow-2xl ${
            activePowerUp.type === 'wind'
              ? 'bg-sky-950/95 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.85)] text-sky-300'
              : 'bg-amber-950/95 border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.9)] text-yellow-300'
          }`}
          title={
            activePowerUp.type === 'wind'
              ? 'Nhấp để nhặt GIÓ (+10đ, +20s thời gian)'
              : 'Nhấp để nhặt SÉT (+20đ, +40s thời gian)'
          }
        >
          {/* Pulsing ring indicator */}
          <span
            className={`absolute inset-0 rounded-3xl animate-ping opacity-60 pointer-events-none ${
              activePowerUp.type === 'wind' ? 'bg-sky-400' : 'bg-yellow-400'
            }`}
          />

          <div className="relative flex flex-col items-center justify-center">
            {activePowerUp.type === 'wind' ? (
              <Wind className="w-9 h-9 sm:w-11 sm:h-11 animate-pulse" />
            ) : (
              <Zap className="w-9 h-9 sm:w-11 sm:h-11 fill-current animate-pulse" />
            )}
            
            <div className="flex items-center gap-1 mt-1 text-[11px] font-mono font-black tracking-wider">
              <span>{activePowerUp.type === 'wind' ? 'GIÓ (+20s)' : 'SÉT (+40s)'}</span>
            </div>

            {/* 4-second life indicator bar */}
            <div className="w-full h-1 bg-black/60 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${activePowerUp.type === 'wind' ? 'bg-sky-400' : 'bg-yellow-400'} transition-all duration-1000`}
                style={{ width: `${(activePowerUp.secondsLeft / 4) * 100}%` }}
              />
            </div>
          </div>
        </button>
      )}

      {/* Floating score text */}
      {floatingTexts.map((f) => (
        <div
          key={f.id}
          style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.color }}
          className="absolute z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono font-black text-base sm:text-lg animate-out fade-out slide-out-to-top-10 duration-1000 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] whitespace-nowrap"
        >
          {f.text}
        </div>
      ))}

      {/* Bottom Status / Rule summary */}
      <div className="absolute bottom-2 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none bg-neutral-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <span>🌀 Quạt quay 1s = +1đ</span>
          <span>•</span>
          <span className="text-sky-400">Gió (+10đ, +20s)</span>
          <span>•</span>
          <span className="text-yellow-400">Sét (+20đ, +40s)</span>
        </div>
        <div className="text-[10px] text-amber-400 font-bold">
          ⚡ Tối đa 60s • Vật phẩm tồn tại 4s
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. GAME OVER MODAL (KHI HẾT 60s) */}
      {/* ========================================================================= */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-sm w-full bg-[#120719] border-2 border-red-500/80 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_60px_rgba(239,68,68,0.4)]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 font-sans uppercase tracking-normal">
                QUẠT ĐÃ NGỪNG QUAY!
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Đã hết thời gian 60 giây. Hãy nhanh tay nhặt Gió và Sét trong 4 giây nhé!
              </p>
            </div>

            {/* Score Results */}
            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Điểm đạt được:</span>
                <strong className="text-amber-400 text-base">{score} ĐIỂM</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-400 border-t border-neutral-800/80 pt-2">
                <span>Kỷ lục cao nhất:</span>
                <strong className="text-yellow-300">{highScore} ĐIỂM</strong>
              </div>
            </div>

            {/* Restart Button */}
            <button
              onClick={restartGame}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-neutral-950 font-black text-sm font-mono tracking-wider shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CHƠI LẠI NGAY</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
