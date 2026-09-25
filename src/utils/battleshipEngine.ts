import {
  AiDifficulty,
  CellState,
  DeviceInfo,
  DeviceType,
  DevicesInventory,
  PlacedShip,
  ShipOrientation,
  ShipTemplate,
} from '../types/battleship';

export const BOARD_SIZE = 10;
export const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

// Balanced 4-ship size combinations (guarantees both players have equal total cells)
const BALANCED_SHIP_COMBOS: number[][] = [
  [5, 4, 3, 2], // 14 cells
  [5, 4, 3, 3], // 15 cells
  [4, 4, 3, 2], // 13 cells
  [5, 3, 3, 2], // 13 cells
  [4, 3, 3, 2], // 12 cells
  [6, 4, 3, 2], // 15 cells
  [5, 4, 4, 2], // 15 cells
  [4, 4, 3, 3], // 14 cells
];

const SHIP_METADATA_BY_SIZE: Record<
  number,
  Array<{ name: string; icon: string; badge: string; border: string; grad: string }>
> = {
  6: [
    {
      name: 'Siêu Hạm Titan Hư Không',
      icon: '🛸',
      badge: 'bg-purple-500/20 text-purple-300',
      border: 'border-purple-500',
      grad: 'from-purple-600 to-indigo-600',
    },
  ],
  5: [
    {
      name: 'Tàu Sân Bay Nguyên Tử',
      icon: '🚢',
      badge: 'bg-cyan-500/20 text-cyan-300',
      border: 'border-cyan-500',
      grad: 'from-cyan-600 to-blue-600',
    },
    {
      name: 'Hàng Mẫu Hạm Thái Dương',
      icon: '🛳️',
      badge: 'bg-amber-500/20 text-amber-300',
      border: 'border-amber-500',
      grad: 'from-amber-600 to-yellow-600',
    },
  ],
  4: [
    {
      name: 'Thiết Giáp Hạm Hắc Long',
      icon: '⚓',
      badge: 'bg-indigo-500/20 text-indigo-300',
      border: 'border-indigo-500',
      grad: 'from-indigo-600 to-purple-600',
    },
    {
      name: 'Chiến Hạm Pháo Hạm Hoàng Gia',
      icon: '⚔️',
      badge: 'bg-rose-500/20 text-rose-300',
      border: 'border-rose-500',
      grad: 'from-rose-600 to-red-600',
    },
  ],
  3: [
    {
      name: 'Tuần Dương Hạm Lôi Đình',
      icon: '⚡',
      badge: 'bg-yellow-500/20 text-yellow-300',
      border: 'border-yellow-500',
      grad: 'from-yellow-600 to-amber-600',
    },
    {
      name: 'Tàu Phóng Lôi Tiên Phong',
      icon: '🚀',
      badge: 'bg-emerald-500/20 text-emerald-300',
      border: 'border-emerald-500',
      grad: 'from-emerald-600 to-teal-600',
    },
  ],
  2: [
    {
      name: 'Tàu Ngầm Tàng Hình Bão Táp',
      icon: '🦈',
      badge: 'bg-sky-500/20 text-sky-300',
      border: 'border-sky-500',
      grad: 'from-sky-600 to-cyan-600',
    },
    {
      name: 'Tàu Khu Trục Tuần Thao',
      icon: '🚤',
      badge: 'bg-teal-500/20 text-teal-300',
      border: 'border-teal-500',
      grad: 'from-teal-600 to-emerald-600',
    },
  ],
};

/**
 * Generate 4 random ship templates for a match.
 * Both players will receive these EXACT same 4 templates!
 */
export function generateMatchShipTemplates(): ShipTemplate[] {
  const chosenCombo =
    BALANCED_SHIP_COMBOS[Math.floor(Math.random() * BALANCED_SHIP_COMBOS.length)];

  // Shuffle to randomize order slightly
  const sizes = [...chosenCombo];

  const templates: ShipTemplate[] = sizes.map((size, index) => {
    const metaList = SHIP_METADATA_BY_SIZE[size] || SHIP_METADATA_BY_SIZE[3];
    const meta = metaList[index % metaList.length];

    return {
      id: `ship-${index}-${size}`,
      name: meta.name,
      size,
      iconEmoji: meta.icon,
      badgeColor: meta.badge,
      borderColor: meta.border,
      accentGradient: meta.grad,
    };
  });

  return templates;
}

/**
 * Create a fresh 10x10 board of CellState
 */
