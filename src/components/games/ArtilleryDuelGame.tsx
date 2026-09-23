import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame,
  Shield,
  Zap,
  Sparkles,
  Wind,
  Trophy,
  RotateCcw,
  Crosshair,
  BrainCircuit,
  Volume2,
  ChevronRight,
  Swords,
  Target,
  Send,
  HelpCircle,
  Footprints,
  Dices,
  Heart,
  Snowflake,
  Bomb,
  Radio,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Lock,
  Hourglass,
  CheckCircle,
} from 'lucide-react';
import {
  playCannonShotSound,
  playArtilleryExplosionSound,
  playHitDamageSound,
  playShieldSound,
  playGameOverSound,
  playClickSound,
  playComboFanfareSound,
  playStepSound,
  playHealSound,
} from '../../utils/audio';

// ==========================================
// CONSTANTS & TYPES
// ==========================================
const CANVAS_WIDTH = 840;
const CANVAS_HEIGHT = 440;
const BASE_GRAVITY = 320; // px/s^2
const MAX_HP = 400;

export type AIDifficulty = 'novice' | 'veteran' | 'grandmaster';
export type TurnState =
  | 'player_aiming'
  | 'player_projectile'
  | 'ai_thinking'
  | 'ai_moving'
  | 'ai_projectile'
  | 'round_transition'
  | 'game_over';

export interface MagicSkill {
  id: string;
  name: string;
  desc: string;
  iconName: string;
  color: string;
  borderGlow: string;
  damage: number;
  craterSize: number;
  cooldownTurns: number; // Cooldown in rounds (max 3)
}

// BASE WEAPON (Always available, 0 cooldown, infinite uses - NOT part of 12 skills)
export const BASIC_FIREBALL: MagicSkill = {
  id: 'fireball',
  name: 'Hỏa Cầu Ma Pháp',
  desc: 'Đạn cơ bản vĩnh cửu luôn sẵn sàng (Vô hạn dùng, không có hồi chiêu, sát thương 38 HP).',
  iconName: 'flame',
  color: '#f97316',
  borderGlow: 'rgba(249,115,22,0.9)',
  damage: 38,
  craterSize: 24,
  cooldownTurns: 0,
};

// 12 DISTINCT SPECIAL SKILLS (Pool from which 3 are randomly picked)
export const ALL_12_SPECIAL_SKILLS: MagicSkill[] = [
  {
    id: 'meteor',
    name: 'Sao Băng Tận Thế',
    desc: 'Bạo kích 75 HP, khoét hố bom khổng lồ gây sụt lún địa hình dữ dội!',
    iconName: 'meteor',
    color: '#ef4444',
    borderGlow: 'rgba(239,68,68,0.9)',
    damage: 75,
    craterSize: 48,
    cooldownTurns: 3, // OP skill
  },
  {
    id: 'thunder',
    name: 'Thiên Lôi Thần Phạt',
    desc: 'Triệu hồi sấm sét từ mây trời đánh thẳng xuống mục tiêu gây 68 HP bạo kích!',
    iconName: 'thunder',
    color: '#fde047',
    borderGlow: 'rgba(253,224,71,0.9)',
    damage: 68,
    craterSize: 34,
    cooldownTurns: 3, // OP skill
  },
  {
    id: 'heal',
    name: 'Dược Thảo Sinh Mệnh',
    desc: 'Hồi phục ngay lập tức +80 HP cho bản thân để lật ngược thế trận!',
    iconName: 'heal',
    color: '#34d399',
    borderGlow: 'rgba(52,211,153,0.9)',
    damage: -80,
    craterSize: 0,
    cooldownTurns: 3, // OP heal
  },
  {
    id: 'triple',
    name: 'Lôi Thần Ba Tia',
    desc: 'Tách làm 3 tia đạn sét trên không trung oanh tạc diện rộng (25 HP x 3).',
    iconName: 'zap',
    color: '#38bdf8',
    borderGlow: 'rgba(56,189,248,0.9)',
    damage: 25,
    craterSize: 22,
    cooldownTurns: 2,
  },
  {
    id: 'shield',
    name: 'Khiên Thánh Hộ Thể',
    desc: 'Giảm 60% sát thương từ đòn đánh tiếp theo và chống lún địa hình!',
    iconName: 'shield',
    color: '#60a5fa',
    borderGlow: 'rgba(96,165,250,0.9)',
    damage: 0,
    craterSize: 0,
    cooldownTurns: 2,
  },
  {
    id: 'frost',
    name: 'Băng Cầu Hàn Băng',
    desc: 'Sát thương 45 HP, đóng băng khiến đối thủ không thể di chuyển ở hiệp sau!',
    iconName: 'frost',
    color: '#67e8f9',
    borderGlow: 'rgba(103,232,249,0.9)',
    damage: 45,
    craterSize: 24,
    cooldownTurns: 2,
  },
  {
    id: 'cluster',
    name: 'Đại Bác Phân Mảnh',
    desc: 'Nổ bung 4 quả bom nảy xung quanh gây liên hoàn sát thương 55 HP.',
    iconName: 'cluster',
    color: '#fbbf24',
    borderGlow: 'rgba(251,191,36,0.9)',
    damage: 55,
    craterSize: 38,
    cooldownTurns: 2,
  },
  {
    id: 'acid',
    name: 'Axit Ăn Mòn Địa Hình',
    desc: 'Khoét thủng địa hình sâu gấp đôi khiến đối thủ lọt thỏm xuống vực (48 HP)!',
    iconName: 'acid',
    color: '#a3e635',
    borderGlow: 'rgba(163,230,53,0.9)',
    damage: 48,
    craterSize: 52,
    cooldownTurns: 2,
  },
  {
    id: 'homing',
    name: 'Phi Đạn Dẫn Đường',
    desc: 'Tự động uốn cong đường bay tìm đến đối thủ nếu bay gần trong 90px (48 HP)!',
    iconName: 'homing',
    color: '#f43f5e',
    borderGlow: 'rgba(244,63,94,0.9)',
    damage: 48,
    craterSize: 28,
    cooldownTurns: 2,
  },
  {
    id: 'dual',
    name: 'Song Phát Liên Hoàn',
    desc: 'Khai hỏa liên tiếp 2 phát đạn trong cùng 1 lượt (34 HP x 2 = 68 HP)!',
    iconName: 'dual',
    color: '#e879f9',
    borderGlow: 'rgba(232,121,249,0.9)',
    damage: 34,
    craterSize: 26,
    cooldownTurns: 2,
  },
  {
    id: 'vortex',
    name: 'Gió Lốc Chân Không',
    desc: 'Lốc xoáy hút đối thủ vào tâm hố sâu, sát thương 45 HP.',
    iconName: 'vortex',
    color: '#c084fc',
    borderGlow: 'rgba(192,132,252,0.9)',
    damage: 45,
    craterSize: 35,
    cooldownTurns: 2,
  },
  {
    id: 'antigrav',
    name: 'Xuyên Gió Không Trọng Lực',
    desc: 'Đạn bay thẳng tắp không bị rơi bởi trọng lực và gió trong 1.5s (50 HP)!',
    iconName: 'antigrav',
    color: '#fb7185',
    borderGlow: 'rgba(251,113,133,0.9)',
    damage: 50,
    craterSize: 30,
    cooldownTurns: 1,
  },
];

export const ALL_SKILLS_CATALOG = [BASIC_FIREBALL, ...ALL_12_SPECIAL_SKILLS];

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  skillId: string;
  owner: 'player' | 'ai';
  color: string;
  glow: string;
  subType?: string;
  bornAt: number;
  hasSplit?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  vy: number;
  alpha: number;
}

interface Crater {
  x: number;
  radius: number;
  depth: number;
}

