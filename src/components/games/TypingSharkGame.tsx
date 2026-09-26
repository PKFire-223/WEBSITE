import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  WordTarget,
  BossState,
  BossId,
  Projectile,
  FloatingText,
  Particle,
  Bubble,
  ActiveBuff,
  BuffType,
  SubmarineSkinId,
  FishType,
} from '../../types/typingShark';
import {
  ENGLISH_WORDS,
  VIETNAMESE_WORDS,
  WordDictionary,
  getRandomWordByTime,
  getRandomCleanseWord,
  getRandomBarrelWord,
  getRandomEliteWord,
  getRandomBossWord,
} from '../../data/typingWords';
import {
  loadSavedUpgrades,
  saveUpgrades,
  loadSavedStats,
  saveStats,
  hardResetProgress,
  UpgradeTreeState,
  SKILL_DEFINITIONS,
  SUBMARINE_SKINS,
} from '../../data/typingSkills';
import {
  playKeystrokeSound,
  playTorpedoSound,
  playDroneZapSound,
  playMonsterExplodeSound,
  playCoinDingSound,
  playTypoErrorSound,
  playDepthChargeBombSound,
  playBossWarningSiren,
  playSubDamageSound,
  playVictoryFanfare,
  playMysteryBarrelSound,
  playSwarmWarningSound,
  setTypingSharkMuted,
} from '../../utils/typingSharkAudio';
import { TypingSkillTreeModal } from './TypingSkillTreeModal';
import { getZoneByTime } from './typingShark/oceanZones';
import { drawSubmarineWithSkin } from './typingShark/submarineRenderers';
import {
  drawMonsterShape,
  drawWordBadge,
  drawBossEntity,
} from './typingShark/monsterRenderers';
import {
  Shield,
  Heart,
  Zap,
  Bomb,
  Volume2,
  VolumeX,
  Play,
  Globe,
  Sparkles,
  Gift,
  Keyboard,
} from 'lucide-react';

