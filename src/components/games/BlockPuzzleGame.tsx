import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RotateCcw,
  RotateCw,
  Trophy,
  Sparkles,
  Zap,
  Flame,
  AlertTriangle,
  Move,
  Dices,
  Wand2,
  Hammer,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
} from 'lucide-react';
import {
  playBlockPlaceSound,
  playLineExplosionSound,
  playComboFanfareSound,
  playCoinSound,
  playGameOverSound,
  playClickSound,
  playRotateSound,
  playMagicRerollSound,
} from '../../utils/audio';

const BOARD_SIZE = 8; // 8 x 8 Classic Grid

export interface PieceShape {
  id: string;
  matrix: number[][]; // 2D binary array
  colorName: string;
  bgGradient: string;
  borderStyle: string;
  glowShadow: string;
  gemSymbol: string;
}

const GEM_THEMES = [
  {
    colorName: 'ruby',
    bgGradient: 'from-rose-500 via-red-500 to-rose-700',
    borderStyle: 'border-rose-300',
    glowShadow: 'shadow-[0_0_15px_rgba(244,63,94,0.9)]',
    gemSymbol: '♦',
  },
  {
    colorName: 'sapphire',
    bgGradient: 'from-blue-500 via-sky-500 to-indigo-600',
    borderStyle: 'border-sky-200',
    glowShadow: 'shadow-[0_0_15px_rgba(56,189,248,0.9)]',
    gemSymbol: '✦',
  },
  {
    colorName: 'emerald',
    bgGradient: 'from-emerald-400 via-teal-500 to-emerald-700',
    borderStyle: 'border-emerald-200',
    glowShadow: 'shadow-[0_0_15px_rgba(16,185,129,0.9)]',
    gemSymbol: '★',
  },
  {
    colorName: 'amethyst',
    bgGradient: 'from-purple-500 via-fuchsia-500 to-indigo-700',
    borderStyle: 'border-purple-200',
    glowShadow: 'shadow-[0_0_15px_rgba(168,85,247,0.9)]',
    gemSymbol: '🔮',
  },
  {
    colorName: 'topaz',
    bgGradient: 'from-amber-400 via-yellow-500 to-orange-600',
    borderStyle: 'border-yellow-200',
    glowShadow: 'shadow-[0_0_15px_rgba(245,158,11,0.9)]',
    gemSymbol: '⚡',
  },
  {
    colorName: 'cyan',
    bgGradient: 'from-cyan-400 via-teal-400 to-blue-600',
    borderStyle: 'border-cyan-200',
    glowShadow: 'shadow-[0_0_15px_rgba(6,182,212,0.9)]',
    gemSymbol: '✧',
  },
];

// All standard polyomino piece templates
const PIECE_MATRICES = [
  // 1x1 dot
  [[1]],
  // 2x1 & 1x2 dominos
  [[1, 1]],
  [[1], [1]],
  // 3x1 & 1x3 triominos
  [[1, 1, 1]],
  [[1], [1], [1]],
  // 4x1 & 1x4 lines
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  // 5x1 line
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  // 2x2 square
  [
    [1, 1],
    [1, 1],
  ],
  // 3x3 big square
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  // Corner 2x2
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [0, 1],
  ],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  // Big L 3x3
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  // T shape
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [0, 1],
  ],
  // Z / S shape
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
];

// Helper: rotate 2D matrix 90 degrees clockwise
export const rotateMatrixClockwise = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = [];
  for (let c = 0; c < cols; c++) {
    const newRow: number[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(matrix[r][c]);
    }
    rotated.push(newRow);
  }
  return rotated;
};

