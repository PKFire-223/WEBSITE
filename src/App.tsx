import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagicBookCover } from './components/MagicBookCover';
import { GameHub } from './components/GameHub';
import { GameModal } from './components/GameModal';
import { LevelUpNotification } from './components/LevelUpNotification';
import { ProfilePage } from './components/ProfilePage';
import { INITIAL_GAMES, GameItem } from './data/gamesData';
import { setSoundEnabled as configureSound, isSoundEnabled, playLevelUpSound } from './utils/audio';

const SECONDS_PER_LEVEL = 600; // 10 phút (600 giây) chơi game = 1 Level Up (LV +1)

export function App() {
  const [currentPage, setCurrentPage] = useState<'cover' | 'hub' | 'profile'>('cover');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Games list - initialized with OnlyaFan as Game #1 and Snake as Game #2
  const [games, setGames] = useState<GameItem[]>(() => {
    try {
      const saved = localStorage.getItem('polyplay_games_library');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = [...parsed];
          INITIAL_GAMES.forEach((initG) => {
            const exists = list.some((g: GameItem) => g.id === initG.id);
            if (!exists) {
              list.push(initG);
            } else {
              // update metadata like thumbnail
              const idx = list.findIndex((g: GameItem) => g.id === initG.id);
              if (idx !== -1) list[idx] = { ...list[idx], ...initG };
            }
          });
          return list;
        }
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_GAMES;
  });

  // Level & Playtime persistence
  const [playerLevel, setPlayerLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('polyplay_player_level');
      if (saved) {
        const lvl = parseInt(saved, 10);
        if (!isNaN(lvl) && lvl >= 1) return lvl;
      }
    } catch (e) {
      // fallback
    }
    return 1;
  });

  const [totalPlaySeconds, setTotalPlaySeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('polyplay_play_seconds');
      if (saved) {
        const secs = parseInt(saved, 10);
        if (!isNaN(secs) && secs >= 0) return secs;
      }
    } catch (e) {
      // fallback
    }
    return 0;
  });

  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [activeSlotNumber, setActiveSlotNumber] = useState<number | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [celebrateLevel, setCelebrateLevel] = useState<number | null>(null);

  // Persist level and total playtime
  useEffect(() => {
    try {
      localStorage.setItem('polyplay_player_level', playerLevel.toString());
      localStorage.setItem('polyplay_play_seconds', totalPlaySeconds.toString());
    } catch (e) {
      // ignore
    }
  }, [playerLevel, totalPlaySeconds]);

  // Active Playtime Timer: counts every second when a game modal is open
  useEffect(() => {
    const isPlaying = activeGame !== null || activeSlotNumber !== null;
    if (!isPlaying) {
      setSessionSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
      setTotalPlaySeconds((prevTotal) => {
        const newTotal = prevTotal + 1;
        // Check if user hit the required time threshold for level up
        if (newTotal % SECONDS_PER_LEVEL === 0) {
          setPlayerLevel((prevLvl) => {
            const nextLvl = prevLvl + 1;
            setCelebrateLevel(nextLvl);
            return nextLvl;
          });
        }
        return newTotal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame, activeSlotNumber]);

  // Calculate progress towards next level
  const currentLevelProgressSeconds = totalPlaySeconds % SECONDS_PER_LEVEL;
  const secondsToNextLevel = SECONDS_PER_LEVEL - currentLevelProgressSeconds;
  const levelProgressPercent = Math.min(
    100,
    Math.round((currentLevelProgressSeconds / SECONDS_PER_LEVEL) * 100)
  );

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    configureSound(nextVal);
  };

  const handleSelectGame = (game: GameItem) => {
    setActiveGame(game);
    setActiveSlotNumber(null);
  };

  const handleSelectEmptySlot = (slotNumber: number) => {
    setActiveSlotNumber(slotNumber);
    setActiveGame(null);
  };

  const handleCloseModal = () => {
    setActiveGame(null);
    setActiveSlotNumber(null);
  };

  const handleCloseLevelUp = useCallback(() => {
    setCelebrateLevel(null);
  }, []);

  const handleForceLevelUp = () => {
    setPlayerLevel((prev) => {
      const next = prev + 1;
      setCelebrateLevel(next);
      return next;
    });
    setTotalPlaySeconds((prev) => prev + SECONDS_PER_LEVEL);
  };

  return (
    <div className="min-h-screen bg-[#07040d] text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Level Up Banner Notification */}
      <LevelUpNotification
        level={celebrateLevel}
        onClose={handleCloseLevelUp}
      />

      {currentPage === 'cover' ? (
        <MagicBookCover
          onStart={() => setCurrentPage('hub')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      ) : currentPage === 'profile' ? (
        <ProfilePage
          playerLevel={playerLevel}
          totalPlaySeconds={totalPlaySeconds}
          secondsToNextLevel={secondsToNextLevel}
          levelProgressPercent={levelProgressPercent}
          onBackToHub={() => setCurrentPage('hub')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      ) : (
        <GameHub
          games={games}
          playerLevel={playerLevel}
          playTimeSeconds={totalPlaySeconds}
          secondsToNextLevel={secondsToNextLevel}
          levelProgressPercent={levelProgressPercent}
          onSelectGame={handleSelectGame}
          onSelectEmptySlot={handleSelectEmptySlot}
          onBackToCover={() => setCurrentPage('cover')}
          onOpenProfile={() => setCurrentPage('profile')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Game Viewer Modal */}
      {(activeGame !== null || activeSlotNumber !== null) && (
        <GameModal
          game={activeGame}
          slotNumber={activeSlotNumber}
          playerLevel={playerLevel}
          sessionSeconds={sessionSeconds}
          secondsToNextLevel={secondsToNextLevel}
          levelProgressPercent={levelProgressPercent}
          onClose={handleCloseModal}
          onForceLevelUp={handleForceLevelUp}
        />
      )}
    </div>
  );
}

export default App;