export const TypingSharkGame: React.FC = () => {
  // Persistent upgrades and stats
  const [upgrades, setUpgrades] = useState<UpgradeTreeState>(loadSavedUpgrades);
  const [stats, setStats] = useState(loadSavedStats);

  // Game Lifecycle States
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameover' | 'victory'>('lobby');
  const [isPaused, setIsPaused] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [isGameOverContext, setIsGameOverContext] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(true);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  // Live in-game stats for current run
  const [gameTime, setGameTime] = useState<number>(0); // in seconds
  const [hp, setHp] = useState<number>(100);
  const [maxHp, setMaxHp] = useState<number>(100);
  const [shield, setShield] = useState<number>(0);
  const [maxShield, setMaxShield] = useState<number>(0);
  const [bombsAvailable, setBombsAvailable] = useState<number>(1);
  const [runGold, setRunGold] = useState<number>(0);
  const [runKills, setRunKills] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctKeys, setCorrectKeys] = useState<number>(0);
  const [totalKeys, setTotalKeys] = useState<number>(0);
  const [currentWpm, setCurrentWpm] = useState<number>(0);

  // Active Buffs from mystery barrels
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);

  // Active Boss state & banners
  const [boss, setBoss] = useState<BossState | null>(null);
  const [bossWarning, setBossWarning] = useState<string | null>(null);
  const [zoneNotice, setZoneNotice] = useState<string | null>(null);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engine references
  const engineRef = useRef<{
    targets: WordTarget[];
    projectiles: Projectile[];
    floatingTexts: FloatingText[];
    particles: Particle[];
    bubbles: Bubble[];
    lockedTargetId: string | null;
    lastSpawnTime: number;
    lastAutoTypeTime: number;
    lastWingmanFireTime: number;
    lastShieldRegenTime: number;
    lastDamageTime: number;
    lastEliteSpawnTime: number;
    lastBarrelSpawnTime: number;
    lastSwarmTime: number;
    screenShake: number;
    inkBlindness: number;
    currentBoss: BossState | null;
    runActive: boolean;
    milestoneBossesSpawned: Set<string>; // Prevents re-spawning bug!
  }>({
    targets: [],
    projectiles: [],
    floatingTexts: [],
    particles: [],
    bubbles: [],
    lockedTargetId: null,
    lastSpawnTime: 0,
    lastAutoTypeTime: 0,
    lastWingmanFireTime: 0,
    lastShieldRegenTime: 0,
    lastDamageTime: 0,
    lastEliteSpawnTime: 0,
    lastBarrelSpawnTime: 0,
    lastSwarmTime: 0,
    screenShake: 0,
    inkBlindness: 0,
    currentBoss: null,
    runActive: false,
    milestoneBossesSpawned: new Set<string>(),
  });

  const dictionary: WordDictionary = language === 'en' ? ENGLISH_WORDS : VIETNAMESE_WORDS;

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setTypingSharkMuted(next);
  };

  // Re-calculate derived values
  const derivedStats = {
    autoTypingSpeed: SKILL_DEFINITIONS.auto_typing_speed.getCurrentValue(upgrades.auto_typing_speed),
    maxHp: SKILL_DEFINITIONS.max_health.getCurrentValue(upgrades.max_health),
    maxShield: SKILL_DEFINITIONS.shield_generator.getCurrentValue(upgrades.shield_generator),
    goldMultiplier: SKILL_DEFINITIONS.gold_multiplier.getCurrentValue(upgrades.gold_multiplier),
    maxBombs: SKILL_DEFINITIONS.depth_bomb_capacity.getCurrentValue(upgrades.depth_bomb_capacity),
    cryoSlow: SKILL_DEFINITIONS.cryo_slowdown.getCurrentValue(upgrades.cryo_slowdown),
    chainLightning: SKILL_DEFINITIONS.chain_lightning.getCurrentValue(upgrades.chain_lightning),
    lifeLeech: SKILL_DEFINITIONS.life_leech.getCurrentValue(upgrades.life_leech),
    comboFrenzy: SKILL_DEFINITIONS.combo_frenzy.getCurrentValue(upgrades.combo_frenzy),
    supportGunboats: SKILL_DEFINITIONS.support_gunboat.getCurrentValue(upgrades.support_gunboat),
    hyperLaser: SKILL_DEFINITIONS.hyper_laser.getCurrentValue(upgrades.hyper_laser),
    treasureBonus: SKILL_DEFINITIONS.treasure_radar.getCurrentValue(upgrades.treasure_radar),
    shockwaveArmor: SKILL_DEFINITIONS.shockwave_armor.getCurrentValue(upgrades.shockwave_armor),
    piercingTorpedo: SKILL_DEFINITIONS.piercing_torpedo.getCurrentValue(upgrades.piercing_torpedo),
  };

  // Check active buffs
  const hasBuff = useCallback((type: BuffType) => activeBuffs.some((b) => b.type === type), [activeBuffs]);

  // Award gold immediately and persist to localStorage
  const awardGold = useCallback((amount: number, killsInc = 0) => {
    setRunGold((g) => g + amount);
    if (killsInc > 0) setRunKills((k) => k + killsInc);
    setStats((prev) => {
      const updated = {
        ...prev,
        gold: prev.gold + amount,
        lifetimeGold: prev.lifetimeGold + amount,
        kills: prev.kills + killsInc,
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  // Save on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveStats(stats);
      saveUpgrades(upgrades);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveStats(stats);
      saveUpgrades(upgrades);
    };
  }, [stats, upgrades]);

  // Skill upgrade purchase
  const handleSkillUpgrade = (skillKey: keyof UpgradeTreeState, cost: number) => {
    if (stats.gold < cost) return;
    const newGold = stats.gold - cost;
    const newUpgrades = {
      ...upgrades,
      [skillKey]: upgrades[skillKey] + 1,
    };
    const newStats = {
      ...stats,
      gold: newGold,
    };
    setUpgrades(newUpgrades);
    setStats(newStats);
    saveUpgrades(newUpgrades);
    saveStats(newStats);
  };

  // Skin selection
  const handleSelectSkin = (skinId: SubmarineSkinId) => {
    const newStats = { ...stats, selectedSkin: skinId };
    setStats(newStats);
    saveStats(newStats);
  };

  // Hard Reset
  const handleHardReset = () => {
    const res = hardResetProgress();
    setUpgrades(res.upgrades);
    setStats(res.stats);
    setGameState('lobby');
  };

  // Start / Restart game
  const startGame = useCallback(() => {
    const curMaxHp = SKILL_DEFINITIONS.max_health.getCurrentValue(upgrades.max_health);
    const curMaxShield = SKILL_DEFINITIONS.shield_generator.getCurrentValue(upgrades.shield_generator);
    const curBombs = SKILL_DEFINITIONS.depth_bomb_capacity.getCurrentValue(upgrades.depth_bomb_capacity);

    setMaxHp(curMaxHp);
    setHp(curMaxHp);
    setMaxShield(curMaxShield);
    setShield(curMaxShield);
    setBombsAvailable(curBombs);
    setGameTime(0);
    setRunGold(0);
    setRunKills(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectKeys(0);
    setTotalKeys(0);
    setCurrentWpm(0);
    setActiveBuffs([]);
    setBoss(null);
    setBossWarning(null);
    setZoneNotice(null);
    setIsPaused(false);
    setShowSkillTree(false);
    setIsGameOverContext(false);
    setGameState('playing');

    const engine = engineRef.current;
    engine.targets = [];
    engine.projectiles = [];
    engine.floatingTexts = [];
    engine.particles = [];
    engine.lockedTargetId = null;
    engine.lastSpawnTime = Date.now();
    engine.lastAutoTypeTime = Date.now();
    engine.lastWingmanFireTime = Date.now();
    engine.lastShieldRegenTime = Date.now();
    engine.lastDamageTime = Date.now();
    engine.lastEliteSpawnTime = Date.now();
    engine.lastBarrelSpawnTime = Date.now();
    engine.lastSwarmTime = Date.now();
    engine.screenShake = 0;
    engine.inkBlindness = 0;
    engine.currentBoss = null;
    engine.runActive = true;
    engine.milestoneBossesSpawned = new Set<string>();

    // Init bubbles
    engine.bubbles = Array.from({ length: 35 }, () => ({
      x: Math.random() * 900,
      y: Math.random() * 600,
      speed: 0.5 + Math.random() * 1.5,
      radius: 1.5 + Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.4,
      swingOffset: Math.random() * Math.PI * 2,
    }));
  }, [upgrades]);

  // Activate Mystery Barrel Buff
  const triggerRandomBuff = () => {
    playMysteryBarrelSound();
    const buffs: { type: BuffType; name: string; icon: string; color: string; duration: number }[] = [
      { type: 'freeze', name: 'Bão Băng Đóng Băng Biển Sâu', icon: '❄️', color: '#38bdf8', duration: 20 },
      { type: 'drone_overclock', name: 'Siêu Tốc Drone x4 Tốc Độ', icon: '⚡', color: '#22d3ee', duration: 25 },
      { type: 'torpedo_salvo', name: 'Mưa Ngư Lôi Siêu Thanh Xòe Quạt', icon: '🚀', color: '#f43f5e', duration: 25 },
      { type: 'gold_rush', name: 'Cơn Mưa Vàng Đại Dương x5', icon: '🪙', color: '#fbbf24', duration: 25 },
      { type: 'invincible_shield', name: 'Khiên Thánh Bất Tử Hư Không', icon: '🛡️', color: '#fde047', duration: 20 },
      { type: 'bomb_barrage', name: 'Tiếp Tế +3 Bom Sóng Siêu Âm', icon: '💣', color: '#fb923c', duration: 15 },
    ];

    const pick = buffs[Math.floor(Math.random() * buffs.length)];
    const bonusSec = derivedStats.treasureBonus;
    const finalDuration = pick.duration + bonusSec;

    if (pick.type === 'bomb_barrage') {
      setBombsAvailable((b) => b + 3);
    }

    setActiveBuffs((prev) => {
      const filtered = prev.filter((b) => b.type !== pick.type);
      return [
        ...filtered,
        {
          type: pick.type,
          name: pick.name,
          icon: pick.icon,
          duration: finalDuration,
          maxDuration: finalDuration,
          color: pick.color,
        },
      ];
    });

    engineRef.current.floatingTexts.push({
      id: Math.random().toString(),
      text: `🎁 BUFF: ${pick.name}!`,
      x: 350,
      y: 180,
      color: pick.color,
      opacity: 1,
      vy: -1.5,
    });
  };

  // Trigger Depth Bomb (Screen Wiper)
  const triggerDepthBomb = useCallback(() => {
    if (bombsAvailable <= 0 || gameState !== 'playing') return;
    setBombsAvailable((prev) => Math.max(0, prev - 1));
    playDepthChargeBombSound();

    const engine = engineRef.current;
    engine.screenShake = 25;
    engine.inkBlindness = 0; // Cleanses ink!

    // Shockwave particles
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60;
      const speed = 4 + Math.random() * 8;
      engine.particles.push({
        x: 450,
        y: 250,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color: '#38bdf8',
        alpha: 1,
        decay: 0.02,
      });
    }

    // Eliminate regular monsters
    let killedCount = 0;
    let goldGained = 0;
    engine.targets.forEach((target) => {
      killedCount++;
      goldGained += target.goldValue;
      playMonsterExplodeSound();
      engine.floatingTexts.push({
        id: Math.random().toString(),
        text: `+${Math.round(target.goldValue * derivedStats.goldMultiplier)}🪙`,
        x: target.x,
        y: target.y,
        color: '#fbbf24',
        opacity: 1,
        vy: -1.5,
      });
    });

    engine.targets = [];
    engine.lockedTargetId = null;

    // Damage Boss if active
    if (engine.currentBoss) {
      const bossDmg = Math.round(30 * derivedStats.piercingTorpedo);
      engine.currentBoss.currentHp = Math.max(0, engine.currentBoss.currentHp - bossDmg);
      engine.floatingTexts.push({
        id: Math.random().toString(),
        text: `BOOM! -${bossDmg} HP BOSS`,
        x: engine.currentBoss.x,
        y: engine.currentBoss.y,
        color: '#f43f5e',
        opacity: 1,
        vy: -2,
      });
      if (engine.currentBoss.currentHp <= 0) {
        handleBossDefeated(engine.currentBoss);
      }
    }

    const goldBonus = hasBuff('gold_rush') ? 5 : 1;
    const earned = Math.round(goldGained * derivedStats.goldMultiplier * goldBonus);
    awardGold(earned, killedCount);
  }, [bombsAvailable, gameState, derivedStats, hasBuff, awardGold]);

  // Handle Boss Defeated
  const handleBossDefeated = (currentBoss: BossState) => {
    playMonsterExplodeSound(true);
    const engine = engineRef.current;
    engine.screenShake = 35;

    // Boss gold rewards
    const rewards: Record<BossId, number> = {
      megalodon: 1200,
      kraken: 3000,
      dragon: 7000,
      behemoth: 15000,
      leviathan: 50000,
    };
    const baseReward = rewards[currentBoss.bossId] || 2000;
    const goldBonus = hasBuff('gold_rush') ? 5 : 1;
    const finalGold = Math.round(baseReward * derivedStats.goldMultiplier * goldBonus);

    awardGold(finalGold, 0);

    // Unlock skin for defeating this boss!
    const skinKeyMap: Record<BossId, SubmarineSkinId> = {
      megalodon: 'megalodon_armor',
      kraken: 'kraken_shadow',
      dragon: 'dragon_azure',
      behemoth: 'poseidon_mech',
      leviathan: 'void_leviathan',
    };
    const unlockedSkinId = skinKeyMap[currentBoss.bossId];
    if (unlockedSkinId && !stats.unlockedSkins.includes(unlockedSkinId)) {
      const nextUnlocked = [...stats.unlockedSkins, unlockedSkinId];
      const nextStats = { ...stats, unlockedSkins: nextUnlocked };
      setStats(nextStats);
      saveStats(nextStats);
      engine.floatingTexts.push({
        id: Math.random().toString(),
        text: `🔓 MỞ KHÓA SKIN MỚI: ${SUBMARINE_SKINS[unlockedSkinId].name}!`,
        x: 450,
        y: 150,
        color: '#fde047',
        opacity: 1,
        vy: -1,
      });
    }

    engine.floatingTexts.push({
      id: Math.random().toString(),
      text: `🏆 BOSS DIỆT VONG! +${finalGold.toLocaleString()}🪙`,
      x: 450,
      y: 200,
      color: '#34d399',
      opacity: 1,
      vy: -1,
    });

    // Check for Final 25-minute victory (Leviathan)
    if (currentBoss.bossId === 'leviathan') {
      engine.currentBoss = null;
      setBoss(null);
      handleGameVictory();
      return;
    }

    // Map Shift Notice
    const nextZone = getZoneByTime(gameTime + 60);
    setZoneNotice(`🌊 TIẾN VÀO ${nextZone.title.toUpperCase()}!`);
    setTimeout(() => setZoneNotice(null), 6000);

    engine.currentBoss = null;
    setBoss(null);
    setBossWarning(null);
  };

  // Handle Ultimate Game Victory
  const handleGameVictory = () => {
    playVictoryFanfare();
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.5 },
    });

    setGameState('victory');
    engineRef.current.runActive = false;

    setStats((prev) => {
      const newStats = {
        ...prev,
        bossesKilled: prev.bossesKilled + 5,
        totalKeystrokes: prev.totalKeystrokes + totalKeys,
        correctKeystrokes: prev.correctKeystrokes + correctKeys,
        maxWpm: Math.max(prev.maxWpm, currentWpm),
        highestMinuteSurvived: Math.max(prev.highestMinuteSurvived, Math.floor(gameTime / 60)),
        gamesPlayed: prev.gamesPlayed + 1,
        victories: prev.victories + 1,
      };
      saveStats(newStats);
      return newStats;
    });
  };

  // Handle Game Over
  const handleGameOver = () => {
    playSubDamageSound();
    setGameState('gameover');
    engineRef.current.runActive = false;

    setStats((prev) => {
      const newStats = {
        ...prev,
        totalKeystrokes: prev.totalKeystrokes + totalKeys,
        correctKeystrokes: prev.correctKeystrokes + correctKeys,
        maxWpm: Math.max(prev.maxWpm, currentWpm),
        highestMinuteSurvived: Math.max(prev.highestMinuteSurvived, Math.floor(gameTime / 60)),
        gamesPlayed: prev.gamesPlayed + 1,
      };
      saveStats(newStats);
      return newStats;
    });
  };

  // BOSS SPAWN CHECK (Fixes the bug permanently by tracking milestoneBossesSpawned)
  const checkBossSpawn = (currentSeconds: number) => {
    const engine = engineRef.current;
    if (engine.currentBoss) return;

    // Boss 1: Minute 5 (300s)
    if (currentSeconds >= 300 && !engine.milestoneBossesSpawned.has('boss_5m')) {
      engine.milestoneBossesSpawned.add('boss_5m');
      spawnBoss('megalodon');
    }
    // Boss 2: Minute 10 (600s)
    else if (currentSeconds >= 600 && !engine.milestoneBossesSpawned.has('boss_10m')) {
      engine.milestoneBossesSpawned.add('boss_10m');
      spawnBoss('kraken');
    }
    // Boss 3: Minute 15 (900s)
    else if (currentSeconds >= 900 && !engine.milestoneBossesSpawned.has('boss_15m')) {
      engine.milestoneBossesSpawned.add('boss_15m');
      spawnBoss('dragon');
    }
    // Boss 4: Minute 20 (1200s)
    else if (currentSeconds >= 1200 && !engine.milestoneBossesSpawned.has('boss_20m')) {
      engine.milestoneBossesSpawned.add('boss_20m');
      spawnBoss('behemoth');
    }
    // Boss 5: Minute 25 (1500s) - Ultimate Final Boss
    else if (currentSeconds >= 1500 && !engine.milestoneBossesSpawned.has('boss_25m')) {
      engine.milestoneBossesSpawned.add('boss_25m');
      spawnBoss('leviathan');
    }
  };

  const spawnBoss = (bossId: BossId) => {
    playBossWarningSiren();
    const engine = engineRef.current;
    let newBoss: BossState;

    if (bossId === 'megalodon') {
      setBossWarning('⚠️ BÁ CHỦ THƯỢNG CỔ: ANCIENT MEGALODON XUẤT HIỆN! (PHÚT 05:00)');
      newBoss = {
        active: true,
        bossId: 'megalodon',
        name: 'Megalodon Thượng Cổ',
        title: 'Hàm Cá Mập Hắc Ám (Minute 05:00 Boss)',
        maxHp: 65,
        currentHp: 65,
        x: 750,
        y: 260,
        targetY: 260,
        phase: 1,
        attackTimer: 0,
        specialTimer: 0,
        isEnraged: false,
        wordsPool: [getRandomBossWord(dictionary, 'megalodon'), getRandomBossWord(dictionary, 'megalodon')],
        activeWords: [
          { id: '1', word: getRandomBossWord(dictionary, 'megalodon'), typedIndex: 0, offsetX: 0, offsetY: -40 },
          { id: '2', word: getRandomBossWord(dictionary, 'megalodon'), typedIndex: 0, offsetX: 0, offsetY: 40 },
        ],
        shieldActive: true,
      };

      for (let i = 0; i < 4; i++) {
        engine.targets.push({
          id: Math.random().toString(),
          word: getRandomWordByTime(dictionary, 120),
          typedIndex: 0,
          x: 580 + (i % 2) * 50,
          y: 120 + i * 80,
          targetY: 120 + i * 80,
          speed: 0.8,
          type: 'boss_minion',
          maxHp: 1,
          hp: 1,
          goldValue: 20,
          radius: 18,
          color: '#38bdf8',
          wobbleOffset: Math.random() * Math.PI,
          tailAngle: 0,
          isBossPart: true,
        });
      }
    } else if (bossId === 'kraken') {
      setBossWarning('⚠️ BẠCH TUỘC VỰC SÂU: ABYSSAL KRAKEN TRỖI DẬY! (PHÚT 10:00)');
      newBoss = {
        active: true,
        bossId: 'kraken',
        name: 'Kraken Vực Thẳm',
        title: 'Ma Thần Xúc Tu (Minute 10:00 Boss)',
        maxHp: 110,
        currentHp: 110,
        x: 730,
        y: 280,
        targetY: 280,
        phase: 1,
        attackTimer: 0,
        specialTimer: 0,
        isEnraged: false,
        wordsPool: [getRandomBossWord(dictionary, 'kraken')],
        activeWords: [
          { id: '1', word: getRandomBossWord(dictionary, 'kraken'), typedIndex: 0, offsetX: 0, offsetY: -50 },
          { id: '2', word: getRandomBossWord(dictionary, 'kraken'), typedIndex: 0, offsetX: 0, offsetY: 0 },
          { id: '3', word: getRandomBossWord(dictionary, 'kraken'), typedIndex: 0, offsetX: 0, offsetY: 50 },
        ],
        shieldActive: false,
        inkActive: true,
        inkOpacity: 0.65,
      };
      engine.inkBlindness = 0.65;

      for (let i = 0; i < 4; i++) {
        engine.targets.push({
          id: Math.random().toString(),
          word: getRandomCleanseWord(dictionary),
          typedIndex: 0,
          x: 520 + i * 40,
          y: 120 + i * 90,
          targetY: 120 + i * 90,
          speed: 0.6,
          type: 'boss_tentacle',
          maxHp: 1,
          hp: 1,
          goldValue: 40,
          radius: 22,
          color: '#c084fc',
          wobbleOffset: Math.random() * Math.PI,
          tailAngle: 0,
          isBossPart: true,
        });
      }
    } else if (bossId === 'dragon') {
      setBossWarning('❄️ BĂNG LONG CỔ ĐẠI: GLACIAL SEA DRAGON TRỖI DẬY! (PHÚT 15:00)');
      newBoss = {
        active: true,
        bossId: 'dragon',
        name: 'Băng Long Cổ Đại',
        title: 'Thần Thú Băng Hàn (Minute 15:00 Boss)',
        maxHp: 180,
        currentHp: 180,
        x: 730,
        y: 270,
        targetY: 270,
        phase: 1,
        attackTimer: 0,
        specialTimer: 0,
        isEnraged: false,
        wordsPool: [getRandomBossWord(dictionary, 'dragon')],
        activeWords: [
          { id: '1', word: getRandomBossWord(dictionary, 'dragon'), typedIndex: 0, offsetX: 0, offsetY: -50 },
          { id: '2', word: getRandomBossWord(dictionary, 'dragon'), typedIndex: 0, offsetX: 0, offsetY: 0 },
          { id: '3', word: getRandomBossWord(dictionary, 'dragon'), typedIndex: 0, offsetX: 0, offsetY: 50 },
        ],
        shieldActive: true,
        iceStormActive: true,
      };
    } else if (bossId === 'behemoth') {
      setBossWarning('⚡ CỰ THẦN CƠ GIỚI: POSEIDON BEHEMOTH MECH! (PHÚT 20:00)');
      newBoss = {
        active: true,
        bossId: 'behemoth',
        name: 'Poseidon Mech Behemoth',
        title: 'Cơ Thần Lôi Đình (Minute 20:00 Boss)',
        maxHp: 270,
        currentHp: 270,
        x: 720,
        y: 270,
        targetY: 270,
        phase: 1,
        attackTimer: 0,
        specialTimer: 0,
        isEnraged: true,
        wordsPool: [getRandomBossWord(dictionary, 'behemoth')],
        activeWords: [
          { id: '1', word: getRandomBossWord(dictionary, 'behemoth'), typedIndex: 0, offsetX: 0, offsetY: -55 },
          { id: '2', word: getRandomBossWord(dictionary, 'behemoth'), typedIndex: 0, offsetX: 0, offsetY: 0 },
          { id: '3', word: getRandomBossWord(dictionary, 'behemoth'), typedIndex: 0, offsetX: 0, offsetY: 55 },
        ],
        shieldActive: true,
        laserCharging: true,
      };
    } else {
      setBossWarning('👑 CHÚA TỂ VỰC THẲNG TỐI THƯỢNG: VOID LEVIATHAN SOVEREIGN! ĐÁNH BẠI ĐỂ WIN GAME! (PHÚT 25:00)');
      newBoss = {
        active: true,
        bossId: 'leviathan',
        name: 'Hư Không Thần Trùng Leviathan Prime',
        title: 'Đấng Sáng Tạo Vực Thẳm - Đánh Bại Để Chiến Thắng Tuyệt Đối!',
        maxHp: 420,
        currentHp: 420,
        x: 710,
        y: 270,
        targetY: 270,
        phase: 1,
        attackTimer: 0,
        specialTimer: 0,
        isEnraged: true,
        wordsPool: [getRandomBossWord(dictionary, 'leviathan')],
        activeWords: [
          { id: '1', word: getRandomBossWord(dictionary, 'leviathan'), typedIndex: 0, offsetX: 0, offsetY: -60 },
          { id: '2', word: getRandomBossWord(dictionary, 'leviathan'), typedIndex: 0, offsetX: 0, offsetY: 0 },
          { id: '3', word: getRandomBossWord(dictionary, 'leviathan'), typedIndex: 0, offsetX: 0, offsetY: 60 },
        ],
        shieldActive: true,
        vortexActive: true,
      };
    }

    engine.currentBoss = newBoss;
    setBoss(newBoss);
  };

  // Target Destroyed Logic
  const handleTargetDestroyed = (target: WordTarget) => {
    playMonsterExplodeSound();
    const engine = engineRef.current;

    engine.targets = engine.targets.filter((t) => t.id !== target.id);
    if (engine.lockedTargetId === target.id) {
      engine.lockedTargetId = null;
    }

    // Check if mystery barrel
    if (target.type === 'barrel') {
      triggerRandomBuff();
      return;
    }

    // Reward gold & kills
    const goldBonus = hasBuff('gold_rush') ? 5 : 1;
    const earnedGold = Math.round(target.goldValue * derivedStats.goldMultiplier * goldBonus);
    awardGold(earnedGold, 1);
    playCoinDingSound();

    engine.floatingTexts.push({
      id: Math.random().toString(),
      text: `+${earnedGold}🪙`,
      x: target.x,
      y: target.y - 15,
      color: '#fbbf24',
      opacity: 1,
      vy: -1.5,
    });

    // Life Leech Nanobots
    if (derivedStats.lifeLeech > 0) {
      setHp((h) => Math.min(maxHp, h + derivedStats.lifeLeech));
      setShield((s) => Math.min(maxShield, s + derivedStats.lifeLeech));
    }

    // Chain Lightning Splash
    if (derivedStats.chainLightning > 0) {
      const splashTargets = engine.targets.slice(0, derivedStats.chainLightning);
      splashTargets.forEach((st) => {
        if (st.typedIndex < st.word.length) {
          st.typedIndex++;
          engine.projectiles.push({
            id: Math.random().toString(),
            startX: target.x,
            startY: target.y,
            x: target.x,
            y: target.y,
            targetId: st.id,
            targetX: st.x,
            targetY: st.y,
            speed: 20,
            color: '#a855f7',
            type: 'chain',
          });
          if (st.typedIndex >= st.word.length) {
            handleTargetDestroyed(st);
          }
        }
      });
    }

    // If Kraken tentacle, reduce ink blindness!
    if (target.type === 'boss_tentacle') {
      engine.inkBlindness = Math.max(0, engine.inkBlindness - 0.3);
    }
  };

  // Unified character input handler (supports Physical Keyboard, On-Screen Virtual Keyboard, and Tap-to-type)
  const handleCharacterInput = useCallback((char: string) => {
    if (gameState !== 'playing' || isPaused || showSkillTree) return;

    if (char === ' ' || char === 'SPACE') {
      triggerDepthBomb();
      return;
    }

    const pressedChar = char.toUpperCase();
    const engine = engineRef.current;
    setTotalKeys((k) => k + 1);

    let lockedTarget = engine.targets.find((t) => t.id === engine.lockedTargetId);

    // Boss target check if no locked monster
    if (!lockedTarget && engine.currentBoss) {
      const hasMinions = engine.targets.some((t) => t.isBossPart);
      if (!hasMinions) {
        const bossWord = engine.currentBoss.activeWords.find((w) => {
          const nextChar = w.word[w.typedIndex];
          return nextChar === pressedChar;
        });

        if (bossWord) {
          playKeystrokeSound();
          playTorpedoSound();
          setCorrectKeys((k) => k + 1);
          setCombo((c) => {
            const next = c + 1;
            setMaxCombo((mc) => Math.max(mc, next));
            return next;
          });

          bossWord.typedIndex++;

          engine.projectiles.push({
            id: Math.random().toString(),
            startX: 140,
            startY: 280,
            x: 140,
            y: 280,
            targetId: engine.currentBoss.bossId,
            targetX: engine.currentBoss.x + bossWord.offsetX,
            targetY: engine.currentBoss.y + bossWord.offsetY,
            speed: 16,
            color: '#38bdf8',
            type: 'torpedo',
          });

          if (bossWord.typedIndex >= bossWord.word.length) {
            playMonsterExplodeSound();
            const dmg = Math.round(12 * derivedStats.piercingTorpedo);
            engine.currentBoss.currentHp -= dmg;
            bossWord.word = getRandomBossWord(dictionary, engine.currentBoss.bossId);
            bossWord.typedIndex = 0;

            engine.floatingTexts.push({
              id: Math.random().toString(),
              text: `-${dmg} HP BOSS`,
              x: engine.currentBoss.x,
              y: engine.currentBoss.y,
              color: '#f43f5e',
              opacity: 1,
              vy: -1.5,
            });

            if (engine.currentBoss.currentHp <= 0) {
              handleBossDefeated(engine.currentBoss);
            }
          }
          return;
        }
      }
    }

    // If we have a locked target
    if (lockedTarget) {
      const nextChar = lockedTarget.word[lockedTarget.typedIndex];
      if (nextChar === pressedChar || (nextChar === ' ' && pressedChar === ' ')) {
        playKeystrokeSound();
        playTorpedoSound();
        setCorrectKeys((k) => k + 1);
        setCombo((c) => {
          const next = c + 1;
          setMaxCombo((mc) => Math.max(mc, next));
          return next;
        });

        lockedTarget.typedIndex++;

        // Multiple torpedo salvo if buff is active
        if (hasBuff('torpedo_salvo')) {
          for (let s = -1; s <= 1; s++) {
            engine.projectiles.push({
              id: Math.random().toString(),
              startX: 140,
              startY: 280 + s * 10,
              x: 140,
              y: 280 + s * 10,
              targetId: lockedTarget.id,
              targetX: lockedTarget.x,
              targetY: lockedTarget.y + s * 15,
              speed: 18,
              color: '#f43f5e',
              type: 'salvo',
            });
          }
        } else {
          engine.projectiles.push({
            id: Math.random().toString(),
            startX: 140,
            startY: 280,
            x: 140,
            y: 280,
            targetId: lockedTarget.id,
            targetX: lockedTarget.x,
            targetY: lockedTarget.y,
            speed: 15,
            color: '#38bdf8',
            type: 'torpedo',
          });
        }

        if (lockedTarget.typedIndex >= lockedTarget.word.length) {
          handleTargetDestroyed(lockedTarget);
        }
      } else {
        // Typo error
        playTypoErrorSound();
        setCombo(0);

        if (engine.currentBoss?.bossId === 'leviathan') {
          engine.screenShake = 12;
          setHp((h) => {
            const next = Math.max(0, h - 8);
            if (next <= 0) handleGameOver();
            return next;
          });
          engine.floatingTexts.push({
            id: Math.random().toString(),
            text: `PHẠT GÕ SAI -8HP!`,
            x: 150,
            y: 250,
            color: '#ef4444',
            opacity: 1,
            vy: -2,
          });
        }
      }
    } else {
      // Lock new target
      const candidates = engine.targets.filter((t) => t.word[0] === pressedChar);
      if (candidates.length > 0) {
        candidates.sort((a, b) => a.x - b.x);
        const newTarget = candidates[0];
        engine.lockedTargetId = newTarget.id;
        newTarget.typedIndex = 1;

        playKeystrokeSound();
        playTorpedoSound();
        setCorrectKeys((k) => k + 1);
        setCombo((c) => {
          const next = c + 1;
          setMaxCombo((mc) => Math.max(mc, next));
          return next;
        });

        engine.projectiles.push({
          id: Math.random().toString(),
          startX: 140,
          startY: 280,
          x: 140,
          y: 280,
          targetId: newTarget.id,
          targetX: newTarget.x,
          targetY: newTarget.y,
          speed: 15,
          color: '#38bdf8',
          type: 'torpedo',
        });

        if (newTarget.typedIndex >= newTarget.word.length) {
          handleTargetDestroyed(newTarget);
        }
      } else {
        playTypoErrorSound();
        setCombo(0);
      }
    }
  }, [gameState, isPaused, showSkillTree, triggerDepthBomb, dictionary, derivedStats, hasBuff, handleTargetDestroyed]);

  // Tap-on-Monster or Canvas click handler
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 900 / rect.width;
    const scaleY = 520 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const engine = engineRef.current;
    // Find closest target within 80px
    let bestDist = 80;
    let closestTarget: WordTarget | null = null;
    for (const t of engine.targets) {
      const d = Math.hypot(t.x - clickX, t.y - clickY);
      if (d < bestDist) {
        bestDist = d;
        closestTarget = t;
      }
    }

    if (closestTarget) {
      const nextChar = closestTarget.word[closestTarget.typedIndex];
      if (nextChar) {
        handleCharacterInput(nextChar);
      }
    } else if (engine.currentBoss) {
      // Tap on Boss words
      const bossWord = engine.currentBoss.activeWords.find((w) => {
        const wordX = engine.currentBoss!.x + w.offsetX;
        const wordY = engine.currentBoss!.y + w.offsetY;
        return Math.hypot(wordX - clickX, wordY - clickY) < 60;
      });
      if (bossWord) {
        const nextChar = bossWord.word[bossWord.typedIndex];
        if (nextChar) handleCharacterInput(nextChar);
      }
    } else {
      // Focus hidden input for mobile device soft keyboard
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }
  };

  // Keyboard typing input listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || isPaused || showSkillTree) return;

      if (e.code === 'Space') {
        e.preventDefault();
        triggerDepthBomb();
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
      handleCharacterInput(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isPaused, showSkillTree, triggerDepthBomb, handleCharacterInput]);

  // Clock Timer Tick (1s interval)
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const timer = setInterval(() => {
      setGameTime((prevTime) => {
        const nextTime = prevTime + 1;
        checkBossSpawn(nextTime);
        return nextTime;
      });

      // Decrement active buffs
      setActiveBuffs((prev) =>
        prev
          .map((b) => ({ ...b, duration: b.duration - 1 }))
          .filter((b) => b.duration > 0)
      );

      // Recalculate WPM
      setCorrectKeys((corr) => {
        setGameTime((secs) => {
          if (secs > 0) {
            const words = corr / 5;
            const minutes = secs / 60;
            const wpm = Math.round(words / minutes);
            setCurrentWpm(wpm);
          }
          return secs;
        });
        return corr;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isPaused]);

  // Shield Auto-Regeneration
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const regenInterval = setInterval(() => {
      const engine = engineRef.current;
      const now = Date.now();
      if (now - engine.lastDamageTime > 5000 && maxShield > 0) {
        setShield((prevShield) => Math.min(maxShield, prevShield + 8));
      }
    }, 1000);

    return () => clearInterval(regenInterval);
  }, [gameState, isPaused, maxShield]);

  // Main Animation Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastFrameTime = performance.now();

    const renderLoop = (timestamp: number) => {
      const delta = (timestamp - lastFrameTime) / 1000;
      lastFrameTime = timestamp;

      if (gameState === 'playing' && !isPaused) {
        updateGame(delta);
      }

      drawGame(ctx, canvas.width, canvas.height);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPaused, derivedStats, language, activeBuffs, stats.selectedSkin]);

  // Game Logic Update
  const updateGame = (dt: number) => {
    const engine = engineRef.current;
    const now = Date.now();

    // 1. Auto-Typing AI Drone Logic
    const droneMultiplier = hasBuff('drone_overclock') ? 4 : 1;
    const effectiveDroneSpeed = derivedStats.autoTypingSpeed * droneMultiplier;
    if (effectiveDroneSpeed > 0) {
      const intervalMs = 1000 / effectiveDroneSpeed;
      if (now - engine.lastAutoTypeTime >= intervalMs) {
        engine.lastAutoTypeTime = now;
        performAutoDroneTyping();
      }
    }

    // 2. Wingman Support Submarines Fire
    if (derivedStats.supportGunboats > 0) {
      if (now - engine.lastWingmanFireTime >= 1200 / derivedStats.supportGunboats) {
        engine.lastWingmanFireTime = now;
        performWingmanFire();
      }
    }

    // 3. Spawning regular monsters
    const spawnRateMs = Math.max(900, 2800 - Math.min(gameTime * 2.8, 1700));
    if (now - engine.lastSpawnTime >= spawnRateMs && engine.targets.length < 9) {
      engine.lastSpawnTime = now;
      spawnRandomMonster();
    }

    // 4. Mystery Barrel Spawn (Every 35-45s)
    if (now - engine.lastBarrelSpawnTime >= 38000 && !engine.targets.some((t) => t.type === 'barrel')) {
      engine.lastBarrelSpawnTime = now;
      spawnMysteryBarrel();
    }

    // 5. Elite Mini-Boss Spawn (Every 80-100s if no main boss active)
    if (now - engine.lastEliteSpawnTime >= 85000 && !engine.currentBoss) {
      engine.lastEliteSpawnTime = now;
      spawnEliteMiniBoss();
    }

    // 6. Swarm Wave Trigger
    if (now - engine.lastSwarmTime >= 130000 && gameTime > 120) {
      engine.lastSwarmTime = now;
      triggerSwarmWave();
    }

    // 7. Move Monsters towards Submarine (X = 140)
    const isFrozen = hasBuff('freeze');
    const effectiveCryoFactor = isFrozen ? 0.25 : 1 - derivedStats.cryoSlow;
    const vortexBonus = engine.currentBoss?.vortexActive ? 1.45 : 1.0;

    engine.targets.forEach((target) => {
      target.x -= target.speed * 60 * dt * effectiveCryoFactor * vortexBonus;
      target.wobbleOffset += dt * 5;
      target.tailAngle = Math.sin(target.wobbleOffset);

      if (target.type === 'pufferfish' && target.x < 350) {
        target.pufferScale = Math.min(1.8, (target.pufferScale || 1) + dt * 0.8);
      }

      if (target.x <= 150) {
        handleMonsterCollision(target);
      }
    });

    // 8. Update Projectiles
    engine.projectiles.forEach((proj) => {
      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20 || isNaN(dist)) {
        proj.speed = 0;
      } else {
        proj.x += (dx / dist) * proj.speed * 60 * dt;
        proj.y += (dy / dist) * proj.speed * 60 * dt;
      }
    });
    engine.projectiles = engine.projectiles.filter((p) => p.speed > 0);

    // 9. Update Floating Texts & Particles
    engine.floatingTexts.forEach((ft) => {
      ft.y += ft.vy;
      ft.opacity -= 0.02;
    });
    engine.floatingTexts = engine.floatingTexts.filter((ft) => ft.opacity > 0);

    engine.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
    });
    engine.particles = engine.particles.filter((p) => p.alpha > 0);

    // 10. Update Bubbles
    engine.bubbles.forEach((b) => {
      b.y -= b.speed;
      b.x += Math.sin(b.swingOffset + b.y * 0.05) * 0.5;
      if (b.y < -10) {
        b.y = 520;
        b.x = Math.random() * 900;
      }
    });

    if (engine.screenShake > 0) {
      engine.screenShake = Math.max(0, engine.screenShake - dt * 40);
    }
  };

  // Auto-Drone Execution
  const performAutoDroneTyping = () => {
    const engine = engineRef.current;
    if (engine.targets.length === 0 && !engine.currentBoss) return;

    let target = engine.targets.find((t) => t.id === engine.lockedTargetId);
    if (!target && engine.targets.length > 0) {
      const sorted = [...engine.targets].sort((a, b) => a.x - b.x);
      target = sorted[0];
      engine.lockedTargetId = target.id;
    }

    if (target) {
      target.typedIndex++;
      playDroneZapSound();
      setCorrectKeys((k) => k + 1);

      engine.projectiles.push({
        id: Math.random().toString(),
        startX: 130,
        startY: 230,
        x: 130,
        y: 230,
        targetId: target.id,
        targetX: target.x,
        targetY: target.y,
        speed: 35,
        color: '#22d3ee',
        type: 'laser',
        isAutoDrone: true,
      });

      if (target.typedIndex >= target.word.length) {
        handleTargetDestroyed(target);
      }
    } else if (engine.currentBoss && !engine.targets.some((t) => t.isBossPart)) {
      const activeWord = engine.currentBoss.activeWords[0];
      if (activeWord) {
        activeWord.typedIndex++;
        playDroneZapSound();
        setCorrectKeys((k) => k + 1);

        engine.projectiles.push({
          id: Math.random().toString(),
          startX: 130,
          startY: 230,
          x: 130,
          y: 230,
          targetId: engine.currentBoss.bossId,
          targetX: engine.currentBoss.x,
          targetY: engine.currentBoss.y,
          speed: 35,
          color: '#22d3ee',
          type: 'laser',
          isAutoDrone: true,
        });

        if (activeWord.typedIndex >= activeWord.word.length) {
          const dmg = Math.round(10 * derivedStats.piercingTorpedo);
          engine.currentBoss.currentHp -= dmg;
          activeWord.word = getRandomBossWord(dictionary, engine.currentBoss.bossId);
          activeWord.typedIndex = 0;
          if (engine.currentBoss.currentHp <= 0) {
            handleBossDefeated(engine.currentBoss);
          }
        }
      }
    }
  };

  // Wingman Mini-Sub Fire
  const performWingmanFire = () => {
    const engine = engineRef.current;
    if (engine.targets.length === 0) return;
    const sorted = [...engine.targets].sort((a, b) => a.x - b.x);
    const target = sorted[0];
    if (target) {
      target.typedIndex++;
      playTorpedoSound();
      engine.projectiles.push({
        id: Math.random().toString(),
        startX: 120,
        startY: 290,
        x: 120,
        y: 290,
        targetId: target.id,
        targetX: target.x,
        targetY: target.y,
        speed: 25,
        color: '#38bdf8',
        type: 'wingman',
      });
      if (target.typedIndex >= target.word.length) {
        handleTargetDestroyed(target);
      }
    }
  };

  // Monster Collision with Submarine
  const handleMonsterCollision = (target: WordTarget) => {
    playSubDamageSound();
    const engine = engineRef.current;
    engine.screenShake = 16;
    engine.lastDamageTime = Date.now();

    const isInvincible = hasBuff('invincible_shield');
    if (isInvincible) {
      engine.floatingTexts.push({
        id: Math.random().toString(),
        text: `KHIÊN BẤT TỬ ĐÃ CHẶN ĐÒN!`,
        x: 150,
        y: 240,
        color: '#fde047',
        opacity: 1,
        vy: -2,
      });
      engine.targets = engine.targets.filter((t) => t.id !== target.id);
      return;
    }

    let damage = target.type === 'mine' ? 45 : target.isElite ? 35 : target.type === 'hammerhead' ? 25 : 15;

    // Shockwave Reactive Armor reflection
    if (derivedStats.shockwaveArmor > 0) {
      engine.targets.forEach((t) => {
        if (t.id !== target.id) {
          t.x = Math.min(850, t.x + 80); // Knockback!
        }
      });
    }

    setShield((curShield) => {
      if (curShield >= damage) {
        return curShield - damage;
      } else {
        const remainingDmg = damage - curShield;
        setHp((curHp) => {
          const nextHp = Math.max(0, curHp - remainingDmg);
          if (nextHp <= 0) {
            handleGameOver();
          }
          return nextHp;
        });
        return 0;
      }
    });

    engine.targets = engine.targets.filter((t) => t.id !== target.id);
    if (engine.lockedTargetId === target.id) {
      engine.lockedTargetId = null;
    }

    engine.floatingTexts.push({
      id: Math.random().toString(),
      text: `-${damage} HP!`,
      x: 140,
      y: 270,
      color: '#ef4444',
      opacity: 1,
      vy: -2,
    });
  };

  // Mystery Wooden Barrel Spawning
  const spawnMysteryBarrel = () => {
    const engine = engineRef.current;
    const spawnY = 100 + Math.random() * 320;
    const word = getRandomBarrelWord(dictionary);

    engine.targets.push({
      id: Math.random().toString(),
      word,
      typedIndex: 0,
      x: 880,
      y: spawnY,
      targetY: spawnY,
      speed: 0.65,
      type: 'barrel',
      maxHp: 1,
      hp: 1,
      goldValue: 50,
      radius: 20,
      color: '#b45309',
      wobbleOffset: Math.random() * Math.PI,
      tailAngle: 0,
    });
  };

  // Elite Mini-Boss Spawning
  const spawnEliteMiniBoss = () => {
    const engine = engineRef.current;
    const spawnY = 120 + Math.random() * 280;
    const word = getRandomEliteWord(dictionary);

    engine.floatingTexts.push({
      id: Math.random().toString(),
      text: `⚠️ TINH ANH BIỂN SÂU XUẤT HIỆN!`,
      x: 500,
      y: 100,
      color: '#f59e0b',
      opacity: 1,
      vy: -1,
    });

    engine.targets.push({
      id: Math.random().toString(),
      word,
      typedIndex: 0,
      x: 880,
      y: spawnY,
      targetY: spawnY,
      speed: 0.55,
      type: 'elite_miniboss',
      maxHp: 1,
      hp: 1,
      goldValue: 250,
      radius: 28,
      color: '#eab308',
      wobbleOffset: Math.random() * Math.PI,
      tailAngle: 0,
      isElite: true,
      eliteName: 'Quái Tinh Anh',
    });
  };

  // Swarm Wave Trigger
  const triggerSwarmWave = () => {
    playSwarmWarningSound();
    setBossWarning('⚠️ BẦY CÁ ĐẠI HẢI TRÌNH ĐANG ĐỔ BỘ! (SWARM INCOMING!)');
    setTimeout(() => setBossWarning(null), 4000);

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        spawnRandomMonster(true);
      }, i * 300);
    }
  };

  // Random Monster Factory (15+ fish types with progressive difficulty)
  const spawnRandomMonster = (isSwarm = false) => {
    const engine = engineRef.current;
    const yMin = 70;
    const yMax = 440;
    const spawnY = yMin + Math.random() * (yMax - yMin);

    const fishTypes: FishType[] = [
      'piranha', 'shark', 'hammerhead', 'pufferfish', 'mine',
      'squid', 'eel', 'stingray', 'jellyfish', 'crab',
      'swordfish', 'ghost_shark', 'anglerfish', 'mantis_shrimp', 'sea_dragon',
    ];

    // Pick type based on game time
    let availableMaxIndex = 2; // piranha, shark, hammerhead
    if (gameTime > 60) availableMaxIndex = 5;
    if (gameTime > 180) availableMaxIndex = 8;
    if (gameTime > 360) availableMaxIndex = 11;
    if (gameTime > 600) availableMaxIndex = 14;

    const chosenIndex = Math.floor(Math.random() * (availableMaxIndex + 1));
    const type = fishTypes[chosenIndex];

    const word = getRandomWordByTime(dictionary, gameTime);
    let speed = 0.9 + Math.random() * 0.4;
    let gold = 15;
    let color = '#38bdf8';
    let radius = 18;

    if (type === 'swordfish') {
      speed = 1.9;
      gold = 45;
      color = '#38bdf8';
    } else if (type === 'piranha') {
      speed = 1.35;
      gold = 10;
      color = '#ef4444';
      radius = 14;
    } else if (type === 'hammerhead' || type === 'crab') {
      speed = 0.75;
      gold = 35;
      color = '#94a3b8';
      radius = 24;
    } else if (type === 'mine') {
      speed = 0.6;
      gold = 25;
      color = '#dc2626';
    } else if (type === 'eel') {
      speed = 1.25;
      gold = 40;
      color = '#eab308';
    } else if (type === 'ghost_shark') {
      speed = 1.1;
      gold = 55;
      color = '#a855f7';
    } else if (type === 'sea_dragon') {
      speed = 0.7;
      gold = 80;
      color = '#22d3ee';
      radius = 26;
    }

    if (isSwarm) speed *= 1.15;

    engine.targets.push({
      id: Math.random().toString(),
      word,
      typedIndex: 0,
      x: 880,
      y: spawnY,
      targetY: spawnY,
      speed,
      type,
      maxHp: 1,
      hp: 1,
      goldValue: gold,
      radius,
      color,
      wobbleOffset: Math.random() * Math.PI,
      tailAngle: 0,
    });
  };

  // Canvas Drawing Engine
  const drawGame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const engine = engineRef.current;
    const zone = getZoneByTime(gameTime);

    ctx.save();

    if (engine.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * engine.screenShake;
      const shakeY = (Math.random() - 0.5) * engine.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Zone Dynamic Background Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, zone.bgGradTop);
    oceanGrad.addColorStop(0.5, zone.bgGradMid);
    oceanGrad.addColorStop(1, zone.bgGradBottom);
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Caustic Rays
    ctx.save();
    ctx.globalAlpha = zone.causticAlpha;
    for (let i = 0; i < 5; i++) {
      const rayGrad = ctx.createLinearGradient(150 + i * 150, 0, 80 + i * 120, height);
      rayGrad.addColorStop(0, zone.causticColor);
      rayGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(100 + i * 160, 0);
      ctx.lineTo(160 + i * 160, 0);
      ctx.lineTo(80 + i * 120, height);
      ctx.lineTo(20 + i * 120, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Bubbles
    engine.bubbles.forEach((b) => {
      ctx.save();
      ctx.fillStyle = zone.bubbleColor;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Seafloor
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height - 35);
    ctx.quadraticCurveTo(width * 0.25, height - 60, width * 0.5, height - 40);
    ctx.quadraticCurveTo(width * 0.75, height - 20, width, height - 45);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // 5. DRAW SUBMARINE WITH SELECTED SKIN
    drawSubmarineWithSkin(
      ctx,
      110,
      270,
      stats.selectedSkin,
      shield,
      hasBuff('invincible_shield'),
      derivedStats.supportGunboats
    );

    // 6. Draw AI Drone
    if (derivedStats.autoTypingSpeed > 0) {
      ctx.save();
      const floatY = 215 + Math.sin(Date.now() * 0.006) * 5;
      ctx.translate(110, floatY);
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#0891b2';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a5f3fc';
      ctx.beginPath();
      ctx.arc(3, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#22d3ee';
      ctx.textAlign = 'center';
      ctx.fillText(`AI LV.${upgrades.auto_typing_speed}`, 0, -16);
      ctx.restore();
    }

    // 7. DRAW BOSS IF ACTIVE
    if (engine.currentBoss) {
      drawBossEntity(ctx, engine.currentBoss);
    }

    // 8. DRAW SEA MONSTERS & WORD BADGES
    engine.targets.forEach((target) => {
      drawMonsterShape(ctx, target);
      drawWordBadge(ctx, target, engine.lockedTargetId === target.id);
    });

    // 9. DRAW PROJECTILES & LASERS
    engine.projectiles.forEach((p) => {
      ctx.save();
      if (p.type === 'laser') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(p.startX, p.startY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else if (p.type === 'chain') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p.startX, p.startY);
        ctx.lineTo((p.startX + p.x) / 2, (p.startY + p.y) / 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.type === 'salvo' ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 10. Floating Texts
    engine.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // 11. Kraken Ink Blindness Overlay
    if (engine.inkBlindness > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(10, 5, 20, ${Math.min(0.85, engine.inkBlindness)})`;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🦑 MỰC ĐEN CHE KHUẤT TẦM NHÌN! GÕ XÚC TU HOẶC [SPACEBAR] ĐỂ XÓA MỰC!', width / 2, 45);
      ctx.restore();
    }

    ctx.restore();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentZone = getZoneByTime(gameTime);

  return (
    <div className="relative w-full bg-[#030712] text-neutral-100 font-sans select-none flex flex-col items-center">
      {/* TOP HUD BAR */}
      <div className="w-full bg-neutral-950/90 border-b border-cyan-500/20 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-3">
          {/* Submarine HP */}
          <div className="flex items-center gap-1.5 bg-neutral-900/90 px-2.5 py-1 rounded-xl border border-red-500/30">
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <div className="text-xs font-mono font-bold text-red-400">
              {hp} / {maxHp} <span className="text-[10px] text-neutral-400">HP</span>
            </div>
          </div>

          {/* Energy Shield */}
          {maxShield > 0 && (
            <div className="flex items-center gap-1.5 bg-neutral-900/90 px-2.5 py-1 rounded-xl border border-cyan-500/30">
              <Shield className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              <div className="text-xs font-mono font-bold text-cyan-300">
                {shield} / {maxShield} <span className="text-[10px] text-neutral-400">Khiên</span>
              </div>
            </div>
          )}

          {/* Depth Bomb Stock */}
          <button
            onClick={triggerDepthBomb}
            disabled={bombsAvailable <= 0 || gameState !== 'playing'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              bombsAvailable > 0
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
            title="Nhấn SPACEBAR để kích nổ Bom Sóng Siêu Âm quét sạch quái vật!"
          >
            <Bomb className="w-4 h-4 text-amber-400" />
            <span>x{bombsAvailable} [SPACE]</span>
          </button>
        </div>

        {/* Center: Live Timer & Zone info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-xl border border-cyan-500/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-sm font-mono font-black text-cyan-300 tracking-wider">
              {formatTime(gameTime)}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-xl text-cyan-300">
            <span>🗺️</span>
            <span>{currentZone.name}</span>
          </div>
        </div>

        {/* Right: Gold, WPM & Skill Tree Quick Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-neutral-900/90 px-3 py-1 rounded-xl border border-amber-500/40">
            <span className="text-sm">🪙</span>
            <span className="text-xs font-mono font-black text-amber-300">
              {runGold.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-neutral-900 px-2.5 py-1 rounded-xl border border-neutral-800 text-xs font-mono text-emerald-400 font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentWpm} WPM</span>
          </div>

          <button
            onClick={() => {
              setIsPaused(true);
              setShowSkillTree(true);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-md shadow-cyan-600/25 border border-cyan-400/40 transition-all cursor-pointer"
          >
            <span>🌳</span>
            <span>Cây Kỹ Năng</span>
          </button>

          <button
            onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
            title="Chuyển đổi Tiếng Anh / Tiếng Việt"
          >
            <Globe className="w-4 h-4 inline-block mr-1 text-cyan-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Toggle Virtual Keyboard */}
          <button
            onClick={() => setShowVirtualKeyboard((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
              showVirtualKeyboard
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
            title="Bật/Tắt bàn phím ảo trên màn hình cho Mobile / iPad"
          >
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{showVirtualKeyboard ? 'Phím Ảo' : 'Ẩn Phím'}</span>
          </button>

          <button
            onClick={handleToggleSound}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ACTIVE BUFFS STRIP */}
      {activeBuffs.length > 0 && (
        <div className="w-full bg-neutral-900/90 border-b border-neutral-800 px-4 py-1.5 flex items-center justify-center gap-4 overflow-x-auto z-15">
          {activeBuffs.map((buff) => (
            <div
              key={buff.type}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold animate-pulse"
              style={{ borderColor: buff.color, color: buff.color, backgroundColor: `${buff.color}15` }}
            >
              <span>{buff.icon}</span>
              <span>{buff.name}: {buff.duration}s</span>
            </div>
          ))}
        </div>
      )}

      {/* BOSS WARNING & ZONE NOTICE STRIP */}
      {bossWarning && (
        <div className="w-full bg-red-950/90 border-y border-red-500/50 py-1.5 px-4 text-center text-xs font-mono font-black text-red-200 tracking-wider flex items-center justify-center gap-2 animate-bounce z-10">
          <span>🚨</span>
          <span>{bossWarning}</span>
          <span>🚨</span>
        </div>
      )}
      {zoneNotice && !bossWarning && (
        <div className="w-full bg-cyan-950/90 border-y border-cyan-500/50 py-1.5 px-4 text-center text-xs font-mono font-black text-cyan-200 tracking-wider flex items-center justify-center gap-2 animate-pulse z-10">
          <span>{zoneNotice}</span>
        </div>
      )}

      {/* Hidden native input to summon iOS/Android soft keyboard on tap */}
      <input
        ref={hiddenInputRef}
        type="text"
        value=""
        onChange={(e) => {
          const val = e.target.value;
          if (val.length > 0) {
            const char = val[val.length - 1];
            handleCharacterInput(char);
          }
        }}
        className="opacity-0 absolute -left-[9999px] pointer-events-none"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* GAME CANVAS VIEWPORT */}
      <div className="relative w-full max-w-[900px] aspect-[900/520] max-h-[500px] min-h-[260px] bg-[#020617] overflow-hidden flex items-center justify-center shadow-2xl">
        <canvas
          ref={canvasRef}
          width={900}
          height={520}
          onPointerDown={handleCanvasPointerDown}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* LOBBY WELCOME OVERLAY */}
        {gameState === 'lobby' && (
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center text-4xl mb-3 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              🦈
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 tracking-wide uppercase">
              Typing Shark: Vực Sâu Thần Hải
            </h1>
            <p className="text-sm text-neutral-300 font-mono max-w-lg mt-2 leading-relaxed">
              Gõ chữ diệt 15 loại quái vật và tàu mìn biển sâu. Cày vàng nâng cấp <strong>Cây Kỹ Năng Lũy Tiến</strong>, mở khóa Skin thuyền huyền thoại và công phá <strong>Đại Boss Leviathan Phút 25</strong>!
            </p>

            <div className="grid grid-cols-4 gap-2.5 my-5 max-w-md w-full text-xs font-mono">
              <div className="bg-neutral-900/80 p-2 rounded-xl border border-cyan-500/30">
                <div className="text-neutral-400">🤖 Trợ Thủ AI</div>
                <div className="text-cyan-300 font-bold mt-0.5">
                  {SKILL_DEFINITIONS.auto_typing_speed.getFormattedValue(upgrades.auto_typing_speed)}
                </div>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded-xl border border-amber-500/30">
                <div className="text-neutral-400">🪙 Kho Vàng</div>
                <div className="text-amber-300 font-bold mt-0.5">
                  {stats.gold.toLocaleString()}
                </div>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded-xl border border-purple-500/30">
                <div className="text-neutral-400">🚢 Skin Tàu</div>
                <div className="text-purple-300 font-bold mt-0.5">
                  {stats.unlockedSkins.length}/6 Đã Mở
                </div>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded-xl border border-emerald-500/30">
                <div className="text-neutral-400">⏱️ Kỷ Lục</div>
                <div className="text-emerald-300 font-bold mt-0.5">
                  {stats.highestMinuteSurvived} phút
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-neutral-950 font-black text-sm font-mono uppercase tracking-wider shadow-lg shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-neutral-950" />
                <span>Xuất Phát Ngay</span>
              </button>

              <button
                onClick={() => setShowSkillTree(true)}
                className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-cyan-300 font-bold text-sm font-mono border border-cyan-500/40 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>🌳</span>
                <span>Nâng Kỹ Năng & Đổi Skin</span>
              </button>
            </div>
          </div>
        )}

        {/* PAUSE OVERLAY */}
        {isPaused && gameState === 'playing' && !showSkillTree && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            <h3 className="text-2xl font-black text-cyan-300 font-mono tracking-wider mb-2">
              TRÒ CHƠI ĐANG TẠM DỪNG
            </h3>
            <p className="text-xs text-neutral-400 font-mono mb-4">
              Thời gian: {formatTime(gameTime)} | Vàng vòng này: {runGold.toLocaleString()}🪙
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPaused(false)}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Tiếp Tục Chơi
              </button>
              <button
                onClick={() => setShowSkillTree(true)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-cyan-300 font-bold text-xs font-mono border border-cyan-500/40 cursor-pointer"
              >
                Mở Cây Kỹ Năng
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-3xl mb-3 text-red-400">
              💥
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-red-400 font-mono tracking-wide uppercase">
              Tàu Ngầm Bị Phá Hủy!
            </h2>
            <p className="text-xs text-neutral-300 font-mono mt-1 max-w-md">
              Toàn bộ <strong>+{runGold.toLocaleString()} Vàng</strong> kiếm được đã được bảo toàn trong ví! Hãy nâng cấp <strong>Cây Kỹ Năng</strong> để vượt qua các mốc Boss khó hơn!
            </p>

            <div className="grid grid-cols-3 gap-3 my-4 max-w-sm w-full text-xs font-mono">
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400">Thời gian</div>
                <div className="text-cyan-300 font-bold">{formatTime(gameTime)}</div>
              </div>
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400">Tiêu diệt</div>
                <div className="text-amber-300 font-bold">{runKills} quái</div>
              </div>
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400">Tốc độ WPM</div>
                <div className="text-emerald-300 font-bold">{currentWpm} WPM</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsGameOverContext(true);
                  setShowSkillTree(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-xs font-mono uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <span>🌳</span>
                <span>Vào Cây Kỹ Năng Nâng Cấp</span>
              </button>

              <button
                onClick={startGame}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs font-mono border border-neutral-800 transition-colors cursor-pointer"
              >
                Chơi Lại Luôn
              </button>
            </div>
          </div>
        )}

        {/* ULTIMATE 25-MINUTE VICTORY OVERLAY */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-neutral-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-4xl mb-3 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
              👑
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 tracking-wide uppercase">
              Vua Đáy Biển Vực Thẳm!
            </h2>
            <p className="text-sm text-neutral-200 font-mono mt-1 max-w-lg">
              Tuyệt đỉnh! Bạn đã chinh phục cột mốc <strong>25 PHÚT</strong> và đập tan hoàn toàn <strong>Chúa Tể Hư Không Leviathan Prime</strong>! Mở khóa trọn bộ Skin Tối Thượng!
            </p>

            <div className="grid grid-cols-4 gap-2.5 my-4 max-w-md w-full text-xs font-mono">
              <div className="bg-neutral-900 p-2 rounded-xl border border-amber-500/30">
                <div className="text-neutral-400">Thời gian</div>
                <div className="text-amber-300 font-bold">{formatTime(gameTime)}</div>
              </div>
              <div className="bg-neutral-900 p-2 rounded-xl border border-cyan-500/30">
                <div className="text-neutral-400">Tổng Vàng</div>
                <div className="text-cyan-300 font-bold">+{runGold.toLocaleString()}🪙</div>
              </div>
              <div className="bg-neutral-900 p-2 rounded-xl border border-emerald-500/30">
                <div className="text-neutral-400">Tốc độ đỉnh</div>
                <div className="text-emerald-300 font-bold">{currentWpm} WPM</div>
              </div>
              <div className="bg-neutral-900 p-2 rounded-xl border border-purple-500/30">
                <div className="text-neutral-400">Diệt Boss</div>
                <div className="text-purple-300 font-bold">5/5 BOSS</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-black text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Chinh Phục Trận Mới
              </button>
              <button
                onClick={() => setShowSkillTree(true)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold text-xs font-mono border border-amber-500/40 cursor-pointer"
              >
                Tiến Hóa Cây Kỹ Năng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIRTUAL QWERTY KEYBOARD FOR MOBILE & IPAD */}
      {/* ========================================================================= */}
      {showVirtualKeyboard && gameState === 'playing' && (
        <div className="w-full max-w-[900px] bg-[#070e1c] border-t border-cyan-900/60 p-2 sm:p-3 flex flex-col gap-1.5 select-none animate-in fade-in duration-200">
          {/* Row 1: Q-P */}
          <div className="flex justify-center gap-1 sm:gap-1.5">
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCharacterInput(key)}
                className="flex-1 max-w-[55px] h-10 sm:h-12 rounded-xl bg-neutral-900 hover:bg-cyan-950/80 active:bg-cyan-500 text-white active:text-neutral-950 border border-neutral-700/80 active:border-cyan-300 font-mono font-black text-sm sm:text-base shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Row 2: A-L */}
          <div className="flex justify-center gap-1 sm:gap-1.5 px-2 sm:px-4">
            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCharacterInput(key)}
                className="flex-1 max-w-[55px] h-10 sm:h-12 rounded-xl bg-neutral-900 hover:bg-cyan-950/80 active:bg-cyan-500 text-white active:text-neutral-950 border border-neutral-700/80 active:border-cyan-300 font-mono font-black text-sm sm:text-base shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Row 3: Z-M */}
          <div className="flex justify-center gap-1 sm:gap-1.5 px-6 sm:px-10">
            {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCharacterInput(key)}
                className="flex-1 max-w-[55px] h-10 sm:h-12 rounded-xl bg-neutral-900 hover:bg-cyan-950/80 active:bg-cyan-500 text-white active:text-neutral-950 border border-neutral-700/80 active:border-cyan-300 font-mono font-black text-sm sm:text-base shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Row 4: Space Bomb + Soft Keyboard Trigger */}
          <div className="flex items-center justify-center gap-2 pt-1 max-w-lg mx-auto w-full">
            <button
              type="button"
              disabled={bombsAvailable <= 0}
              onClick={triggerDepthBomb}
              className={`flex-1 py-2.5 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                bombsAvailable > 0
                  ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-neutral-950 border border-amber-300 shadow-orange-500/30 active:scale-95'
                  : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
              }`}
            >
              <Bomb className="w-4 h-4" />
              <span>THẢ BOM SÓNG NƯỚC (SPACE) • x{bombsAvailable}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (hiddenInputRef.current) hiddenInputRef.current.focus();
              }}
              className="px-3 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-cyan-600 text-cyan-300 active:text-white border border-neutral-700 text-xs font-mono font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer shrink-0"
              title="Mở bàn phím gõ tiếng Việt / tiếng Anh mặc định của điện thoại / iPad"
            >
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Phím Máy</span>
            </button>
          </div>
        </div>
      )}

      {/* FOOTER CONTROLS & TIMELINE GUIDE */}
      <div className="w-full bg-neutral-950/80 border-t border-neutral-800/80 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 font-bold">A-Z</span>
            <span>Gõ chữ diệt 15 loại quái</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-bold">SPACE</span>
            <span>Bom Sóng Siêu Âm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">📦</span>
            <span>Thùng Gỗ chứa Siêu Buff</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>Chuỗi Combo: <strong className="text-amber-400">{combo}</strong> (Kỷ lục: {maxCombo})</span>
        </div>
      </div>

      {/* SKILL TREE & SKINS MODAL */}
      {showSkillTree && (
        <TypingSkillTreeModal
          upgrades={upgrades}
          stats={stats}
          onUpgrade={handleSkillUpgrade}
          onSelectSkin={handleSelectSkin}
          onHardReset={handleHardReset}
          onClose={() => {
            setShowSkillTree(false);
            if (gameState === 'playing') setIsPaused(false);
          }}
          onStartGame={() => {
            setShowSkillTree(false);
            startGame();
          }}
          isGameOverContext={isGameOverContext}
        />
      )}
    </div>
  );
};