// Helper: generate 3 random pieces
const generateRandomPieces = (): (PieceShape | null)[] => {
  return Array.from({ length: 3 }).map((_, idx) => {
    const matrix = PIECE_MATRICES[Math.floor(Math.random() * PIECE_MATRICES.length)];
    const theme = GEM_THEMES[Math.floor(Math.random() * GEM_THEMES.length)];
    return {
      id: `piece-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      matrix,
      ...theme,
    };
  });
};

interface BoardCell {
  filled: boolean;
  colorName?: string;
  bgGradient?: string;
  borderStyle?: string;
  glowShadow?: string;
  gemSymbol?: string;
  isExploding?: boolean;
}

interface FloatingNotice {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

export const BlockPuzzleGame: React.FC = () => {
  // 8x8 Board state
  const [board, setBoard] = useState<BoardCell[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => ({ filled: false }))
    )
  );

  // Available pieces (always 3 slots)
  const [availablePieces, setAvailablePieces] = useState<(PieceShape | null)[]>(() => generateRandomPieces());
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);

  // Drag and drop state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);
  const [dragOffsetAbove, setDragOffsetAbove] = useState<number>(0);
  const [hoverPosition, setHoverPosition] = useState<{ r: number; c: number; isValid: boolean } | null>(null);

  // Magic Spells State
  const [magicRerolls, setMagicRerolls] = useState(2); // 2 free Re-rolls to start
  const [hammerCharges, setHammerCharges] = useState(1); // 1 Thunder Hammer to start
  const [isHammerActive, setIsHammerActive] = useState(false);

  // Refs for tracking DOM rects and drag state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardGridRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Stats
  const [score, setScore] = useState(0);
  const [linesExploded, setLinesExploded] = useState(0);
  const [streakCombo, setStreakCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [floatingNotices, setFloatingNotices] = useState<FloatingNotice[]>([]);

  // High score
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('polyplay_block_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Track high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('polyplay_block_high_score', score.toString());
      } catch {
        // ignore
      }
    }
  }, [score, highScore]);

  // Global pointerup failsafe so dragging never freezes
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (draggingIndex !== null) {
        setDraggingIndex(null);
        setDragPointer(null);
        isDraggingRef.current = false;
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [draggingIndex]);

  // Floating text notice trigger
  const addFloatingNotice = useCallback((text: string, color: string, x: number, y: number) => {
    const id = `notice-${Date.now()}-${Math.random()}`;
    setFloatingNotices((prev) => [...prev, { id, text, color, x, y }]);
    setTimeout(() => {
      setFloatingNotices((prev) => prev.filter((n) => n.id !== id));
    }, 1500);
  }, []);

  // Check if a piece can be placed at (anchorR, anchorC)
  const canPlacePiece = useCallback(
    (currentBoard: BoardCell[][], piece: PieceShape, anchorR: number, anchorC: number): boolean => {
      const pRows = piece.matrix.length;
      const pCols = piece.matrix[0].length;

      for (let r = 0; r < pRows; r++) {
        for (let c = 0; c < pCols; c++) {
          if (piece.matrix[r][c] === 1) {
            const targetR = anchorR + r;
            const targetC = anchorC + c;

            // Out of bounds check
            if (targetR < 0 || targetR >= BOARD_SIZE || targetC < 0 || targetC >= BOARD_SIZE) {
              return false;
            }

            // Already filled check
            if (currentBoard[targetR][targetC].filled) {
              return false;
            }
          }
        }
      }
      return true;
    },
    []
  );

  // Check if a piece can fit ANYWHERE on the board
  const canPieceFitAnywhere = useCallback(
    (currentBoard: BoardCell[][], piece: PieceShape): boolean => {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (canPlacePiece(currentBoard, piece, r, c)) {
            return true;
          }
        }
      }
      return false;
    },
    [canPlacePiece]
  );

  // Check Game Over condition
  const checkGameOver = useCallback(
    (currentBoard: BoardCell[][], pieces: (PieceShape | null)[]) => {
      const activePieces = pieces.filter((p): p is PieceShape => p !== null);
      if (activePieces.length === 0) return false;
      const hasAnyMove = activePieces.some((p) => canPieceFitAnywhere(currentBoard, p));
      return !hasAnyMove;
    },
    [canPieceFitAnywhere]
  );

  // Rotate piece function (called via key 'R', Space, or button)
  const rotatePieceAtIndex = useCallback((idx: number) => {
    setAvailablePieces((prev) => {
      const piece = prev[idx];
      if (!piece) return prev;
      const newMatrix = rotateMatrixClockwise(piece.matrix);
      const updatedPiece: PieceShape = {
        ...piece,
        matrix: newMatrix,
      };
      const nextList = [...prev];
      nextList[idx] = updatedPiece;
      playRotateSound();
      return nextList;
    });
  }, []);

  // Magic Re-roll function
  const handleMagicReroll = useCallback(() => {
    if (magicRerolls <= 0 || isGameOver) return;
    setMagicRerolls((r) => r - 1);
    const freshPieces = generateRandomPieces();
    setAvailablePieces(freshPieces);
    setSelectedPieceIndex(null);
    setHoverPosition(null);
    playMagicRerollSound();
    addFloatingNotice('🎲 TRIỆU HỒI 3 KHỐI MỚI!', '#38bdf8', 50, 48);
  }, [magicRerolls, isGameOver, addFloatingNotice]);

  // Magic Hammer destruction of a single cell
  const handleHammerCellClick = useCallback(
    (r: number, c: number) => {
      if (!isHammerActive || hammerCharges <= 0) return;
      if (!board[r][c].filled) {
        addFloatingNotice('⚠️ Hãy chọn 1 ô đang có ngọc!', '#ef4444', 50, 48);
        return;
      }

      setBoard((prev) => {
        const nextB = prev.map((row) => row.map((cell) => ({ ...cell })));
        nextB[r][c] = { filled: false };
        return nextB;
      });

      setHammerCharges((h) => h - 1);
      setIsHammerActive(false);
      setScore((s) => s + 15);
      playLineExplosionSound(1);
      addFloatingNotice('⚡ SẤM SÉT PHÁ Ô THÀNH CÔNG! +15Đ', '#eab308', 50, 45);
    },
    [isHammerActive, hammerCharges, board, addFloatingNotice]
  );

  // Advance pieces & check game over
  const handlePostPlacement = useCallback(
    (currentBoard: BoardCell[][], placedPieceIndex: number) => {
      const nextPieces = [...availablePieces];
      nextPieces[placedPieceIndex] = null;

      setSelectedPieceIndex(null);
      setHoverPosition(null);
      setDraggingIndex(null);
      setDragPointer(null);

      // If all 3 pieces used, spawn 3 new pieces
      const allUsed = nextPieces.every((p) => p === null);
      let finalPieces = nextPieces;
      if (allUsed) {
        finalPieces = generateRandomPieces();
        playCoinSound();
        addFloatingNotice('✨ TIẾP TẾ 3 KHỐI MỚI!', '#38bdf8', 50, 50);
      }

      setAvailablePieces(finalPieces);

      if (checkGameOver(currentBoard, finalPieces)) {
        setIsGameOver(true);
        playGameOverSound();
      }
    },
    [availablePieces, checkGameOver, addFloatingNotice]
  );

  // Execute placement of a piece
  const executePlacement = useCallback(
    (pieceIndex: number, anchorR: number, anchorC: number) => {
      const piece = availablePieces[pieceIndex];
      if (!piece || isGameOver) return;

      if (!canPlacePiece(board, piece, anchorR, anchorC)) {
        return;
      }

      playBlockPlaceSound();

      // 1. Calculate cell points (+1 point per cell in piece)
      let pieceCellCount = 0;
      const nextBoard: BoardCell[][] = board.map((row) => row.map((cell) => ({ ...cell })));

      for (let r = 0; r < piece.matrix.length; r++) {
        for (let c = 0; c < piece.matrix[0].length; c++) {
          if (piece.matrix[r][c] === 1) {
            pieceCellCount++;
            const targetR = anchorR + r;
            const targetC = anchorC + c;
            nextBoard[targetR][targetC] = {
              filled: true,
              colorName: piece.colorName,
              bgGradient: piece.bgGradient,
              borderStyle: piece.borderStyle,
              glowShadow: piece.glowShadow,
              gemSymbol: piece.gemSymbol,
            };
          }
        }
      }

      setScore((s) => s + pieceCellCount);

      // 2. CHECK FOR COMPLETED ROWS & COLUMNS (NỔ HÀNG VÀ NỔ CỘT)
      const fullRows: number[] = [];
      const fullCols: number[] = [];

      for (let r = 0; r < BOARD_SIZE; r++) {
        let rowFull = true;
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (!nextBoard[r][c].filled) {
            rowFull = false;
            break;
          }
        }
        if (rowFull) fullRows.push(r);
      }

      for (let c = 0; c < BOARD_SIZE; c++) {
        let colFull = true;
        for (let r = 0; r < BOARD_SIZE; r++) {
          if (!nextBoard[r][c].filled) {
            colFull = false;
            break;
          }
        }
        if (colFull) fullCols.push(c);
      }

      const totalLinesCleared = fullRows.length + fullCols.length;

      if (totalLinesCleared > 0) {
        const currentStreak = streakCombo + 1;
        setStreakCombo(currentStreak);
        setLinesExploded((l) => l + totalLinesCleared);

        const lineScore =
          totalLinesCleared * 20 +
          (totalLinesCleared > 1 ? totalLinesCleared * 30 : 0) +
          currentStreak * 15;
        setScore((s) => s + lineScore);

        // Award extra Magic Reroll on multi-line clear!
        if (totalLinesCleared >= 2) {
          setMagicRerolls((r) => r + 1);
          addFloatingNotice('🎲 THƯỞNG +1 BÙA ĐỔI KHỐI!', '#38bdf8', 50, 30);
        }

        playLineExplosionSound(totalLinesCleared);
        if (totalLinesCleared >= 2 || currentStreak >= 2) {
          playComboFanfareSound();
        }

        fullRows.forEach((r) => {
          for (let c = 0; c < BOARD_SIZE; c++) {
            nextBoard[r][c].isExploding = true;
          }
        });
        fullCols.forEach((c) => {
          for (let r = 0; r < BOARD_SIZE; r++) {
            nextBoard[r][c].isExploding = true;
          }
        });

        let noticeMsg = `💥 NỔ ${totalLinesCleared} DÒNG! +${lineScore}Đ`;
        if (totalLinesCleared >= 3) {
          noticeMsg = `⚡ SIÊU NỔ BÙNG ${totalLinesCleared} DÒNG! +${lineScore}Đ`;
        } else if (currentStreak > 1) {
          noticeMsg = `🔥 COMBO x${currentStreak}! +${lineScore}Đ`;
        }
        addFloatingNotice(noticeMsg, '#facc15', 50, 40);

        setBoard(nextBoard);

        setTimeout(() => {
          setBoard((prev) => {
            const cleared = prev.map((row, r) =>
              row.map((cell, c) => {
                if (fullRows.includes(r) || fullCols.includes(c)) {
                  return { filled: false };
                }
                return cell;
              })
            );

            // PERFECT CLEAR BONUS: if the entire board is now empty!
            const isBoardEmpty = cleared.every((row) => row.every((cell) => !cell.filled));
            if (isBoardEmpty) {
              setScore((s) => s + 100);
              playComboFanfareSound();
              addFloatingNotice('🌟 QUÉT SẠCH MA TRẬN (PERFECT CLEAR)! +100Đ', '#facc15', 50, 35);
              setMagicRerolls((r) => r + 1);
              setHammerCharges((h) => h + 1);
            }

            handlePostPlacement(cleared, pieceIndex);
            return cleared;
          });
        }, 320);
      } else {
        setStreakCombo(0);
        setBoard(nextBoard);
        handlePostPlacement(nextBoard, pieceIndex);
      }
    },
    [availablePieces, board, isGameOver, canPlacePiece, streakCombo, addFloatingNotice, handlePostPlacement]
  );

  // Virtual D-Pad movement for keyboard & on-screen buttons
  const handleDpadMove = useCallback((dr: number, dc: number) => {
    if (isGameOver) return;
    const activeIdx = selectedPieceIndex !== null ? selectedPieceIndex : availablePieces.findIndex((p) => p !== null);
    if (activeIdx === -1 || !availablePieces[activeIdx]) return;
    const piece = availablePieces[activeIdx]!;

    if (selectedPieceIndex !== activeIdx) {
      setSelectedPieceIndex(activeIdx);
    }

    const currentR = hoverPosition ? hoverPosition.r : 3;
    const currentC = hoverPosition ? hoverPosition.c : 3;

    const maxR = BOARD_SIZE - piece.matrix.length;
    const maxC = BOARD_SIZE - piece.matrix[0].length;

    const nextR = Math.max(0, Math.min(maxR, currentR + dr));
    const nextC = Math.max(0, Math.min(maxC, currentC + dc));

    const isValid = canPlacePiece(board, piece, nextR, nextC);
    setHoverPosition({ r: nextR, c: nextC, isValid });
    playClickSound();
  }, [isGameOver, selectedPieceIndex, availablePieces, hoverPosition, board]);

  const handleDpadPlace = useCallback(() => {
    if (isGameOver) return;
    const activeIdx = selectedPieceIndex !== null ? selectedPieceIndex : availablePieces.findIndex((p) => p !== null);
    if (activeIdx === -1 || !availablePieces[activeIdx]) return;

    if (!hoverPosition) {
      const piece = availablePieces[activeIdx]!;
      const r = 3, c = 3;
      if (canPlacePiece(board, piece, r, c)) {
        executePlacement(activeIdx, r, c);
      } else {
        addFloatingNotice('⚠️ Hãy di chuyển khối đến vị trí hợp lệ!', '#ef4444', 50, 48);
      }
      return;
    }

    if (hoverPosition.isValid) {
      executePlacement(activeIdx, hoverPosition.r, hoverPosition.c);
    } else {
      addFloatingNotice('⚠️ Vị trí không hợp lệ!', '#ef4444', 50, 48);
    }
  }, [isGameOver, selectedPieceIndex, availablePieces, hoverPosition, board, executePlacement, addFloatingNotice]);

  // Keyboard shortcut listener: R / Space for Rotate, 1/2/3 for slot select, Arrow keys/WASD for D-Pad, Enter for place, D for Reroll, F for Hammer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      const key = e.key.toLowerCase();

      if (key === 'r' || key === ' ') {
        e.preventDefault();
        const activeIdx =
          draggingIndex !== null
            ? draggingIndex
            : selectedPieceIndex !== null
            ? selectedPieceIndex
            : availablePieces.findIndex((p) => p !== null);

        if (activeIdx !== -1 && availablePieces[activeIdx]) {
          rotatePieceAtIndex(activeIdx);
          addFloatingNotice('🔄 ĐÃ XOAY KHỐI (R)', '#facc15', 50, 48);
        }
      } else if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        handleDpadMove(-1, 0);
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        handleDpadMove(1, 0);
      } else if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        handleDpadMove(0, -1);
      } else if (key === 'arrowright') {
        e.preventDefault();
        handleDpadMove(0, 1);
      } else if (key === 'enter') {
        e.preventDefault();
        handleDpadPlace();
      } else if (key === '1' || key === '2' || key === '3') {
        const idx = parseInt(key, 10) - 1;
        if (availablePieces[idx]) {
          setSelectedPieceIndex(idx);
          playClickSound();
        }
      } else if (key === 'd' && !['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (magicRerolls > 0) {
          handleMagicReroll();
        }
      } else if (key === 'f') {
        if (hammerCharges > 0) {
          setIsHammerActive((prev) => !prev);
          playClickSound();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isGameOver,
    draggingIndex,
    selectedPieceIndex,
    availablePieces,
    rotatePieceAtIndex,
    addFloatingNotice,
    magicRerolls,
    hammerCharges,
    handleMagicReroll,
    handleDpadMove,
    handleDpadPlace,
  ]);

  // Restart game
  const handleRestart = () => {
    playCoinSound();
    setBoard(
      Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => ({ filled: false }))
      )
    );
    const newPieces = generateRandomPieces();
    setAvailablePieces(newPieces);
    setSelectedPieceIndex(null);
    setHoverPosition(null);
    setDraggingIndex(null);
    setDragPointer(null);
    setMagicRerolls(2);
    setHammerCharges(1);
    setIsHammerActive(false);
    setScore(0);
    setLinesExploded(0);
    setStreakCombo(0);
    setIsGameOver(false);
    setFloatingNotices([]);
  };

  // =========================================================================
  // DRAG AND DROP HANDLERS (POINTER EVENTS FOR MOUSE & TOUCH)
  // =========================================================================
  const calculateBoardCellUnderPointer = useCallback(
    (clientX: number, clientY: number, piece: PieceShape, offsetAbove: number) => {
      const grid = boardGridRef.current;
      if (!grid) return null;

      const rect = grid.getBoundingClientRect();
      const cellWidth = rect.width / BOARD_SIZE;
      const cellHeight = rect.height / BOARD_SIZE;

      // Adjust pointer Y above finger for great visibility
      const adjustedY = clientY - offsetAbove;

      // Center the piece around the pointer target
      const pRows = piece.matrix.length;
      const pCols = piece.matrix[0].length;

      const relX = clientX - rect.left - (pCols * cellWidth) / 2;
      const relY = adjustedY - rect.top - (pRows * cellHeight) / 2;

      // Nearest integer anchor cell
      const anchorC = Math.round(relX / cellWidth);
      const anchorR = Math.round(relY / cellHeight);

      // Check if completely within board placing limits
      if (
        anchorR >= 0 &&
        anchorR + pRows <= BOARD_SIZE &&
        anchorC >= 0 &&
        anchorC + pCols <= BOARD_SIZE
      ) {
        const isValid = canPlacePiece(board, piece, anchorR, anchorC);
        return { r: anchorR, c: anchorC, isValid };
      }

      // If near borders, show invalid position
      if (
        anchorR >= -1 &&
        anchorR <= BOARD_SIZE &&
        anchorC >= -1 &&
        anchorC <= BOARD_SIZE
      ) {
        return { r: anchorR, c: anchorC, isValid: false };
      }

      return null;
    },
    [board, canPlacePiece]
  );

  // Pointer Down on a piece
  const handlePiecePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    index: number
  ) => {
    if (isGameOver) return;
    const piece = availablePieces[index];
    if (!piece) return;

    if (!canPieceFitAnywhere(board, piece)) {
      return; // Cannot fit anywhere
    }

    // Determine offset above finger for touch (approx 70px), 15px for mouse
    const isTouch = e.pointerType === 'touch';
    const offset = isTouch ? 70 : 15;
    setDragOffsetAbove(offset);

    isDraggingRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };

    setDraggingIndex(index);
    setDragPointer({ x: e.clientX, y: e.clientY });

    // Also select this piece for click-to-place fallback
    setSelectedPieceIndex(index);

    // Capture pointer
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Pointer Move while dragging
  const handlePiecePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex === null) return;
    const piece = availablePieces[draggingIndex];
    if (!piece) return;

    const dx = Math.abs(e.clientX - dragStartPosRef.current.x);
    const dy = Math.abs(e.clientY - dragStartPosRef.current.y);

    if (dx > 4 || dy > 4) {
      isDraggingRef.current = true;
    }

    setDragPointer({ x: e.clientX, y: e.clientY });

    // Check board intersection
    const cellHover = calculateBoardCellUnderPointer(
      e.clientX,
      e.clientY,
      piece,
      dragOffsetAbove
    );
    setHoverPosition(cellHover);
  };

  // Pointer Up / Drop
  const handlePiecePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex === null) return;
    const piece = availablePieces[draggingIndex];

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const wasDragging = isDraggingRef.current;
    const finalHover = hoverPosition;

    if (wasDragging && finalHover && finalHover.isValid && piece) {
      // SUCCESSFUL DROP ON BOARD!
      executePlacement(draggingIndex, finalHover.r, finalHover.c);
    } else if (!wasDragging) {
      // It was a tap/click: select for tap-to-place
      playClickSound();
    }

    // Reset drag state
    setDraggingIndex(null);
    setDragPointer(null);
    isDraggingRef.current = false;
  };

  // Direct cell click on board (click-to-place or hammer mode)
  const handleCellClick = (r: number, c: number) => {
    if (isGameOver) return;

    // If hammer mode is active
    if (isHammerActive) {
      handleHammerCellClick(r, c);
      return;
    }

    if (selectedPieceIndex === null) return;
    const piece = availablePieces[selectedPieceIndex];
    if (!piece) return;

    if (canPlacePiece(board, piece, r, c)) {
      executePlacement(selectedPieceIndex, r, c);
    }
  };

  // Cell hover for click-to-place preview
  const handleCellMouseEnter = (r: number, c: number) => {
    if (draggingIndex !== null || isHammerActive) return;
    if (selectedPieceIndex !== null) {
      const piece = availablePieces[selectedPieceIndex];
      if (piece) {
        const isValid = canPlacePiece(board, piece, r, c);
        setHoverPosition({ r, c, isValid });
      }
    }
  };

  // Check if a cell is part of the preview highlight
  const isCellInPreview = (r: number, c: number): { inPreview: boolean; isValid: boolean } => {
    const activePieceIdx = draggingIndex !== null ? draggingIndex : selectedPieceIndex;
    if (activePieceIdx === null || !hoverPosition) return { inPreview: false, isValid: false };

    const piece = availablePieces[activePieceIdx];
    if (!piece) return { inPreview: false, isValid: false };

    const offsetR = r - hoverPosition.r;
    const offsetC = c - hoverPosition.c;

    if (
      offsetR >= 0 &&
      offsetR < piece.matrix.length &&
      offsetC >= 0 &&
      offsetC < piece.matrix[0].length &&
      piece.matrix[offsetR][offsetC] === 1
    ) {
      return { inPreview: true, isValid: hoverPosition.isValid };
    }

    return { inPreview: false, isValid: false };
  };

  const activePiece =
    draggingIndex !== null
      ? availablePieces[draggingIndex]
      : selectedPieceIndex !== null
      ? availablePieces[selectedPieceIndex]
      : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden select-none flex flex-col items-center justify-between p-3 sm:p-5 font-sans bg-[#090312]"
    >
      {/* ========================================================================= */}
      {/* MAGICAL ARCANE BACKGROUND (PHÔNG NỀN MA PHÁP HUYỀN ẢO) */}
      {/* ========================================================================= */}
      
      {/* 1. Deep cosmic starlight texture */}
      <img
        src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
        alt="Arcane Space Nebula"
        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none mix-blend-screen filter saturate-150 brightness-75"
      />

      {/* 2. Mystical Violet & Gold Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#3b115e55_0%,#1a062fdd_55%,#090312_95%)] pointer-events-none" />

      {/* 3. Glowing Animated Arcane Magic Circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 overflow-hidden">
        <svg
          viewBox="0 0 500 500"
          className="w-[520px] h-[520px] sm:w-[620px] sm:h-[620px] text-amber-400 animate-[spin_80s_linear_infinite]"
        >
          {/* Outer runic rings */}
          <circle cx="250" cy="250" r="235" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" />
          <circle cx="250" cy="250" r="220" fill="none" stroke="#a855f7" strokeWidth="2" />
          <circle cx="250" cy="250" r="198" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />

          {/* Hexagram Arcane Star */}
          <polygon points="250,52 422,350 78,350" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
          <polygon points="250,448 78,150 422,150" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />

          {/* Inner Magic Sigils */}
          <circle cx="250" cy="250" r="142" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="10 15" />
          <circle cx="250" cy="250" r="80" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="250" cy="250" r="40" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP STATS & ACTIONS BAR */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full flex items-center justify-between gap-2 bg-[#120624]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ĐIỂM:</span>
            </span>
            <span className="text-xl sm:text-2xl font-black font-sans text-white drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
              {score}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-purple-900/60 text-xs font-sans">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-neutral-400 hidden sm:inline">Đã Nổ:</span>
            <strong className="text-orange-300 font-mono text-sm">{linesExploded} Dòng</strong>
          </div>

          {streakCombo > 1 && (
            <div className="flex items-center gap-1.5 pl-3 border-l border-purple-900/60 text-xs font-sans animate-bounce">
              <Zap className="w-4 h-4 text-yellow-400 fill-current" />
              <strong className="text-yellow-300 font-mono text-sm">COMBO x{streakCombo}!</strong>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-sans text-neutral-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Kỷ lục: <strong className="text-yellow-300 font-mono">{highScore}</strong></span>
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-purple-500/40 hover:border-amber-400 text-xs font-mono text-neutral-200 hover:text-white transition-all shadow cursor-pointer"
            title="Chơi ván mới"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Ván Mới</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAGIC SPELLS & POWER-UPS TOOLBAR */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full flex items-center justify-between gap-2 mt-2 px-1 max-w-lg">
        {/* Magic Re-roll button */}
        <button
          onClick={handleMagicReroll}
          disabled={magicRerolls <= 0 || isGameOver}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow cursor-pointer ${
            magicRerolls > 0 && !isGameOver
              ? 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 hover:from-blue-800 hover:to-indigo-800 border border-sky-400/50 text-sky-200 hover:text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
              : 'bg-neutral-900/50 border border-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
          }`}
          title="Đổi 3 khối mới ngẫu nhiên (Phím D)"
        >
          <Dices className="w-3.5 h-3.5 text-sky-400" />
          <span>Đổi Khối</span>
          <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">
            x{magicRerolls}
          </span>
          <span className="hidden sm:inline text-[9px] text-sky-400/70 font-mono">[D]</span>
        </button>

        {/* Thunder Hammer button */}
        <button
          onClick={() => {
            if (hammerCharges > 0) {
              setIsHammerActive((prev) => !prev);
              playClickSound();
            }
          }}
          disabled={hammerCharges <= 0 || isGameOver}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow cursor-pointer ${
            isHammerActive
              ? 'bg-amber-500 text-neutral-950 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-pulse'
              : hammerCharges > 0 && !isGameOver
              ? 'bg-gradient-to-r from-purple-900/80 to-amber-900/80 hover:from-purple-800 hover:to-amber-800 border border-amber-500/50 text-amber-200 hover:text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-neutral-900/50 border border-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
          }`}
          title="Chọn 1 ô bất kỳ trên bàn cờ để phá vỡ (Phím F)"
        >
          <Zap className={`w-3.5 h-3.5 ${isHammerActive ? 'text-neutral-950 fill-current' : 'text-amber-400'}`} />
          <span>{isHammerActive ? 'Đang Phá Ô...' : 'Phá 1 Ô'}</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isHammerActive ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300'}`}>
            x{hammerCharges}
          </span>
          <span className="hidden sm:inline text-[9px] text-amber-400/70 font-mono">[F]</span>
        </button>

        {/* Rotate Active Block Button */}
        <button
          onClick={() => {
            const activeIdx =
              draggingIndex !== null
                ? draggingIndex
                : selectedPieceIndex !== null
                ? selectedPieceIndex
                : availablePieces.findIndex((p) => p !== null);
            if (activeIdx !== -1) {
              rotatePieceAtIndex(activeIdx);
              addFloatingNotice('🔄 ĐÃ XOAY KHỐI!', '#facc15', 50, 48);
            }
          }}
          disabled={isGameOver || availablePieces.every((p) => p === null)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-emerald-900/80 to-teal-900/80 hover:from-emerald-800 hover:to-teal-800 border border-emerald-400/50 text-emerald-200 hover:text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          title="Xoay khối 90 độ (Phím R hoặc Phím Cách)"
        >
          <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-[spin_6s_linear_infinite]" />
          <span>Xoay Khối</span>
          <span className="text-[10px] font-mono font-bold text-amber-300 bg-emerald-500/20 px-1.5 py-0.2 rounded">
            [R]
          </span>
        </button>
      </div>

      {/* Hammer Active Notice */}
      {isHammerActive && (
        <div className="relative z-30 mt-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono flex items-center gap-1.5 animate-bounce">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Hãy nhấp vào 1 ô có ngọc trên bàn cờ để phá hủy! (Bấm lại để hủy)</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 8x8 GEMSTONE GRID BOARD - FULL SIZED & PROMINENT */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex items-center justify-center my-3 sm:my-4">
        <div className="relative w-[340px] sm:w-[420px] md:w-[460px] max-w-[94vw] aspect-square p-2.5 sm:p-3.5 rounded-3xl bg-gradient-to-br from-[#230f3a] via-[#140624] to-[#1a082c] border-2 border-amber-500/50 shadow-[0_0_60px_rgba(168,85,247,0.4)] flex items-center justify-center">
          
          {/* Ornate corner gemstones */}
          <div className="absolute top-2 left-2.5 text-sm text-amber-400/80 drop-shadow">✦</div>
          <div className="absolute top-2 right-2.5 text-sm text-amber-400/80 drop-shadow">✦</div>
          <div className="absolute bottom-2 left-2.5 text-sm text-amber-400/80 drop-shadow">✦</div>
          <div className="absolute bottom-2 right-2.5 text-sm text-amber-400/80 drop-shadow">✦</div>

          {/* Grid Container */}
          <div
            ref={boardGridRef}
            className={`w-full h-full grid gap-1 sm:gap-1.5 bg-[#0a0314]/95 p-1.5 sm:p-2 rounded-2xl border shadow-inner relative overflow-hidden transition-all ${
              isHammerActive
                ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-crosshair'
                : 'border-purple-800/60'
            }`}
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
            onMouseLeave={() => {
              if (draggingIndex === null) setHoverPosition(null);
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const { inPreview, isValid } = isCellInPreview(r, c);

                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className={`relative rounded-lg transition-all duration-150 flex items-center justify-center cursor-pointer ${
                      cell.filled
                        ? isHammerActive
                          ? 'bg-red-500/50 border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105 hover:scale-110'
                          : `bg-gradient-to-tr ${cell.bgGradient} border ${cell.borderStyle} ${cell.glowShadow}`
                        : inPreview
                        ? isValid
                          ? 'bg-emerald-500/50 border-2 border-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.9)] scale-95'
                          : 'bg-red-500/40 border-2 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)] scale-95'
                        : 'bg-[#150a24]/80 hover:bg-[#220e3a] border border-purple-900/40'
                    } ${cell.isExploding ? 'animate-ping scale-125 bg-yellow-300 border-white z-20' : ''}`}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
                    onClick={() => handleCellClick(r, c)}
                  >
                    {/* Gem Rune Symbol on filled cell */}
                    {cell.filled && !cell.isExploding && (
                      <span className="text-xs sm:text-base font-black text-white/95 select-none drop-shadow">
                        {isHammerActive ? '⚡' : cell.gemSymbol}
                      </span>
                    )}

                    {/* Preview Gem Shadow */}
                    {!cell.filled && inPreview && isValid && (
                      <span className="text-xs sm:text-base font-bold text-white/90 animate-pulse">
                        {activePiece?.gemSymbol}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Floating celebratory notices */}
          {floatingNotices.map((n) => (
            <div
              key={n.id}
              className="absolute z-40 pointer-events-none text-xs sm:text-base font-sans font-black drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] animate-out fade-out slide-out-to-top-8 duration-1000 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                color: n.color,
              }}
            >
              {n.text}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. THREE AVAILABLE PIECES (3 KHAY CHỨA KHỐI KÉO THẢ & NÚT XOAY) */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full flex flex-col items-center gap-2">
        <div className="text-[11px] font-mono text-amber-200/90 flex flex-wrap items-center justify-center gap-2 bg-[#140626]/80 px-3.5 py-1 rounded-full border border-purple-500/30">
          <div className="flex items-center gap-1">
            <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Kéo thả / Nhấp ô</span>
          </div>
          <span className="text-neutral-500">•</span>
          <div className="flex items-center gap-1 text-emerald-300">
            <RotateCw className="w-3 h-3 text-emerald-400" />
            <span>Phím <strong>[R]</strong> xoay khối</span>
          </div>
          <span className="text-neutral-500 hidden sm:inline">•</span>
          <span className="text-sky-300 hidden sm:inline">Phím <strong>[1, 2, 3]</strong> chọn</span>
          {activePiece && (
            <span className="text-amber-400 font-bold ml-1">
              [{activePiece.colorName.toUpperCase()}]
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-5 w-full max-w-lg mx-auto">
          {availablePieces.map((piece, idx) => {
            if (!piece) {
              // Empty slot (piece was already placed)
              return (
                <div
                  key={`empty-slot-${idx}`}
                  className="p-2.5 sm:p-3 rounded-2xl flex items-center justify-center min-h-[90px] sm:min-h-[105px] border-2 border-dashed border-purple-900/40 bg-[#0d0417]/40"
                >
                  <span className="text-[10px] font-mono text-purple-600/50">ĐÃ ĐẶT</span>
                </div>
              );
            }

            const isDraggingThis = draggingIndex === idx;
            const isSelected = selectedPieceIndex === idx;
            const canFit = canPieceFitAnywhere(board, piece);

            return (
              <div
                key={piece.id}
                onPointerDown={(e) => handlePiecePointerDown(e, idx)}
                onPointerMove={handlePiecePointerMove}
                onPointerUp={handlePiecePointerUp}
                onPointerCancel={handlePiecePointerUp}
                style={{ touchAction: 'none' }}
                className={`relative p-2.5 sm:p-3 rounded-2xl flex items-center justify-center min-h-[90px] sm:min-h-[105px] cursor-grab active:cursor-grabbing transition-all duration-200 select-none group ${
                  isDraggingThis
                    ? 'opacity-25 scale-95 border-2 border-dashed border-amber-400'
                    : isSelected
                    ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105'
                    : canFit
                    ? 'bg-[#150727]/90 hover:bg-[#200d3a] border border-purple-500/40 hover:border-amber-400 shadow-lg hover:shadow-purple-500/30'
                    : 'bg-[#10061d]/50 border border-neutral-800 opacity-35 cursor-not-allowed'
                }`}
                title={canFit ? 'Giữ & kéo khối lên bàn cờ, hoặc bấm R để xoay' : 'Không còn vị trí vừa trên bàn cờ (Bấm R để xoay tìm góc đặt)'}
              >
                {/* Slot index badge */}
                <div className="absolute top-1.5 left-2 text-[9px] font-mono font-bold text-neutral-400/60 pointer-events-none">
                  [ {idx + 1} ]
                </div>

                {/* Instant Rotate Button on each card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    rotatePieceAtIndex(idx);
                    addFloatingNotice('🔄 ĐÃ XOAY KHỐI!', '#facc15', 50, 48);
                  }}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-neutral-900/90 hover:bg-amber-500 text-amber-400 hover:text-neutral-950 border border-purple-500/40 hover:border-amber-300 transition-all cursor-pointer shadow active:scale-90 z-20"
                  title="Xoay 90° (Phím R)"
                >
                  <RotateCw className="w-3 h-3" />
                </button>

                {/* Piece Mini Matrix Display */}
                <div
                  className="grid gap-1 sm:gap-1.5 items-center justify-center pointer-events-none mt-1"
                  style={{
                    gridTemplateColumns: `repeat(${piece.matrix[0].length}, minmax(0, 1fr))`,
                  }}
                >
                  {piece.matrix.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`mini-${piece.id}-${r}-${c}`}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-[9px] sm:text-[10px] text-white font-black transition-all ${
                          val === 1
                            ? `bg-gradient-to-tr ${piece.bgGradient} border ${piece.borderStyle} ${piece.glowShadow}`
                            : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        {val === 1 && piece.gemSymbol}
                      </div>
                    ))
                  )}
                </div>

                {/* Hand Grab Indicator badge */}
                <div className="absolute bottom-1 right-2 text-[9px] font-mono text-neutral-400/70 pointer-events-none flex items-center gap-0.5">
                  <Move className="w-2.5 h-2.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* VIRTUAL CONTROLLER FOR MOBILE & IPAD: D-PAD, ROTATE & PLACEMENT BUTTONS */}
        {/* ========================================================================= */}
        <div className="w-full max-w-lg mx-auto mt-2 bg-[#120522]/90 border border-purple-500/40 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col gap-2.5">
          {/* Quick Slot Selector & Rotate */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-neutral-400">Chọn khối:</span>
              {[0, 1, 2].map((idx) => {
                const p = availablePieces[idx];
                const isSelected = selectedPieceIndex === idx;
                return (
                  <button
                    key={`slot-btn-${idx}`}
                    type="button"
                    disabled={!p || isGameOver}
                    onClick={() => {
                      if (p) {
                        setSelectedPieceIndex(idx);
                        playClickSound();
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      !p
                        ? 'bg-neutral-950 text-neutral-600 border border-neutral-800 cursor-not-allowed opacity-40'
                        : isSelected
                        ? 'bg-amber-500 text-neutral-950 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-105'
                        : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700'
                    }`}
                  >
                    #{idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Rotate Active Piece */}
              <button
                type="button"
                disabled={isGameOver || (selectedPieceIndex === null && !availablePieces.some((p) => p !== null))}
                onClick={() => {
                  const activeIdx =
                    selectedPieceIndex !== null
                      ? selectedPieceIndex
                      : availablePieces.findIndex((p) => p !== null);
                  if (activeIdx !== -1 && availablePieces[activeIdx]) {
                    rotatePieceAtIndex(activeIdx);
                    addFloatingNotice('🔄 ĐÃ XOAY KHỐI (R)', '#facc15', 50, 48);
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-purple-900/60 hover:bg-purple-800 active:bg-amber-500 text-purple-200 active:text-neutral-950 border border-purple-500/50 text-xs font-mono font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
                title="Xoay 90° (Phím R)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Xoay (R)</span>
              </button>

              {/* Reroll 3 Pieces */}
              <button
                type="button"
                disabled={magicRerolls <= 0 || isGameOver}
                onClick={handleMagicReroll}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                  magicRerolls > 0
                    ? 'bg-sky-950/60 hover:bg-sky-900 text-sky-300 border-sky-500/50 shadow'
                    : 'bg-neutral-950 text-neutral-600 border-neutral-800 opacity-40 cursor-not-allowed'
                }`}
                title="Đổi 3 khối mới (Phím D)"
              >
                <Dices className="w-3.5 h-3.5 text-sky-400" />
                <span>Đổi ({magicRerolls})</span>
              </button>

              {/* Thunder Hammer */}
              <button
                type="button"
                disabled={hammerCharges <= 0 || isGameOver}
                onClick={() => {
                  setIsHammerActive((prev) => !prev);
                  playClickSound();
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                  isHammerActive
                    ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.7)] animate-pulse'
                    : hammerCharges > 0
                    ? 'bg-amber-950/50 hover:bg-amber-900 text-amber-300 border-amber-500/40 shadow'
                    : 'bg-neutral-950 text-neutral-600 border-neutral-800 opacity-40 cursor-not-allowed'
                }`}
                title="Búa sấm sét phá 1 ô (Phím F)"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>Búa ({hammerCharges})</span>
              </button>
            </div>
          </div>

          {/* D-Pad Buttons + Place Button */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-purple-900/40">
            {/* D-Pad 4 Directions */}
            <div className="relative w-36 h-24 flex items-center justify-center select-none">
              {/* UP */}
              <button
                type="button"
                onClick={() => handleDpadMove(-1, 0)}
                className="absolute top-0 w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 text-white active:text-neutral-950 border border-neutral-700 flex items-center justify-center shadow transition-transform active:scale-95 cursor-pointer"
                title="Di chuyển lên (↑)"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              {/* LEFT */}
              <button
                type="button"
                onClick={() => handleDpadMove(0, -1)}
                className="absolute left-0 w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 text-white active:text-neutral-950 border border-neutral-700 flex items-center justify-center shadow transition-transform active:scale-95 cursor-pointer"
                title="Di chuyển sang trái (←)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {/* CENTER DOT */}
              <div className="w-6 h-6 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[9px] text-neutral-500 pointer-events-none">
                ✦
              </div>
              {/* RIGHT */}
              <button
                type="button"
                onClick={() => handleDpadMove(0, 1)}
                className="absolute right-0 w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 text-white active:text-neutral-950 border border-neutral-700 flex items-center justify-center shadow transition-transform active:scale-95 cursor-pointer"
                title="Di chuyển sang phải (→)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              {/* DOWN */}
              <button
                type="button"
                onClick={() => handleDpadMove(1, 0)}
                className="absolute bottom-0 w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 text-white active:text-neutral-950 border border-neutral-700 flex items-center justify-center shadow transition-transform active:scale-95 cursor-pointer"
                title="Di chuyển xuống (↓)"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Place Block Button */}
            <div className="flex-1 flex flex-col gap-1 items-end">
              <button
                type="button"
                disabled={isGameOver}
                onClick={handleDpadPlace}
                className={`w-full max-w-[200px] py-3 px-4 rounded-2xl font-black font-sans text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                  hoverPosition?.isValid
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.6)] transform hover:scale-[1.02] active:scale-95'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>ĐẶT KHỐI</span>
              </button>
              <span className="text-[10px] font-mono text-neutral-400 text-right">
                {hoverPosition
                  ? hoverPosition.isValid
                    ? '✓ Vị trí hợp lệ'
                    : '⚠️ Vị trí không hợp lệ'
                  : 'Dùng mũi tên căn vị trí'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FLOATING DRAGGED GHOST PIECE (REALISTIC CELL SIZE) */}
      {/* ========================================================================= */}
      {draggingIndex !== null && dragPointer && availablePieces[draggingIndex] && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
          style={{
            left: `${dragPointer.x}px`,
            top: `${dragPointer.y - dragOffsetAbove}px`,
          }}
        >
          {(() => {
            const piece = availablePieces[draggingIndex];
            if (!piece) return null;
            return (
              <div
                className="grid gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-[#140624]/85 backdrop-blur-sm border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.7)]"
                style={{
                  gridTemplateColumns: `repeat(${piece.matrix[0].length}, minmax(0, 1fr))`,
                }}
              >
                {piece.matrix.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`dragged-${r}-${c}`}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-sm sm:text-base text-white font-black ${
                        val === 1
                          ? `bg-gradient-to-tr ${piece.bgGradient} border-2 ${piece.borderStyle} ${piece.glowShadow}`
                          : 'opacity-0'
                      }`}
                    >
                      {val === 1 && piece.gemSymbol}
                    </div>
                  ))
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GAME OVER MODAL */}
      {/* ========================================================================= */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-sm w-full bg-[#180829] border-2 border-red-500/80 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_70px_rgba(239,68,68,0.5)]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 font-sans uppercase">
                HẾT Ô ĐẶT KHỐI!
              </h3>
              <p className="text-xs font-sans text-neutral-300">
                Không còn vị trí thích hợp nào trên bàn cờ cho các khối còn lại!
              </p>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Điểm đạt được:</span>
                <strong className="text-amber-400 text-base font-bold">{score} ĐIỂM</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Số dòng đã nổ:</span>
                <strong className="text-emerald-400 font-bold">{linesExploded} DÒNG</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-400 border-t border-neutral-800/80 pt-2">
                <span>Kỷ lục cao nhất:</span>
                <strong className="text-yellow-300 font-bold">{highScore} ĐIỂM</strong>
              </div>
            </div>

            <button
              onClick={handleRestart}
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