export const ArtilleryDuelGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Match State
  const [turn, setTurn] = useState<TurnState>('player_aiming');
  const [turnCount, setTurnCount] = useState(1);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  // PRE-MATCH PREPARATION MODAL (Rút 3 kỹ năng + Hỏa Cầu, cho phép đổi trước khi vào trận)
  const [isPreMatchModalOpen, setIsPreMatchModalOpen] = useState(true);

  // Health: 400 HP
  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [aiHp, setAiHp] = useState(MAX_HP);

  // Movement: 5 steps per turn
  const [playerSteps, setPlayerSteps] = useState(5);
  const [aiSteps, setAiSteps] = useState(5);
  const [playerFrozen, setPlayerFrozen] = useState(false);
  const [aiFrozen, setAiFrozen] = useState(false);

  // Shields
  const [playerShield, setPlayerShield] = useState(false);
  const [aiShield, setAiShield] = useState(false);

  // Aiming Controls
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(65);

  // 12 SPECIAL SKILLS: Randomly Pick 3 Skills for this game session
  const [activeDeck, setActiveDeck] = useState<MagicSkill[]>(() => {
    const shuffled = [...ALL_12_SPECIAL_SKILLS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  // Selected skill defaults to BASIC_FIREBALL
  const [selectedSkillId, setSelectedSkillId] = useState<string>(BASIC_FIREBALL.id);

  // Skill Cooldowns (tracked in turns)
  const [cooldowns, setCooldowns] = useState<{ [id: string]: number }>({});

  // 2D WIND SYSTEM (Horizontal: -5.0 to +5.0, Vertical: -5.0 to +5.0)
  // Horizontal: every 0.5 wind -> 2.5% force adjustment (0.1 wind = 0.5%)
  // Vertical: every 1.0 wind -> 1 degree angle change (0.2 wind = 0.2 degree)
  const [windX, setWindX] = useState<number>(1.5);
  const [windY, setWindY] = useState<number>(1.0);

  // AI Configuration
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('veteran');
  const [aiThoughtLog, setAiThoughtLog] = useState<string>(
    'AI đã sẵn sàng: Thuật toán 2D Monte Carlo đã khởi động!'
  );
  const [aiSpeech, setAiSpeech] = useState<string>('Hãy cho ta xem đường đạn của ngươi!');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Positions (x is horizontal; y will be strictly snapped to terrain)
  const playerXRef = useRef(130);
  const aiXRef = useRef(710);
  const playerSlopeDegRef = useRef(0);
  const aiSlopeDegRef = useRef(0);

  // Memory of AI past shots for reinforcement learning
  const aiMemoryRef = useRef<{
    lastMissDistance: number;
    lastAngle: number;
    lastPower: number;
  }>({
    lastMissDistance: 0,
    lastAngle: 135,
    lastPower: 65,
  });

  // Physics Collections
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const cratersRef = useRef<Crater[]>([]);
  const screenShakeRef = useRef(0);

  // Dragging Aim
  const isDraggingAimRef = useRef(false);

  // Stats & Win Streak
  const [stats, setStats] = useState({
    playerShots: 0,
    playerHits: 0,
    aiShots: 0,
    aiHits: 0,
    totalDamageDealt: 0,
  });
  const [winStreak, setWinStreak] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('artillery_win_streak') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Trigger AI speech that auto-disappears after 3.5s!
  const triggerAiSpeech = useCallback((text: string) => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    setAiSpeech(text);
    speechTimeoutRef.current = setTimeout(() => {
      setAiSpeech('');
    }, 3500);
  }, []);

  // Initial speech fadeout after 3.5s
  useEffect(() => {
    speechTimeoutRef.current = setTimeout(() => {
      setAiSpeech('');
    }, 3500);
    return () => {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    };
  }, []);

  // Floating text creator
  const addFloatingText = useCallback(
    (text: string, x: number, y: number, color = '#facc15', size = 16) => {
      floatingTextsRef.current.push({
        id: `ft-${Date.now()}-${Math.random()}`,
        text,
        x,
        y,
        color,
        size,
        vy: -1.2,
        alpha: 1,
      });
    },
    []
  );

  // Dust kickup when walking
  const spawnDust = useCallback((x: number, y: number) => {
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x: x + (Math.random() * 8 - 4),
        y: y + (Math.random() * 4 - 2),
        vx: (Math.random() * 2 - 1) * 20,
        vy: -Math.random() * 15 - 5,
        radius: Math.random() * 2.5 + 1.5,
        color: '#94a3b8',
        alpha: 0.6,
        decay: 0.04,
      });
    }
  }, []);

  // Explosion effect with crater deformation
  const spawnExplosion = useCallback(
    (x: number, y: number, color = '#f97316', count = 30, craterRadius = 26, craterDepth = 22) => {
      screenShakeRef.current = 9;
      playArtilleryExplosionSound();

      // Carve crater in terrain
      if (craterRadius > 0) {
        cratersRef.current.push({ x, radius: craterRadius, depth: craterDepth });
      }

      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 220 + 40;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: Math.random() * 4 + 2,
          color: i % 3 === 0 ? '#facc15' : i % 3 === 1 ? color : '#ffffff',
          alpha: 1,
          decay: Math.random() * 0.025 + 0.015,
        });
      }
    },
    []
  );

  // Generate 2D Wind (Horizontal & Vertical: 0.5 to 5.0)
  const generateNew2DWind = useCallback(() => {
    const signX = Math.random() < 0.5 ? -1 : 1;
    const magX = Math.round((Math.random() * 4.5 + 0.5) * 10) / 10;
    setWindX(signX * magX);

    const signY = Math.random() < 0.55 ? 1 : -1;
    const magY = Math.round((Math.random() * 4.5 + 0.5) * 10) / 10;
    setWindY(signY * magY);
  }, []);

  // Reroll 3 random skills out of 12 (ONLY ALLOWED IN PRE-MATCH MODAL)
  const handleRerollDeck = () => {
    playClickSound();
    const shuffled = [...ALL_12_SPECIAL_SKILLS].sort(() => Math.random() - 0.5);
    const new3 = shuffled.slice(0, 3);
    setActiveDeck(new3);
  };

  // Start battle from Pre-Match Modal
  const handleStartBattle = () => {
    playClickSound();
    setIsPreMatchModalOpen(false);
    try {
      localStorage.setItem('artillery_played', 'true');
    } catch {}
    triggerAiSpeech('Trận chiến bắt đầu! Chuẩn bị nhận đòn đi!');
  };

  // Terrain function: Base undulating landscape + craters
  const getGroundY = useCallback((x: number) => {
    const base =
      325 +
      Math.sin(x * 0.007) * 22 +
      Math.cos(x * 0.013) * 14 +
      (x > 320 && x < 520 ? 36 : 0);

    let sink = 0;
    for (const c of cratersRef.current) {
      const dist = Math.abs(x - c.x);
      if (dist < c.radius) {
        const factor = Math.cos((dist / c.radius) * (Math.PI / 2));
        sink = Math.max(sink, factor * c.depth);
      }
    }
    return base + sink;
  }, []);

  // Compute terrain slope (degrees) at any X
  const getGroundSlopeDeg = useCallback(
    (x: number) => {
      const dy = getGroundY(x + 7) - getGroundY(x - 7);
      const rad = Math.atan2(dy, 14);
      return Math.round((rad * 180) / Math.PI);
    },
    [getGroundY]
  );

  // Player Move: Walk left or right (5 steps per turn)
  const handlePlayerMove = (dir: 'left' | 'right') => {
    if (turn !== 'player_aiming' || playerSteps <= 0 || playerFrozen || isPreMatchModalOpen) return;

    const delta = dir === 'left' ? -10 : 10;
    const nextX = Math.min(CANVAS_WIDTH * 0.44, Math.max(40, playerXRef.current + delta));

    playerXRef.current = nextX;
    setPlayerSteps((s) => s - 1);
    playStepSound();

    const groundY = getGroundY(nextX);
    spawnDust(nextX, groundY);
  };

  // AI 2D Trajectory Simulation & Optimization
  const computeAIShot = useCallback(() => {
    const aiX = aiXRef.current;
    const aiY = getGroundY(aiX);
    const targetX = playerXRef.current;
    const aiSlope = getGroundSlopeDeg(aiX);

    let bestAngle = 135;
    let bestPower = 65;
    let minError = 99999;

    const windLiftAngle = windY * 1.0;

    for (let testAngle = 115; testAngle <= 165; testAngle += 2) {
      for (let testPwr = 35; testPwr <= 95; testPwr += 3) {
        const totalAngle = testAngle + aiSlope + windLiftAngle;
        const rad = (totalAngle * Math.PI) / 180;

        const horizBoost = (windX / 0.1) * 0.005;
        const effectiveSpeed = testPwr * 5.6 * (1 + horizBoost * -1);

        let simX = aiX - 16;
        let simY = aiY - 18;
        let simVx = Math.cos(rad) * effectiveSpeed;
        let simVy = -Math.sin(rad) * effectiveSpeed;

        const dt = 0.04;
        let landed = false;

        for (let step = 0; step < 160; step++) {
          simVx += windX * 18 * dt;
          simVy += (BASE_GRAVITY - windY * 12) * dt;
          simX += simVx * dt;
          simY += simVy * dt;

          const ground = getGroundY(simX);
          if (simY >= ground || simX < 0 || simX > CANVAS_WIDTH) {
            landed = true;
            break;
          }
        }

        if (landed) {
          const err = Math.abs(simX - targetX);
          if (err < minError) {
            minError = err;
            bestAngle = testAngle;
            bestPower = testPwr;
          }
        }
      }
    }

    let finalAngle = bestAngle;
    let finalPower = bestPower;
    const memory = aiMemoryRef.current;

    if (aiDifficulty === 'novice') {
      finalAngle += Math.random() * 12 - 6;
      finalPower += Math.random() * 16 - 8;
      setAiThoughtLog(
        `AI Tập Sự: Quét vector... Góc ${Math.round(finalAngle)}°, Lực ${Math.round(finalPower)}% (Sai số lớn)`
      );
    } else if (aiDifficulty === 'veteran') {
      finalAngle += Math.random() * 4 - 2;
      finalPower += Math.random() * 5 - 2.5;
      setAiThoughtLog(
        `AI Tinh Nhuệ: Cân bằng Gió 2D (${windX > 0 ? '+' : ''}${windX} m/s, ${windY > 0 ? '▲' : '▼'}${Math.abs(windY)}) ➔ Góc ${Math.round(finalAngle)}°, Lực ${Math.round(finalPower)}%`
      );
    } else {
      let errorCompensation = 0;
      if (Math.abs(memory.lastMissDistance) > 8) {
        errorCompensation = memory.lastMissDistance * 0.06;
      }
      finalPower = Math.min(100, Math.max(25, finalPower + errorCompensation));
      finalAngle += Math.random() * 1.2 - 0.6;
      setAiThoughtLog(
        `Đại Pháp Sư AI: Bù trừ địa hình nghiêng (${aiSlope}°) & gió 2D... Tự sửa sai: ${errorCompensation.toFixed(1)}% lực!`
      );
    }

    return {
      angle: Math.min(168, Math.max(105, Math.round(finalAngle))),
      power: Math.min(100, Math.max(25, Math.round(finalPower))),
    };
  }, [getGroundY, getGroundSlopeDeg, windX, windY, aiDifficulty]);

  // Player Fire Execution with Cooldown Logic
  const handlePlayerFire = useCallback(() => {
    if (turn !== 'player_aiming' || isPreMatchModalOpen) return;

    const skill = ALL_SKILLS_CATALOG.find((s) => s.id === selectedSkillId) || BASIC_FIREBALL;
    const currentCd = cooldowns[skill.id] || 0;
    if (currentCd > 0) {
      addFloatingText('⏳ KỸ NĂNG ĐANG HỒI CHIÊU!', playerXRef.current, getGroundY(playerXRef.current) - 45, '#ef4444', 16);
      return;
    }

    // Apply cooldown to used skill (if not basic fireball)
    if (skill.id !== BASIC_FIREBALL.id && skill.cooldownTurns > 0) {
      setCooldowns((prev) => ({ ...prev, [skill.id]: skill.cooldownTurns }));
      // Revert selection back to basic fireball for convenience
      setSelectedSkillId(BASIC_FIREBALL.id);
    }

    // Handle Healing skill
    if (skill.id === 'heal') {
      setPlayerHp((hp) => Math.min(MAX_HP, hp + 80));
      playHealSound();
      addFloatingText('💚 +80 HP HỒI MÁU!', playerXRef.current, getGroundY(playerXRef.current) - 45, '#34d399', 22);
      setTurn('ai_thinking');
      return;
    }

    // Handle Shield skill
    if (skill.id === 'shield') {
      setPlayerShield(true);
      playShieldSound();
      addFloatingText('🛡️ KÍCH HOẠT THÁNH GIÁP!', playerXRef.current, getGroundY(playerXRef.current) - 45, '#60a5fa', 18);
      setTurn('ai_thinking');
      return;
    }

    // Fire Projectile
    setStats((s) => ({ ...s, playerShots: s.playerShots + 1 }));
    setTurn('player_projectile');
    playCannonShotSound();

    const groundSlope = getGroundSlopeDeg(playerXRef.current);
    const windLift = windY * 1.0;
    const effectiveAngle = Math.min(88, Math.max(8, angle + groundSlope + windLift));

    const windForceFactor = 1 + (windX / 0.1) * 0.005;
    const effectiveSpeed = power * 5.6 * windForceFactor;

    const rad = (effectiveAngle * Math.PI) / 180;
    const startX = playerXRef.current + 22;
    const startY = getGroundY(playerXRef.current) - 24;

    const baseProj: Projectile = {
      x: startX,
      y: startY,
      vx: Math.cos(rad) * effectiveSpeed,
      vy: -Math.sin(rad) * effectiveSpeed,
      radius: skill.craterSize > 40 ? 9 : 6,
      skillId: skill.id,
      owner: 'player',
      color: skill.color,
      glow: skill.borderGlow,
      bornAt: Date.now(),
    };

    projectilesRef.current = [baseProj];

    // Dual shot: fire second bullet after delay
    if (skill.id === 'dual') {
      setTimeout(() => {
        playCannonShotSound();
        projectilesRef.current.push({
          ...baseProj,
          vy: baseProj.vy - 16,
          bornAt: Date.now(),
        });
      }, 260);
    }
  }, [
    turn,
    isPreMatchModalOpen,
    selectedSkillId,
    cooldowns,
    angle,
    power,
    windX,
    windY,
    getGroundSlopeDeg,
    getGroundY,
    addFloatingText,
  ]);

  // AI Turn Logic
  useEffect(() => {
    if (turn === 'ai_thinking') {
      const thinkTimer = setTimeout(() => {
        // AI repositioning if standing on steep crater
        const currentSlope = Math.abs(getGroundSlopeDeg(aiXRef.current));
        if (currentSlope > 18 && !aiFrozen) {
          const moveDir = aiSlopeDegRef.current > 0 ? -12 : 12;
          const targetX = Math.min(CANVAS_WIDTH - 50, Math.max(CANVAS_WIDTH * 0.56, aiXRef.current + moveDir * 2));
          aiXRef.current = targetX;
          playStepSound();
          spawnDust(targetX, getGroundY(targetX));
        }

        // AI Shield use if HP < 150
        if (aiHp < 150 && !aiShield && Math.random() < 0.35) {
          setAiShield(true);
          playShieldSound();
          addFloatingText('🛡️ AI BẬT KHIÊN HỘ MỆNH!', aiXRef.current, getGroundY(aiXRef.current) - 45, '#c084fc');
          triggerAiSpeech('Lá chắn này sẽ chặn đứng đòn tấn công của ngươi!');

          // Pass turn back to player
          setTurn('player_aiming');
          setPlayerSteps(5);
          setAiSteps(5);
          setTurnCount((t) => t + 1);
          generateNew2DWind();
          // Decrease cooldowns
          setCooldowns((prev) =>
            Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v - 1)])
            )
          );
          return;
        }

        // AI Fires Projectile
        const { angle: aiAngle, power: aiPower } = computeAIShot();
        setTurn('ai_projectile');
        playCannonShotSound();
        setStats((s) => ({ ...s, aiShots: s.aiShots + 1 }));

        const groundSlope = getGroundSlopeDeg(aiXRef.current);
        const windLift = windY * 1.0;
        const totalAngle = aiAngle + groundSlope + windLift;
        const rad = (totalAngle * Math.PI) / 180;

        const windForceFactor = 1 + (windX / 0.1) * 0.005 * -1;
        const initialSpeed = aiPower * 5.6 * windForceFactor;

        const startX = aiXRef.current - 22;
        const startY = getGroundY(aiXRef.current) - 24;

        const aiProj: Projectile = {
          x: startX,
          y: startY,
          vx: Math.cos(rad) * initialSpeed,
          vy: -Math.sin(rad) * initialSpeed,
          radius: 6,
          skillId: 'fireball',
          owner: 'ai',
          color: '#a855f7',
          glow: 'rgba(168,85,247,0.9)',
          bornAt: Date.now(),
        };

        projectilesRef.current = [aiProj];

        const quotes = [
          'Vector này đã được tối ưu hóa!',
          'Hỏa cầu hắc ám sẽ tìm đến ngươi!',
          'Gió 2D đã được tính toán kỹ lưỡng!',
          'Hãy xem ngươi né được cú này không!',
        ];
        triggerAiSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
      }, 1200);

      return () => clearTimeout(thinkTimer);
    }
  }, [
    turn,
    computeAIShot,
    aiHp,
    aiShield,
    aiFrozen,
    getGroundSlopeDeg,
    getGroundY,
    windX,
    windY,
    generateNew2DWind,
    addFloatingText,
    spawnDust,
    triggerAiSpeech,
  ]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // Screen shake
      if (screenShakeRef.current > 0) {
        screenShakeRef.current -= dt * 25;
        if (screenShakeRef.current < 0) screenShakeRef.current = 0;
      }
      const shakeX = (Math.random() * 2 - 1) * screenShakeRef.current;
      const shakeY = (Math.random() * 2 - 1) * screenShakeRef.current;

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 1. Draw Magical Twilight Background
      ctx.clearRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, '#0a0217');
      skyGrad.addColorStop(0.4, '#1b0933');
      skyGrad.addColorStop(0.8, '#32104d');
      skyGrad.addColorStop(1, '#110424');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Celestial Moon
      ctx.save();
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH * 0.5, 60, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1b0933';
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH * 0.5 + 9, 56, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Distant enchanted mountains
      ctx.fillStyle = '#140626';
      ctx.beginPath();
      ctx.moveTo(0, 360);
      ctx.lineTo(140, 255);
      ctx.lineTo(330, 315);
      ctx.lineTo(460, 265);
      ctx.lineTo(650, 325);
      ctx.lineTo(840, 245);
      ctx.lineTo(840, 440);
      ctx.lineTo(0, 440);
      ctx.closePath();
      ctx.fill();

      // 2. Draw Terrain with Craters
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT);
      for (let x = 0; x <= CANVAS_WIDTH; x += 4) {
        ctx.lineTo(x, getGroundY(x));
      }
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.closePath();

      const groundGrad = ctx.createLinearGradient(0, 280, 0, CANVAS_HEIGHT);
      groundGrad.addColorStop(0, '#3b1754');
      groundGrad.addColorStop(0.3, '#240d38');
      groundGrad.addColorStop(1, '#0e0417');
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // Glowing Grass/Crystal Edge
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#c084fc';
      ctx.shadowColor = '#e879f9';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // 3. Draw Redesigned Characters
      const pX = playerXRef.current;
      const pY = getGroundY(pX);
      const pSlope = getGroundSlopeDeg(pX);
      playerSlopeDegRef.current = pSlope;

      const aX = aiXRef.current;
      const aY = getGroundY(aX);
      const aSlope = getGroundSlopeDeg(aX);
      aiSlopeDegRef.current = aSlope;

      const breathing = Math.sin(currentTime * 0.004) * 1.5;

      // ==========================================
      // REDESIGNED PLAYER: ARCANE LIGHT SORCERER
      // ==========================================
      ctx.save();
      ctx.translate(pX, pY);
      ctx.rotate((pSlope * Math.PI) / 180);

      // Ground Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Shield
      if (playerShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 25;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, -22, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Freeze ice block
      if (playerFrozen) {
        ctx.fillStyle = 'rgba(103,232,249,0.4)';
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 2;
        ctx.strokeRect(-20, -48, 40, 50);
        ctx.fillRect(-20, -48, 40, 50);
      }

      // Sorcerer Flowing Robe (Sapphire Blue with Gold Trim & Cyan Runes)
      ctx.save();
      const robeGrad = ctx.createLinearGradient(-14, -36, 14, 0);
      robeGrad.addColorStop(0, '#1e3a8a');
      robeGrad.addColorStop(0.6, '#2563eb');
      robeGrad.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = robeGrad;
      ctx.beginPath();
      ctx.moveTo(0, -32 + breathing);
      ctx.quadraticCurveTo(-18, -16, -15, 0);
      ctx.lineTo(15, 0);
      ctx.quadraticCurveTo(18, -16, 0, -32 + breathing);
      ctx.closePath();
      ctx.fill();

      // Gold Robe Trim & Hem
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(15, 0);
      ctx.moveTo(0, -32 + breathing);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Belt with Arcane Sapphire Buckle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -14 + breathing, 16, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillRect(-3, -15 + breathing, 6, 6);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Sorcerer Head & Face
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(0, -32 + breathing, 8, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Cyan Arcane Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(3, -33 + breathing, 1.8, 0, Math.PI * 2);
      ctx.arc(6, -33 + breathing, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Arcane Wizard Hat (Pointed with wide curved brim & blue jewel)
      ctx.save();
      ctx.fillStyle = '#1e1b4b';
      // Brim
      ctx.beginPath();
      ctx.ellipse(0, -38 + breathing, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hat Cone
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.moveTo(-11, -38 + breathing);
      ctx.quadraticCurveTo(-2, -54 + breathing, 6, -60 + breathing);
      ctx.quadraticCurveTo(4, -48 + breathing, 11, -38 + breathing);
      ctx.closePath();
      ctx.fill();
      // Gold Buckle on Hat
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-4, -41 + breathing, 8, 3);
      ctx.restore();

      // Golden Arcane Staff & Pulsating Celestial Crystal
      ctx.save();
      const staffRad = (angle * Math.PI) / 180;
      const staffLen = 34;
      const staffBaseX = 8;
      const staffBaseY = -18 + breathing;
      const staffTipX = staffBaseX + Math.cos(staffRad) * staffLen;
      const staffTipY = staffBaseY - Math.sin(staffRad) * staffLen;

      // Wooden staff shaft
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(staffBaseX, staffBaseY);
      ctx.lineTo(staffTipX, staffTipY);
      ctx.stroke();

      // Gold filigree tip
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsating Celestial Crystal at Staff Tip
      const crystalPulse = Math.sin(currentTime * 0.008) * 1.5;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(staffTipX, staffTipY, 6 + crystalPulse, 0, Math.PI * 2);
      ctx.fill();

      // Aim Line & Crosshair Rune if player aiming
      if (turn === 'player_aiming' && !isPreMatchModalOpen) {
        const lineLen = 36 + (power / 100) * 35;
        const aimEndX = staffBaseX + Math.cos(staffRad) * lineLen;
        const aimEndY = staffBaseY - Math.sin(staffRad) * lineLen;

        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(staffTipX, staffTipY);
        ctx.lineTo(aimEndX, aimEndY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Runic targeting reticle
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(aimEndX, aimEndY, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(aimEndX, aimEndY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore(); // End Player

      // ==========================================
      // REDESIGNED AI: VOID CYBER-SHADOW ARCHMAGE
      // ==========================================
      ctx.save();
      ctx.translate(aX, aY);
      ctx.rotate((aSlope * Math.PI) / 180);

      // AI Ground Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 18, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // AI Shield
      if (aiShield) {
        ctx.strokeStyle = '#c084fc';
        ctx.shadowColor = '#9333ea';
        ctx.shadowBlur = 25;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, -22, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Freeze ice block
      if (aiFrozen) {
        ctx.fillStyle = 'rgba(103,232,249,0.4)';
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 2;
        ctx.strokeRect(-20, -48, 40, 50);
        ctx.fillRect(-20, -48, 40, 50);
      }

      // AI Obsidian Robe with Crimson Edge
      ctx.save();
      const aiRobeGrad = ctx.createLinearGradient(-15, -36, 15, 0);
      aiRobeGrad.addColorStop(0, '#3b0764');
      aiRobeGrad.addColorStop(0.5, '#581c87');
      aiRobeGrad.addColorStop(1, '#1e0538');
      ctx.fillStyle = aiRobeGrad;
      ctx.beginPath();
      ctx.moveTo(0, -32 + breathing);
      ctx.quadraticCurveTo(-20, -16, -16, 0);
      ctx.lineTo(16, 0);
      ctx.quadraticCurveTo(20, -16, 0, -32 + breathing);
      ctx.closePath();
      ctx.fill();

      // Sharp Dark Pauldron Armor Plates
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(-16, -26 + breathing);
      ctx.lineTo(-24, -34 + breathing);
      ctx.lineTo(-12, -32 + breathing);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(16, -26 + breathing);
      ctx.lineTo(24, -34 + breathing);
      ctx.lineTo(12, -32 + breathing);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // AI Shadow Head with Ominous Cowl
      ctx.fillStyle = '#0f051d';
      ctx.beginPath();
      ctx.arc(0, -32 + breathing, 9, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Horns / Cowl Spikes
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(-8, -36 + breathing);
      ctx.lineTo(-14, -50 + breathing);
      ctx.lineTo(-2, -38 + breathing);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, -36 + breathing);
      ctx.lineTo(14, -50 + breathing);
      ctx.lineTo(2, -38 + breathing);
      ctx.closePath();
      ctx.fill();

      // Glowing Fierce Red/Purple Cyber Demonic Eyes
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#e11d48';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-4, -32 + breathing, 2, 0, Math.PI * 2);
      ctx.arc(-7, -32 + breathing, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Floating Forbidden Grimoire (Tự động lật trang bay lơ lửng)
      const bookBob = Math.sin(currentTime * 0.006) * 4;
      ctx.save();
      ctx.translate(-26, -30 + bookBob);
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(-6, -8, 12, 16);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#e879f9';
      ctx.shadowBlur = 8;
      ctx.fillRect(-5, -7, 10, 14);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Floating Dark Nebula Orb
      const orbPulse = Math.sin(currentTime * 0.007) * 2;
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(0, -56 + breathing + orbPulse, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // End AI

      // 4. Update & Render Projectiles with 2D Wind Physics
      const currentProjs = [...projectilesRef.current];
      const remainingProjs: Projectile[] = [];

      for (let i = 0; i < currentProjs.length; i++) {
        const p = currentProjs[i];

        const isAntigrav = p.skillId === 'antigrav' && currentTime - p.bornAt < 1400;

        const windAccelX = isAntigrav ? 0 : windX * 18;
        const windLiftY = isAntigrav ? 0 : windY * 12;
        const currentGravity = isAntigrav ? 0 : BASE_GRAVITY - windLiftY;

        p.vx += windAccelX * dt;
        p.vy += currentGravity * dt;

        // Homing missile logic
        if (p.skillId === 'homing' && p.owner === 'player') {
          const targetX = aiXRef.current;
          const targetY = aY - 14;
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && p.x < targetX) {
            p.vy += (dy / dist) * 220 * dt;
            p.vx += (dx / dist) * 130 * dt;
          }
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Triple Thunder split
        if (p.skillId === 'triple' && !p.hasSplit && currentTime - p.bornAt > 420) {
          p.hasSplit = true;
          playClickSound();
          remainingProjs.push(
            { ...p, vy: p.vy - 65, vx: p.vx + 15, bornAt: currentTime },
            { ...p, vy: p.vy + 65, vx: p.vx - 15, bornAt: currentTime }
          );
        }

        // Particle trail
        particlesRef.current.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() * 2 - 1) * 14,
          vy: (Math.random() * 2 - 1) * 14,
          radius: Math.random() * 3 + 1.5,
          color: p.color,
          alpha: 0.85,
          decay: 0.05,
        });

        // Hit Detection
        let hasHit = false;
        const groundY = getGroundY(p.x);

        // Hit Player
        const distToPlayer = Math.hypot(p.x - pX, p.y - (pY - 18));
        if (p.owner === 'ai' && distToPlayer < 26) {
          hasHit = true;
          let dmg = Math.round(36 + Math.random() * 10);
          if (playerShield) {
            dmg = Math.round(dmg * 0.4);
            setPlayerShield(false);
            addFloatingText('🛡️ KHIÊN HẤP THỤ 60% SÁT THƯƠNG!', pX, pY - 50, '#38bdf8');
          }
          setPlayerHp((hp) => Math.max(0, hp - dmg));
          setStats((s) => ({ ...s, aiHits: s.aiHits + 1 }));
          spawnExplosion(p.x, p.y, '#a855f7', 35, 26, 20);
          playHitDamageSound();
          addFloatingText(`-${dmg} HP!`, pX, pY - 30, '#ef4444', 22);
        }

        // Hit AI
        const distToAi = Math.hypot(p.x - aX, p.y - (aY - 18));
        if (p.owner === 'player' && distToAi < 26) {
          hasHit = true;
          const skillObj = ALL_SKILLS_CATALOG.find((s) => s.id === p.skillId) || BASIC_FIREBALL;
          let baseDamage = skillObj.damage > 0 ? skillObj.damage : 38;

          if (aiShield) {
            baseDamage = Math.round(baseDamage * 0.4);
            setAiShield(false);
            addFloatingText('🛡️ KHIÊN AI ĐÃ VỠ!', aX, aY - 50, '#c084fc');
          }

          if (p.skillId === 'frost') {
            setAiFrozen(true);
            addFloatingText('❄️ ĐỐI THỦ BỊ ĐÓNG BĂNG!', aX, aY - 65, '#67e8f9');
          }

          // Visual lightning strike for Thunder skill
          if (p.skillId === 'thunder') {
            for (let ly = 0; ly < p.y; ly += 14) {
              particlesRef.current.push({
                x: p.x + (Math.random() * 12 - 6),
                y: ly,
                vx: (Math.random() * 2 - 1) * 10,
                vy: Math.random() * 50 + 50,
                radius: 3,
                color: '#fef08a',
                alpha: 1,
                decay: 0.08,
              });
            }
          }

          setAiHp((hp) => Math.max(0, hp - baseDamage));
          setStats((s) => ({
            ...s,
            playerHits: s.playerHits + 1,
            totalDamageDealt: s.totalDamageDealt + baseDamage,
          }));

          spawnExplosion(
            p.x,
            p.y,
            skillObj.color,
            skillObj.craterSize > 35 ? 45 : 30,
            skillObj.craterSize,
            skillObj.id === 'acid' ? 38 : 22
          );
          playHitDamageSound();
          addFloatingText(`-${baseDamage} HP!`, aX, aY - 30, '#facc15', 22);
        }

        // Hit Ground or Out of Screen
        if (!hasHit && (p.y >= groundY || p.x < -40 || p.x > CANVAS_WIDTH + 40)) {
          hasHit = true;
          if (p.y >= groundY) {
            const skillObj = ALL_SKILLS_CATALOG.find((s) => s.id === p.skillId) || BASIC_FIREBALL;
            spawnExplosion(
              p.x,
              groundY,
              skillObj.color,
              25,
              skillObj.craterSize,
              skillObj.id === 'acid' ? 36 : 20
            );

            // Record landing distance for AI learning
            if (p.owner === 'ai') {
              const missDist = p.x - pX;
              aiMemoryRef.current = {
                lastMissDistance: missDist,
                lastAngle: angle,
                lastPower: power,
              };
              if (Math.abs(missDist) < 55) {
                addFloatingText('⚠️ SUÝT TRÚNG!', p.x, groundY - 15, '#f97316');
              } else {
                addFloatingText('HỤT ĐÍCH!', p.x, groundY - 15, '#94a3b8');
              }
            }
          }
        }

        if (!hasHit) {
          remainingProjs.push(p);

          // Draw Projectile
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      projectilesRef.current = remainingProjs;

      // When all projectiles disappear, advance turn
      if (currentProjs.length > 0 && remainingProjs.length === 0) {
        setTimeout(() => {
          setTurn((curr) => {
            if (curr === 'player_projectile') {
              return 'ai_thinking';
            } else if (curr === 'ai_projectile') {
              // End of round: Reset steps, generate new 2D wind, decrease skill cooldowns!
              setPlayerSteps(5);
              setAiSteps(5);
              setPlayerFrozen(false);
              setAiFrozen(false);
              generateNew2DWind();
              setTurnCount((t) => t + 1);

              // Decrease all active cooldowns by 1 turn!
              setCooldowns((prev) =>
                Object.fromEntries(
                  Object.entries(prev).map(([k, v]) => [k, Math.max(0, v - 1)])
                )
              );

              return 'player_aiming';
            }
            return curr;
          });
        }, 400);
      }

      // 5. Render Particles
      const activeParticles: Particle[] = [];
      for (const pt of particlesRef.current) {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.alpha -= pt.decay;
        if (pt.alpha > 0) {
          activeParticles.push(pt);
          ctx.save();
          ctx.globalAlpha = pt.alpha;
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      particlesRef.current = activeParticles;

      // 6. Render Floating Texts
      const activeTexts: FloatingText[] = [];
      for (const ft of floatingTextsRef.current) {
        ft.y += ft.vy;
        ft.alpha -= 0.015;
        if (ft.alpha > 0) {
          activeTexts.push(ft);
          ctx.save();
          ctx.globalAlpha = ft.alpha;
          ctx.fillStyle = ft.color;
          ctx.font = `bold ${ft.size}px monospace, sans-serif`;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.fillText(ft.text, ft.x - 25, ft.y);
          ctx.restore();
        }
      }
      floatingTextsRef.current = activeTexts;

      ctx.restore();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [
    getGroundY,
    getGroundSlopeDeg,
    windX,
    windY,
    angle,
    power,
    turn,
    playerShield,
    aiShield,
    playerFrozen,
    aiFrozen,
    isPreMatchModalOpen,
    spawnExplosion,
    addFloatingText,
    generateNew2DWind,
  ]);

  // Game Over Checking
  useEffect(() => {
    if (playerHp <= 0 || aiHp <= 0) {
      if (playerHp <= 0 && aiHp <= 0) {
        setWinner(null);
      } else if (playerHp <= 0) {
        setWinner('ai');
        playGameOverSound();
        setWinStreak(0);
        try {
          localStorage.setItem('artillery_win_streak', '0');
        } catch {}
      } else if (aiHp <= 0) {
        setWinner('player');
        playComboFanfareSound();
        setWinStreak((s) => {
          const next = s + 1;
          try {
            localStorage.setItem('artillery_win_streak', next.toString());
            const prevHighestStreak = parseInt(localStorage.getItem('artillery_highest_streak') || '0', 10);
            if (next > prevHighestStreak) {
              localStorage.setItem('artillery_highest_streak', next.toString());
            }
          } catch {}
          return next;
        });

        try {
          const wins = parseInt(localStorage.getItem('artillery_total_wins') || '0', 10) + 1;
          localStorage.setItem('artillery_total_wins', wins.toString());

          if (aiDifficulty === 'grandmaster') {
            localStorage.setItem('artillery_beat_grandmaster', 'true');
          }
          const currentDmg = stats.totalDamageDealt;
          const maxDmg = Math.max(currentDmg, parseInt(localStorage.getItem('artillery_max_damage') || '0', 10));
          localStorage.setItem('artillery_max_damage', maxDmg.toString());
        } catch {}
      }
      setTurn('game_over');
    }
  }, [playerHp, aiHp, aiDifficulty, stats.totalDamageDealt]);

  // Restart match
  const handleRestart = () => {
    playClickSound();
    setPlayerHp(MAX_HP);
    setAiHp(MAX_HP);
    setPlayerShield(false);
    setAiShield(false);
    setPlayerFrozen(false);
    setAiFrozen(false);
    setPlayerSteps(5);
    setAiSteps(5);
    setCooldowns({});
    setSelectedSkillId(BASIC_FIREBALL.id);
    playerXRef.current = 130;
    aiXRef.current = 710;
    setTurn('player_aiming');
    setTurnCount(1);
    setWinner(null);
    setIsPreMatchModalOpen(true); // Open preparation modal for new game!
    handleRerollDeck();
    generateNew2DWind();
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    cratersRef.current = [];
  };

  // Canvas Slingshot Drag Aiming
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (turn !== 'player_aiming' || isPreMatchModalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (clickX < CANVAS_WIDTH * 0.45) {
      isDraggingAimRef.current = true;
      updateAimFromPoint(clickX, clickY);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingAimRef.current || turn !== 'player_aiming' || isPreMatchModalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    updateAimFromPoint(clickX, clickY);
  };

  const handleCanvasPointerUp = () => {
    isDraggingAimRef.current = false;
  };

  const updateAimFromPoint = (targetX: number, targetY: number) => {
    const pX = playerXRef.current;
    const pY = getGroundY(pX) - 16;
    const dx = targetX - pX;
    const dy = pY - targetY;

    if (dx > 0) {
      const calcAngle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
      setAngle(Math.min(85, Math.max(10, calcAngle)));
      const dist = Math.hypot(dx, dy);
      setPower(Math.min(100, Math.max(20, Math.round((dist / 140) * 100))));
    }
  };

  // Keyboard Shortcuts: A/D to walk, Arrow keys to aim, Space to shoot, 1/2/3/4 for skills
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (turn !== 'player_aiming' || isPreMatchModalOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayerFire();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handlePlayerMove('left');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handlePlayerMove('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAngle((a) => Math.min(85, a + 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAngle((a) => Math.max(10, a - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPower((p) => Math.min(100, p + 2));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPower((p) => Math.max(15, p - 2));
      } else if (e.key === '1') {
        setSelectedSkillId(BASIC_FIREBALL.id);
      } else if (e.key === '2' && activeDeck[0]) {
        if ((cooldowns[activeDeck[0].id] || 0) === 0) setSelectedSkillId(activeDeck[0].id);
      } else if (e.key === '3' && activeDeck[1]) {
        if ((cooldowns[activeDeck[1].id] || 0) === 0) setSelectedSkillId(activeDeck[1].id);
      } else if (e.key === '4' && activeDeck[2]) {
        if ((cooldowns[activeDeck[2].id] || 0) === 0) setSelectedSkillId(activeDeck[2].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [turn, handlePlayerFire, isPreMatchModalOpen, activeDeck, cooldowns, playerSteps, playerFrozen]);

  const currentGroundSlope = getGroundSlopeDeg(playerXRef.current);
  const currentWindLift = Math.round(windY * 10) / 10;
  const effectiveCalculatedAngle = Math.min(88, Math.max(8, angle + currentGroundSlope + currentWindLift));
  const horizontalForceBoostPct = Math.round((windX / 0.1) * 0.5 * 10) / 10;

  // Selected skill preview object
  const activeSelectedSkill = ALL_SKILLS_CATALOG.find((s) => s.id === selectedSkillId) || BASIC_FIREBALL;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden select-none flex flex-col items-center justify-between p-3 sm:p-5 font-sans bg-[#090312] text-white">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: HEALTH BARS (400 HP) & 2D WIND COMPASS */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#130626]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-amber-500/40 shadow-xl">
        {/* Player Health Bar (400 HP) */}
        <div className="flex-1 w-full max-w-[270px] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span>BẠN (PHÁP SƯ ÁNH SÁNG)</span>
              {playerShield && <Shield className="w-3.5 h-3.5 text-sky-300 fill-current" />}
              {playerFrozen && <Snowflake className="w-3.5 h-3.5 text-cyan-300" />}
            </span>
            <span className="text-sky-300 font-bold">{playerHp} / {MAX_HP} HP</span>
          </div>
          <div className="w-full h-3 rounded-full bg-neutral-950 p-0.5 border border-sky-500/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-300 transition-all duration-300"
              style={{ width: `${(playerHp / MAX_HP) * 100}%` }}
            />
          </div>
        </div>

        {/* Center: 2D DUAL-AXIS WIND COMPASS */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-neutral-950/90 border border-purple-500/40 text-center">
          {/* Horizontal Wind */}
          <div className="flex flex-col items-center border-r border-neutral-800 pr-3">
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Wind className="w-3 h-3 text-amber-400" />
              <span>Gió Ngang (H)</span>
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-xs text-amber-300 mt-0.5">
              <span>{windX > 0 ? 'Đông ▶' : '◀ Tây'}</span>
              <span>{Math.abs(windX)} m/s</span>
            </div>
            <span className="text-[8px] font-mono text-neutral-400">
              {horizontalForceBoostPct > 0 ? `+${horizontalForceBoostPct}% lực` : `${horizontalForceBoostPct}% lực`}
            </span>
          </div>

          {/* Vertical Wind */}
          <div className="flex flex-col items-center pl-1">
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <span>Gió Dọc (V)</span>
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-xs text-cyan-300 mt-0.5">
              <span>{windY > 0 ? 'Thổi Lên ⬆' : 'Thổi Xuống ⬇'}</span>
              <span>{Math.abs(windY)} m/s</span>
            </div>
            <span className="text-[8px] font-mono text-neutral-400">
              {windY > 0 ? `+${currentWindLift}° góc nâng` : `-${Math.abs(currentWindLift)}° góc`}
            </span>
          </div>
        </div>

        {/* AI Health Bar (400 HP) */}
        <div className="flex-1 w-full max-w-[270px] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span>ĐỐI THỦ AI ({aiDifficulty.toUpperCase()})</span>
              {aiShield && <Shield className="w-3.5 h-3.5 text-purple-300 fill-current" />}
              {aiFrozen && <Snowflake className="w-3.5 h-3.5 text-cyan-300" />}
            </span>
            <span className="text-purple-300 font-bold">{aiHp} / {MAX_HP} HP</span>
          </div>
          <div className="w-full h-3 rounded-full bg-neutral-950 p-0.5 border border-purple-500/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-rose-500 transition-all duration-300"
              style={{ width: `${(aiHp / MAX_HP) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN BATTLEFIELD CANVAS */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full my-3 flex items-center justify-center">
        <div className="relative w-full max-w-4xl aspect-[840/440] rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_50px_rgba(168,85,247,0.35)] bg-[#07030d]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerUp}
            className="w-full h-full block cursor-crosshair touch-none"
          />

          {/* Turn Banner Overlay */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
            {turn === 'player_aiming' && !isPreMatchModalOpen && (
              <div className="px-4 py-1.5 rounded-full bg-sky-500/90 text-neutral-950 font-black font-mono text-xs shadow-lg border border-white flex items-center gap-1.5 animate-bounce">
                <Target className="w-3.5 h-3.5" />
                <span>LƯỢT CỦA BẠN: HÃY CĂN GÓC VÀ LỰC!</span>
              </div>
            )}
            {turn === 'ai_thinking' && (
              <div className="px-4 py-1.5 rounded-full bg-purple-600/90 text-white font-black font-mono text-xs shadow-lg border border-purple-300 flex items-center gap-1.5 animate-pulse">
                <BrainCircuit className="w-3.5 h-3.5 animate-spin" />
                <span>AI ĐANG TÍNH TOÁN QUỸ ĐẠO BẮN 2D...</span>
              </div>
            )}
            {turn === 'ai_projectile' && (
              <div className="px-4 py-1.5 rounded-full bg-rose-600/90 text-white font-black font-mono text-xs shadow-lg border border-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>AI ĐÃ KHAI HỎA! HÃY COI CHỪNG!</span>
              </div>
            )}
          </div>

          {/* AUTO-DISAPPEARING AI VOICE SPEECH BUBBLE (Fade after 3.5s) */}
          {aiSpeech && !isPreMatchModalOpen && (
            <div className="absolute bottom-28 right-6 max-w-[220px] pointer-events-none p-2.5 rounded-2xl bg-neutral-950/90 border border-purple-500/50 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-[10px] font-mono font-bold text-purple-300 flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-purple-400" />
                <span>VOICE AI:</span>
              </div>
              <p className="text-xs text-neutral-200 font-sans italic mt-0.5 leading-snug">
                "{aiSpeech}"
              </p>
            </div>
          )}

          {/* Real-time Terrain Slope & Effective Angle HUD */}
          <div className="absolute top-3 left-4 pointer-events-none text-[10px] font-mono text-sky-200 bg-neutral-950/80 px-2.5 py-1 rounded-lg border border-sky-500/30 flex items-center gap-2">
            <span>
              Độ nghiêng địa hình: <strong>{currentGroundSlope > 0 ? `+${currentGroundSlope}°` : `${currentGroundSlope}°`}</strong>
            </span>
            <span className="text-amber-400">
              ➔ Góc thực: <strong>{effectiveCalculatedAngle}°</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOVEMENT CONTROLS & AI DIFFICULTY SELECTOR */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#120625]/90 px-4 py-2.5 rounded-2xl border border-purple-500/30 text-xs font-mono">
        {/* Step movement controls */}
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-emerald-400" />
          <span className="text-neutral-400">Di chuyển:</span>
          <span className="font-bold text-emerald-300">{playerSteps}/5 bước</span>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => handlePlayerMove('left')}
              disabled={turn !== 'player_aiming' || playerSteps <= 0 || playerFrozen || isPreMatchModalOpen}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-700 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer"
              title="Phím A: Bước sang trái"
            >
              <ArrowLeft className="w-3 h-3" /> [A] Trái
            </button>
            <button
              onClick={() => handlePlayerMove('right')}
              disabled={turn !== 'player_aiming' || playerSteps <= 0 || playerFrozen || isPreMatchModalOpen}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-700 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer"
              title="Phím D: Bước sang phải"
            >
              Phải [D] <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* AI Thought & Difficulty Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-neutral-400 text-[10px]">Cấp độ AI:</span>
            {(['novice', 'veteran', 'grandmaster'] as AIDifficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => {
                  playClickSound();
                  setAiDifficulty(level);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  aiDifficulty === level
                    ? 'bg-purple-600 text-white border border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {level === 'novice' ? 'Tập Sự' : level === 'veteran' ? 'Tinh Nhuệ' : 'Đại Pháp Sư'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. IN-GAME WEAPON SELECTOR (FIREBALL + 3 LOCKED SPECIAL SKILLS) & SLIDERS */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-4xl mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* WEAPONS ROW: FIREBALL (BASE) + 3 SKILLS */}
        <div className="md:col-span-5 p-2.5 rounded-2xl bg-[#120624] border border-purple-900/60 shadow-lg space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pb-1 border-b border-neutral-800">
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>PHÉP THUẬT CHIẾN ĐẤU</span>
            </span>
            <span className="text-[9px] text-neutral-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-neutral-500" />
              <span>Đã khóa bộ kỹ năng</span>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {/* 1. BASIC FIREBALL (ALWAYS AVAILABLE, NO COOLDOWN) */}
            <button
              onClick={() => {
                playClickSound();
                setSelectedSkillId(BASIC_FIREBALL.id);
              }}
              className={`relative p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer text-center ${
                selectedSkillId === BASIC_FIREBALL.id
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-neutral-950 font-bold border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105 z-10'
                  : 'bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold leading-tight truncate w-full">Hỏa Cầu</span>
              <span className="text-[8px] font-mono text-emerald-400">Vô hạn</span>
              <span className="text-[8px] font-mono text-amber-300/80 absolute top-1 right-1">[1]</span>
            </button>

            {/* 2, 3, 4. THE 3 RANDOMLY DRAWN SPECIAL SKILLS (WITH TURN COOLDOWNS) */}
            {activeDeck.map((skill, idx) => {
              const isSelected = selectedSkillId === skill.id;
              const cd = cooldowns[skill.id] || 0;
              const isOnCooldown = cd > 0;

              return (
                <button
                  key={skill.id}
                  disabled={isOnCooldown || turn !== 'player_aiming'}
                  onClick={() => {
                    playClickSound();
                    setSelectedSkillId(skill.id);
                  }}
                  className={`relative p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-center ${
                    isOnCooldown
                      ? 'bg-neutral-950 text-neutral-600 border border-neutral-900 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-gradient-to-b from-purple-600 to-purple-700 text-white font-bold border-2 border-amber-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105 z-10 cursor-pointer'
                      : 'bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 border border-neutral-800 cursor-pointer'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight truncate w-full">
                    {skill.name}
                  </span>

                  {isOnCooldown ? (
                    <span className="text-[8px] font-mono text-rose-400 flex items-center gap-0.5 font-bold">
                      <Hourglass className="w-2.5 h-2.5 animate-spin" /> {cd} lượt
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono text-cyan-300">Sẵn sàng</span>
                  )}

                  <span className="text-[8px] font-mono text-purple-300/80 absolute top-1 right-1">
                    [{idx + 2}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Skill description preview */}
          <p className="text-[10px] font-sans text-neutral-400 italic truncate pt-1">
            ℹ️ {activeSelectedSkill.name}: {activeSelectedSkill.desc}
          </p>
        </div>

        {/* SLIDERS FOR ANGLE & POWER (4 COLUMNS) */}
        <div className="md:col-span-4 p-3 rounded-2xl bg-[#120624] border border-purple-900/60 shadow-lg space-y-2.5">
          {/* Angle Slider */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>GÓC:</span>
            </span>
            <input
              type="range"
              min="10"
              max="85"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value, 10))}
              disabled={turn !== 'player_aiming' || isPreMatchModalOpen}
              className="flex-1 accent-amber-400 cursor-pointer h-1.5 rounded-lg bg-neutral-800"
            />
            <span className="w-10 text-right font-black text-amber-400 font-mono text-xs">
              {angle}°
            </span>
          </div>

          {/* Power Slider */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>LỰC:</span>
            </span>
            <input
              type="range"
              min="15"
              max="100"
              value={power}
              onChange={(e) => setPower(parseInt(e.target.value, 10))}
              disabled={turn !== 'player_aiming' || isPreMatchModalOpen}
              className="flex-1 accent-orange-400 cursor-pointer h-1.5 rounded-lg bg-neutral-800"
            />
            <span className="w-10 text-right font-black text-orange-400 font-mono text-xs">
              {power}%
            </span>
          </div>
        </div>

        {/* FIRE BUTTON (3 COLUMNS) */}
        <div className="md:col-span-3">
          <button
            onClick={handlePlayerFire}
            disabled={turn !== 'player_aiming' || isPreMatchModalOpen}
            className={`w-full py-3.5 px-4 rounded-2xl font-black font-sans tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              turn === 'player_aiming' && !isPreMatchModalOpen
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-neutral-950 shadow-[0_0_30px_rgba(245,158,11,0.6)] transform hover:scale-[1.02] active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>BẮN! [SPACE]</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PRE-MATCH PREPARATION POP-UP MODAL (RÚT 3 KỸ NĂNG + HỎA CẦU, ĐỔI ĐƯỢC TẠI ĐÂY) */}
      {/* ========================================================================= */}
      {isPreMatchModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-xl w-full bg-[#18072d] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_80px_rgba(168,85,247,0.5)] space-y-5">
            {/* Header */}
            <div className="text-center space-y-1.5 border-b border-purple-900/60 pb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>CHUẨN BỊ CHIẾN ĐẤU (HP: {MAX_HP})</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                THIẾT LẬP KỸ NĂNG & ĐỘ KHÓ
              </h2>
              <p className="text-xs text-neutral-300">
                Chọn độ khó của đối thủ và tùy biến bộ kỹ năng ma pháp trước khi bước vào lôi đài!
              </p>
            </div>

            {/* AI DIFFICULTY SELECTOR IN PRE-MATCH */}
            <div className="space-y-1.5 bg-[#120625] p-3 rounded-2xl border border-purple-900/60">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                  <span>THIẾT LẬP CẤP ĐỘ ĐỐI THỦ AI:</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-sans">
                  {aiDifficulty === 'novice' && '🟢 Tập Sự: Sai số lớn, đạn bay chệch nhiều'}
                  {aiDifficulty === 'veteran' && '🟡 Tinh Nhuệ: Tính toán gió 2D và độ dốc địa hình'}
                  {aiDifficulty === 'grandmaster' && '🔴 Đại Pháp Sư: Monte Carlo cao cấp, tự sửa sai số'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      id: 'novice',
                      name: 'Tập Sự (Dễ)',
                      desc: 'Sai số lớn, thích hợp tập dượt',
                      badge: '🌱 DỄ',
                      activeStyle: 'bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.35)]',
                    },
                    {
                      id: 'veteran',
                      name: 'Tinh Nhuệ (Vừa)',
                      desc: 'Cân bằng gió 2D & địa hình dốc',
                      badge: '⚡ VỪA',
                      activeStyle: 'bg-amber-950/60 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
                    },
                    {
                      id: 'grandmaster',
                      name: 'Đại Pháp Sư (Khó)',
                      desc: 'Tự sửa sai, bách phát bách trúng',
                      badge: '🔥 KHÓ',
                      activeStyle: 'bg-rose-950/60 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
                    },
                  ] as const
                ).map((lvl) => {
                  const isSelected = aiDifficulty === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setAiDifficulty(lvl.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? `${lvl.activeStyle} border-2 scale-[1.02]`
                          : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 text-neutral-400 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-sans truncate">{lvl.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-white/10">
                          {lvl.badge}
                        </span>
                      </div>
                      <span className="text-[10px] font-sans text-neutral-400 mt-1 leading-snug">
                        {lvl.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Skill: Basic Fireball */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>KỸ NĂNG CƠ BẢN MẶC ĐỊNH (KHÔNG NẰM TRONG 12 KỸ NĂNG):</span>
              </span>
              <div className="p-3 rounded-2xl bg-neutral-950/80 border border-amber-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-300">{BASIC_FIREBALL.name}</h4>
                    <p className="text-xs text-neutral-400">{BASIC_FIREBALL.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  Hồi chiêu: 0 lượt
                </span>
              </div>
            </div>

            {/* 3 Random Special Skills Drawn */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>3 KỸ NĂNG ĐƯỢC BAN TẶNG (TRONG 12 KỸ NĂNG):</span>
                </span>
                <span className="text-[10px] text-neutral-400">Tối đa hồi chiêu: 3 lượt</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeDeck.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3 rounded-2xl bg-[#230b3f] border border-purple-500/40 space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{skill.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-rose-300 font-bold">
                          ⏳ Hồi {skill.cooldownTurns} lượt
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                        {skill.desc}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-purple-900/50">
                      {skill.damage > 0 ? `Sát thương: ~${skill.damage} HP` : skill.damage < 0 ? `Hồi máu: +${Math.abs(skill.damage)} HP` : 'Khiên phòng hộ'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note & Action Buttons */}
            <div className="space-y-3 pt-1">
              <p className="text-[11px] font-mono text-center text-amber-300/80 bg-black/40 py-1.5 px-3 rounded-xl border border-amber-500/20">
                ⚠️ Lưu ý: Khi đã bấm "VÀO TRẬN ĐẤU NGAY", bạn sẽ <strong>không thể đổi kỹ năng</strong> trong suốt ván đấu!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleRerollDeck}
                  className="w-full py-3 px-4 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-purple-200 font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Dices className="w-4 h-4 text-purple-300" />
                  <span>🎲 ĐỔI 3 KỸ NĂNG KHÁC</span>
                </button>

                <button
                  onClick={handleStartBattle}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-neutral-950 font-black text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Swords className="w-4 h-4" />
                  <span>⚔️ VÀO TRẬN ĐẤU NGAY</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MATCH RESULT MODAL */}
      {/* ========================================================================= */}
      {turn === 'game_over' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-sm w-full bg-[#180829] border-2 border-amber-500 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_70px_rgba(245,158,11,0.5)]">
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
                winner === 'player'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400 animate-bounce'
                  : 'bg-red-500/20 text-red-400 border border-red-400 animate-pulse'
              }`}
            >
              {winner === 'player' ? <Trophy className="w-9 h-9" /> : <Flame className="w-9 h-9" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black font-sans uppercase">
                {winner === 'player' ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                    CHIẾN THẮNG HUY HOÀNG!
                  </span>
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-purple-500">
                    BẠN ĐÃ BỊ HẠ GỤC!
                  </span>
                )}
              </h3>
              <p className="text-xs font-sans text-neutral-300">
                {winner === 'player'
                  ? 'Kỹ năng căn gió 2D và độ dốc địa hình của bạn đã áp đảo đối thủ AI!'
                  : 'AI đã học hỏi và thích ứng địa hình nghiêng để lội ngược dòng! Hãy phục thù!'}
              </p>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Số hiệp đấu:</span>
                <strong className="text-amber-400">{turnCount} Hiệp</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Độ chính xác của bạn:</span>
                <strong className="text-emerald-400">
                  {stats.playerShots > 0
                    ? Math.round((stats.playerHits / stats.playerShots) * 100)
                    : 0}
                  %
                </strong>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Tổng sát thương gây ra:</span>
                <strong className="text-yellow-300">{stats.totalDamageDealt} HP</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-400 border-t border-neutral-800/80 pt-2">
                <span>Chuỗi thắng liên tiếp:</span>
                <strong className="text-amber-400 font-mono">{winStreak} Trận</strong>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-neutral-950 font-bold text-sm font-sans tracking-wide shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TÁI ĐẤU NGAY</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
