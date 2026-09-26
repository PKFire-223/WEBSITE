import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Trophy, Music, VolumeX, AlertTriangle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Clock, Gamepad2 } from 'lucide-react';
import {
  playEatAppleSound,
  playBombSound,
  playRockHitSound,
  playGlitchSound,
  playGameOverSound,
  playCoinSound,
  startSnakeGameBGM,
  stopSnakeGameBGM,
} from '../../utils/audio';

// ============================================================================
// GAME CONFIGURATION
// ============================================================================
const GRID_SIZE = 16;
const ITEM_LIFETIME = 8;
const MOVE_INTERVAL_MS = 135;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type WallSide = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

interface Hazard {
  id: string;
  type: 'bomb' | 'rock';
  x: number;
  y: number;
  life: number;
}

interface FloatingNotice {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const SnakeGame: React.FC = () => {
  // ============================================================================
  // GAME STATE
  // ============================================================================
  const [snake, setSnake] = useState<Position[]>([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const lastProcessedDirectionRef = useRef<Direction>('RIGHT');

  const [apple, setApple] = useState<Position>({ x: 12, y: 8 });
  const [appleLife, setAppleLife] = useState(ITEM_LIFETIME);

  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string>('Bạn đã va vào thân mình!');
  const [isStunned, setIsStunned] = useState(false);

  const [isBlackout, setIsBlackout] = useState(false);
  const [gamePlaySeconds, setGamePlaySeconds] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  const [blockedWall, setBlockedWall] = useState<WallSide | null>(null);
  const [blockedWallSecondsLeft, setBlockedWallSecondsLeft] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('polyplay_snake_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [floatingTexts, setFloatingTexts] = useState<FloatingNotice[]>([]);
  const [showVirtualPad, setShowVirtualPad] = useState<boolean>(true);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Synchronous references
  const snakeRef = useRef(snake);
  snakeRef.current = snake;

  const appleRef = useRef(apple);
  appleRef.current = apple;

  const hazardsRef = useRef(hazards);
  hazardsRef.current = hazards;

  const blockedWallRef = useRef<WallSide | null>(null);
  const blockedWallSecondsRef = useRef<number>(0);

  // Audio background loop
  useEffect(() => {
    if (isMusicPlaying && !isGameOver) {
      startSnakeGameBGM();
    } else {
      stopSnakeGameBGM();
    }
    return () => {
      stopSnakeGameBGM();
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
        localStorage.setItem('polyplay_snake_high_score', score.toString());
      } catch {
        // ignore
      }
    }
  }, [score, highScore]);

  // Helper: Find free cell
  const getRandomFreeCell = useCallback(
    (excludePositions: Position[]): Position => {
      let attempts = 0;
      while (attempts < 250) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        const occupied = excludePositions.some((p) => p.x === x && p.y === y);
        if (!occupied) return { x, y };
        attempts++;
      }
      return { x: 0, y: 0 };
    },
    []
  );

  // Helper: Floating notification text
  const addFloatingNotice = useCallback((text: string, x: number, y: number, color: string) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1500);
  }, []);

  // Safe direction setter preventing instant 180-degree suicide
  const setSafeDirection = useCallback((newDir: Direction) => {
    const currentMoving = lastProcessedDirectionRef.current;
    if (newDir === 'UP' && currentMoving !== 'DOWN') {
      nextDirectionRef.current = 'UP';
    } else if (newDir === 'DOWN' && currentMoving !== 'UP') {
      nextDirectionRef.current = 'DOWN';
    } else if (newDir === 'LEFT' && currentMoving !== 'RIGHT') {
      nextDirectionRef.current = 'LEFT';
    } else if (newDir === 'RIGHT' && currentMoving !== 'LEFT') {
      nextDirectionRef.current = 'RIGHT';
    }
  }, []);