export function createEmptyBoard(size: number = BOARD_SIZE): CellState[][] {
  const grid: CellState[][] = [];
  for (let r = 0; r < size; r++) {
    const row: CellState[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        r,
        c,
        shipId: null,
        isHit: false,
        isMiss: false,
        radarEcho: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Check if a ship of given size and orientation can be placed at (r, c)
 */
export function canPlaceShip(
  board: CellState[][],
  r: number,
  c: number,
  size: number,
  orientation: ShipOrientation,
  excludeShipId: string | null = null,
  boardSize: number = BOARD_SIZE
): boolean {
  for (let i = 0; i < size; i++) {
    const cellR = orientation === 'vertical' ? r + i : r;
    const cellC = orientation === 'horizontal' ? c + i : c;

    // Check bounds
    if (cellR < 0 || cellR >= boardSize || cellC < 0 || cellC >= boardSize) {
      return false;
    }

    // Check overlap
    const existingShipId = board[cellR][cellC].shipId;
    if (existingShipId !== null && existingShipId !== excludeShipId) {
      return false;
    }
  }

  return true;
}

/**
 * Get ship cells coordinate array
 */
export function getShipCoordinates(
  r: number,
  c: number,
  size: number,
  orientation: ShipOrientation
): Array<{ r: number; c: number }> {
  const cells: Array<{ r: number; c: number }> = [];
  for (let i = 0; i < size; i++) {
    cells.push({
      r: orientation === 'vertical' ? r + i : r,
      c: orientation === 'horizontal' ? c + i : c,
    });
  }
  return cells;
}

/**
 * Automatically place all 4 ships randomly on an empty board
 */
export function autoPlaceShips(
  templates: ShipTemplate[],
  boardSize: number = BOARD_SIZE
): { board: CellState[][]; placedShips: PlacedShip[] } {
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    const board = createEmptyBoard(boardSize);
    const placedShips: PlacedShip[] = [];
    let allPlaced = true;

    for (const t of templates) {
      let placed = false;
      let placeTries = 0;

      while (!placed && placeTries < 200) {
        placeTries++;
        const orientation: ShipOrientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const maxR = orientation === 'vertical' ? boardSize - t.size : boardSize - 1;
        const maxC = orientation === 'horizontal' ? boardSize - t.size : boardSize - 1;

        if (maxR < 0 || maxC < 0) continue;

        const r = Math.floor(Math.random() * (maxR + 1));
        const c = Math.floor(Math.random() * (maxC + 1));

        if (canPlaceShip(board, r, c, t.size, orientation, null, boardSize)) {
          const coords = getShipCoordinates(r, c, t.size, orientation);
          coords.forEach(pt => {
            board[pt.r][pt.c].shipId = t.id;
          });

          placedShips.push({
            id: t.id,
            name: t.name,
            size: t.size,
            cells: coords,
            orientation,
            hits: 0,
            isSunk: false,
            iconEmoji: t.iconEmoji,
            badgeColor: t.badgeColor,
          });
          placed = true;
        }
      }

      if (!placed) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      return { board, placedShips };
    }
  }

  // Fallback simple deterministic placement
  const board = createEmptyBoard(boardSize);
  const placedShips: PlacedShip[] = [];
  templates.forEach((t, i) => {
    const r = i * 2;
    const c = 0;
    const coords = getShipCoordinates(r, c, t.size, 'horizontal');
    coords.forEach(pt => {
      board[pt.r][pt.c].shipId = t.id;
    });
    placedShips.push({
      id: t.id,
      name: t.name,
      size: t.size,
      cells: coords,
      orientation: 'horizontal',
      hits: 0,
      isSunk: false,
      iconEmoji: t.iconEmoji,
      badgeColor: t.badgeColor,
    });
  });

  return { board, placedShips };
}

/**
 * Returns 3x3 cells centered at (centerR, centerC) within bounds
 */
export function getRadarCells(
  centerR: number,
  centerC: number,
  boardSize: number = BOARD_SIZE
): Array<{ r: number; c: number }> {
  const cells: Array<{ r: number; c: number }> = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = centerR + dr;
      const c = centerC + dc;
      if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
        cells.push({ r, c });
      }
    }
  }
  return cells;
}

/**
 * Returns 3 contiguous cells for salvo attack starting from (startR, startC)
 * Clamps within board size so 3 cells always fit
 */
export function getSalvoCells(
  startR: number,
  startC: number,
  orientation: ShipOrientation,
  boardSize: number = BOARD_SIZE
): Array<{ r: number; c: number }> {
  let r = startR;
  let c = startC;

  if (orientation === 'horizontal') {
    if (c + 2 >= boardSize) {
      c = boardSize - 3;
    }
    return [
      { r, c },
      { r, c: c + 1 },
      { r, c: c + 2 },
    ];
  } else {
    if (r + 2 >= boardSize) {
      r = boardSize - 3;
    }
    return [
      { r, c },
      { r: r + 1, c },
      { r: r + 2, c },
    ];
  }
}

/** 2x2 Cluster Bomb cells */
export function getCluster2x2Cells(
  startR: number,
  startC: number,
  boardSize: number = BOARD_SIZE
): Array<{ r: number; c: number }> {
  const r = Math.max(0, Math.min(boardSize - 2, startR));
  const c = Math.max(0, Math.min(boardSize - 2, startC));
  return [
    { r, c },
    { r, c: c + 1 },
    { r: r + 1, c },
    { r: r + 1, c: c + 1 },
  ];
}

/** 5-cell Cross/Plus scan (+) */
export function getCrossScanCells(
  centerR: number,
  centerC: number,
  boardSize: number = BOARD_SIZE
): Array<{ r: number; c: number }> {
  const cells: Array<{ r: number; c: number }> = [{ r: centerR, c: centerC }];
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];
  dirs.forEach(d => {
    const nr = centerR + d.dr;
    const nc = centerC + d.dc;
    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
      cells.push({ r: nr, c: nc });
    }
  });
  return cells;
}

/** 3-cell Diagonal Strike */
export function getDiagonal3Cells(
  centerR: number,
  centerC: number,
  orientation: ShipOrientation,
  boardSize: number = BOARD_SIZE
): Array<{ r: number; c: number }> {
  const r = Math.max(1, Math.min(boardSize - 2, centerR));
  const c = Math.max(1, Math.min(boardSize - 2, centerC));

  if (orientation === 'horizontal') {
    // Top-left to bottom-right
    return [
      { r: r - 1, c: c - 1 },
      { r, c },
      { r: r + 1, c: c + 1 },
    ];
  } else {
    // Top-right to bottom-left
    return [
      { r: r - 1, c: c + 1 },
      { r, c },
      { r: r + 1, c: c - 1 },
    ];
  }
}

