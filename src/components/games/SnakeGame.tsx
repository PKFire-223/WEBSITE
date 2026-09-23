import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Trophy, Music, VolumeX, AlertTriangle, ShieldAlert, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
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

// Grid size: 16 x 16 (Classic arcade layout)
const GRID_SIZE = 16;
const ITEM_LIFETIME = 8; // Táo, Bom và Đá đều tồn tại đúng 8 giây rồi biến mất

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
  life: number; // Despawns when 0
}

interface FloatingNotice {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const SnakeGame: React.FC = () => {
  // Game state
  const [snake, setSnake] = useState<Position[]>([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');

  const [apple, setApple] = useState<Position>({ x: 12, y: 8 });
  const [appleLife, setAppleLife] = useState(ITEM_LIFETIME);

  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string>('Bạn đã va vào thân mình!');
  const [isStunned, setIsStunned] = useState(false);

  // Blackout event (1 - 1.5s)
  const [isBlackout, setIsBlackout] = useState(false);
  const [gamePlaySeconds, setGamePlaySeconds] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  // Random wall lockdown mechanic (active after 30 seconds)
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

  // Synchronous references so 1-second interval NEVER loses state or gets reset by movement ticks
  const snakeRef = useRef(snake);
  snakeRef.current = snake;

  const appleRef = useRef(apple);
  appleRef.current = apple;

  const hazardsRef = useRef(hazards);
  hazardsRef.current = hazards;

  const blockedWallRef = useRef<WallSide | null>(null);
  const blockedWallSecondsRef = useRef<number>(0);

  // Music loop
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

  // Helper: Find random unoccupied cell
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

  // Helper: Trigger floating text
  const addFloatingNotice = useCallback((text: string, x: number, y: number, color: string) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1500);
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
    setDirection('RIGHT');
    nextDirectionRef.current = 'RIGHT';
    setScore(0);
    setIsGameOver(false);
    setGameOverReason('Bạn đã va vào thân mình!');
    setIsStunned(false);
    setIsBlackout(false);
    setGamePlaySeconds(0);
    
    // Reset blocked wall
    blockedWallRef.current = null;
    blockedWallSecondsRef.current = 0;
    setBlockedWall(null);
    setBlockedWallSecondsLeft(0);

    setHazards([]);
    setFloatingTexts([]);

    const newApple = getRandomFreeCell(initialSnake);
    setApple(newApple);
    setAppleLife(ITEM_LIFETIME);

    if (isMusicPlaying) startSnakeGameBGM();
  };

  // Key listener for Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const cur = nextDirectionRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && cur !== 'DOWN') {
        nextDirectionRef.current = 'UP';
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && cur !== 'UP') {
        nextDirectionRef.current = 'DOWN';
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && cur !== 'RIGHT') {
        nextDirectionRef.current = 'LEFT';
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && cur !== 'LEFT') {
        nextDirectionRef.current = 'RIGHT';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // =========================================================================
  // DEDICATED 1-SECOND INTERVAL (ROCK SOLID, INDEPENDENT FROM SNAKE TICKS)
  // =========================================================================
  useEffect(() => {
    if (isGameOver) return;

    const secondInterval = setInterval(() => {
      // 1. Apple Lifetime Countdown (Strictly 8 seconds)
      // When apple reaches 1s -> despawns and relocates to a fresh random tile!
      setAppleLife((prevLife) => {
        if (prevLife <= 1) {
          const occupied: Position[] = [
            ...snakeRef.current,
            ...hazardsRef.current.map((h) => ({ x: h.x, y: h.y })),
          ];
          const newPos = getRandomFreeCell(occupied);
          setApple(newPos);
          return ITEM_LIFETIME; // Reset back to 8s
        }
        return prevLife - 1;
      });

      // 2. Playtime Counter & Special States
      setGamePlaySeconds((prev) => {
        const nextSec = prev + 1;

        // BẮT ĐẦU KÍCH HOẠT KHI CHƠI ĐẠT 30 GIÂY TRỞ LÊN:
        if (nextSec >= 30) {
          // A. Blackout glitch (Chớp tối màn hình 1.2s mỗi ~18s)
          if (nextSec % 18 === 0) {
            playGlitchSound();
            setIsBlackout(true);
            setTimeout(() => {
              setIsBlackout(false);
            }, 1200);
          }

          // B. Bombs & Rocks hazard spawning (mỗi 7s xuất hiện 1 vật phẩm)
          if (nextSec % 7 === 0) {
            const type: 'bomb' | 'rock' = Math.random() < 0.5 ? 'bomb' : 'rock';
            setHazards((prevHazards) => {
              if (prevHazards.length >= 3) return prevHazards; // Tối đa 3 vật phẩm cùng lúc
              const occupied: Position[] = [
                ...snakeRef.current,
                appleRef.current,
                ...prevHazards.map((h) => ({ x: h.x, y: h.y })),
              ];
              const freeCell = getRandomFreeCell(occupied);
              return [
                ...prevHazards,
                {
                  id: `hazard-${Date.now()}-${Math.random()}`,
                  type,
                  x: freeCell.x,
                  y: freeCell.y,
                  life: ITEM_LIFETIME, // Cùng tồn tại 8s như táo
                },
              ];
            });
          }

          // C. WALL LOCKDOWN (TƯỜNG NGĂN 1 PHÍA NGẪU NHIÊN TRONG 5S)
          // Kích hoạt ngay tại giây 30 và lặp lại định kỳ mỗi 12 giây
          if (blockedWallSecondsRef.current <= 0 && (nextSec === 30 || nextSec % 12 === 0)) {
            const walls: WallSide[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];
            const chosen = walls[Math.floor(Math.random() * walls.length)];
            
            // Set synchronous ref FIRST so next movement tick immediately sees it
            blockedWallRef.current = chosen;
            blockedWallSecondsRef.current = 5; // Khóa 5 giây

            // Then update React states for UI rendering
            setBlockedWall(chosen);
            setBlockedWallSecondsLeft(5);

            playGlitchSound();
            addFloatingNotice(`⚡ TƯỜNG ${chosen} BỊ KHÓA 5 GIÂY!`, 8, 8, '#ef4444');
          }
        }

        return nextSec;
      });

      // 3. Decrement blocked wall countdown via synchronous ref
      if (blockedWallSecondsRef.current > 0) {
        blockedWallSecondsRef.current -= 1;
        setBlockedWallSecondsLeft(blockedWallSecondsRef.current);
        if (blockedWallSecondsRef.current <= 0) {
          blockedWallRef.current = null;
          setBlockedWall(null);
        }
      }

      // 4. Hazards lifetime (despawns when 8s expire)
      setHazards((prev) =>
        prev
          .map((h) => ({ ...h, life: h.life - 1 }))
          .filter((h) => h.life > 0)
      );
    }, 1000);

    return () => clearInterval(secondInterval);
  }, [isGameOver, getRandomFreeCell, addFloatingNotice]);

  // =========================================================================
  // MAIN MOVEMENT TICK (SNAKE ADVANCES EVERY 135ms)
  // =========================================================================
  useEffect(() => {
    if (isGameOver) return;

    const moveInterval = setInterval(() => {
      // If stunned by rock, snake stands still
      if (isStunned) return;

      const curDir = nextDirectionRef.current;
      setDirection(curDir);

      setSnake((prevSnake) => {
        const curHead = prevSnake[0];
        let nextX = curHead.x;
        let nextY = curHead.y;

        // Calculate theoretical next position
        if (curDir === 'UP') nextY -= 1;
        if (curDir === 'DOWN') nextY += 1;
        if (curDir === 'LEFT') nextX -= 1;
        if (curDir === 'RIGHT') nextX += 1;

        // Current locked wall check from synchronous ref
        const currentBlocked = blockedWallRef.current;

        // =====================================================================
        // WALL WRAP-AROUND & BLOCKED WALL CHECK
        // =====================================================================
        // 1. Check UP boundary
        if (nextY < 0) {
          if (currentBlocked === 'TOP') {
            setIsGameOver(true);
            setGameOverReason('Rắn đã đâm vào TƯỜNG TRÊN đang bị phong tỏa!');
            playGameOverSound();
            stopSnakeGameBGM();
            return prevSnake;
          }
          nextY = GRID_SIZE - 1; // Wrap around to bottom
        }

        // 2. Check DOWN boundary
        else if (nextY >= GRID_SIZE) {
          if (currentBlocked === 'BOTTOM') {
            setIsGameOver(true);
            setGameOverReason('Rắn đã đâm vào TƯỜNG DƯỚI đang bị phong tỏa!');
            playGameOverSound();
            stopSnakeGameBGM();
            return prevSnake;
          }
          nextY = 0; // Wrap around to top
        }

        // 3. Check LEFT boundary
        if (nextX < 0) {
          if (currentBlocked === 'LEFT') {
            setIsGameOver(true);
            setGameOverReason('Rắn đã đâm vào TƯỜNG TRÁI đang bị phong tỏa!');
            playGameOverSound();
            stopSnakeGameBGM();
            return prevSnake;
          }
          nextX = GRID_SIZE - 1; // Wrap around to right
        }

        // 4. Check RIGHT boundary
        else if (nextX >= GRID_SIZE) {
          if (currentBlocked === 'RIGHT') {
            setIsGameOver(true);
            setGameOverReason('Rắn đã đâm vào TƯỜNG PHẢI đang bị phong tỏa!');
            playGameOverSound();
            stopSnakeGameBGM();
            return prevSnake;
          }
          nextX = 0; // Wrap around to left
        }

        const newHead: Position = { x: nextX, y: nextY };

        // 5. Check Self Collision (Game Over)
        const hitSelf = prevSnake.some((seg, idx) => idx > 0 && seg.x === newHead.x && seg.y === newHead.y);
        if (hitSelf) {
          setIsGameOver(true);
          setGameOverReason('Rắn đã cắn trúng thân mình!');
          playGameOverSound();
          stopSnakeGameBGM();
          return prevSnake;
        }

        // 6. Check Apple Collision
        if (newHead.x === appleRef.current.x && newHead.y === appleRef.current.y) {
          playEatAppleSound();
          setScore((s) => s + 10);

          // Reset Apple position & lifetime back to 8s
          const occupied: Position[] = [newHead, ...prevSnake, ...hazardsRef.current.map((h) => ({ x: h.x, y: h.y }))];
          setApple(getRandomFreeCell(occupied));
          setAppleLife(ITEM_LIFETIME);

          // Snake grows: return new head with all current body segments
          return [newHead, ...prevSnake];
        }

        // 7. Check Hazard Collisions (Bomb or Rock)
        const currentHazards = hazardsRef.current;
        const hitHazardIndex = currentHazards.findIndex((h) => h.x === newHead.x && h.y === newHead.y);
        if (hitHazardIndex !== -1) {
          const hazard = currentHazards[hitHazardIndex];
          setHazards((hz) => hz.filter((_, i) => i !== hitHazardIndex));

          if (hazard.type === 'bomb') {
            // ĂN BOM: Giảm 1/6 kích thước và 1/6 số điểm (làm tròn lên Math.ceil)
            playBombSound();
            const curLen = prevSnake.length;
            const sizePenalty = Math.ceil(curLen / 6);

            setScore((s) => {
              const scorePenalty = Math.ceil(s / 6);
              return Math.max(0, s - scorePenalty);
            });

            addFloatingNotice(`💥 BOM! -${sizePenalty} thân & -1/6 điểm`, newHead.x, newHead.y, '#ef4444');

            const remainingBody = prevSnake.slice(0, Math.max(3, prevSnake.length - sizePenalty));
            return [newHead, ...remainingBody.slice(0, -1)];
          } else if (hazard.type === 'rock') {
            // ĂN ĐÁ: Bị choáng 3s đứng yên
            playRockHitSound();
            setIsStunned(true);

            addFloatingNotice('💫 CHOÁNG 3 GIÂY!', newHead.x, newHead.y, '#facc15');

            setTimeout(() => {
              setIsStunned(false);
            }, 3000);

            return [newHead, ...prevSnake.slice(0, -1)];
          }
        }

        // Standard movement: advance head, discard tail
        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, 135);

    return () => clearInterval(moveInterval);
  }, [isGameOver, isStunned, getRandomFreeCell, addFloatingNotice]);

  // Touch controls for mobile
  const handleTouchDirection = (newDir: Direction) => {
    const cur = nextDirectionRef.current;
    if (newDir === 'UP' && cur !== 'DOWN') nextDirectionRef.current = 'UP';
    if (newDir === 'DOWN' && cur !== 'UP') nextDirectionRef.current = 'DOWN';
    if (newDir === 'LEFT' && cur !== 'RIGHT') nextDirectionRef.current = 'LEFT';
    if (newDir === 'RIGHT' && cur !== 'LEFT') nextDirectionRef.current = 'RIGHT';
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

  return (
    <div className="relative w-full h-[470px] sm:h-[550px] rounded-2xl overflow-hidden select-none flex flex-col justify-between p-3 sm:p-4 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TRANQUIL FOREST & TREES BACKGROUND */}
      {/* ========================================================================= */}
      <img
        src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1400&q=80"
        alt="Enchanted Forest"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.4] contrast-110 pointer-events-none"
      />
      {/* Soft forest vignette & sunbeam overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,#040a04_95%] pointer-events-none" />
      <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 2. TOP DASHBOARD (Score, Playtime Seconds, Snake Length, Music) */}
      {/* ========================================================================= */}
      <div className="relative z-20 flex items-center justify-between gap-2 bg-neutral-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/40 shadow-xl">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-sans font-bold text-amber-400 uppercase">ĐIỂM:</span>
            <span className="text-xl sm:text-2xl font-black font-sans text-white drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              {score}
            </span>
          </div>

          {/* Real-time seconds played */}
          <div className="flex items-center gap-1.5 pl-2.5 sm:pl-3 border-l border-neutral-800 text-xs font-sans">
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

        {/* Music toggle button */}
        <button
          onClick={toggleMusic}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
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

      {/* ========================================================================= */}
      {/* 3. 16x16 LAWN BOARD */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-1 overflow-hidden">
        
        {/* Outer Wooden/Garden Border Container */}
        <div className="relative aspect-square h-full max-h-[350px] sm:max-h-[390px] rounded-2xl p-2.5 bg-gradient-to-br from-[#2a1a0e] via-[#1f1309] to-[#2a1a0e] border-2 border-amber-600/70 shadow-[0_0_35px_rgba(0,0,0,0.9)]">
          
          {/* ================================================================= */}
          {/* HIGH-VISIBILITY LOCKED WALL BARRIER (PHONG TỎA TƯỜNG CỰC KỲ RÕ NÉT) */}
          {/* ================================================================= */}
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

          {/* Lush Green Lawn Grid */}
          <div
            className="relative w-full h-full rounded-xl overflow-hidden grid shadow-inner border border-emerald-950"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {/* Alternating Checkered Lawn Tiles */}
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

            {/* 1. APPLE (TÁO ĐỎ CÓ CUỐNG LÁ TRÊN BÃI CỎ - BIẾN MẤT VÀ ĐỔI VỊ TRÍ SAU 8S) */}
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
                {/* Green Leaf */}
                <div className="absolute -top-1 right-1 w-2 h-2.5 bg-emerald-400 rounded-tr-full rotate-12 shadow" />
                <div className="w-1.5 h-1.5 bg-white/80 rounded-full -mt-0.5 -ml-0.5 shadow" />
              </div>
            </div>

            {/* 2. HAZARDS: BOM & ĐÁ */}
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
                  // BOMB ICON
                  <div className="relative w-4/5 h-4/5 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-950 border-2 border-red-500 shadow-[0_0_15px_#ef4444] flex items-center justify-center animate-bounce">
                    <div className="absolute -top-1.5 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[10px] font-sans font-black text-red-400">💣</span>
                  </div>
                ) : (
                  // ROCK ICON
                  <div className="relative w-4/5 h-4/5 rounded-lg bg-gradient-to-br from-stone-600 via-stone-700 to-stone-900 border border-stone-400 shadow-[0_0_10px_rgba(0,0,0,0.6)] flex items-center justify-center">
                    <span className="text-[11px] font-sans font-black text-stone-300">🪨</span>
                  </div>
                )}
              </div>
            ))}

            {/* 3. SNAKE ON THE LAWN */}
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
                    // Snake Head
                    <div
                      className={`relative w-[92%] h-[92%] rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.9)] border-2 transition-all flex items-center justify-center ${
                        isStunned
                          ? 'bg-amber-400 border-yellow-200 animate-pulse'
                          : 'bg-gradient-to-tr from-emerald-500 via-lime-400 to-emerald-300 border-white'
                      }`}
                    >
                      {/* Big Cartoon Eyes */}
                      <div className="flex items-center justify-around w-full px-0.5">
                        <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center shadow">
                          <span className="w-1 h-1 rounded-full bg-neutral-950" />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center shadow">
                          <span className="w-1 h-1 rounded-full bg-neutral-950" />
                        </div>
                      </div>

                      {/* Stun icon */}
                      {isStunned && (
                        <div className="absolute -top-3 text-xs font-black text-yellow-300 animate-spin">
                          💫
                        </div>
                      )}
                    </div>
                  ) : (
                    // Snake Body Segment
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

            {/* ================================================================= */}
            {/* BLACKOUT GLITCH OVERLAY (Chớp tối màn hình 1.2s) */}
            {/* ================================================================= */}
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

      {/* ========================================================================= */}
      {/* 4. BOTTOM CONTROLLER & STATUS */}
      {/* ========================================================================= */}
      <div className="relative z-20 flex items-center justify-between gap-3">
        {/* Keyboard hint or Locked Wall Alert Banner */}
        <div className="flex items-center gap-2 text-xs font-sans">
          {blockedWall ? (
            <div className="flex items-center gap-2 bg-red-950/80 px-3 py-1 rounded-lg border border-red-500 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span className="text-red-300 font-black">
                ⚠️ NGUY HIỂM: TƯỜNG {getWallLabel(blockedWall)} ĐANG BỊ KHÓA ({blockedWallSecondsLeft}s)!
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-neutral-300">
              <span className="text-emerald-400 font-medium">🌿 Rắn có thể xuyên vách tường!</span>
              <span>•</span>
              <span className="text-neutral-400">Di chuyển: W-A-S-D hoặc ↑ ↓ ← →</span>
            </div>
          )}
        </div>

        {/* Touch D-Pad for Mobile */}
        <div className="flex sm:hidden items-center justify-center mx-auto gap-1">
          <button
            onClick={() => handleTouchDirection('LEFT')}
            className="p-2.5 rounded-xl bg-neutral-900 active:bg-amber-500 border border-neutral-800 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleTouchDirection('UP')}
              className="p-2.5 rounded-xl bg-neutral-900 active:bg-amber-500 border border-neutral-800 text-white"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleTouchDirection('DOWN')}
              className="p-2.5 rounded-xl bg-neutral-900 active:bg-amber-500 border border-neutral-800 text-white"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => handleTouchDirection('RIGHT')}
            className="p-2.5 rounded-xl bg-neutral-900 active:bg-amber-500 border border-neutral-800 text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Live Stunned Indicator */}
        {isStunned && (
          <div className="text-xs font-sans text-yellow-400 font-bold animate-pulse">
            ⚡ Đang bị choáng (3s)
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. GAME OVER MODAL */}
      {/* ========================================================================= */}
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
