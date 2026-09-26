import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ShipTemplate,
  PlacedShip,
  CellState,
  GamePhase,
  ShipOrientation,
  DeviceType,
  DevicesInventory,
  PlayerStats,
  ToastAlert,
  AiDifficulty,
} from '../../types/battleship';
import {
  BOARD_SIZE,
  COL_LABELS,
  ROW_LABELS,
  ALL_12_DEVICES,
  generateMatchShipTemplates,
  createEmptyBoard,
  canPlaceShip,
  getShipCoordinates,
  autoPlaceShips,
  getRadarCells,
  getSalvoCells,
  getCluster2x2Cells,
  getCrossScanCells,
  getDiagonal3Cells,
  getTorpedoRun,
  countShipsInRowOrCol,
  pickRandomMatchDevices,
  createInitialDevicesInventory,
  computeAiMove,
  calculateProbabilityMap,
} from '../../utils/battleshipEngine';
import { navalAudio } from '../../utils/navalAudio';
import {
  Radio,
  Move,
  Crosshair,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Trophy,
  Shield,
  Bot,
  Flame,
  Zap,
  Swords,
  Skull,
  Eye,
  EyeOff,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface BattleshipGameProps {
  isFullscreen?: boolean;
}

interface SunkBannerData {
  shipName: string;
  shipSize: number;
  shipIcon: string;
  whoDestroyed: 'player' | 'ai'; // 'player' = YOU destroyed an AI ship! 'ai' = AI destroyed YOUR ship!
  rewardDeviceName?: string;
}

export const BattleshipGame: React.FC<BattleshipGameProps> = ({
  isFullscreen = false,
}) => {
  // Game Configuration & Templates
  const [matchShipTemplates, setMatchShipTemplates] = useState<ShipTemplate[]>(() => generateMatchShipTemplates());
  const [matchDevices, setMatchDevices] = useState<DeviceType[]>(() => pickRandomMatchDevices());
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('hard');
  const [phase, setPhase] = useState<GamePhase>('difficulty-select');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Player Board & Fleet (RIGHT SIDE - DEFENSE BASE)
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(() => createEmptyBoard());
  const [playerShips, setPlayerShips] = useState<PlacedShip[]>([]);
  const [playerDevices, setPlayerDevices] = useState<DevicesInventory>(() => createInitialDevicesInventory(matchDevices));
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ shotsFired: 0, hits: 0, shipsDestroyed: 0, devicesUsed: 0 });

  // AI Board & Fleet (LEFT SIDE - ATTACK TARGET ZONE - 100% Fog of War)
  const [aiBoard, setAiBoard] = useState<CellState[][]>(() => createEmptyBoard());
  const [aiShips, setAiShips] = useState<PlacedShip[]>([]);
  const [aiDevices, setAiDevices] = useState<DevicesInventory>(() => createInitialDevicesInventory(matchDevices));
  const [aiStats, setAiStats] = useState<PlayerStats>({ shotsFired: 0, hits: 0, shipsDestroyed: 0, devicesUsed: 0 });

  // Placement phase states
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [placementOrientation, setPlacementOrientation] = useState<ShipOrientation>('horizontal');
  const [hoverPlacementCell, setHoverPlacementCell] = useState<{ r: number; c: number } | null>(null);

  // Battle Active Device Mode
  const [activeDevice, setActiveDevice] = useState<DeviceType | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<ShipOrientation>('horizontal');
  const [relocateSelectedShipId, setRelocateSelectedShipId] = useState<string | null>(null);
  const [doubleFireFirstCell, setDoubleFireFirstCell] = useState<{ r: number; c: number } | null>(null);

  // Visual effects and battle log
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [sunkBanner, setSunkBanner] = useState<SunkBannerData | null>(null);
  const [screenShaking, setScreenShaking] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [hitStreak, setHitStreak] = useState(0);

  // Cool Features
  const [showProbabilityHeatmap, setShowProbabilityHeatmap] = useState(false);
  const [revealAiBoardOnGameOver, setRevealAiBoardOnGameOver] = useState(false);
  const [showDeviceEncyclopedia, setShowDeviceEncyclopedia] = useState(false);
  const [mobileActiveBoard, setMobileActiveBoard] = useState<'both' | 'ai' | 'player'>('both');

  // Total ship cells for display
  const totalShipCells = matchShipTemplates.reduce((sum, s) => sum + s.size, 0);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'danger' | 'warning' = 'info') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const triggerScreenShake = () => {
    setScreenShaking(true);
    setTimeout(() => setScreenShaking(false), 500);
  };

  const addCombatLog = (msg: string) => {
    setCombatLog(prev => [msg, ...prev.slice(0, 9)]);
  };

  // Keyboard shortcut: Press R to rotate ship placement or salvo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        navalAudio.playRotate();
        setPlacementOrientation(prev => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
        setDeviceOrientation(prev => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // START MATCH WITH CHOSEN DIFFICULTY
  const startNewMatch = (difficulty: AiDifficulty = aiDifficulty) => {
    const templates = generateMatchShipTemplates();
    const pickedDevices = pickRandomMatchDevices();
    setMatchShipTemplates(templates);
    setMatchDevices(pickedDevices);
    setAiDifficulty(difficulty);

    setPlayerBoard(createEmptyBoard());
    setPlayerShips([]);
    setPlayerDevices(createInitialDevicesInventory(pickedDevices));
    setPlayerStats({ shotsFired: 0, hits: 0, shipsDestroyed: 0, devicesUsed: 0 });

    setAiBoard(createEmptyBoard());
    setAiShips([]);
    setAiDevices(createInitialDevicesInventory(pickedDevices));
    setAiStats({ shotsFired: 0, hits: 0, shipsDestroyed: 0, devicesUsed: 0 });

    setSelectedTemplateIndex(0);
    setPlacementOrientation('horizontal');
    setActiveDevice(null);
    setRelocateSelectedShipId(null);
    setDoubleFireFirstCell(null);
    setSunkBanner(null);
    setCombatLog([]);
    setIsAiThinking(false);
    setHitStreak(0);
    setRevealAiBoardOnGameOver(false);

    setPhase('placement');
    navalAudio.playVictoryHorn();

    const deviceNames = pickedDevices.map(d => ALL_12_DEVICES.find(dev => dev.id === d)?.name).join(', ');
    showToast(`Đã nhận 4 chiến hạm và 3 Thiết bị: [${deviceNames}] (mỗi loại 2 lượt)!`, 'info');
  };

  // Quick auto-deploy for placement
  const handleAutoDeployCurrent = () => {
    navalAudio.playRelocateSound();
    const { board, placedShips } = autoPlaceShips(matchShipTemplates);
    setPlayerBoard(board);
    setPlayerShips(placedShips);
    setSelectedTemplateIndex(matchShipTemplates.length);
  };

  // Reset current placement
  const handleResetPlacement = () => {
    navalAudio.playRotate();
    setPlayerBoard(createEmptyBoard());
    setPlayerShips([]);
    setSelectedTemplateIndex(0);
  };

  // Manual placement click on Player Board
  const handlePlaceShipClick = (r: number, c: number) => {
    if (selectedTemplateIndex >= matchShipTemplates.length) return;
    const template = matchShipTemplates[selectedTemplateIndex];

    if (!canPlaceShip(playerBoard, r, c, template.size, placementOrientation)) {
      navalAudio.playWaterSplash();
      showToast('Vị trí này không hợp lệ hoặc bị va chạm tàu khác!', 'warning');
      return;
    }

    navalAudio.playRotate();
    const nextBoard = playerBoard.map(row => row.map(cell => ({ ...cell })));
    const coords = getShipCoordinates(r, c, template.size, placementOrientation);

    coords.forEach(pt => {
      nextBoard[pt.r][pt.c].shipId = template.id;
    });

    const newShip: PlacedShip = {
      id: template.id,
      name: template.name,
      size: template.size,
      cells: coords,
      orientation: placementOrientation,
      hits: 0,
      isSunk: false,
      iconEmoji: template.iconEmoji,
      badgeColor: template.badgeColor,
    };

    setPlayerBoard(nextBoard);
    setPlayerShips(prev => [...prev, newShip]);
    setSelectedTemplateIndex(prev => prev + 1);
  };

  // Confirm placement & start battle against AI
  const handleConfirmPlacement = () => {
    navalAudio.playShipSunk();
    const aiPlaced = autoPlaceShips(matchShipTemplates);
    setAiBoard(aiPlaced.board);
    setAiShips(aiPlaced.placedShips);
    setPhase('battle');
    showToast(`Hải chiến bắt đầu! Độ khó: ${getDifficultyLabel(aiDifficulty)}. Khai hỏa vào hạm đội AI (Bên Trái)!`, 'success');
    addCombatLog(`Trận đấu bắt đầu! Đối đầu AI (${getDifficultyLabel(aiDifficulty)}).`);
  };

  // AWARD RANDOM DEVICE TO DESTROYER FROM CURRENT MATCH DEVICES
  const awardDestroyerDevice = (whoDestroyed: 'player' | 'ai', ship: PlacedShip) => {
    const rewardDevice = matchDevices[Math.floor(Math.random() * matchDevices.length)];
    const devInfo = ALL_12_DEVICES.find(d => d.id === rewardDevice);
    const deviceName = devInfo?.name || 'Thiết Bị Chiến Thuật';

    if (whoDestroyed === 'player') {
      navalAudio.playEnemySunkFanfare();
      setPlayerDevices(prev => ({ ...prev, [rewardDevice]: (prev[rewardDevice] || 0) + 1 }));
      showToast(`🏆 CHIẾN CÔNG! Bạn đã bắn chìm ${ship.name}! Nhận +1 ${deviceName}!`, 'success');
      addCombatLog(`Bạn bắn chìm ${ship.name} của AI, nhận +1 ${deviceName}!`);

      setSunkBanner({
        shipName: ship.name,
        shipSize: ship.size,
        shipIcon: ship.iconEmoji,
        whoDestroyed: 'player',
        rewardDeviceName: deviceName,
      });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } else {
      navalAudio.playPlayerSunkAlarm();
      setAiDevices(prev => ({ ...prev, [rewardDevice]: (prev[rewardDevice] || 0) + 1 }));
      showToast(`⚠️ BÁO ĐỘNG! Tàu ${ship.name} của bạn đã bị AI bắn chìm!`, 'danger');
      addCombatLog(`AI bắn chìm tàu ${ship.name} của bạn!`);

      setSunkBanner({
        shipName: ship.name,
        shipSize: ship.size,
        shipIcon: ship.iconEmoji,
        whoDestroyed: 'ai',
      });
      triggerScreenShake();
    }

    setTimeout(() => {
      setSunkBanner(null);
    }, 2800);
  };

  // Check Game Over condition
  const checkGameOver = (ships: PlacedShip[]) => {
    return ships.length > 0 && ships.every(s => s.isSunk);
  };

  // Calculate live probability heatmap for tactical display
  const liveProbMap = useMemo(() => {
    if (phase !== 'battle' || !showProbabilityHeatmap) return null;
    return calculateProbabilityMap(aiBoard, aiShips, BOARD_SIZE);
  }, [phase, showProbabilityHeatmap, aiBoard, aiShips]);

  const maxProbWeight = useMemo(() => {
    if (!liveProbMap) return 1;
    let max = 1;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!aiBoard[r][c].isHit && !aiBoard[r][c].isMiss && liveProbMap[r][c] > max) {
          max = liveProbMap[r][c];
        }
      }
    }
    return max;
  }, [liveProbMap, aiBoard]);

  // ========================================================
  // PLAYER ATTACK: Standard Attack on AI Board (LEFT SIDE)
  // ========================================================
  const handlePlayerWon = () => {
    try {
      const cur = parseInt(localStorage.getItem('polyplay_battleship_wins') || '0', 10);
      localStorage.setItem('polyplay_battleship_wins', String(cur + 1));
    } catch {}
  };

  const handlePlayerAttack = (r: number, c: number) => {
    if (isAiThinking || phase !== 'battle') return;

    const cell = aiBoard[r][c];
    if (cell.isHit || cell.isMiss) {
      showToast('Tọa độ này đã bắn trước đó! Hãy chọn tọa độ khác.', 'warning');
      return;
    }

    navalAudio.playCannonFire();

    const nextBoard = aiBoard.map(row => row.map(cl => ({ ...cl })));
    const nextShips = aiShips.map(s => ({ ...s, cells: [...s.cells] }));
    const targetCell = nextBoard[r][c];

    let isHit = false;
    let newlySunkShip: PlacedShip | null = null;

    if (targetCell.shipId) {
      // Check if enemy cell has an active shield
      if (targetCell.hasShield) {
        targetCell.hasShield = false;
        navalAudio.playShieldSound();
        showToast('🛡️ PHÁ KHIÊN! Đòn bắn đã kích hoạt và phá vỡ Khiên Năng Lượng của đối thủ!', 'warning');
        addCombatLog(`Đòn bắn phá vỡ Khiên Năng Lượng tại ${COL_LABELS[c]}${ROW_LABELS[r]}!`);
      } else {
        isHit = true;
        targetCell.isHit = true;
        targetCell.radarEcho = false;
        navalAudio.playExplosionHit();

        const ship = nextShips.find(s => s.id === targetCell.shipId);
        if (ship && !ship.isSunk) {
          ship.hits += 1;
          if (ship.hits >= ship.size) {
            ship.isSunk = true;
            newlySunkShip = ship;
          }
        }

        setHitStreak(prev => {
          const nextStreak = prev + 1;
          if (nextStreak >= 3) {
            showToast(`⚡ SIÊU PHÁO THỦ! Chuỗi bắn trúng liên hoàn x${nextStreak}!`, 'success');
          } else if (nextStreak === 2) {
            showToast(`🔥 COMBO x2! Bắn trúng liên tiếp!`, 'success');
          }
          return nextStreak;
        });

        addCombatLog(`Bạn bắn trúng tọa độ ${COL_LABELS[c]}${ROW_LABELS[r]}!`);
      }
    } else {
      targetCell.isMiss = true;
      targetCell.radarEcho = false;
      targetCell.isDecoy = false;
      navalAudio.playWaterSplash();
      setHitStreak(0);
      addCombatLog(`Bạn bắn trượt tại ${COL_LABELS[c]}${ROW_LABELS[r]}.`);
    }

    setAiBoard(nextBoard);
    setAiShips(nextShips);
    setPlayerStats(prev => ({
      ...prev,
      shotsFired: prev.shotsFired + 1,
      hits: prev.hits + (isHit ? 1 : 0),
      shipsDestroyed: prev.shipsDestroyed + (newlySunkShip ? 1 : 0),
    }));

    if (newlySunkShip) {
      awardDestroyerDevice('player', newlySunkShip);
    }

    if (checkGameOver(nextShips)) {
      handlePlayerWon();
      navalAudio.playVictoryHorn();
      confetti({ particleCount: 180, spread: 110, origin: { y: 0.6 } });
      setPhase('game-over');
      return;
    }

    const delay = newlySunkShip ? 2400 : 700;
    triggerAiTurn(nextBoard, nextShips, playerBoard, playerShips, delay);
  };

  // ========================================================
  // PLAYER UNIVERSAL DEVICE HANDLER (HANDLES ALL 12 DEVICES)
  // ========================================================
  const handleUseDeviceAction = (r: number, c: number, targetBoardType: 'ai' | 'player') => {
    if (isAiThinking || phase !== 'battle' || !activeDevice) return;
    if ((playerDevices[activeDevice] || 0) <= 0) return;

    // 1. RADAR 3x3 (on AI board)
    if (activeDevice === 'radar' && targetBoardType === 'ai') {
      navalAudio.playSonarPing();
      const nextBoard = aiBoard.map(row => row.map(cl => ({ ...cl })));
      const scanned = getRadarCells(r, c);
      let count = 0;
      scanned.forEach(pt => {
        const cell = nextBoard[pt.r][pt.c];
        if (cell.shipId && !cell.isHit) {
          cell.radarEcho = true;
          count++;
        }
      });
      setAiBoard(nextBoard);
      setPlayerDevices(prev => ({ ...prev, radar: prev.radar - 1 }));
      setPlayerStats(prev => ({ ...prev, devicesUsed: prev.devicesUsed + 1 }));
      setActiveDevice(null);
      showToast(count > 0 ? `📡 RADAR: Phát hiện ${count} ô tín hiệu mờ quanh ${COL_LABELS[c]}${ROW_LABELS[r]}!` : `📡 RADAR: Vùng quanh ${COL_LABELS[c]}${ROW_LABELS[r]} hoàn toàn trống!`, count > 0 ? 'warning' : 'info');
      addCombatLog(`Radar quét ${count} tín hiệu quanh ${COL_LABELS[c]}${ROW_LABELS[r]}.`);
      triggerAiTurn(nextBoard, aiShips, playerBoard, playerShips, 900);
    }

    // 2. CROSS SCAN 5-CELLS (on AI board)
    else if (activeDevice === 'cross_scan' && targetBoardType === 'ai') {
      navalAudio.playSonarPing();
      const nextBoard = aiBoard.map(row => row.map(cl => ({ ...cl })));
      const scanned = getCrossScanCells(r, c);
      let count = 0;
      scanned.forEach(pt => {
        const cell = nextBoard[pt.r][pt.c];
        if (cell.shipId && !cell.isHit) {
          cell.radarEcho = true;
          count++;
        }
      });
      setAiBoard(nextBoard);
      setPlayerDevices(prev => ({ ...prev, cross_scan: prev.cross_scan - 1 }));
      setPlayerStats(prev => ({ ...prev, devicesUsed: prev.devicesUsed + 1 }));
      setActiveDevice(null);
      showToast(`➕ RADAR THẬP TỰ: Phát hiện ${count} ô tàu trong hình chữ thập!`, count > 0 ? 'warning' : 'info');
      addCombatLog(`Radar chữ thập phát hiện ${count} tín hiệu.`);
      triggerAiTurn(nextBoard, aiShips, playerBoard, playerShips, 900);
    }

    // 3. SALVO 3 (on AI board)
    else if (activeDevice === 'salvo3' && targetBoardType === 'ai') {
      executeSalvoAttack(getSalvoCells(r, c, deviceOrientation), 'salvo3');
    }

    // 4. CLUSTER 2x2 (on AI board)
    else if (activeDevice === 'cluster2x2' && targetBoardType === 'ai') {
      navalAudio.playClusterSound();
      executeSalvoAttack(getCluster2x2Cells(r, c), 'cluster2x2');
    }

    // 5. DIAGONAL 3 (on AI board)
    else if (activeDevice === 'diagonal3' && targetBoardType === 'ai') {
      navalAudio.playCannonFire();
      executeSalvoAttack(getDiagonal3Cells(r, c, deviceOrientation), 'diagonal3');
    }

    // 6. TORPEDO (on AI board)
    else if (activeDevice === 'torpedo' && targetBoardType === 'ai') {
      navalAudio.playTorpedoSound();
      const { path, impactCell } = getTorpedoRun(aiBoard, r, c, deviceOrientation);
      const cellsToAttack = impactCell ? [impactCell] : [path[Math.floor(path.length / 2)] || { r, c }];
      showToast(impactCell ? `🚀 NGƯ LÔI ĐÂM TRÚNG TÀU tại ${COL_LABELS[impactCell.c]}${ROW_LABELS[impactCell.r]}! 💥` : '🚀 Ngư lôi phóng hết hành trình không chạm tàu địch! 🌊', impactCell ? 'success' : 'info');
      executeSalvoAttack(cellsToAttack, 'torpedo');
    }

    // 7. LINE SONAR (on AI board - reports ship count in row/col)
    else if (activeDevice === 'line_sonar' && targetBoardType === 'ai') {
      navalAudio.playSonarPing();
      const count = countShipsInRowOrCol(aiBoard, deviceOrientation === 'horizontal' ? 'row' : 'col', deviceOrientation === 'horizontal' ? r : c);
      setPlayerDevices(prev => ({ ...prev, line_sonar: prev.line_sonar - 1 }));
      setPlayerStats(prev => ({ ...prev, devicesUsed: prev.devicesUsed + 1 }));
      setActiveDevice(null);
      const axisName = deviceOrientation === 'horizontal' ? `Hàng ${ROW_LABELS[r]}` : `Cột ${COL_LABELS[c]}`;
      showToast(`📶 SONAR BÁO CÁO: Có chính xác ${count} ô tàu đang ẩn náu trên ${axisName}!`, 'warning');
      addCombatLog(`Sonar phát hiện ${count} ô tàu trên ${axisName}.`);
      triggerAiTurn(aiBoard, aiShips, playerBoard, playerShips, 900);
    }

    // 8. DOUBLE FIRE (Select 2 individual cells on AI board)
    else if (activeDevice === 'double_fire' && targetBoardType === 'ai') {
      if (!doubleFireFirstCell) {
        navalAudio.playRotate();
        setDoubleFireFirstCell({ r, c });
        showToast(`Đã chọn ô thứ nhất (${COL_LABELS[c]}${ROW_LABELS[r]}). Nhấp chọn ô thứ hai để KHAI HỎA KÉP!`, 'info');
      } else {
        const cell1 = doubleFireFirstCell;
        const cell2 = { r, c };
        setDoubleFireFirstCell(null);
        navalAudio.playCannonFire();
        executeSalvoAttack([cell1, cell2], 'double_fire');
      }
    }

    // 9. DEEP PROBE (on AI board - Free Turn if Miss)
    else if (activeDevice === 'deep_probe' && targetBoardType === 'ai') {
      const cell = aiBoard[r][c];
      if (cell.isHit || cell.isMiss) return;

      const nextBoard = aiBoard.map(row => row.map(cl => ({ ...cl })));
      const nextShips = aiShips.map(s => ({ ...s, cells: [...s.cells] }));
      let hit = false;
      let sunk: PlacedShip | null = null;

      if (cell.shipId) {
        hit = true;
        nextBoard[r][c].isHit = true;
        nextBoard[r][c].radarEcho = false;
        navalAudio.playExplosionHit();
        const ship = nextShips.find(s => s.id === cell.shipId);
        if (ship && !ship.isSunk) {
          ship.hits += 1;
          if (ship.hits >= ship.size) {
            ship.isSunk = true;
            sunk = ship;
          }
        }
      } else {
        nextBoard[r][c].isMiss = true;
        nextBoard[r][c].radarEcho = false;
        navalAudio.playWaterSplash();
      }

      setAiBoard(nextBoard);
      setAiShips(nextShips);
      setPlayerDevices(prev => ({ ...prev, deep_probe: prev.deep_probe - 1 }));
      setPlayerStats(prev => ({
        ...prev,
        shotsFired: prev.shotsFired + 1,
        hits: prev.hits + (hit ? 1 : 0),
        shipsDestroyed: prev.shipsDestroyed + (sunk ? 1 : 0),
        devicesUsed: prev.devicesUsed + 1,
      }));
      setActiveDevice(null);

      if (sunk) {
        awardDestroyerDevice('player', sunk);
      }

      if (checkGameOver(nextShips)) {
        handlePlayerWon();
        navalAudio.playVictoryHorn();
        confetti({ particleCount: 180, spread: 110, origin: { y: 0.6 } });
        setPhase('game-over');
        return;
      }

      if (hit) {
        showToast('🎯 ĐẦU DÒ TRÚNG ĐÍCH! Đã kích nổ và phá hủy ô tàu địch!', 'success');
        addCombatLog(`Đầu dò trúng đích tại ${COL_LABELS[c]}${ROW_LABELS[r]}.`);
        triggerAiTurn(nextBoard, nextShips, playerBoard, playerShips, 1200);
      } else {
        showToast('🌊 ĐẦU DÒ BIỂN TRỐNG: Xác nhận không có tàu & BẠN ĐƯỢC BẮN TIẾP!', 'success');
        addCombatLog(`Đầu dò trống tại ${COL_LABELS[c]}${ROW_LABELS[r]} (Được bắn tiếp).`);
        // Note: No AI turn triggered! Player keeps turn!
      }
    }

    // 10. SHIELD (on Player Board - Place ironclad shield on ship cell)
    else if (activeDevice === 'shield' && targetBoardType === 'player') {
      const cell = playerBoard[r][c];
      if (!cell.shipId || cell.isHit) {
        showToast('Chỉ có thể đặt khiên lên ô tàu của bạn chưa bị trúng đạn!', 'warning');
        return;
      }
      navalAudio.playShieldSound();
      const nextBoard = playerBoard.map(row => row.map(cl => ({ ...cl })));
      nextBoard[r][c].hasShield = true;
      setPlayerBoard(nextBoard);
      setPlayerDevices(prev => ({ ...prev, shield: prev.shield - 1 }));
      setPlayerStats(prev => ({ ...prev, devicesUsed: prev.devicesUsed + 1 }));
      setActiveDevice(null);
      showToast(`🛡️ Đã đặt Khiên Hộ Mệnh lên ô ${COL_LABELS[c]}${ROW_LABELS[r]}! Miễn nhiễm 1 phát đạn!`, 'success');
      addCombatLog(`Đặt khiên bảo vệ ô ${COL_LABELS[c]}${ROW_LABELS[r]}.`);
      triggerAiTurn(aiBoard, aiShips, nextBoard, playerShips, 900);
    }

    // 11. DECOY (on Player Board - Place decoy on empty water)
    else if (activeDevice === 'decoy' && targetBoardType === 'player') {
      const cell = playerBoard[r][c];
      if (cell.shipId || cell.isHit || cell.isMiss) {
        showToast('Chỉ có thể thả phao mồi nhử trên ô biển trống chưa bị bắn!', 'warning');
        return;
      }
      navalAudio.playSonarPing();
      const nextBoard = playerBoard.map(row => row.map(cl => ({ ...cl })));
      nextBoard[r][c].isDecoy = true;
      nextBoard[r][c].radarEcho = true;
      setPlayerBoard(nextBoard);
      setPlayerDevices(prev => ({ ...prev, decoy: prev.decoy - 1 }));
      setPlayerStats(prev => ({ ...prev, devicesUsed: prev.devicesUsed + 1 }));
      setActiveDevice(null);
      showToast(`🪤 Đã thả Phao Mồi Nhử tại ${COL_LABELS[c]}${ROW_LABELS[r]}! Sóng radar giả đang phát ra!`, 'success');
      addCombatLog(`Thả phao mồi nhử tại ${COL_LABELS[c]}${ROW_LABELS[r]}.`);
      triggerAiTurn(aiBoard, aiShips, nextBoard, playerShips, 900);
    }

    // 12. RELOCATE (on Player Board)
    else if (activeDevice === 'relocate' && targetBoardType === 'player') {
      handleExecuteRelocate(r, c);
    }
  };

  // Helper for multi-cell offensive devices (Salvo3, Cluster2x2, Diagonal3, Torpedo, Double Fire)
  const executeSalvoAttack = (cells: Array<{ r: number; c: number }>, deviceId: DeviceType) => {
    const nextBoard = aiBoard.map(row => row.map(cl => ({ ...cl })));
    const nextShips = aiShips.map(s => ({ ...s, cells: [...s.cells] }));
    let hitsCount = 0;
    const sunkList: PlacedShip[] = [];

    cells.forEach(pt => {
      const cell = nextBoard[pt.r][pt.c];
      if (cell.isHit || cell.isMiss) return;

      if (cell.shipId) {
        if (cell.hasShield) {
          cell.hasShield = false;
        } else {
          cell.isHit = true;
          cell.radarEcho = false;
          hitsCount++;
          const ship = nextShips.find(s => s.id === cell.shipId);
          if (ship && !ship.isSunk) {
            ship.hits += 1;
            if (ship.hits >= ship.size) {
              ship.isSunk = true;
              sunkList.push(ship);
            }
          }
        }
      } else {
        cell.isMiss = true;
        cell.radarEcho = false;
      }
    });

    if (hitsCount > 0) {
      navalAudio.playExplosionHit();
      setHitStreak(prev => prev + hitsCount);
    } else {
      navalAudio.playWaterSplash();
      setHitStreak(0);
    }

    setAiBoard(nextBoard);
    setAiShips(nextShips);
    setPlayerDevices(prev => ({ ...prev, [deviceId]: (prev[deviceId] || 1) - 1 }));
    setPlayerStats(prev => ({
      ...prev,
      shotsFired: prev.shotsFired + cells.length,
      hits: prev.hits + hitsCount,
      shipsDestroyed: prev.shipsDestroyed + sunkList.length,
      devicesUsed: prev.devicesUsed + 1,
    }));
    setActiveDevice(null);

    const devName = ALL_12_DEVICES.find(d => d.id === deviceId)?.name || 'Thiết Bị';
    showToast(`💥 ${devName.toUpperCase()}: Trúng đích ${hitsCount} ô mục tiêu!`, hitsCount > 0 ? 'success' : 'info');
    addCombatLog(`${devName}: Trúng ${hitsCount} ô.`);

    sunkList.forEach(s => {
      awardDestroyerDevice('player', s);
    });

    if (checkGameOver(nextShips)) {
      handlePlayerWon();
      navalAudio.playVictoryHorn();
      confetti({ particleCount: 180, spread: 110, origin: { y: 0.6 } });
      setPhase('game-over');
      return;
    }

    const delay = sunkList.length > 0 ? 2500 : 900;
    triggerAiTurn(nextBoard, nextShips, playerBoard, playerShips, delay);
  };

  // Helper for Relocate Device
  const handleExecuteRelocate = (newR: number, newC: number) => {
    if (isAiThinking || phase !== 'battle') return;
    if ((playerDevices.relocate || 0) <= 0 || !relocateSelectedShipId) return;

    const shipToMove = playerShips.find(s => s.id === relocateSelectedShipId);
    if (!shipToMove || shipToMove.hits > 0) {
      showToast('Chiến hạm này đã bị bắn trúng ít nhất 1 ô, không thể di chuyển!', 'danger');
      return;
    }

    if (!canPlaceShip(playerBoard, newR, newC, shipToMove.size, placementOrientation, shipToMove.id)) {
      showToast('Vị trí di chuyển mới không hợp lệ hoặc bị va chạm tàu khác!', 'warning');
      return;
    }

    navalAudio.playRelocateSound();

    const nextBoard = playerBoard.map(row => row.map(cl => ({ ...cl })));
    shipToMove.cells.forEach(pt => {
      nextBoard[pt.r][pt.c].shipId = null;
      nextBoard[pt.r][pt.c].radarEcho = false;
    });

    const newCoords = getShipCoordinates(newR, newC, shipToMove.size, placementOrientation);
    newCoords.forEach(pt => {
      nextBoard[pt.r][pt.c].shipId = shipToMove.id;
    });

    const nextShips = playerShips.map(s => {
      if (s.id === shipToMove.id) {
        return {
          ...s,
          cells: newCoords,
          orientation: placementOrientation,
        };
      }
      return s;
    });

    setPlayerBoard(nextBoard);
    setPlayerShips(nextShips);
    setPlayerDevices(prev => ({ ...prev, relocate: prev.relocate - 1 }));
    setPlayerStats(prev => ({ ...prev, devicesUsed: prev.devicesUsed + 1 }));
    setActiveDevice(null);
    setRelocateSelectedShipId(null);

    showToast(`🔄 Đã cơ động thành công ${shipToMove.name} sang tọa độ mới!`, 'success');
    addCombatLog(`Bạn đã đổi vị trí ${shipToMove.name} sang vùng an toàn.`);

    triggerAiTurn(aiBoard, aiShips, nextBoard, nextShips, 900);
  };

  // ========================================================
  // AI TURN EXECUTION WITH SMART HANDLING FOR ALL 12 DEVICES
  // ========================================================
  const triggerAiTurn = (
    currentAiBoard: CellState[][],
    currentAiShips: PlacedShip[],
    currentPlayerBoard: CellState[][],
    currentPlayerShips: PlacedShip[],
    initialDelay: number = 700
  ) => {
    setIsAiThinking(true);

    setTimeout(() => {
      const decision = computeAiMove(
        currentAiShips,
        currentAiBoard,
        currentPlayerBoard,
        currentPlayerShips,
        aiDevices,
        aiStats.shotsFired,
        aiDifficulty
      );

      // AI Decision: Relocate
      if (decision.type === 'relocate' && decision.relocateShipId && decision.newR !== undefined && decision.newC !== undefined) {
        const ship = currentAiShips.find(s => s.id === decision.relocateShipId);
        if (ship && canPlaceShip(currentAiBoard, decision.newR, decision.newC, ship.size, decision.newOrientation || 'horizontal', ship.id)) {
          const nextBoard = currentAiBoard.map(r => r.map(c => ({ ...c })));
          ship.cells.forEach(pt => {
            nextBoard[pt.r][pt.c].shipId = null;
            nextBoard[pt.r][pt.c].radarEcho = false;
          });
          const newCoords = getShipCoordinates(decision.newR, decision.newC, ship.size, decision.newOrientation || 'horizontal');
          newCoords.forEach(pt => {
            nextBoard[pt.r][pt.c].shipId = ship.id;
          });
          const nextShips = currentAiShips.map(s => (s.id === ship.id ? { ...s, cells: newCoords, orientation: decision.newOrientation || 'horizontal' } : s));
          setAiBoard(nextBoard);
          setAiShips(nextShips);
          setAiDevices(prev => ({ ...prev, relocate: (prev.relocate || 1) - 1 }));
          navalAudio.playRelocateSound();
          showToast('🤖 AI kích hoạt: Đổi Vị Trí 1 chiến hạm sang vùng an toàn!', 'warning');
          addCombatLog('AI cơ động đổi vị trí một con tàu sang vùng khác!');
        }
      }
      // AI Decision: Shield
      else if (decision.type === 'shield' && decision.targetR !== undefined && decision.targetC !== undefined) {
        navalAudio.playShieldSound();
        const nextBoard = currentAiBoard.map(r => r.map(c => ({ ...c })));
        nextBoard[decision.targetR][decision.targetC].hasShield = true;
        setAiBoard(nextBoard);
        setAiDevices(prev => ({ ...prev, shield: (prev.shield || 1) - 1 }));
        showToast('🤖 AI kích hoạt: Đặt Khiên Năng Lượng bảo vệ 1 ô trên tàu của nó!', 'warning');
        addCombatLog('AI đặt khiên bảo vệ tàu.');
      }
      // AI Decision: Decoy
      else if (decision.type === 'decoy' && decision.targetR !== undefined && decision.targetC !== undefined) {
        navalAudio.playSonarPing();
        const nextBoard = currentAiBoard.map(r => r.map(c => ({ ...c })));
        nextBoard[decision.targetR][decision.targetC].isDecoy = true;
        nextBoard[decision.targetR][decision.targetC].radarEcho = true;
        setAiBoard(nextBoard);
        setAiDevices(prev => ({ ...prev, decoy: (prev.decoy || 1) - 1 }));
        showToast('🤖 AI kích hoạt: Thả Phao Mồi Nhử đánh lừa sóng quét!', 'warning');
        addCombatLog('AI thả phao mồi nhử.');
      }
      // AI Decision: Radar / Cross Scan
      else if ((decision.type === 'radar' || decision.type === 'cross_scan') && decision.targetR !== undefined && decision.targetC !== undefined) {
        navalAudio.playSonarPing();
        const nextBoard = currentPlayerBoard.map(r => r.map(c => ({ ...c })));
        const scannedCells = decision.type === 'radar' ? getRadarCells(decision.targetR, decision.targetC) : getCrossScanCells(decision.targetR, decision.targetC);
        let spotted = 0;
        scannedCells.forEach(pt => {
          if (nextBoard[pt.r][pt.c].shipId && !nextBoard[pt.r][pt.c].isHit) {
            nextBoard[pt.r][pt.c].radarEcho = true;
            spotted++;
          }
        });
        setPlayerBoard(nextBoard);
        setAiDevices(prev => ({ ...prev, [decision.type as DeviceType]: (prev[decision.type as DeviceType] || 1) - 1 }));
        showToast(`🤖 AI quét ${decision.type === 'radar' ? 'Radar 3x3' : 'Radar Dấu +'} (${spotted > 0 ? `Bắt được ${spotted} tín hiệu tàu bạn!` : 'Không thấy tàu'})`, spotted > 0 ? 'danger' : 'info');
        addCombatLog(`AI quét radar (${spotted} tín hiệu).`);
      }
      // AI Decision: Line Sonar
      else if (decision.type === 'line_sonar' && decision.sonarAxis && decision.sonarIndex !== undefined) {
        navalAudio.playSonarPing();
        const axisText = decision.sonarAxis === 'row' ? `Hàng ${ROW_LABELS[decision.sonarIndex]}` : `Cột ${COL_LABELS[decision.sonarIndex]}`;
        setAiDevices(prev => ({ ...prev, line_sonar: (prev.line_sonar || 1) - 1 }));
        showToast(`🤖 AI sử dụng Sonar đo đếm số lượng tàu trên ${axisText}!`, 'warning');
        addCombatLog(`AI dùng Sonar trên ${axisText}.`);
      }
      // AI Decision: Multi-cell attacks (Salvo3, Cluster2x2, Diagonal3, Torpedo, Double Fire)
      else if (['salvo3', 'cluster2x2', 'diagonal3', 'torpedo', 'double_fire'].includes(decision.type) && decision.targetR !== undefined && decision.targetC !== undefined) {
        let cellsToHit: Array<{ r: number; c: number }> = [];
        if (decision.type === 'salvo3') {
          cellsToHit = getSalvoCells(decision.targetR, decision.targetC, decision.salvoOrientation || 'horizontal');
        } else if (decision.type === 'cluster2x2') {
          cellsToHit = getCluster2x2Cells(decision.targetR, decision.targetC);
        } else if (decision.type === 'diagonal3') {
          cellsToHit = getDiagonal3Cells(decision.targetR, decision.targetC, decision.salvoOrientation || 'horizontal');
        } else if (decision.type === 'double_fire') {
          cellsToHit = [
            { r: decision.targetR, c: decision.targetC },
            decision.secondaryTargetR !== undefined && decision.secondaryTargetC !== undefined
              ? { r: decision.secondaryTargetR, c: decision.secondaryTargetC }
              : { r: decision.targetR, c: Math.min(BOARD_SIZE - 1, decision.targetC + 1) },
          ];
        } else if (decision.type === 'torpedo') {
          const { path, impactCell } = getTorpedoRun(currentPlayerBoard, decision.targetR, decision.targetC, decision.salvoOrientation || 'horizontal');
          cellsToHit = impactCell ? [impactCell] : [path[0] || { r: decision.targetR, c: decision.targetC }];
        }

        navalAudio.playCannonFire();
        const nextBoard = currentPlayerBoard.map(r => r.map(c => ({ ...c })));
        const nextShips = currentPlayerShips.map(s => ({ ...s, cells: [...s.cells] }));
        let hits = 0;
        const sunkList: PlacedShip[] = [];

        cellsToHit.forEach(pt => {
          const cell = nextBoard[pt.r][pt.c];
          if (cell.isHit || cell.isMiss) return;
          if (cell.shipId) {
            if (cell.hasShield) {
              cell.hasShield = false;
              navalAudio.playShieldSound();
            } else {
              cell.isHit = true;
              cell.radarEcho = false;
              hits++;
              const ship = nextShips.find(s => s.id === cell.shipId);
              if (ship && !ship.isSunk) {
                ship.hits += 1;
                if (ship.hits >= ship.size) {
                  ship.isSunk = true;
                  sunkList.push(ship);
                }
              }
            }
          } else {
            cell.isMiss = true;
            cell.radarEcho = false;
          }
        });

        if (hits > 0) {
          navalAudio.playExplosionHit();
          triggerScreenShake();
        } else {
          navalAudio.playWaterSplash();
        }

        setPlayerBoard(nextBoard);
        setPlayerShips(nextShips);
        setAiDevices(prev => ({ ...prev, [decision.type as DeviceType]: (prev[decision.type as DeviceType] || 1) - 1 }));
        setAiStats(prev => ({
          ...prev,
          shotsFired: prev.shotsFired + cellsToHit.length,
          hits: prev.hits + hits,
          shipsDestroyed: prev.shipsDestroyed + sunkList.length,
        }));

        const devName = ALL_12_DEVICES.find(d => d.id === decision.type)?.name || 'Vũ khí đặc biệt';
        showToast(`🤖 AI tung ${devName}: Trúng ${hits} phát vào hạm đội bạn!`, hits > 0 ? 'danger' : 'info');
        addCombatLog(`AI dùng ${devName}, trúng ${hits} phát.`);

        sunkList.forEach(s => {
          awardDestroyerDevice('ai', s);
        });

        if (checkGameOver(nextShips)) {
          setPhase('game-over');
          setIsAiThinking(false);
          return;
        }
      }
      // AI Standard Attack
      else {
        const targetR = decision.targetR ?? 0;
        const targetC = decision.targetC ?? 0;
        navalAudio.playCannonFire();

        const nextBoard = currentPlayerBoard.map(r => r.map(c => ({ ...c })));
        const nextShips = currentPlayerShips.map(s => ({ ...s, cells: [...s.cells] }));
        const cell = nextBoard[targetR][targetC];

        let isHit = false;
        let newlySunkShip: PlacedShip | null = null;

        if (cell.shipId) {
          if (cell.hasShield) {
            cell.hasShield = false;
            navalAudio.playShieldSound();
            showToast(`🛡️ KHIÊN ĐÃ BẢO VỆ! Khiên chặn đứng phát pháo của AI tại ${COL_LABELS[targetC]}${ROW_LABELS[targetR]}!`, 'success');
            addCombatLog(`Khiên bảo vệ ô ${COL_LABELS[targetC]}${ROW_LABELS[targetR]} khỏi pháo AI!`);
          } else {
            isHit = true;
            cell.isHit = true;
            cell.radarEcho = false;
            navalAudio.playExplosionHit();
            triggerScreenShake();

            const ship = nextShips.find(s => s.id === cell.shipId);
            if (ship && !ship.isSunk) {
              ship.hits += 1;
              if (ship.hits >= ship.size) {
                ship.isSunk = true;
                newlySunkShip = ship;
              }
            }
            showToast(`🤖 AI bắn trúng ${COL_LABELS[targetC]}${ROW_LABELS[targetR]} trên tàu bạn! 💥`, 'danger');
            addCombatLog(`AI bắn trúng ${COL_LABELS[targetC]}${ROW_LABELS[targetR]}!`);
          }
        } else {
          cell.isMiss = true;
          cell.radarEcho = false;
          cell.isDecoy = false;
          navalAudio.playWaterSplash();
          showToast(`🤖 AI nã pháo vào ${COL_LABELS[targetC]}${ROW_LABELS[targetR]}: Bắn trượt vào biển! 🌊`, 'info');
          addCombatLog(`AI bắn trượt tại ${COL_LABELS[targetC]}${ROW_LABELS[targetR]}.`);
        }

        setPlayerBoard(nextBoard);
        setPlayerShips(nextShips);
        setAiStats(prev => ({
          ...prev,
          shotsFired: prev.shotsFired + 1,
          hits: prev.hits + (isHit ? 1 : 0),
          shipsDestroyed: prev.shipsDestroyed + (newlySunkShip ? 1 : 0),
        }));

        if (newlySunkShip) {
          awardDestroyerDevice('ai', newlySunkShip);
        }

        if (checkGameOver(nextShips)) {
          setPhase('game-over');
          setIsAiThinking(false);
          return;
        }
      }

      setIsAiThinking(false);
    }, initialDelay + Math.random() * 250);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    navalAudio.setEnabled(next);
  };

  const getDifficultyLabel = (diff: AiDifficulty) => {
    switch (diff) {
      case 'easy':
        return 'Tân Binh (Dễ)';
      case 'medium':
        return 'Thuyền Trưởng (Vừa)';
      case 'hard':
        return 'Đô Đốc Pro (Khó)';
    }
  };

  // Compute cell hover highlight for the active device
  const isCellInActiveDeviceHover = (r: number, c: number, boardType: 'ai' | 'player'): boolean => {
    if (!hoverPlacementCell || !activeDevice) return false;

    // Defense devices operate on player board
    if (['shield', 'decoy', 'relocate'].includes(activeDevice) && boardType !== 'player') return false;
    // Attack and recon devices operate on AI board
    if (!['shield', 'decoy', 'relocate'].includes(activeDevice) && boardType !== 'ai') return false;

    if (activeDevice === 'radar') {
      return getRadarCells(hoverPlacementCell.r, hoverPlacementCell.c).some(pt => pt.r === r && pt.c === c);
    }
    if (activeDevice === 'cross_scan') {
      return getCrossScanCells(hoverPlacementCell.r, hoverPlacementCell.c).some(pt => pt.r === r && pt.c === c);
    }
    if (activeDevice === 'salvo3') {
      return getSalvoCells(hoverPlacementCell.r, hoverPlacementCell.c, deviceOrientation).some(pt => pt.r === r && pt.c === c);
    }
    if (activeDevice === 'cluster2x2') {
      return getCluster2x2Cells(hoverPlacementCell.r, hoverPlacementCell.c).some(pt => pt.r === r && pt.c === c);
    }
    if (activeDevice === 'diagonal3') {
      return getDiagonal3Cells(hoverPlacementCell.r, hoverPlacementCell.c, deviceOrientation).some(pt => pt.r === r && pt.c === c);
    }
    if (activeDevice === 'torpedo') {
      return deviceOrientation === 'horizontal' ? r === hoverPlacementCell.r : c === hoverPlacementCell.c;
    }
    if (activeDevice === 'line_sonar') {
      return deviceOrientation === 'horizontal' ? r === hoverPlacementCell.r : c === hoverPlacementCell.c;
    }
    return hoverPlacementCell.r === r && hoverPlacementCell.c === c;
  };

  // ========================================================
  // RENDER OPPONENT CELL (AI BOARD - LEFT SIDE)
  // Strictly hidden under Fog of War. Only hits, misses, radar echoes, and sunk ships are shown.
  // ========================================================
  const renderAiCell = (cell: CellState) => {
    const isDeviceTarget = isCellInActiveDeviceHover(cell.r, cell.c, 'ai');
    const isDoubleFireSelected = doubleFireFirstCell?.r === cell.r && doubleFireFirstCell?.c === cell.c;
    const isHovered = hoverPlacementCell?.r === cell.r && hoverPlacementCell?.c === cell.c;

    const sunkShip = cell.shipId ? aiShips.find(s => s.id === cell.shipId && s.isSunk) : null;
    const isRevealedPostGame = revealAiBoardOnGameOver && cell.shipId && !sunkShip && !cell.isHit;

    let cellContent = null;
    let cellBg = 'bg-[#061426]/90 hover:bg-[#0b2545] border-sky-950/80';

    if (sunkShip) {
      cellBg = 'bg-rose-950 border-rose-500 shadow-[inset_0_0_12px_rgba(244,63,94,0.9)]';
      cellContent = (
        <div className="flex flex-col items-center justify-center animate-pulse">
          <Skull className="w-3.5 h-3.5 text-rose-300" />
          <span className="text-[7px] font-mono font-black text-rose-200 uppercase leading-none">Chìm</span>
        </div>
      );
    } else if (isRevealedPostGame) {
      cellBg = 'bg-amber-950/70 border-amber-500/80';
      cellContent = <span className="text-xs">🚢</span>;
    } else if (cell.isHit) {
      cellBg = 'bg-gradient-to-t from-orange-950 via-rose-950 to-red-900 border-orange-500 shadow-[inset_0_0_12px_rgba(249,115,22,0.8)]';
      cellContent = (
        <div className="relative flex items-center justify-center">
          <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
        </div>
      );
    } else if (cell.isMiss) {
      cellBg = 'bg-sky-950/40 border-sky-900/40';
      cellContent = (
        <div className="relative flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
          <span className="absolute w-4 h-4 rounded-full border border-sky-400/30 animate-ping" />
        </div>
      );
    } else if (cell.radarEcho) {
      cellBg = 'bg-emerald-950/80 border-emerald-400 ring-1 ring-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.5)]';
      cellContent = (
        <div className="flex flex-col items-center justify-center">
          <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
          <span className="text-[7px] font-mono font-bold text-emerald-300 uppercase">Tàu Mờ</span>
        </div>
      );
    } else if (showProbabilityHeatmap && liveProbMap && !cell.isHit && !cell.isMiss) {
      const weight = liveProbMap[cell.r][cell.c];
      const intensity = Math.min(1, weight / (maxProbWeight || 1));
      if (intensity > 0.6) {
        cellBg = 'bg-rose-950/50 border-rose-500/70 text-rose-300';
      } else if (intensity > 0.25) {
        cellBg = 'bg-amber-950/40 border-amber-500/60 text-amber-300';
      } else {
        cellBg = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300';
      }
      cellContent = (
        <span className="text-[9px] font-mono font-black opacity-80">
          {Math.round(weight)}
        </span>
      );
    } else if (isDoubleFireSelected) {
      cellBg = 'bg-red-500/50 border-red-400 ring-2 ring-red-400';
      cellContent = <Crosshair className="w-4 h-4 text-red-300 animate-spin" />;
    } else if (isHovered && !activeDevice) {
      cellBg = 'bg-cyan-900/40 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
      cellContent = <Crosshair className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />;
    }

    if (isDeviceTarget && !cell.isHit && !cell.isMiss) {
      cellBg = 'bg-orange-600/50 border-orange-400 ring-2 ring-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.6)]';
      cellContent = <Sparkles className="w-3.5 h-3.5 text-orange-200" />;
    }

    const canInteract = !isAiThinking && phase === 'battle';
    const isAlreadyShot = cell.isHit || cell.isMiss;
    const isAoEDevice = activeDevice !== null && ['salvo3', 'cluster2x2', 'diagonal3', 'torpedo', 'radar', 'cross_scan', 'line_sonar'].includes(activeDevice);
    const isTargetable = canInteract && (!isAlreadyShot || isAoEDevice);

    return (
      <button
        key={`ai-${cell.r}-${cell.c}`}
        disabled={!canInteract}
        onClick={() => {
          if (!canInteract) return;
          if (activeDevice) {
            handleUseDeviceAction(cell.r, cell.c, 'ai');
          } else if (!isAlreadyShot) {
            handlePlayerAttack(cell.r, cell.c);
          }
        }}
        onMouseEnter={() => setHoverPlacementCell({ r: cell.r, c: cell.c })}
        onMouseLeave={() => setHoverPlacementCell(null)}
        className={`relative aspect-square rounded-md border flex items-center justify-center transition-all ${
          isTargetable ? 'cursor-crosshair hover:scale-[1.04]' : 'cursor-default'
        } ${cellBg}`}
      >
        {cellContent}
      </button>
    );
  };

  // ========================================================
  // RENDER FRIENDLY CELL (PLAYER BOARD - RIGHT SIDE)
  // Shows player's fleet clearly, shows AI attacks landing here
  // ========================================================
  const renderPlayerCell = (cell: CellState) => {
    const hasShip = cell.shipId !== null;
    const ship = playerShips.find(s => s.id === cell.shipId);
    let cellBg = 'bg-[#08131e]/90 border-slate-800/80';
    let content = null;

    if (hasShip) {
      if (ship?.isSunk) {
        cellBg = 'bg-rose-950/90 border-rose-500 shadow-[inset_0_0_10px_rgba(244,63,94,0.8)]';
        content = <Skull className="w-3.5 h-3.5 text-rose-300" />;
      } else {
        cellBg = 'bg-cyan-950/80 border-cyan-500/80 shadow-[inset_0_0_8px_rgba(6,182,212,0.3)]';
        content = <span className="text-[11px] sm:text-xs">{ship?.iconEmoji || '🚢'}</span>;
      }
    }

    if (cell.hasShield) {
      cellBg += ' ring-2 ring-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]';
    }

    if (cell.isDecoy) {
      cellBg = 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400 animate-pulse';
      content = <span className="text-xs">🪤</span>;
    }

    if (cell.isHit) {
      cellBg = 'bg-gradient-to-t from-red-950 via-rose-950 to-orange-900 border-red-500 shadow-[inset_0_0_12px_rgba(239,68,68,0.8)]';
      content = <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />;
    } else if (cell.isMiss) {
      cellBg = 'bg-sky-950/40 border-sky-800/40';
      content = <span className="w-1.5 h-1.5 rounded-full bg-sky-400/60" />;
    } else if (cell.radarEcho) {
      cellBg += ' ring-2 ring-amber-400/80';
    }

    const isRelocatingThis = relocateSelectedShipId && ship?.id === relocateSelectedShipId;
    if (isRelocatingThis) {
      cellBg = 'bg-emerald-500/50 border-emerald-300 ring-2 ring-emerald-300 animate-pulse';
    }

    const isDeviceTarget = isCellInActiveDeviceHover(cell.r, cell.c, 'player');
    if (isDeviceTarget) {
      cellBg = 'bg-indigo-500/40 border-indigo-300 ring-2 ring-indigo-300';
    }

    const isInteractive = activeDevice && ['shield', 'decoy', 'relocate'].includes(activeDevice) && !isAiThinking && phase === 'battle';

    return (
      <div
        key={`player-${cell.r}-${cell.c}`}
        onClick={() => {
          if (activeDevice === 'relocate') {
            if (!relocateSelectedShipId && ship) {
              if (ship.hits > 0) {
                showToast('Chiến hạm này đã bị trúng đạn, không thể di chuyển!', 'danger');
                return;
              }
              navalAudio.playRotate();
              setRelocateSelectedShipId(ship.id);
              showToast(`Đã chọn ${ship.name}. Hãy nhấp chọn vị trí trống mới trên bàn cờ này (Bấm R để xoay)!`, 'info');
            } else if (relocateSelectedShipId) {
              handleExecuteRelocate(cell.r, cell.c);
            }
          } else if (activeDevice) {
            handleUseDeviceAction(cell.r, cell.c, 'player');
          }
        }}
        onMouseEnter={() => setHoverPlacementCell({ r: cell.r, c: cell.c })}
        onMouseLeave={() => setHoverPlacementCell(null)}
        className={`aspect-square rounded-md border flex items-center justify-center font-mono text-xs transition-all ${
          isInteractive ? 'cursor-pointer hover:border-emerald-400 hover:scale-[1.04]' : ''
        } ${cellBg}`}
      >
        {content}
      </div>
    );
  };

  return (
    <div
      className={`relative w-full text-white font-sans selection:bg-cyan-500 selection:text-neutral-950 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 overflow-y-auto bg-neutral-950 p-4 sm:p-6'
          : 'min-h-[640px] bg-[#02070e] p-3 sm:p-5 rounded-2xl border border-cyan-900/40 shadow-2xl'
      } ${screenShaking ? 'animate-naval-shake' : ''}`}
    >
      {/* Background Naval Radar Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#082038_0%,#031020_50%,#01050a_100%)] pointer-events-none -z-10" />

      {/* Floating Notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none max-w-md w-full px-4">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-bold shadow-xl backdrop-blur-md animate-fadeIn flex items-center gap-2.5 ${
              t.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200 shadow-emerald-500/20'
                : t.type === 'danger'
                ? 'bg-rose-950/95 border-rose-500 text-rose-200 shadow-rose-500/20 animate-bounce'
                : t.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500 text-amber-200 shadow-amber-500/20'
                : 'bg-cyan-950/95 border-cyan-500 text-cyan-200 shadow-cyan-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="flex-1 leading-snug">{t.message}</span>
          </div>
        ))}
      </div>

      {/* SUNK SHIP DRAMATIC BANNER OVERLAY - 100% EXPLICIT AND UNMISTAKABLE */}
      {sunkBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn pointer-events-none">
          <div
            className={`max-w-lg w-full rounded-3xl p-6 sm:p-7 text-center animate-explosion-burst border-2 ${
              sunkBanner.whoDestroyed === 'player'
                ? 'bg-gradient-to-b from-neutral-900 via-emerald-950/90 to-black border-emerald-400 shadow-[0_0_90px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-b from-neutral-900 via-rose-950/90 to-black border-rose-500 shadow-[0_0_90px_rgba(244,63,94,0.5)]'
            }`}
          >
            <div className="text-5xl sm:text-6xl mb-3 animate-bounce">
              {sunkBanner.whoDestroyed === 'player' ? '🎖️' : '⚠️'}
            </div>

            {/* Header Title */}
            <h3
              className={`text-xl sm:text-2xl font-black font-mono uppercase tracking-wider mb-2 ${
                sunkBanner.whoDestroyed === 'player'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-300 to-orange-400'
              }`}
            >
              {sunkBanner.whoDestroyed === 'player'
                ? 'CHIẾN CÔNG VANG DỘI! BẮN CHÌM TÀU ĐỊCH!'
                : 'BÁO ĐỘNG ĐỎ! CHIẾN HẠM CỦA BẠN ĐÃ CHÌM!'}
            </h3>

            {/* Ship Details */}
            <p className="text-sm sm:text-base font-bold text-white font-mono mb-4 leading-relaxed">
              {sunkBanner.whoDestroyed === 'player' ? (
                <>
                  🎯 Bạn đã bắn chìm hoàn toàn chiến hạm địch:{' '}
                  <span className="text-amber-400 font-black block text-lg sm:text-xl mt-1">
                    {sunkBanner.shipIcon} {sunkBanner.shipName} ({sunkBanner.shipSize} ô)
                  </span>
                </>
              ) : (
                <>
                  💥 AI đã đánh chìm chiến hạm của bạn:{' '}
                  <span className="text-rose-400 font-black block text-lg sm:text-xl mt-1">
                    {sunkBanner.shipIcon} {sunkBanner.shipName} ({sunkBanner.shipSize} ô)
                  </span>
                </>
              )}
            </p>

            {/* Reward or Warning Badge */}
            <div
              className={`inline-block px-4 py-2 rounded-xl text-xs font-mono font-bold border ${
                sunkBanner.whoDestroyed === 'player'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {sunkBanner.whoDestroyed === 'player'
                ? `🎉 THƯỞNG CHIẾN TÍCH: +1 ${sunkBanner.rewardDeviceName} đã nạp vào kho!`
                : '⚠️ Hạm đội tổn thất! Hãy đổi vị trí các chiến hạm còn lại để bảo toàn hỏa lực!'}
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-cyan-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center text-xl">
            ⚓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 uppercase">
                HẢI CHIẾN BẮN TÀU
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                12 THIẾT BỊ HẢI QUÂN
              </span>
              {hitStreak >= 2 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
                  🔥 COMBO x{hitStreak}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-cyan-400/80">
              4 TÀU ĐỐI XỨNG {totalShipCells} Ô • 3/12 THIẾT BỊ NGẪU NHIÊN ĐỒNG ĐỀU (x2 LƯỢT) • ĐỘ KHÓ: {getDifficultyLabel(aiDifficulty)}
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* Encyclopedia of 12 Devices Button */}
          <button
            onClick={() => setShowDeviceEncyclopedia(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 border border-neutral-800 text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Xem bách khoa 12 thiết bị hải chiến"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">12 Thiết Bị</span>
          </button>

          {/* Difficulty Dropdown / Selector */}
          <div className="flex items-center rounded-xl bg-neutral-900/90 border border-neutral-800 p-1 text-xs font-mono">
            <button
              onClick={() => {
                setAiDifficulty('easy');
                if (phase === 'battle') {
                  showToast('Đã đổi độ khó AI sang: Tân Binh (Dễ)', 'info');
                }
              }}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                aiDifficulty === 'easy'
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Dễ
            </button>
            <button
              onClick={() => {
                setAiDifficulty('medium');
                if (phase === 'battle') {
                  showToast('Đã đổi độ khó AI sang: Thuyền Trưởng (Vừa)', 'info');
                }
              }}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                aiDifficulty === 'medium'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vừa
            </button>
            <button
              onClick={() => {
                setAiDifficulty('hard');
                if (phase === 'battle') {
                  showToast('Đã đổi độ khó AI sang: Đô Đốc Pro (Mật Độ Xác Suất)', 'warning');
                }
              }}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                aiDifficulty === 'hard'
                  ? 'bg-rose-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Khó (Pro)
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* New Match Button */}
          <button
            onClick={() => setPhase('difficulty-select')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trận Mới</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. DIFFICULTY SELECTION SCREEN */}
      {/* ======================================================== */}
      {phase === 'difficulty-select' && (
        <div className="max-w-3xl mx-auto py-8 text-center animate-fadeIn">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            🤖
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wide uppercase mb-2">
            CHỌN ĐỘ KHÓ AI HUẤN LUYỆN
          </h2>
          <p className="text-sm text-neutral-400 font-mono max-w-lg mx-auto mb-8 leading-relaxed">
            Hải chiến thuần túy Người Đấu Với Máy AI. Cả bạn và AI đều nhận 4 tàu ngẫu nhiên cùng kích thước và <strong>3 trong số 12 loại thiết bị ngẫu nhiên y hệt nhau</strong> (mỗi loại 2 lượt dùng).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Easy */}
            <div
              onClick={() => startNewMatch('easy')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group hover:scale-[1.03] ${
                aiDifficulty === 'easy'
                  ? 'bg-emerald-950/50 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-emerald-500/60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl mb-3">
                ⚓
              </div>
              <h3 className="font-mono font-black text-base text-emerald-400 uppercase mb-1">
                Tân Binh (Dễ)
              </h3>
              <p className="text-xs text-neutral-400 font-mono leading-relaxed mb-4">
                AI bắn thăm dò ngẫu nhiên rải rác, không dùng thế cờ caro. 50% cơ hội bắn theo vết trúng. Thích hợp cho người mới!
              </p>
              <button className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer mt-auto">
                Chọn Cấp Dễ
              </button>
            </div>

            {/* Medium */}
            <div
              onClick={() => startNewMatch('medium')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group hover:scale-[1.03] ${
                aiDifficulty === 'medium'
                  ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-amber-500/60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl mb-3">
                🧭
              </div>
              <h3 className="font-mono font-black text-base text-amber-400 uppercase mb-1">
                Thuyền Trưởng (Vừa)
              </h3>
              <p className="text-xs text-neutral-400 font-mono leading-relaxed mb-4">
                Chiến thuật caro so le (Parity). Khi bắn trúng sẽ dò hướng đường thẳng (ngang/dọc), biết dùng thiết bị tấn công & do thám!
              </p>
              <button className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer mt-auto">
                Chọn Cấp Vừa
              </button>
            </div>

            {/* Hard Pro */}
            <div
              onClick={() => startNewMatch('hard')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group hover:scale-[1.03] ${
                aiDifficulty === 'hard'
                  ? 'bg-rose-950/50 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-rose-500/60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl mb-3">
                🏆
              </div>
              <h3 className="font-mono font-black text-base text-rose-400 uppercase mb-1">
                Đô Đốc Pro (Khó)
              </h3>
              <p className="text-xs text-neutral-400 font-mono leading-relaxed mb-4">
                Thuật toán <strong>Bản đồ Mật độ Xác suất (Probability Density Map)</strong> chuẩn cao thủ Battleship thế giới. Không nhìn trộm bài, thăm dò toán học siêu chuẩn!
              </p>
              <button className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer mt-auto">
                Chiến Đấu Pro
              </button>
            </div>
          </div>

          {/* 12 Devices Callout Bar */}
          <div className="mt-8 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">⚡</span>
              <div>
                <h4 className="text-xs font-mono font-bold text-amber-300 uppercase">
                  HỆ THỐNG 12 THIẾT BỊ CHIẾN THUẬT HẢI QUÂN
                </h4>
                <p className="text-[11px] font-mono text-neutral-400">
                  Mỗi trận đấu rút ngẫu nhiên 3 loại, cả bạn và AI nhận chung 3 loại này (mỗi loại x2 lượt dùng).
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeviceEncyclopedia(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 hover:border-cyan-500/50 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              📚 Xem Danh Mục 12 Thiết Bị
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FLEET PLACEMENT PHASE (SETTING UP YOUR 4 SHIPS) */}
      {/* ======================================================== */}
      {phase === 'placement' && (
        <div className="max-w-5xl mx-auto py-2 animate-fadeIn">
          {/* Instructions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/80 border border-cyan-900/60 rounded-2xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs font-bold text-cyan-300 uppercase">
                BƯỚC 1: BỐ TRÍ HẠM ĐỘI (4 CHIẾN HẠM • TỔNG {totalShipCells} Ô)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navalAudio.playRotate();
                  setPlacementOrientation(prev => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
                title="Hoặc bấm phím R trên bàn phím"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Hướng: {placementOrientation === 'horizontal' ? 'Ngang ➔' : 'Dọc ⬇'} (Bấm R)</span>
              </button>

              <button
                onClick={handleAutoDeployCurrent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Xếp Tự Động</span>
              </button>

              <button
                onClick={handleResetPlacement}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Xóa Hết
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Docking Bay: List of 4 ships to place */}
            <div className="lg:col-span-4 bg-neutral-900/70 border border-cyan-900/60 rounded-2xl p-4">
              <h3 className="text-xs font-mono font-bold uppercase text-cyan-300 mb-3 flex items-center justify-between">
                <span>Danh Sách 4 Chiến Hạm</span>
                <span className="text-[10px] text-neutral-400">Tổng: {totalShipCells} ô</span>
              </h3>

              <div className="space-y-2.5">
                {matchShipTemplates.map((t, idx) => {
                  const isPlaced = playerShips.some(s => s.id === t.id);
                  const isCurrent = idx === selectedTemplateIndex;

                  return (
                    <div
                      key={t.id}
                      onClick={() => !isPlaced && setSelectedTemplateIndex(idx)}
                      className={`p-3 rounded-xl border transition-all ${
                        isPlaced
                          ? 'bg-neutral-950/60 border-neutral-800 opacity-60'
                          : isCurrent
                          ? 'bg-cyan-950/70 border-cyan-400 shadow-md ring-1 ring-cyan-400/40 cursor-pointer'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-cyan-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{t.iconEmoji}</span>
                          <span className="font-mono text-xs font-bold text-white">{t.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {t.size} ô
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: t.size }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            className={`h-2.5 flex-1 rounded-sm ${
                              isPlaced
                                ? 'bg-emerald-500/40'
                                : isCurrent
                                ? 'bg-cyan-400 shadow-sm'
                                : 'bg-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ready to fight CTA Button */}
              {playerShips.length === matchShipTemplates.length ? (
                <button
                  onClick={handleConfirmPlacement}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black font-mono text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 animate-bounce"
                >
                  <Swords className="w-4 h-4" />
                  <span>XÁC NHẬN HẠM ĐỘI • XUẤT TRẬN!</span>
                </button>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 text-[11px] font-mono text-neutral-400 text-center">
                  Nhấp vào bàn cờ bên phải để đặt tàu ({playerShips.length}/4 tàu đã đặt)
                </div>
              )}

              {/* 3 Shared Tactical Devices for this Match */}
              <div className="mt-4 pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>3 THIẾT BỊ TRẬN NÀY (x2 LƯỢT)</span>
                  </span>
                  <button
                    onClick={() => setShowDeviceEncyclopedia(true)}
                    className="text-[9px] font-mono text-cyan-400 hover:underline cursor-pointer"
                  >
                    Xem 12 loại
                  </button>
                </div>
                <div className="space-y-1.5">
                  {matchDevices.map(devId => {
                    const dev = ALL_12_DEVICES.find(d => d.id === devId);
                    if (!dev) return null;
                    return (
                      <div
                        key={dev.id}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{dev.icon}</span>
                          <span className="text-[11px] font-mono font-bold text-white truncate">{dev.name}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                          x2 Lượt
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] font-mono text-neutral-500 mt-2 text-center">
                  Cả bạn và AI đều nhận chung 3 thiết bị trên!
                </p>
              </div>
            </div>

            {/* Placement 10x10 Grid (Bàn cờ của bạn) */}
            <div className="lg:col-span-8 bg-neutral-950 border border-cyan-900/60 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
                <span className="font-mono text-xs font-bold text-cyan-300 uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>BÀN CỜ HẠM ĐỘI CỦA BẠN (10x10)</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Phím R để xoay • Đã đặt {playerShips.length}/4
                </span>
              </div>

              <div className="w-full max-w-[420px] mx-auto">
                <div className="grid grid-cols-10 gap-1 mb-1 pl-6">
                  {COL_LABELS.map(col => (
                    <div key={col} className="text-center font-mono text-[10px] font-bold text-cyan-400">
                      {col}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  {ROW_LABELS.map((rowLabel, r) => (
                    <div key={rowLabel} className="flex items-center gap-1">
                      <div className="w-5 text-right font-mono text-[10px] font-bold text-cyan-400 shrink-0">
                        {rowLabel}
                      </div>
                      <div className="grid grid-cols-10 gap-1 flex-1">
                        {Array.from({ length: BOARD_SIZE }).map((_, c) => {
                          const cell = playerBoard[r][c];
                          const hasShip = cell.shipId !== null;
                          const currentTemplate = selectedTemplateIndex < matchShipTemplates.length ? matchShipTemplates[selectedTemplateIndex] : null;

                          let isPreviewCell = false;
                          let isPreviewValid = false;

                          if (hoverPlacementCell && currentTemplate) {
                            const coords = getShipCoordinates(hoverPlacementCell.r, hoverPlacementCell.c, currentTemplate.size, placementOrientation);
                            isPreviewCell = coords.some(pt => pt.r === r && pt.c === c);
                            isPreviewValid = canPlaceShip(playerBoard, hoverPlacementCell.r, hoverPlacementCell.c, currentTemplate.size, placementOrientation);
                          }

                          let bgClass = 'bg-slate-900/60 hover:bg-cyan-950/40 border-slate-800/80';
                          if (hasShip) {
                            bgClass = 'bg-cyan-950 border-cyan-500 shadow-[inset_0_0_8px_rgba(6,182,212,0.4)]';
                          }
                          if (isPreviewCell) {
                            bgClass = isPreviewValid
                              ? 'bg-emerald-500/40 border-emerald-400 ring-2 ring-emerald-400'
                              : 'bg-rose-500/40 border-rose-400 ring-2 ring-rose-400';
                          }

                          return (
                            <button
                              key={`place-${r}-${c}`}
                              onClick={() => handlePlaceShipClick(r, c)}
                              onMouseEnter={() => setHoverPlacementCell({ r, c })}
                              onMouseLeave={() => setHoverPlacementCell(null)}
                              className={`aspect-square rounded-md border flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                            >
                              {hasShip && <span className="text-[10px] sm:text-xs">🚢</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MAIN BATTLE ARENA (COMBAT PHASE) */}
      {/* LEFT: AI BOARD (Target Zone) | RIGHT: PLAYER BOARD (Own Base) */}
      {/* ======================================================== */}
      {phase === 'battle' && (
        <div className="max-w-6xl mx-auto py-1 animate-fadeIn">
          {/* Turn Banner & Current Player Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/80 border border-cyan-900/60 rounded-2xl px-4 py-2.5 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  isAiThinking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span className="font-mono text-xs font-black uppercase text-white">
                {isAiThinking
                  ? '🤖 AI ĐANG PHÂN TÍCH MẬT ĐỘ XÁC SUẤT & NGẮM BẮN...'
                  : '🎯 LƯỢT CỦA BẠN: HÃY CHỌN Ô BÊN TRÁI ĐỂ KHAI HỎA!'}
              </span>
            </div>

            {/* Live Fleet Health Status */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">Tàu của bạn:</span>
                <span className="font-bold text-white">
                  {playerShips.filter(s => !s.isSunk).length}/{playerShips.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-400 font-bold">Tàu AI:</span>
                <span className="font-bold text-white">
                  {aiShips.filter(s => !s.isSunk).length}/{aiShips.length}
                </span>
              </div>
            </div>
          </div>

          {/* 3 TACTICAL DEVICES (RANDOMLY SELECTED FROM 12) TOOLBAR */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3 mb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>3 THIẾT BỊ CHIẾN THUẬT CỦA TRẬN ĐẤU (RÚT TỪ 12 LOẠI • KHỞI ĐẦU x2 LƯỢT)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                🎯 Bắn chìm 1 tàu địch = +1 Thiết Bị ngẫu nhiên!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {matchDevices.map(devId => {
                const dev = ALL_12_DEVICES.find(d => d.id === devId);
                if (!dev) return null;

                const count = playerDevices[devId] || 0;
                const isSelected = activeDevice === devId;
                const canUse = count > 0 && !isAiThinking;

                const requiresRotation = ['salvo3', 'diagonal3', 'torpedo', 'line_sonar'].includes(devId);

                return (
                  <div
                    key={dev.id}
                    role="button"
                    tabIndex={canUse ? 0 : -1}
                    onClick={() => {
                      if (!canUse) return;
                      navalAudio.playRotate();
                      setActiveDevice(prev => (prev === dev.id ? null : dev.id));
                      setRelocateSelectedShipId(null);
                      setDoubleFireFirstCell(null);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all select-none ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 shadow-lg cursor-pointer'
                        : canUse
                        ? 'bg-neutral-900/90 border-neutral-700 hover:border-amber-500/60 text-white cursor-pointer'
                        : 'bg-neutral-950 border-neutral-900 text-neutral-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{dev.icon}</span>
                      <div className="text-left truncate">
                        <p className="text-xs font-mono font-bold truncate">{dev.name}</p>
                        <p className="text-[9px] text-neutral-400 truncate">{dev.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && requiresRotation && (
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            navalAudio.playRotate();
                            setDeviceOrientation(prev => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
                          }}
                          className="px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[9px] cursor-pointer shadow-sm transition-colors"
                          title="Hoặc bấm phím R trên bàn phím để xoay hướng"
                        >
                          {deviceOrientation === 'horizontal' ? 'Ngang ➔' : 'Dọc ⬇'}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                        x{count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Shared Arsenal Monitor */}
            <div className="mt-2.5 pt-2.5 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Bot className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold text-neutral-300">KHO VŨ KHÍ CỦA AI:</span>
                <span className="text-neutral-500 hidden sm:inline">(AI nhận chung 3 loại như bạn • Khởi đầu x2 mỗi loại)</span>
              </div>
              <div className="flex items-center gap-2">
                {matchDevices.map(devId => {
                  const dev = ALL_12_DEVICES.find(d => d.id === devId);
                  if (!dev) return null;
                  const aiCount = aiDevices[devId] || 0;
                  return (
                    <span
                      key={`ai-arsenal-${devId}`}
                      className={`px-2 py-0.5 rounded-md border flex items-center gap-1 font-bold ${
                        aiCount > 0
                          ? 'bg-rose-950/40 border-rose-900/60 text-rose-300'
                          : 'bg-neutral-900/40 border-neutral-800 text-neutral-600 line-through'
                      }`}
                      title={`${dev.name} của AI: còn ${aiCount} lượt`}
                    >
                      <span>{dev.icon}</span>
                      <span>{dev.shortName}: x{aiCount}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Active Device Instructions Bar */}
            {activeDevice && (
              <div className="mt-2.5 p-2 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-300">
                  {activeDevice === 'radar' && '📡 Nhấp 1 ô trên BÀN ĐỐI PHƯƠNG (Trái) để quét vùng 3x3!'}
                  {activeDevice === 'cross_scan' && '➕ Nhấp 1 ô trên BÀN ĐỐI PHƯƠNG (Trái) để quét hình chữ thập 5 ô!'}
                  {activeDevice === 'salvo3' && `💥 Nhấp ô mục tiêu trên BÀN ĐỐI PHƯƠNG (Trái) để bắn dàn 3 ô (${deviceOrientation === 'horizontal' ? 'Ngang ➔' : 'Dọc ⬇'}, bấm R để xoay)!`}
                  {activeDevice === 'cluster2x2' && '💣 Nhấp vào ô góc trên-trái trên BÀN ĐỐI PHƯƠNG (Trái) để nổ chùm 4 ô (2x2)!'}
                  {activeDevice === 'diagonal3' && `📐 Nhấp ô tâm trên BÀN ĐỐI PHƯƠNG (Trái) để bắn 3 ô chéo (${deviceOrientation === 'horizontal' ? 'Chéo Xuống ↘' : 'Chéo Lên ↗'}, bấm R xoay)!`}
                  {activeDevice === 'torpedo' && `🚀 Nhấp vào ô trên BÀN ĐỐI PHƯƠNG (Trái) để phóng ngư lôi theo ${deviceOrientation === 'horizontal' ? 'Hàng Ngang' : 'Cột Dọc'} (bấm R xoay)!`}
                  {activeDevice === 'line_sonar' && `📶 Nhấp vào ô trên BÀN ĐỐI PHƯƠNG (Trái) để sonar đếm số ô tàu trên ${deviceOrientation === 'horizontal' ? 'Hàng Ngang' : 'Cột Dọc'} (bấm R xoay)!`}
                  {activeDevice === 'double_fire' && (doubleFireFirstCell ? '⚔️ Đã chọn ô 1! Nhấp chọn ô thứ 2 trên BÀN ĐỐI PHƯƠNG để nổ súng!' : '⚔️ Nhấp chọn ô thứ nhất trên BÀN ĐỐI PHƯƠNG (Trái)!')}
                  {activeDevice === 'deep_probe' && '🎯 Nhấp 1 ô trên BÀN ĐỐI PHƯƠNG (Trái): Trúng thì nổ phá hủy, nếu trượt biển trống thì ĐƯỢC BẮN TIẾP!'}
                  {activeDevice === 'shield' && '🛡️ Nhấp vào 1 ô trên TÀU CỦA BẠN (Bên Phải) để bọc khiên năng lượng miễn nhiễm 1 đòn bắn!'}
                  {activeDevice === 'decoy' && '🪤 Nhấp vào 1 ô BIỂN TRỐNG CỦA BẠN (Bên Phải) để thả phao phát sóng radar giả đánh lừa AI!'}
                  {activeDevice === 'relocate' && (relocateSelectedShipId ? '🔄 Nhấp ô trống trên BÀN CỦA BẠN (Bên Phải) để hạ đặt lại tàu (Bấm R xoay)!' : '🔄 Nhấp chọn 1 chiến hạm chưa bị bắn của bạn (Bên Phải) để di chuyển!')}
                </span>
                <button
                  onClick={() => {
                    setActiveDevice(null);
                    setRelocateSelectedShipId(null);
                    setDoubleFireFirstCell(null);
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-pointer ml-2 shrink-0"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          {/* MOBILE & TABLET BOARD SWITCHER TABS */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-3 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setMobileActiveBoard('both')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                mobileActiveBoard === 'both'
                  ? 'bg-cyan-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Cả 2 Bàn
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveBoard('ai')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                mobileActiveBoard === 'ai'
                  ? 'bg-rose-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              🎯 Bàn Địch
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveBoard('player')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                mobileActiveBoard === 'player'
                  ? 'bg-emerald-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              🛡️ Bàn Bạn
            </button>
          </div>

          {/* TWO BOARDS DUAL VIEW */}
          {/* LEFT: ENEMY AI BOARD (Target Zone) | RIGHT: PLAYER BOARD (Defense Zone) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* 1. TARGET BOARD (BÊN TRÁI: HẠM ĐỘI ĐỊCH - BẠN NGẮM BẮN VÀO ĐÂY) */}
            <div className={`bg-[#030d1a] border-2 border-cyan-800/80 rounded-2xl p-3 sm:p-4 shadow-xl ${
              mobileActiveBoard === 'player' ? 'hidden lg:block' : 'block'
            }`}>
              <div className="flex items-center justify-between mb-3 border-b border-cyan-900/60 pb-2">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                  <div>
                    <span className="font-mono text-xs sm:text-sm font-black text-cyan-300 uppercase block">
                      HẠM ĐỘI ĐỊCH (AI) • BẠN NGẮM BẮN
                    </span>
                    <span className="text-[9px] font-mono text-cyan-500/70">
                      Sương mù chiến trận 100% (Không bao giờ lộ vị trí tàu ẩn)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Tactical Probability Heatmap Toggle */}
                  <button
                    onClick={() => setShowProbabilityHeatmap(prev => !prev)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      showProbabilityHeatmap
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-cyan-300'
                    }`}
                    title="Bật/Tắt chế độ xem radar mật độ xác suất của AI"
                  >
                    <Activity className="w-3 h-3 text-amber-400" />
                    <span>{showProbabilityHeatmap ? 'Tắt Radar AI' : '🛰️ Soi Radar AI'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-neutral-400">Tàu sống:</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      {aiShips.filter(s => !s.isSunk).length}/{aiShips.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Opponent 10x10 Grid */}
              <div className="w-full">
                <div className="grid grid-cols-10 gap-1 mb-1 pl-5 sm:pl-6">
                  {COL_LABELS.map(col => (
                    <div key={col} className="text-center font-mono text-[9px] sm:text-[11px] font-bold text-cyan-400">
                      {col}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  {ROW_LABELS.map((rowLabel, r) => (
                    <div key={rowLabel} className="flex items-center gap-1">
                      <div className="w-4 sm:w-5 text-right font-mono text-[9px] sm:text-[11px] font-bold text-cyan-400 shrink-0">
                        {rowLabel}
                      </div>
                      <div className="grid grid-cols-10 gap-1 flex-1">
                        {Array.from({ length: BOARD_SIZE }).map((_, c) =>
                          renderAiCell(aiBoard[r][c])
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical AI Fleet Status Cards */}
              <div className="mt-3 pt-2.5 border-t border-cyan-900/40 grid grid-cols-2 gap-2 text-[11px] font-mono">
                {aiShips.map(ship => (
                  <div
                    key={ship.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all ${
                      ship.isSunk
                        ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                        : ship.hits > 0
                        ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{ship.isSunk ? '☠️' : ship.hits > 0 ? '🔥' : '❓'}</span>
                      <span className="truncate">{ship.name}</span>
                    </div>

                    <div className="flex items-center gap-1 ml-1 shrink-0">
                      {ship.isSunk ? (
                        <span className="text-[9px] font-bold px-1 rounded bg-rose-500/20 text-rose-300">CHÌM</span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-neutral-300">
                          {ship.size - ship.hits}/{ship.size} HP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. FRIENDLY BOARD (BÊN PHẢI: HẠM ĐỘI CỦA BẠN - AI ĐANG BẮN VÀO ĐÂY) */}
            <div className="bg-[#03111e] border-2 border-emerald-900/60 rounded-2xl p-3 sm:p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 border-b border-emerald-900/40 pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-mono text-xs sm:text-sm font-black text-emerald-300 uppercase block">
                      HẠM ĐỘI CỦA BẠN • CĂN CỨ PHÒNG THỦ
                    </span>
                    <span className="text-[9px] font-mono text-emerald-500/70">
                      Hiển thị 4 tàu của bạn và các phát bắn của AI
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-neutral-400">Tàu sống:</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {playerShips.filter(s => !s.isSunk).length}/{playerShips.length}
                  </span>
                </div>
              </div>

              {/* Friendly 10x10 Grid */}
              <div className="w-full">
                <div className="grid grid-cols-10 gap-1 mb-1 pl-5 sm:pl-6">
                  {COL_LABELS.map(col => (
                    <div key={col} className="text-center font-mono text-[9px] sm:text-[11px] font-bold text-emerald-400">
                      {col}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  {ROW_LABELS.map((rowLabel, r) => (
                    <div key={rowLabel} className="flex items-center gap-1">
                      <div className="w-4 sm:w-5 text-right font-mono text-[9px] sm:text-[11px] font-bold text-emerald-400 shrink-0">
                        {rowLabel}
                      </div>
                      <div className="grid grid-cols-10 gap-1 flex-1">
                        {Array.from({ length: BOARD_SIZE }).map((_, c) =>
                          renderPlayerCell(playerBoard[r][c])
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Fleet Health Status Cards with Interactive HP bars */}
              <div className="mt-3 pt-2.5 border-t border-emerald-900/40 grid grid-cols-2 gap-2 text-[11px] font-mono">
                {playerShips.map(ship => (
                  <div
                    key={ship.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all ${
                      ship.isSunk
                        ? 'bg-rose-950/40 border-rose-800/60 text-neutral-500 line-through'
                        : ship.hits > 0
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{ship.iconEmoji}</span>
                      <span className="truncate">{ship.name}</span>
                    </div>

                    <div className="flex items-center gap-1 ml-1 shrink-0">
                      {ship.isSunk ? (
                        <span className="text-[9px] font-bold px-1 rounded bg-rose-500/20 text-rose-300">CHÌM</span>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: ship.size }).map((_, hIdx) => (
                            <div
                              key={hIdx}
                              className={`w-1.5 h-3 rounded-xs ${
                                hIdx < ship.size - ship.hits ? 'bg-emerald-400' : 'bg-rose-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COMBAT RECENT LOG FEED */}
          {combatLog.length > 0 && (
            <div className="mt-4 p-3 rounded-2xl bg-neutral-950/90 border border-neutral-800 text-xs font-mono">
              <div className="text-[10px] text-neutral-400 uppercase font-bold mb-1.5 flex items-center justify-between">
                <span>Nhật ký hải chiến (Lịch sử giao tranh):</span>
                <span>{combatLog.length} sự kiện</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {combatLog.slice(0, 3).map((log, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-md border ${
                      idx === 0
                        ? 'bg-cyan-950/70 border-cyan-800 text-cyan-300 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {log}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ENCYCLOPEDIA MODAL: ALL 12 TACTICAL DEVICES */}
      {/* ======================================================== */}
      {showDeviceEncyclopedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-neutral-950 border-2 border-cyan-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black font-mono uppercase text-white">
                  KHO 12 THIẾT BỊ CHIẾN THUẬT HẢI QUÂN
                </h3>
              </div>
              <button
                onClick={() => setShowDeviceEncyclopedia(false)}
                className="px-3 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <p className="text-xs text-neutral-400 font-mono mb-4 leading-relaxed">
              Mỗi trận đấu, hệ thống sẽ ngẫu nhiên bốc thăm <strong>3 trong số 12 loại thiết bị</strong> dưới đây cho cả hai bên (Player & AI). Mỗi loại khởi đầu có <strong>2 lượt dùng</strong>. Khi bắn chìm 1 tàu địch, bạn sẽ được thưởng nóng +1 lượt thiết bị ngẫu nhiên!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_12_DEVICES.map(dev => (
                <div
                  key={dev.id}
                  className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{dev.icon}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          dev.category === 'attack'
                            ? 'bg-rose-500/20 text-rose-300'
                            : dev.category === 'defense'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {dev.category === 'attack' ? 'Tấn Công' : dev.category === 'defense' ? 'Phòng Thủ' : 'Do Thám'}
                      </span>
                    </div>
                    <h4 className="text-xs font-mono font-black text-white mb-1">{dev.name}</h4>
                    <p className="text-[11px] text-neutral-400 font-mono leading-relaxed">{dev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. GAME OVER / VICTORY MODAL */}
      {/* ======================================================== */}
      {phase === 'game-over' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="max-w-md w-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-cyan-400 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(6,182,212,0.4)]">
            <div className="text-6xl mb-3 animate-bounce">
              {aiShips.every(s => s.isSunk) ? '🏆' : '💀'}
            </div>

            {(() => {
              const playerWon = aiShips.every(s => s.isSunk);
              const winnerTitle = playerWon ? 'BẠN ĐÃ CHIẾN THẮNG!' : 'AI ĐÃ CHIẾN THẮNG!';

              return (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 font-mono tracking-wide uppercase mb-1">
                    {winnerTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 font-mono mb-5">
                    {playerWon
                      ? `Chúc mừng Chỉ Huy! Bạn đã tiêu diệt toàn bộ hạm đội AI (Cấp: ${getDifficultyLabel(aiDifficulty)}).`
                      : 'Hạm đội của bạn đã chìm hoàn toàn. Hãy thử lại để phục thù!'}
                  </p>

                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 mb-5 text-left space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-neutral-300">
                      <span>Tổng phát bắn của bạn:</span>
                      <span className="font-bold text-white">{playerStats.shotsFired}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Số phát bắn trúng đích:</span>
                      <span className="font-bold text-emerald-400">
                        {playerStats.hits} ({playerStats.shotsFired > 0 ? Math.round((playerStats.hits / playerStats.shotsFired) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Chiến hạm đã tiêu diệt:</span>
                      <span className="font-bold text-cyan-400">{playerStats.shipsDestroyed}/4 tàu</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Thiết bị đã kích hoạt:</span>
                      <span className="font-bold text-amber-400">{playerStats.devicesUsed}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Độ khó AI đối đầu:</span>
                      <span className="font-bold text-rose-400">{getDifficultyLabel(aiDifficulty)}</span>
                    </div>
                  </div>

                  {/* Option to reveal AI ship layout */}
                  <div className="mb-5">
                    <button
                      onClick={() => setRevealAiBoardOnGameOver(prev => !prev)}
                      className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                    >
                      {revealAiBoardOnGameOver ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{revealAiBoardOnGameOver ? 'Ẩn vị trí tàu AI' : 'Xem vị trí các tàu AI trên bàn cờ'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => startNewMatch(aiDifficulty)}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-neutral-950 font-black font-mono text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Chơi Lại</span>
                    </button>

                    <button
                      onClick={() => setPhase('difficulty-select')}
                      className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Đổi Độ Khó
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