/** Torpedo path: returns path and first impacted ship cell if any */
export function getTorpedoRun(
  board: CellState[][],
  startR: number,
  startC: number,
  orientation: ShipOrientation,
  boardSize: number = BOARD_SIZE
): {
  path: Array<{ r: number; c: number }>;
  impactCell: { r: number; c: number } | null;
} {
  const path: Array<{ r: number; c: number }> = [];
  let impactCell: { r: number; c: number } | null = null;

  if (orientation === 'horizontal') {
    for (let c = 0; c < boardSize; c++) {
      path.push({ r: startR, c });
      const cell = board[startR][c];
      if (cell.shipId && !cell.isHit) {
        impactCell = { r: startR, c };
        break;
      }
    }
  } else {
    for (let r = 0; r < boardSize; r++) {
      path.push({ r, c: startC });
      const cell = board[r][startC];
      if (cell.shipId && !cell.isHit) {
        impactCell = { r, c: startC };
        break;
      }
    }
  }

  return { path, impactCell };
}

/** Count ship cells in row or col */
export function countShipsInRowOrCol(
  board: CellState[][],
  axis: 'row' | 'col',
  index: number,
  boardSize: number = BOARD_SIZE
): number {
  let count = 0;
  if (axis === 'row') {
    for (let c = 0; c < boardSize; c++) {
      if (board[index][c].shipId) count++;
    }
  } else {
    for (let r = 0; r < boardSize; r++) {
      if (board[r][index].shipId) count++;
    }
  }
  return count;
}

/**
 * MASTER LIST OF 12 BALANCED TACTICAL NAVAL DEVICES
 */
export const ALL_12_DEVICES: DeviceInfo[] = [
  {
    id: 'radar',
    name: 'Radar Quét 3x3',
    shortName: 'Radar 3x3',
    tagline: 'Phát hiện bóng mờ trong vùng 3x3',
    description: 'Quét vùng 3x3 quanh mục tiêu. Nếu có ô chứa tàu, hiện bóng mờ radar (vẫn cần 1 phát bắn để bắn trúng).',
    icon: '📡',
    accentColor: 'text-yellow-400 bg-yellow-500/20',
    borderColor: 'border-yellow-400',
    category: 'recon',
  },
  {
    id: 'relocate',
    name: 'Đổi Vị Trí Tàu',
    shortName: 'Cơ Động Tàu',
    tagline: 'Di chuyển 1 tàu còn nguyên vẹn',
    description: 'Chọn 1 chiến hạm của bạn chưa bị trúng phát đạn nào để di chuyển đến vị trí mới và xóa sạch dấu vết radar.',
    icon: '🔄',
    accentColor: 'text-emerald-400 bg-emerald-500/20',
    borderColor: 'border-emerald-400',
    category: 'defense',
  },
  {
    id: 'salvo3',
    name: 'Oanh Tạc 3 Ô',
    shortName: 'Pháo Dàn 3 Ô',
    tagline: 'Bắn thẳng 3 ô liên tiếp ngang hoặc dọc',
    description: 'Khai hỏa pháo kích 3 ô thẳng hàng liên tiếp theo hướng ngang hoặc dọc (bấm R để xoay hướng).',
    icon: '💥',
    accentColor: 'text-orange-400 bg-orange-500/20',
    borderColor: 'border-orange-400',
    category: 'attack',
  },
  {
    id: 'cluster2x2',
    name: 'Bom Chùm 2x2',
    shortName: 'Bom Chùm 2x2',
    tagline: 'Oanh kích đồng loạt 4 ô diện tích 2x2',
    description: 'Thả chùm bom nổ phá hủy cùng lúc 4 ô trong vùng tứ giác 2x2, gây sát thương diện rộng.',
    icon: '💣',
    accentColor: 'text-rose-400 bg-rose-500/20',
    borderColor: 'border-rose-400',
    category: 'attack',
  },
  {
    id: 'cross_scan',
    name: 'Radar Chữ Thập',
    shortName: 'Radar Dấu +',
    tagline: 'Quét 5 ô hình dấu cộng (+)',
    description: 'Quét radar 5 ô (ô trung tâm và 4 ô lân cận trực giao), phát hiện bóng mờ tàu mà không tiêu tốn lượt bắn.',
    icon: '➕',
    accentColor: 'text-cyan-400 bg-cyan-500/20',
    borderColor: 'border-cyan-400',
    category: 'recon',
  },
  {
    id: 'line_sonar',
    name: 'Sonar Đếm Tàu',
    shortName: 'Sonar Hàng/Cột',
    tagline: 'Đo chính xác số ô tàu trên 1 hàng hoặc cột',
    description: 'Chọn 1 hàng ngang hoặc 1 cột dọc: hệ thống định vị siêu âm sẽ thông báo chính xác có bao nhiêu ô tàu đang ẩn nấp trên đường đó.',
    icon: '📶',
    accentColor: 'text-blue-400 bg-blue-500/20',
    borderColor: 'border-blue-400',
    category: 'recon',
  },
  {
    id: 'double_fire',
    name: 'Hỏa Lực Kép',
    shortName: 'Bắn 2 Ô Tự Do',
    tagline: 'Nã pháo vào 2 ô tùy ý bất kỳ trong 1 lượt',
    description: 'Cho phép bạn chọn 2 ô mục tiêu riêng biệt bất kỳ trên bàn cờ địch để bắn liên thanh trong cùng 1 lượt.',
    icon: '⚔️',
    accentColor: 'text-red-400 bg-red-500/20',
    borderColor: 'border-red-400',
    category: 'attack',
  },
  {
    id: 'shield',
    name: 'Khiên Hộ Mệnh',
    shortName: 'Khiên Năng Lượng',
    tagline: 'Chặn đứng 1 đòn bắn của đối phương',
    description: 'Đặt khiên năng lượng bảo vệ 1 ô trên tàu của bạn. Nếu đối thủ bắn vào ô này, khiên sẽ hấp thụ đòn đánh mà tàu không bị mất máu.',
    icon: '🛡️',
    accentColor: 'text-indigo-400 bg-indigo-500/20',
    borderColor: 'border-indigo-400',
    category: 'defense',
  },
  {
    id: 'torpedo',
    name: 'Ngư Lôi Xuyên Hàng',
    shortName: 'Ngư Lôi Phóng',
    tagline: 'Phóng ngư lôi kích nổ ô tàu đầu tiên',
    description: 'Phóng ngư lôi chạy dọc theo hàng hoặc cột từ mép bàn cờ, nó sẽ đâm và kích nổ ngay ô tàu đầu tiên gặp phải trên đường đi!',
    icon: '🚀',
    accentColor: 'text-teal-400 bg-teal-500/20',
    borderColor: 'border-teal-400',
    category: 'attack',
  },
  {
    id: 'diagonal3',
    name: 'Pháo Kích Đường Chéo',
    shortName: 'Bắn Chéo 3 Ô',
    tagline: 'Bắn 3 ô theo đường chéo góc',
    description: 'Khai hỏa 3 phát đạn theo đường chéo (chính hoặc phụ, bấm R để đổi hướng chéo) xuyên phá góc bất ngờ.',
    icon: '📐',
    accentColor: 'text-purple-400 bg-purple-500/20',
    borderColor: 'border-purple-400',
    category: 'attack',
  },
  {
    id: 'deep_probe',
    name: 'Đầu Dò Đáy Biển',
    shortName: 'Dò Kích Nổ',
    tagline: 'Dò 1 ô: Trúng thì phá hủy, trượt không mất lượt',
    description: 'Thả đầu dò vào 1 ô: Nếu có tàu, ô đó lập tức bị bắn trúng! Nếu là biển trống, ô được đánh dấu nước và BẠN ĐƯỢC BẮN TIẾP!',
    icon: '🎯',
    accentColor: 'text-sky-400 bg-sky-500/20',
    borderColor: 'border-sky-400',
    category: 'recon',
  },
  {
    id: 'decoy',
    name: 'Phao Mồi Nhử',
    shortName: 'Phao Đánh Lừa',
    tagline: 'Tạo tín hiệu radar giả trên bàn bạn',
    description: 'Đặt 1 phao mồi nhử trên 1 ô biển trống của bạn. Phao phát sóng radar giả đánh lừa máy quét và dụ AI bắn trúng vào phao mồi!',
    icon: '🪤',
    accentColor: 'text-amber-400 bg-amber-500/20',
    borderColor: 'border-amber-400',
    category: 'defense',
  },
];

