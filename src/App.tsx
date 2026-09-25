import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_GAMES, GameItem } from './data/gamesData';
import { MagicBookCover } from './components/MagicBookCover';
import { GameHub } from './components/GameHub';
import { GameModal } from './components/GameModal';
import { ProfilePage } from './components/ProfilePage';
import { LevelUpNotification } from './components/LevelUpNotification';
import { AuthModal } from './components/AuthModal';
import { QuickLockScreen } from './components/QuickLockScreen';
import {
  isSoundEnabled,
  setSoundEnabled as setGlobalSoundEnabled,
  playClickSound,
  playCoinSound,
} from './utils/audio';
import {
  getActiveUserId,
  findUserById,
  loadGameData,
  saveGameData,
  clearGuestTransientData,
} from './utils/security';
import { UserAccount } from './types/auth';
import { Gamepad2, Sparkles, BookOpen } from 'lucide-react';

export function App() {
  // Navigation views: 'cover' (Bìa sách 3D) | 'hub' (Kho game) | 'profile' (Hồ sơ người chơi)
  const [currentView, setCurrentView] = useState<'cover' | 'hub' | 'profile'>('cover');

  // Authentication & Security State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const activeId = getActiveUserId();
    if (activeId) {
      return findUserById(activeId) || null;
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'security'>('login');
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  // Game selection state for modal
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number | null>(null);

  // Global sound state
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  // Level & Play Time persistence (Scattered according to Guest vs User)
  const [playTimeSeconds, setPlayTimeSeconds] = useState<number>(() => {
    const initialData = loadGameData(currentUser);
    return initialData.playTimeSeconds;
  });

  const [playerLevel, setPlayerLevel] = useState<number>(() => {
    const initialData = loadGameData(currentUser);
    return initialData.playerLevel;
  });

  const [celebratingLevel, setCelebratingLevel] = useState<number | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Audio initialization
  useEffect(() => {
    setGlobalSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setGlobalSoundEnabled(next);
  };

  // Sync state whenever playerLevel or playTimeSeconds changes
  useEffect(() => {
    saveGameData(currentUser, {
      playerLevel,
      playTimeSeconds,
    });
  }, [playerLevel, playTimeSeconds, currentUser]);

  // When active user changes (Login / Logout / Switch)
  const handleUserChange = useCallback((newUser: UserAccount | null) => {
    setCurrentUser(newUser);
    const loadedData = loadGameData(newUser);
    setPlayerLevel(loadedData.playerLevel);
    setPlayTimeSeconds(loadedData.playTimeSeconds);
  }, []);

  // Level calculation: 10 minutes (600 seconds) = +1 Level
  const SECONDS_PER_LEVEL = 600;
  const currentLevelProgressSeconds = playTimeSeconds % SECONDS_PER_LEVEL;
  const secondsToNextLevel = SECONDS_PER_LEVEL - currentLevelProgressSeconds;
  const levelProgressPercent = Math.min(100, Math.floor((currentLevelProgressSeconds / SECONDS_PER_LEVEL) * 100));

  // Main game loop timer (accumulates time when in hub or playing)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTimeSeconds(prev => {
        const next = prev + 1;
        // Check if level increased
        const calcLevel = Math.floor(next / SECONDS_PER_LEVEL) + 1;
        if (calcLevel > playerLevel) {
          setPlayerLevel(calcLevel);
          setCelebratingLevel(calcLevel);
        }
        return next;
      });

      setSessionSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [playerLevel]);

  // Open game in modal
  const handleSelectGame = (game: GameItem) => {
    playClickSound();
    setSelectedGame(game);
    setSelectedSlotNumber(null);
  };

  const handleSelectEmptySlot = (slotNumber: number) => {
    playClickSound();
    setSelectedGame(null);
    setSelectedSlotNumber(slotNumber);
  };

  const handleCloseGameModal = () => {
    playClickSound();
    setSelectedGame(null);
    setSelectedSlotNumber(null);
  };

  const handleForceLevelUp = () => {
    setPlayerLevel(prev => {
      const next = prev + 1;
      setCelebratingLevel(next);
      return next;
    });
  };

  const openAuth = (mode: 'login' | 'register' | 'security' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07030d] text-white selection:bg-amber-500 selection:text-neutral-950 font-sans antialiased">
      
      {/* QUICK LOCK SCREEN (When user stepped away / pressed Quick Lock) */}
      {isSessionLocked && currentUser && (
        <QuickLockScreen
          user={currentUser}
          onUnlock={() => setIsSessionLocked(false)}
          onLogout={() => {
            setIsSessionLocked(false);
            handleUserChange(null);
          }}
        />
      )}

      {/* 1. MAGIC BOOK COVER (3D Opening Grimoire - Starts Closed) */}
      {currentView === 'cover' && (
        <MagicBookCover
          onStart={() => {
            setCurrentView('hub');
          }}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          currentUser={currentUser}
          onOpenAuth={openAuth}
        />
      )}

      {/* 2. GAME HUB (Kho Game PolyPlay - Contains all 5 games including Vạn Cổ Kỳ Trân Gacha!) */}
      {currentView === 'hub' && (
        <div className="relative min-h-screen">
          <GameHub
            games={INITIAL_GAMES}
            playerLevel={playerLevel}
            playTimeSeconds={playTimeSeconds}
            secondsToNextLevel={secondsToNextLevel}
            levelProgressPercent={levelProgressPercent}
            onSelectGame={handleSelectGame}
            onSelectEmptySlot={handleSelectEmptySlot}
            onBackToCover={() => setCurrentView('cover')}
            onOpenProfile={() => setCurrentView('profile')}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            currentUser={currentUser}
            onOpenAuth={openAuth}
          />
        </div>
      )}

      {/* 3. PROFILE PAGE (Hồ Sơ Pháp Sư / Thành Tích & Quản Trị Bảo Mật) */}
      {currentView === 'profile' && (
        <ProfilePage
          playerLevel={playerLevel}
          totalPlaySeconds={playTimeSeconds}
          secondsToNextLevel={secondsToNextLevel}
          levelProgressPercent={levelProgressPercent}
          onBackToHub={() => setCurrentView('hub')}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          currentUser={currentUser}
          onOpenAuth={openAuth}
        />
      )}

      {/* ACTIVE GAME MODAL (Renders whichever game is selected, including Gacha Game!) */}
      {(selectedGame !== null || selectedSlotNumber !== null) && (
        <GameModal
          game={selectedGame}
          slotNumber={selectedSlotNumber}
          playerLevel={playerLevel}
          sessionSeconds={sessionSeconds}
          secondsToNextLevel={secondsToNextLevel}
          levelProgressPercent={levelProgressPercent}
          onClose={handleCloseGameModal}
          onForceLevelUp={handleForceLevelUp}
          currentUser={currentUser}
          onOpenAuth={openAuth}
        />
      )}

      {/* CELEBRATION LEVEL UP NOTIFICATION */}
      <LevelUpNotification
        level={celebratingLevel}
        onClose={() => setCelebratingLevel(null)}
      />

      {/* AUTHENTICATION & SECURITY MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          handleUserChange(user);
          setIsAuthModalOpen(false);
        }}
        onLogout={() => {
          handleUserChange(null);
          setIsAuthModalOpen(false);
        }}
        onLockSession={() => {
          setIsSessionLocked(true);
          setIsAuthModalOpen(false);
        }}
      />

    </div>
  );
}

export default App;