  // Restart Game
  const restartGame = () => {
    playCoinSound();
    const initialSnake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setDirection('RIGHT');
    nextDirectionRef.current = 'RIGHT';
    lastProcessedDirectionRef.current = 'RIGHT';
    setScore(0);
    setIsGameOver(false);
    setGameOverReason('Bạn đã va vào thân mình!');
    setIsStunned(false);
    setIsBlackout(false);
    setGamePlaySeconds(0);

    blockedWallRef.current = null;
    blockedWallSecondsRef.current = 0;
    setBlockedWall(null);
    setBlockedWallSecondsLeft(0);

    setHazards([]);
    hazardsRef.current = [];
    setFloatingTexts([]);

    const newApple = getRandomFreeCell(initialSnake);
    setApple(newApple);
    appleRef.current = newApple;
    setAppleLife(ITEM_LIFETIME);

    if (isMusicPlaying) startSnakeGameBGM();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setSafeDirection('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setSafeDirection('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setSafeDirection('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSafeDirection('RIGHT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSafeDirection]);

  // ============================================================================
  // 1-SECOND TIMER LOOP: Hazards, Wall Lockdown & Item Lifetimes
  // ============================================================================
  useEffect(() => {
    if (isGameOver) return;

    const secondInterval = setInterval(() => {
      // Apple lifetime countdown
      setAppleLife((prevLife) => {
        if (prevLife <= 1) {
          const occupied: Position[] = [
            ...snakeRef.current,
            ...hazardsRef.current.map((h) => ({ x: h.x, y: h.y })),
          ];
          const newPos = getRandomFreeCell(occupied);
          setApple(newPos);
          appleRef.current = newPos;
          return ITEM_LIFETIME;
        }
        return prevLife - 1;
      });

      // Session play time and dynamic challenges
      setGamePlaySeconds((prev) => {
        const nextSec = prev + 1;

        if (nextSec >= 30) {
          // Blackout glitch event
          if (nextSec % 18 === 0) {
            playGlitchSound();
            setIsBlackout(true);
            setTimeout(() => {
              setIsBlackout(false);
            }, 1200);
          }

          // Hazards spawning
          if (nextSec % 7 === 0) {
            const type: 'bomb' | 'rock' = Math.random() < 0.5 ? 'bomb' : 'rock';
            setHazards((prevHazards) => {
              if (prevHazards.length >= 3) return prevHazards;
              const occupied: Position[] = [
                ...snakeRef.current,
                appleRef.current,
                ...prevHazards.map((h) => ({ x: h.x, y: h.y })),
              ];
              const freeCell = getRandomFreeCell(occupied);
              const nextList = [
                ...prevHazards,
                {
                  id: `hazard-${Date.now()}-${Math.random()}`,
                  type,
                  x: freeCell.x,
                  y: freeCell.y,
                  life: ITEM_LIFETIME,
                },
              ];
              hazardsRef.current = nextList;
              return nextList;
            });
          }

          // Wall lockdown
          if (blockedWallSecondsRef.current <= 0 && (nextSec === 30 || nextSec % 12 === 0)) {
            const walls: WallSide[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];
            const chosen = walls[Math.floor(Math.random() * walls.length)];

            blockedWallRef.current = chosen;
            blockedWallSecondsRef.current = 5;

            setBlockedWall(chosen);
            setBlockedWallSecondsLeft(5);

            playGlitchSound();
            addFloatingNotice(`⚡ TƯỜNG ${chosen} BỊ KHÓA 5 GIÂY!`, 8, 8, '#ef4444');
          }
        }

        return nextSec;
      });

      // Countdown blocked wall
      if (blockedWallSecondsRef.current > 0) {
        blockedWallSecondsRef.current -= 1;
        setBlockedWallSecondsLeft(blockedWallSecondsRef.current);
        if (blockedWallSecondsRef.current <= 0) {
          blockedWallRef.current = null;
          setBlockedWall(null);
        }
      }

      // Hazards lifetime
      setHazards((prev) => {
        const nextList = prev
          .map((h) => ({ ...h, life: h.life - 1 }))
          .filter((h) => h.life > 0);
        hazardsRef.current = nextList;
        return nextList;
      });
    }, 1000);

    return () => clearInterval(secondInterval);
  }, [isGameOver, getRandomFreeCell, addFloatingNotice]);

  // ============================================================================
  // MOVEMENT & COLLISION ENGINE
  // ============================================================================
  useEffect(() => {
    if (isGameOver) return;

    const moveInterval = setInterval(() => {
      if (isStunned) return;

      const curDir = nextDirectionRef.current;
      lastProcessedDirectionRef.current = curDir;
      setDirection(curDir);

      setSnake((prevSnake) => {
        const curHead = prevSnake[0];
        let nextX = curHead.x;
        let nextY = curHead.y;

        if (curDir === 'UP') nextY -= 1;
        if (curDir === 'DOWN') nextY += 1;
        if (curDir === 'LEFT') nextX -= 1;
        if (curDir === 'RIGHT') nextX += 1;

        const currentBlocked = blockedWallRef.current;

        // Boundary wrap & Wall barrier check
        if (nextY < 0) {
          if (currentBlocked === 'TOP') {
            setIsGameOver(true);
            setGameOverReason('Rắn đã đâm vào TƯỜNG TRÊN đang bị phong tỏa!');
            playGameOverSound();
            stopSnakeGameBGM();
            return prevSnake;
          }
          nextY = GRID_SIZE - 1;
        } else if (nextY >= GRID_SIZE) {
          if (currentBlocked === 'BOTTOM') {
            setIsGameOver(true);
            setGameOverReason('Rắn đã đâm vào TƯỜNG DƯỚI đang bị phong tỏa!');
            playGameOverSound();
            stopSnakeGameBGM();
            return prevSnake;
          }
          nextY = 0;
        }

        if (nextX < 0) {
          if (currentBlocked === 'LEFT') {
            setIsGameOver(true);
            setGameOverReason('Rắn đã đâm vào TƯỜNG TRÁI đang bị phong tỏa!');
            playGameOverSound();
            stopSnakeGameBGM();
            return prevSnake;
          }
          nextX = GRID_SIZE - 1;
        } else if (nextX >= GRID_SIZE) {
          if (currentBlocked === 'RIGHT') {
            setIsGameOver(true);
            setGameOverReason('Rắn đã đâm vào TƯỜNG PHẢI đang bị phong tỏa!');
            playGameOverSound();
            stopSnakeGameBGM();
            return prevSnake;
          }
          nextX = 0;
        }

        const newHead: Position = { x: nextX, y: nextY };
        const isEatingApple = newHead.x === appleRef.current.x && newHead.y === appleRef.current.y;

        // Self-collision check (if not eating apple, tail moves forward safely)
        const bodyToCheck = isEatingApple ? prevSnake : prevSnake.slice(0, -1);
        const hitSelf = bodyToCheck.some((seg) => seg.x === newHead.x && seg.y === newHead.y);
        if (hitSelf) {
          setIsGameOver(true);
          setGameOverReason('Rắn đã cắn trúng thân mình!');
          playGameOverSound();
          stopSnakeGameBGM();
          return prevSnake;
        }

        // Apple collection
        if (isEatingApple) {
          playEatAppleSound();
          setScore((s) => s + 10);

          const occupied: Position[] = [
            newHead,
            ...prevSnake,
            ...hazardsRef.current.map((h) => ({ x: h.x, y: h.y })),
          ];
          const newPos = getRandomFreeCell(occupied);
          setApple(newPos);
          appleRef.current = newPos;
          setAppleLife(ITEM_LIFETIME);

          const grownSnake = [newHead, ...prevSnake];
          snakeRef.current = grownSnake;
          return grownSnake;
        }

        // Hazard interactions
        const currentHazards = hazardsRef.current;
        const hitHazardIndex = currentHazards.findIndex((h) => h.x === newHead.x && h.y === newHead.y);
        if (hitHazardIndex !== -1) {
          const hazard = currentHazards[hitHazardIndex];
          const nextHazards = currentHazards.filter((_, i) => i !== hitHazardIndex);
          hazardsRef.current = nextHazards;
          setHazards(nextHazards);

          if (hazard.type === 'bomb') {
            playBombSound();
            const curLen = prevSnake.length;
            const sizePenalty = Math.ceil(curLen / 6);

            setScore((s) => Math.max(0, s - Math.ceil(s / 6)));
            addFloatingNotice(`💥 BOM! -${sizePenalty} thân & -1/6 điểm`, newHead.x, newHead.y, '#ef4444');

            const remainingBody = prevSnake.slice(0, Math.max(3, prevSnake.length - sizePenalty));
            const newSnake = [newHead, ...remainingBody.slice(0, -1)];
            snakeRef.current = newSnake;
            return newSnake;
          } else if (hazard.type === 'rock') {
            playRockHitSound();
            setIsStunned(true);
            addFloatingNotice('💫 CHOÁNG 3 GIÂY!', newHead.x, newHead.y, '#facc15');

            setTimeout(() => {
              setIsStunned(false);
            }, 3000);

            const newSnake = [newHead, ...prevSnake.slice(0, -1)];
            snakeRef.current = newSnake;
            return newSnake;
          }
        }

        // Standard movement step
        const movedSnake = [newHead, ...prevSnake.slice(0, -1)];
        snakeRef.current = movedSnake;
        return movedSnake;
      });
    }, MOVE_INTERVAL_MS);

    return () => clearInterval(moveInterval);
  }, [isGameOver, isStunned, getRandomFreeCell, addFloatingNotice]);

  // Touch gesture listeners
  const handleBoardTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleBoardTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      setSafeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      setSafeDirection(dy > 0 ? 'DOWN' : 'UP');
    }
  };

  const getWallLabel = (wall: WallSide | null) => {
    switch (wall) {
      case 'TOP': return 'TRÊN';
      case 'BOTTOM': return 'DƯỚI';
      case 'LEFT': return 'TRÁI';
      case 'RIGHT': return 'PHẢI';
      default: return '';
    }
  };

  // ============================================================================
  // UI RENDERING
  // ============================================================================
  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[560px] rounded-2xl overflow-hidden select-none flex flex-col justify-between p-2.5 sm:p-4 font-sans">
      {/* Background Graphic */}
      <img
        src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1400&q=80"
        alt="Enchanted Forest"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.4] contrast-110 pointer-events-none"
      />
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,#040a04_95%] pointer-events-none" />
      <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none" />

      {/* Top Dashboard HUD */}
      <div className="relative z-20 flex items-center justify-between gap-2 bg-neutral-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-emerald-500/40 shadow-xl flex-wrap">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-sans font-bold text-amber-400 uppercase">ĐIỂM:</span>
            <span className="text-xl sm:text-2xl font-black font-sans text-white drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              {score}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-neutral-800 text-xs font-sans">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-neutral-400">Thời gian:</span>
            <strong className={`font-mono text-xs ${gamePlaySeconds >= 30 ? 'text-amber-400 font-bold' : 'text-sky-300'}`}>
              {gamePlaySeconds}s
            </strong>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-neutral-800 text-xs font-sans text-emerald-300">
            <span>Dài: <strong className="text-white">{snake.length}</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-neutral-800 text-xs font-sans text-neutral-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Kỷ lục: <strong className="text-yellow-300">{highScore}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVirtualPad((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
              showVirtualPad
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
            title="Bật/Tắt phím điều khiển ảo cho Mobile / iPad"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold">{showVirtualPad ? 'Tay Cầm' : 'Phím Ẩn'}</span>
          </button>

          <button
            onClick={toggleMusic}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
              isMusicPlaying
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
            title={isMusicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
          >
            {isMusicPlaying ? <Music className="w-3.5 h-3.5 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isMusicPlaying ? 'Nhạc: BẬT' : 'Nhạc: TẮT'}</span>
          </button>
        </div>
      </div>

      {/* 16x16 Lawn Board */}
      <div className="relative z-10 w-full flex items-center justify-center my-1">
        <div
          onTouchStart={handleBoardTouchStart}
          onTouchEnd={handleBoardTouchEnd}
          className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-2xl p-2 sm:p-2.5 bg-gradient-to-br from-[#2a1a0e] via-[#1f1309] to-[#2a1a0e] border-2 border-amber-600/70 shadow-[0_0_35px_rgba(0,0,0,0.9)] touch-none cursor-grab"
        >
          {/* Locked Wall Indicators */}
          {blockedWall === 'TOP' && (
            <div className="absolute top-0 left-0 right-0 h-4 z-50 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-t-xl shadow-[0_0_25px_#ef4444] border-b-2 border-yellow-300 animate-pulse flex items-center justify-center">
              <span className="text-[9px] font-sans font-black text-white uppercase tracking-wider drop-shadow-md">
                🚫 TƯỜNG TRÊN ĐANG KHÓA ({blockedWallSecondsLeft}s)
              </span>
            </div>
          )}
          {blockedWall === 'BOTTOM' && (
            <div className="absolute bottom-0 left-0 right-0 h-4 z-50 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-b-xl shadow-[0_0_25px_#ef4444] border-t-2 border-yellow-300 animate-pulse flex items-center justify-center">
              <span className="text-[9px] font-sans font-black text-white uppercase tracking-wider drop-shadow-md">
                🚫 TƯỜNG DƯỚI ĐANG KHÓA ({blockedWallSecondsLeft}s)
              </span>
            </div>
          )}
          {blockedWall === 'LEFT' && (
            <div className="absolute top-0 bottom-0 left-0 w-4 z-50 bg-gradient-to-b from-red-600 via-rose-500 to-red-600 rounded-l-xl shadow-[0_0_25px_#ef4444] border-r-2 border-yellow-300 animate-pulse flex items-center justify-center">
              <span className="text-[8px] font-sans font-black text-white uppercase [writing-mode:vertical-lr] rotate-180 drop-shadow-md">
                🚫 KHÓA TRÁI ({blockedWallSecondsLeft}s)
              </span>
            </div>
          )}
          {blockedWall === 'RIGHT' && (
            <div className="absolute top-0 bottom-0 right-0 w-4 z-50 bg-gradient-to-b from-red-600 via-rose-500 to-red-600 rounded-r-xl shadow-[0_0_25px_#ef4444] border-l-2 border-yellow-300 animate-pulse flex items-center justify-center">
              <span className="text-[8px] font-sans font-black text-white uppercase [writing-mode:vertical-lr] drop-shadow-md">
                🚫 KHÓA PHẢI ({blockedWallSecondsLeft}s)
              </span>
            </div>
          )}

          {/* Grid Viewport */}
          <div
            className="relative w-full h-full rounded-xl overflow-hidden grid shadow-inner border border-emerald-950"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {/* Lawn Tiles */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const row = Math.floor(i / GRID_SIZE);
              const col = i % GRID_SIZE;
              const isEven = (row + col) % 2 === 0;

              return (
                <div
                  key={`lawn-cell-${i}`}
                  className={`w-full h-full relative transition-colors ${
                    isEven ? 'bg-[#2d5724]' : 'bg-[#36682c]'
                  }`}
                >
                  {i % 23 === 0 && (
                    <span className="absolute top-1 left-1 text-[7px] opacity-40 select-none">🌼</span>
                  )}
                  {i % 31 === 0 && (
                    <span className="absolute bottom-1 right-1 text-[7px] opacity-35 select-none">☘️</span>
                  )}
                </div>
              );
            })}

            {/* Apple */}
            <div
              className="absolute z-20 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${((apple.x + 0.5) / GRID_SIZE) * 100}%`,
                top: `${((apple.y + 0.5) / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
              }}
            >
              <div className="relative w-4/5 h-4/5 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.9)] border border-red-300 flex items-center justify-center animate-bounce">
                <div className="absolute -top-1 right-1 w-2 h-2.5 bg-emerald-400 rounded-tr-full rotate-12 shadow" />
                <div className="w-1.5 h-1.5 bg-white/80 rounded-full -mt-0.5 -ml-0.5 shadow" />
              </div>
            </div>

            {/* Hazards */}
            {hazards.map((hz) => (
              <div
                key={hz.id}
                className="absolute z-20 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((hz.x + 0.5) / GRID_SIZE) * 100}%`,
                  top: `${((hz.y + 0.5) / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                }}
              >
                {hz.type === 'bomb' ? (
                  <div className="relative w-4/5 h-4/5 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-950 border-2 border-red-500 shadow-[0_0_15px_#ef4444] flex items-center justify-center animate-bounce">
                    <div className="absolute -top-1.5 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[10px] font-sans font-black text-red-400">💣</span>
                  </div>
                ) : (
                  <div className="relative w-4/5 h-4/5 rounded-lg bg-gradient-to-br from-stone-600 via-stone-700 to-stone-900 border border-stone-400 shadow-[0_0_10px_rgba(0,0,0,0.6)] flex items-center justify-center">
                    <span className="text-[11px] font-sans font-black text-stone-300">🪨</span>
                  </div>
                )}
              </div>
            ))}

            {/* Snake */}
            {snake.map((seg, idx) => {
              const isHead = idx === 0;

              return (
                <div
                  key={`snake-seg-${idx}`}
                  className="absolute z-30 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${((seg.x + 0.5) / GRID_SIZE) * 100}%`,
                    top: `${((seg.y + 0.5) / GRID_SIZE) * 100}%`,
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                  }}
                >
                  {isHead ? (
                    <div
                      className={`relative w-[92%] h-[92%] rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.9)] border-2 transition-all flex items-center justify-center ${
                        isStunned
                          ? 'bg-amber-400 border-yellow-200 animate-pulse'
                          : 'bg-gradient-to-tr from-emerald-500 via-lime-400 to-emerald-300 border-white'
                      }`}
                    >
                      <div className="flex items-center justify-around w-full px-0.5">
                        <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center shadow">
                          <span className="w-1 h-1 rounded-full bg-neutral-950" />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center shadow">
                          <span className="w-1 h-1 rounded-full bg-neutral-950" />
                        </div>
                      </div>

                      {isStunned && (
                        <div className="absolute -top-3 text-xs font-black text-yellow-300 animate-spin">
                          💫
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="w-[84%] h-[84%] rounded-xl bg-gradient-to-b from-lime-400 to-emerald-600 border border-lime-200/60 shadow-sm"
                      style={{
                        opacity: Math.max(0.6, 1 - (idx / snake.length) * 0.4),
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Floating text notices */}
            {floatingTexts.map((f) => (
              <div
                key={f.id}
                className="absolute z-50 pointer-events-none text-xs font-sans font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] animate-out fade-out slide-out-to-top-6 duration-1000 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
                style={{
                  left: `${((f.x + 0.5) / GRID_SIZE) * 100}%`,
                  top: `${((f.y + 0.5) / GRID_SIZE) * 100}%`,
                  color: f.color,
                }}
              >
                {f.text}
              </div>
            ))}

            {/* Blackout overlay */}
            {isBlackout && (
              <div className="absolute inset-0 z-50 bg-black/98 flex items-center justify-center animate-in fade-in duration-100">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-sans font-bold text-red-400 tracking-widest uppercase">
                    CHỚP TỐI MÀN HÌNH...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controller & Virtual D-Pad */}
      <div className="relative z-20 flex flex-col gap-2 pt-1 border-t border-emerald-950/60">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
          {blockedWall ? (
            <div className="flex items-center gap-2 bg-red-950/80 px-3 py-1 rounded-lg border border-red-500 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span className="text-red-300 font-black text-[11px] sm:text-xs">
                ⚠️ NGUY HIỂM: TƯỜNG {getWallLabel(blockedWall)} ĐANG BỊ KHÓA ({blockedWallSecondsLeft}s)!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-300 text-[11px] sm:text-xs">
              <span className="text-emerald-400 font-medium">🌿 Vuốt trên cỏ hoặc bấm phím</span>
              <span>•</span>
              <span className="text-neutral-400 hidden sm:inline">Phím: W-A-S-D / ↑ ↓ ← →</span>
              <span className="text-neutral-400 sm:hidden">Rắn xuyên tường</span>
            </div>
          )}

          {isStunned && (
            <div className="text-xs font-sans text-yellow-400 font-bold animate-pulse flex items-center gap-1">
              <span>💫 Đang bị choáng (3s)</span>
            </div>
          )}
        </div>

        {showVirtualPad && (
          <div className="flex items-center justify-center gap-4 py-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="relative w-36 h-28 sm:w-44 sm:h-32 flex items-center justify-center select-none">
              <button
                type="button"
                onClick={() => setSafeDirection('UP')}
                className={`absolute top-0 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90 border cursor-pointer ${
                  direction === 'UP'
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 border-amber-200 shadow-amber-500/50'
                    : 'bg-neutral-900/90 text-white hover:bg-neutral-800 border-neutral-700/80 active:bg-amber-500'
                }`}
                title="Đi Lên (W / ↑)"
              >
                <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={() => setSafeDirection('LEFT')}
                className={`absolute left-0 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90 border cursor-pointer ${
                  direction === 'LEFT'
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 border-amber-200 shadow-amber-500/50'
                    : 'bg-neutral-900/90 text-white hover:bg-neutral-800 border-neutral-700/80 active:bg-amber-500'
                }`}
                title="Sang Trái (A / ←)"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="w-8 h-8 rounded-full bg-neutral-950/90 border border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500 pointer-events-none">
                ✦
              </div>

              <button
                type="button"
                onClick={() => setSafeDirection('RIGHT')}
                className={`absolute right-0 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90 border cursor-pointer ${
                  direction === 'RIGHT'
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 border-amber-200 shadow-amber-500/50'
                    : 'bg-neutral-900/90 text-white hover:bg-neutral-800 border-neutral-700/80 active:bg-amber-500'
                }`}
                title="Sang Phải (D / →)"
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={() => setSafeDirection('DOWN')}
                className={`absolute bottom-0 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90 border cursor-pointer ${
                  direction === 'DOWN'
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 border-amber-200 shadow-amber-500/50'
                    : 'bg-neutral-900/90 text-white hover:bg-neutral-800 border-neutral-700/80 active:bg-amber-500'
                }`}
                title="Đi Xuống (S / ↓)"
              >
                <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={restartGame}
                className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 active:text-white border border-neutral-800 text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Chơi lại ván mới"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Chơi Lại</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-sm w-full bg-[#120719] border-2 border-red-500/80 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_60px_rgba(239,68,68,0.4)]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 font-sans uppercase tracking-normal">
                RẮN ĐÃ VA CHẠM!
              </h3>
              <p className="text-xs font-sans text-neutral-300 font-medium">
                {gameOverReason}
              </p>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Điểm đạt được:</span>
                <strong className="text-amber-400 text-base font-bold">{score} ĐIỂM</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Chiều dài thân rắn:</span>
                <strong className="text-emerald-400 font-bold">{snake.length} Ô</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-400 border-t border-neutral-800/80 pt-2">
                <span>Kỷ lục cao nhất:</span>
                <strong className="text-yellow-300 font-bold">{highScore} ĐIỂM</strong>
              </div>
            </div>

            <button
              onClick={restartGame}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-neutral-950 font-bold text-sm font-sans tracking-wide shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
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