/**
 * Pick 3 random distinct devices from the 12 for the match.
 * Both sides receive these exact same 3 devices!
 */
export function pickRandomMatchDevices(): DeviceType[] {
  const shuffled = [...ALL_12_DEVICES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(d => d.id);
}

/**
 * Create initial inventory with 2 uses for each of the 3 match devices
 */
export function createInitialDevicesInventory(matchDevices: DeviceType[]): DevicesInventory {
  const inv: DevicesInventory = {
    radar: 0,
    relocate: 0,
    salvo3: 0,
    cluster2x2: 0,
    cross_scan: 0,
    line_sonar: 0,
    double_fire: 0,
    shield: 0,
    torpedo: 0,
    diagonal3: 0,
    deep_probe: 0,
    decoy: 0,
  };
  matchDevices.forEach(d => {
    inv[d] = 2;
  });
  return inv;
}

/**
 * Smart AI Decision Engine with 3 difficulties:
 * - Easy (Tân Binh): Random hunting, 50% hit tracking, no parity
 * - Medium (Thuyền Trưởng): Checkerboard parity, collinear hunt-target tracking, radar usage
 * - Hard (Đô Đốc Pro): Probability Density Map (Monte Carlo density matrix) based on remaining
 *   unsunk ship lengths, collinear hit projection, high-density cluster radar scouting, and strategic relocation.
 *   100% fair - NO CHEATING, simulates grandmaster human player!
 */
export interface AiDecision {
  type: 'attack' | DeviceType;
  targetR?: number;
  targetC?: number;
  secondaryTargetR?: number;
  secondaryTargetC?: number;
  salvoOrientation?: ShipOrientation;
  relocateShipId?: string;
  newR?: number;
  newC?: number;
  newOrientation?: ShipOrientation;
  sonarAxis?: 'row' | 'col';
  sonarIndex?: number;
}

/**
 * Calculate 10x10 Probability Density Map (Monte Carlo Density Matrix Algorithm)
 * 100% fair: NO CHEATING / NO PEEKING at hidden ships!
 * Uses public naval warfare knowledge (remaining ship sizes, sunk ship cells, active hits, radar echoes, and parity).
 */
export function calculateProbabilityMap(
  enemyBoard: CellState[][],
  enemyShips: PlacedShip[],
  boardSize: number = BOARD_SIZE
): number[][] {
  const sunkCellsSet = new Set<string>();
  enemyShips
    .filter(s => s.isSunk)
    .forEach(s => {
      s.cells.forEach(pt => sunkCellsSet.add(`${pt.r},${pt.c}`));
    });

  const activeHits: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (enemyBoard[r][c].isHit && !sunkCellsSet.has(`${r},${c}`)) {
        activeHits.push({ r, c });
      }
    }
  }

  const unattackedRadarEchoes: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (enemyBoard[r][c].radarEcho && !enemyBoard[r][c].isHit && !enemyBoard[r][c].isMiss) {
        unattackedRadarEchoes.push({ r, c });
      }
    }
  }

  const unsunkEnemyShips = enemyShips.filter(s => !s.isSunk);
  const remainingSizes = unsunkEnemyShips.map(s => s.size);
  const minSize = remainingSizes.length > 0 ? Math.min(...remainingSizes) : 2;

  const probMap: number[][] = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(0)
  );

  for (const size of remainingSizes) {
    // Horizontal combinations
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c <= boardSize - size; c++) {
        let valid = true;
        let hitsContained = 0;

        for (let i = 0; i < size; i++) {
          const cell = enemyBoard[r][c + i];
          if (cell.isMiss || sunkCellsSet.has(`${r},${c + i}`)) {
            valid = false;
            break;
          }
          if (cell.isHit) {
            hitsContained++;
          }
        }

        if (valid) {
          let weight = 1;
          if (activeHits.length > 0) {
            if (hitsContained > 0) {
              weight = 50 * Math.pow(4, hitsContained);
            } else {
              weight = 0.5;
            }
          } else {
            weight = 2;
          }

          for (let i = 0; i < size; i++) {
            const cell = enemyBoard[r][c + i];
            if (!cell.isHit && !cell.isMiss) {
              const parityBonus = (r + (c + i)) % minSize === 0 ? 1.5 : 1.0;
              probMap[r][c + i] += weight * parityBonus;
            }
          }
        }
      }
    }

    // Vertical combinations
    for (let c = 0; c < boardSize; c++) {
      for (let r = 0; r <= boardSize - size; r++) {
        let valid = true;
        let hitsContained = 0;

        for (let i = 0; i < size; i++) {
          const cell = enemyBoard[r + i][c];
          if (cell.isMiss || sunkCellsSet.has(`${r + i},${c}`)) {
            valid = false;
            break;
          }
          if (cell.isHit) {
            hitsContained++;
          }
        }

        if (valid) {
          let weight = 1;
          if (activeHits.length > 0) {
            if (hitsContained > 0) {
              weight = 50 * Math.pow(4, hitsContained);
            } else {
              weight = 0.5;
            }
          } else {
            weight = 2;
          }

          for (let i = 0; i < size; i++) {
            const cell = enemyBoard[r + i][c];
            if (!cell.isHit && !cell.isMiss) {
              const parityBonus = ((r + i) + c) % minSize === 0 ? 1.5 : 1.0;
              probMap[r + i][c] += weight * parityBonus;
            }
          }
        }
      }
    }
  }

  for (const echo of unattackedRadarEchoes) {
    probMap[echo.r][echo.c] += 300;
  }

  return probMap;
}

