import React, { useState } from 'react';
import { UserAccount } from '../types/auth';
import { sha256 } from '../utils/security';
import { Lock, Unlock, Shield, AlertTriangle, LogOut, KeyRound } from 'lucide-react';
import { playClickSound, playCoinSound } from '../utils/audio';

interface QuickLockScreenProps {
  user: UserAccount;
  onUnlock: () => void;
  onLogout: () => void;
}

export const QuickLockScreen: React.FC<QuickLockScreenProps> = ({
  user,
  onUnlock,
  onLogout,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [usePasswordFallback, setUsePasswordFallback] = useState(false);
  const [fallbackPassword, setFallbackPassword] = useState('');

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      playClickSound();
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    playClickSound();
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    playClickSound();
    setPin('');
    setErrorMsg('');
  };

  const verifyPin = async (inputPin: string) => {
    setIsVerifying(true);
    setErrorMsg('');

    try {
      if (!user.pinHash) {
        // If user didn't set a pin, unlock directly or use 1234
        playCoinSound();
        onUnlock();
        return;
      }

      const inputHash = await sha256(inputPin, user.salt);
      if (inputHash === user.pinHash) {
        playCoinSound();
        onUnlock();
      } else {
        setErrorMsg('Mã PIN không chính xác!');
        setPin('');
      }
    } catch {
      setErrorMsg('Lỗi xác thực mã bảo mật.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const inputHash = await sha256(fallbackPassword, user.salt);
      if (inputHash === user.passwordHash) {
        playCoinSound();
        onUnlock();
      } else {
        setErrorMsg('Mật khẩu không chính xác!');
      }
    } catch {
      setErrorMsg('Lỗi xác thực.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in select-none">
      {/* Mystical Cosmic Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#391252_0%,#130421_55%,#04010a_100%)] pointer-events-none -z-10" />

      <div className="relative w-full max-w-sm rounded-3xl bg-neutral-950/90 border-2 border-amber-500/50 p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.3)] font-sans">
        
        {/* User Badge */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-lg shadow-amber-500/40">
              <div className="w-full h-full rounded-full bg-[#160a04] flex items-center justify-center text-3xl">
                {user.avatarEmoji || '🧙‍♂️'}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-amber-500 text-neutral-950 shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{user.displayName}</h3>
            <p className="text-xs font-mono text-amber-300/80">Phiên làm việc đã được khóa bảo vệ</p>
          </div>
        </div>

        {/* PIN Entry vs Password Fallback */}
        {!usePasswordFallback ? (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-neutral-400 font-mono">
              Nhập Mã PIN 4 Số để mở khóa:
            </p>

            {/* 4-dot Indicator */}
            <div className="flex justify-center items-center gap-4 py-2">
              {[0, 1, 2, 3].map(index => {
                const filled = index < pin.length;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] scale-125'
                        : 'bg-neutral-800 border border-neutral-700'
                    }`}
                  />
                );
              })}
            </div>

            {errorMsg && (
              <div className="text-xs text-red-400 font-bold flex items-center justify-center gap-1.5 animate-shake">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 10-Key Numpad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigitClick(d)}
                  className="w-16 h-14 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-white font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  {d}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="w-16 h-14 rounded-2xl bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                XÓA
              </button>

              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                className="w-16 h-14 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-white font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-md"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-16 h-14 rounded-2xl bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                ←
              </button>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setUsePasswordFallback(true);
                  setErrorMsg('');
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                Quên mã PIN? Mở khóa bằng Mật khẩu
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordUnlock} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Nhập Mật khẩu tài khoản:
              </label>
              <input
                type="password"
                value={fallbackPassword}
                onChange={e => setFallbackPassword(e.target.value)}
                placeholder="Mật khẩu của bạn..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs outline-none focus:border-amber-400"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-bold">{errorMsg}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUsePasswordFallback(false)}
                className="flex-1 py-2 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-bold cursor-pointer"
              >
                Nhập PIN
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black cursor-pointer"
              >
                Mở Khóa
              </button>
            </div>
          </form>
        )}

        {/* Bottom Switch / Logout */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>

          <span className="font-mono text-[10px] text-neutral-500">
            PolyPlay SafeGuard v1
          </span>
        </div>

      </div>
    </div>
  );
};