export function computeAiMove(
  aiShips: PlacedShip[],
  aiBoard: CellState[][],
  enemyBoard: CellState[][],
  enemyShips: PlacedShip[],
  devices: DevicesInventory,
  turnCount: number,
  difficulty: AiDifficulty = 'hard',
  boardSize: number = BOARD_SIZE
): AiDecision {
  // Defensive Relocate
  const relocateChance = difficulty === 'hard' ? 0.75 : difficulty === 'medium' ? 0.45 : 0.2;
  if (devices.relocate > 0 && Math.random() < relocateChance) {
    const exposedShip = aiShips.find(ship => {
      if (ship.hits > 0 || ship.isSunk) return false;
      return ship.cells.some(cell => aiBoard[cell.r][cell.c].radarEcho);
    });

    if (exposedShip) {
      for (let t = 0; t < 40; t++) {
        const orient: ShipOrientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const maxR = orient === 'vertical' ? boardSize - exposedShip.size : boardSize - 1;
        const maxC = orient === 'horizontal' ? boardSize - exposedShip.size : boardSize - 1;
        const testR = Math.floor(Math.random() * (maxR + 1));
        const testC = Math.floor(Math.random() * (maxC + 1));

        if (canPlaceShip(aiBoard, testR, testC, exposedShip.size, orient, exposedShip.id, boardSize)) {
          return {
            type: 'relocate',
            relocateShipId: exposedShip.id,
            newR: testR,
            newC: testC,
            newOrientation: orient,
          };
        }
      }
    }
  }

  // Defensive Shield: if an AI ship is wounded, protect one of its surviving cells
  if (devices.shield > 0 && Math.random() < 0.5) {
    const woundedShip = aiShips.find(s => s.hits > 0 && !s.isSunk);
    if (woundedShip) {
      const unhitCell = woundedShip.cells.find(pt => !aiBoard[pt.r][pt.c].isHit && !aiBoard[pt.r][pt.c].hasShield);
      if (unhitCell) {
        return {
          type: 'shield',
          targetR: unhitCell.r,
          targetC: unhitCell.c,
        };
      }
    }
  }

  // Defensive Decoy
  if (devices.decoy > 0 && Math.random() < 0.3) {
    const emptyCells: Array<{ r: number; c: number }> = [];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (!aiBoard[r][c].shipId && !aiBoard[r][c].isHit && !aiBoard[r][c].isMiss && !aiBoard[r][c].isDecoy) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length > 0) {
      const pick = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      return {
        type: 'decoy',
        targetR: pick.r,
        targetC: pick.c,
      };
    }
  }

  // Known sunk cells set (public info in naval warfare: players know when a ship sinks)
  const sunkCellsSet = new Set<string>();
  enemyShips
    .filter(s => s.isSunk)
    .forEach(s => {
      s.cells.forEach(pt => sunkCellsSet.add(`${pt.r},${pt.c}`));
    });

  // Active damaged hits (hits on ships that are NOT sunk yet)
  const activeHits: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (enemyBoard[r][c].isHit && !sunkCellsSet.has(`${r},${c}`)) {
        activeHits.push({ r, c });
      }
    }
  }

  // Unattacked radar echoes
  const unattackedRadarEchoes: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (enemyBoard[r][c].radarEcho && !enemyBoard[r][c].isHit && !enemyBoard[r][c].isMiss) {
        unattackedRadarEchoes.push({ r, c });
      }
    }
  }

  // All unattacked cells
  const unattackedCells: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!enemyBoard[r][c].isHit && !enemyBoard[r][c].isMiss) {
        unattackedCells.push({ r, c });
      }
    }
  }

  if (unattackedCells.length === 0) {
    return { type: 'attack', targetR: 0, targetC: 0 };
  }

  // ==========================================================
  // DIFFICULTY: EASY (Tân Binh)
  // Random hunting, 50% chance to pursue adjacent hits, no parity
  // ==========================================================
  if (difficulty === 'easy') {
    // Rare device usage from currently available match devices
    const availableDevices = (Object.keys(devices) as DeviceType[]).filter(d => (devices[d] || 0) > 0);
    if (availableDevices.length > 0 && Math.random() < 0.18) {
      const dev = availableDevices[Math.floor(Math.random() * availableDevices.length)];
      const pick = unattackedCells[Math.floor(Math.random() * unattackedCells.length)];
      if (['radar', 'cross_scan'].includes(dev)) {
        return { type: dev, targetR: pick.r, targetC: pick.c };
      }
      if (dev === 'line_sonar') {
        return { type: dev, sonarAxis: Math.random() < 0.5 ? 'row' : 'col', sonarIndex: Math.floor(Math.random() * boardSize) };
      }
      if (['salvo3', 'cluster2x2', 'diagonal3', 'torpedo', 'deep_probe'].includes(dev)) {
        return {
          type: dev,
          targetR: pick.r,
          targetC: pick.c,
          salvoOrientation: Math.random() < 0.5 ? 'horizontal' : 'vertical',
        };
      }
    }

    if (activeHits.length > 0 && Math.random() < 0.5) {
      const hit = activeHits[Math.floor(Math.random() * activeHits.length)];
      const neighbors = [
        { r: hit.r - 1, c: hit.c },
        { r: hit.r + 1, c: hit.c },
        { r: hit.r, c: hit.c - 1 },
        { r: hit.r, c: hit.c + 1 },
      ].filter(
        pt =>
          pt.r >= 0 &&
          pt.r < boardSize &&
          pt.c >= 0 &&
          pt.c < boardSize &&
          !enemyBoard[pt.r][pt.c].isHit &&
          !enemyBoard[pt.r][pt.c].isMiss
      );

      if (neighbors.length > 0) {
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        return { type: 'attack', targetR: pick.r, targetC: pick.c };
      }
    }

    // Otherwise random shot
    const pick = unattackedCells[Math.floor(Math.random() * unattackedCells.length)];
    return { type: 'attack', targetR: pick.r, targetC: pick.c };
  }

  // ==========================================================
  // DIFFICULTY: MEDIUM (Thuyền Trưởng)
  // Parity hunt + collinear target pursuit + dynamic 12-device utilization
  // ==========================================================
  if (difficulty === 'medium') {
    // Medium Defense: Shield wounded ship
    if (devices.shield > 0 && Math.random() < 0.4) {
      const woundedShip = aiShips.find(s => s.hits > 0 && !s.isSunk);
      if (woundedShip) {
        const unhitCell = woundedShip.cells.find(pt => !aiBoard[pt.r][pt.c].isHit && !aiBoard[pt.r][pt.c].hasShield);
        if (unhitCell) {
          return { type: 'shield', targetR: unhitCell.r, targetC: unhitCell.c };
        }
      }
    }

    // 1. If radar echoes available, 75% target one
    if (unattackedRadarEchoes.length > 0 && Math.random() < 0.75) {
      const pick = unattackedRadarEchoes[Math.floor(Math.random() * unattackedRadarEchoes.length)];
      if (devices.salvo3 > 0 && Math.random() < 0.4) {
        return {
          type: 'salvo3',
          targetR: pick.r,
          targetC: pick.c,
          salvoOrientation: Math.random() < 0.5 ? 'horizontal' : 'vertical',
        };
      }
      if (devices.cluster2x2 > 0 && Math.random() < 0.4) {
        return { type: 'cluster2x2', targetR: pick.r, targetC: pick.c };
      }
      if (devices.deep_probe > 0 && Math.random() < 0.4) {
        return { type: 'deep_probe', targetR: pick.r, targetC: pick.c };
      }
      return { type: 'attack', targetR: pick.r, targetC: pick.c };
    }

    // 2. Target Mode: collinear pursuit of active hits
    if (activeHits.length > 0) {
      // If 2+ hits, check line
      if (activeHits.length >= 2) {
        // Group by row or column
        const sameRow = activeHits.every(h => h.r === activeHits[0].r);
        const sameCol = activeHits.every(h => h.c === activeHits[0].c);

        if (sameRow) {
          const r = activeHits[0].r;
          const cols = activeHits.map(h => h.c).sort((a, b) => a - b);
          const minCol = cols[0];
          const maxCol = cols[cols.length - 1];
          const lineCandidates: Array<{ r: number; c: number }> = [];

          if (minCol - 1 >= 0 && !enemyBoard[r][minCol - 1].isHit && !enemyBoard[r][minCol - 1].isMiss) {
            lineCandidates.push({ r, c: minCol - 1 });
          }
          if (maxCol + 1 < boardSize && !enemyBoard[r][maxCol + 1].isHit && !enemyBoard[r][maxCol + 1].isMiss) {
            lineCandidates.push({ r, c: maxCol + 1 });
          }

          if (lineCandidates.length > 0) {
            const pick = lineCandidates[Math.floor(Math.random() * lineCandidates.length)];
            if (devices.salvo3 > 0 && Math.random() < 0.5) {
              return { type: 'salvo3', targetR: pick.r, targetC: pick.c, salvoOrientation: 'horizontal' };
            }
            if (devices.cluster2x2 > 0 && Math.random() < 0.4) {
              return { type: 'cluster2x2', targetR: pick.r, targetC: pick.c };
            }
            if (devices.torpedo > 0 && Math.random() < 0.4) {
              return { type: 'torpedo', targetR: pick.r, targetC: pick.c, salvoOrientation: 'horizontal' };
            }
            return { type: 'attack', targetR: pick.r, targetC: pick.c };
          }
        } else if (sameCol) {
          const c = activeHits[0].c;
          const rows = activeHits.map(h => h.r).sort((a, b) => a - b);
          const minRow = rows[0];
          const maxRow = rows[rows.length - 1];
          const lineCandidates: Array<{ r: number; c: number }> = [];

          if (minRow - 1 >= 0 && !enemyBoard[minRow - 1][c].isHit && !enemyBoard[minRow - 1][c].isMiss) {
            lineCandidates.push({ r: minRow - 1, c });
          }
          if (maxRow + 1 < boardSize && !enemyBoard[maxRow + 1][c].isHit && !enemyBoard[maxRow + 1][c].isMiss) {
            lineCandidates.push({ r: maxRow + 1, c });
          }

          if (lineCandidates.length > 0) {
            const pick = lineCandidates[Math.floor(Math.random() * lineCandidates.length)];
            if (devices.salvo3 > 0 && Math.random() < 0.5) {
              return { type: 'salvo3', targetR: pick.r, targetC: pick.c, salvoOrientation: 'vertical' };
            }
            if (devices.cluster2x2 > 0 && Math.random() < 0.4) {
              return { type: 'cluster2x2', targetR: pick.r, targetC: pick.c };
            }
            if (devices.torpedo > 0 && Math.random() < 0.4) {
              return { type: 'torpedo', targetR: pick.r, targetC: pick.c, salvoOrientation: 'vertical' };
            }
            return { type: 'attack', targetR: pick.r, targetC: pick.c };
          }
        }
      }

      // Check any neighbor of active hits
      const neighbors: Array<{ r: number; c: number }> = [];
      for (const hit of activeHits) {
        const dirs = [
          { dr: -1, dc: 0 },
          { dr: 1, dc: 0 },
          { dr: 0, dc: -1 },
          { dr: 0, dc: 1 },
        ];
        for (const d of dirs) {
          const nr = hit.r + d.dr;
          const nc = hit.c + d.dc;
          if (
            nr >= 0 &&
            nr < boardSize &&
            nc >= 0 &&
            nc < boardSize &&
            !enemyBoard[nr][nc].isHit &&
            !enemyBoard[nr][nc].isMiss
          ) {
            neighbors.push({ r: nr, c: nc });
          }
        }
      }

      if (neighbors.length > 0) {
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        return { type: 'attack', targetR: pick.r, targetC: pick.c };
      }
    }

    // 3. Recon device usage in medium mode if no hits in a while
    if ((devices.radar > 0 || devices.cross_scan > 0) && Math.random() < 0.3) {
      const candidates = [
        { r: 2, c: 2 },
        { r: 2, c: 7 },
        { r: 7, c: 2 },
        { r: 7, c: 7 },
        { r: 4, c: 4 },
        { r: 5, c: 5 },
      ].filter(pt => {
        return getRadarCells(pt.r, pt.c, boardSize).some(
          cell => !enemyBoard[cell.r][cell.c].isHit && !enemyBoard[cell.r][cell.c].isMiss
        );
      });

      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const reconType = devices.radar > 0 ? 'radar' : 'cross_scan';
        return { type: reconType, targetR: pick.r, targetC: pick.c };
      }
    }

    if (devices.line_sonar > 0 && Math.random() < 0.25) {
      return {
        type: 'line_sonar',
        sonarAxis: Math.random() < 0.5 ? 'row' : 'col',
        sonarIndex: Math.floor(Math.random() * boardSize),
      };
    }

    // 4. Parity hunt mode
    const parity = unattackedCells.filter(pt => (pt.r + pt.c) % 2 === 0);
    const pool = parity.length > 0 ? parity : unattackedCells;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { type: 'attack', targetR: pick.r, targetC: pick.c };
  }

  // ==========================================================
  // DIFFICULTY: HARD (Đô Đốc Pro)
  // Probability Density Map (Monte Carlo Density Matrix Algorithm)
  // 100% fair: NO CHEATING / NO PEEKING at player ship positions!
  // Simulates grandmaster probability weighting across all remaining unsunk ship lengths.
  // ==========================================================
  const probMap = calculateProbabilityMap(enemyBoard, enemyShips, boardSize);

  // Find max probability among unattacked cells
  let maxWeight = -1;
  for (const cell of unattackedCells) {
    if (probMap[cell.r][cell.c] > maxWeight) {
      maxWeight = probMap[cell.r][cell.c];
    }
  }

  // TACTICAL DEVICE DECISIONS (HARD MODE)
  // 1. Radar in High-Density Cluster when hunting (no active hits)
  if (devices.radar > 0 && activeHits.length === 0 && Math.random() < 0.45) {
    let bestRadarCenter = { r: 4, c: 4 };
    let bestClusterSum = -1;

    // Test grid centers
    const radarCenters = [
      { r: 2, c: 2 },
      { r: 2, c: 7 },
      { r: 7, c: 2 },
      { r: 7, c: 7 },
      { r: 4, c: 5 },
      { r: 5, c: 4 },
      { r: 3, c: 4 },
      { r: 6, c: 5 },
    ];

    for (const center of radarCenters) {
      const radiusCells = getRadarCells(center.r, center.c, boardSize);
      const unattackedInZone = radiusCells.filter(
        pt => !enemyBoard[pt.r][pt.c].isHit && !enemyBoard[pt.r][pt.c].isMiss
      );
      if (unattackedInZone.length >= 4) {
        const clusterSum = radiusCells.reduce((sum, pt) => sum + probMap[pt.r][pt.c], 0);
        if (clusterSum > bestClusterSum) {
          bestClusterSum = clusterSum;
          bestRadarCenter = center;
        }
      }
    }

    if (bestClusterSum > 10) {
      return {
        type: 'radar',
        targetR: bestRadarCenter.r,
        targetC: bestRadarCenter.c,
      };
    }
  }

  // Cross Scan 5-cell recon
  if (devices.cross_scan > 0 && activeHits.length === 0 && Math.random() < 0.4) {
    const pick = unattackedCells[Math.floor(Math.random() * unattackedCells.length)];
    return {
      type: 'cross_scan',
      targetR: pick.r,
      targetC: pick.c,
    };
  }

  // Line Sonar
  if (devices.line_sonar > 0 && activeHits.length === 0 && Math.random() < 0.35) {
    const isRow = Math.random() < 0.5;
    const index = Math.floor(Math.random() * boardSize);
    return {
      type: 'line_sonar',
      sonarAxis: isRow ? 'row' : 'col',
      sonarIndex: index,
    };
  }

  // Cluster 2x2 Bomb
  if (devices.cluster2x2 > 0 && Math.random() < 0.45) {
    let bestCluster = { r: 0, c: 0 };
    let bestSum = -1;
    for (let r = 0; r <= boardSize - 2; r++) {
      for (let c = 0; c <= boardSize - 2; c++) {
        const sum = probMap[r][c] + probMap[r][c + 1] + probMap[r + 1][c] + probMap[r + 1][c + 1];
        if (sum > bestSum) {
          bestSum = sum;
          bestCluster = { r, c };
        }
      }
    }
    return {
      type: 'cluster2x2',
      targetR: bestCluster.r,
      targetC: bestCluster.c,
    };
  }

  // 2. Salvo 3 across high-probability strip or active line
  if (devices.salvo3 > 0) {
    // Check if there are active hits in a line
    if (activeHits.length >= 2) {
      const sameRow = activeHits.every(h => h.r === activeHits[0].r);
      const sameCol = activeHits.every(h => h.c === activeHits[0].c);

      if (sameRow) {
        const r = activeHits[0].r;
        const cols = activeHits.map(h => h.c).sort((a, b) => a - b);
        const startC = Math.max(0, Math.min(boardSize - 3, cols[0] - 1));
        return {
          type: 'salvo3',
          targetR: r,
          targetC: startC,
          salvoOrientation: 'horizontal',
        };
      } else if (sameCol) {
        const c = activeHits[0].c;
        const rows = activeHits.map(h => h.r).sort((a, b) => a - b);
        const startR = Math.max(0, Math.min(boardSize - 3, rows[0] - 1));
        return {
          type: 'salvo3',
          targetR: startR,
          targetC: c,
          salvoOrientation: 'vertical',
        };
      }
    }
  }

  // Candidates with max weight (tie-breaking with human-like variance)
  const topCandidates = unattackedCells.filter(
    cell => probMap[cell.r][cell.c] >= maxWeight - 0.5
  );

  const best =
    topCandidates.length > 0
      ? topCandidates[Math.floor(Math.random() * topCandidates.length)]
      : unattackedCells[0];

  // Double Fire
  if (devices.double_fire > 0 && topCandidates.length >= 2 && Math.random() < 0.6) {
    return {
      type: 'double_fire',
      targetR: topCandidates[0].r,
      targetC: topCandidates[0].c,
      secondaryTargetR: topCandidates[1].r,
      secondaryTargetC: topCandidates[1].c,
    };
  }

  // Deep Probe
  if (devices.deep_probe > 0 && Math.random() < 0.45) {
    return {
      type: 'deep_probe',
      targetR: best.r,
      targetC: best.c,
    };
  }

  // Torpedo
  if (devices.torpedo > 0 && Math.random() < 0.4) {
    const isHoriz = Math.random() < 0.5;
    return {
      type: 'torpedo',
      targetR: best.r,
      targetC: best.c,
      salvoOrientation: isHoriz ? 'horizontal' : 'vertical',
    };
  }

  // Diagonal 3
  if (devices.diagonal3 > 0 && Math.random() < 0.35) {
    return {
      type: 'diagonal3',
      targetR: Math.max(1, Math.min(boardSize - 2, best.r)),
      targetC: Math.max(1, Math.min(boardSize - 2, best.c)),
      salvoOrientation: Math.random() < 0.5 ? 'horizontal' : 'vertical',
    };
  }

  return {
    type: 'attack',
    targetR: best.r,
    targetC: best.c,
  };
}
