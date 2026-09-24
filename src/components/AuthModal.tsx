import React, { useState } from 'react';
import {
  UserAccount,
  ACCOUNT_AVATARS,
  SECURITY_QUESTIONS,
  UserGameData
} from '../types/auth';
import {
  sha256,
  generateSalt,
  evaluatePasswordStrength,
  findUserByUsername,
  getAllUsers,
  saveUsers,
  calculateAccountSecurityRating,
  purgeGuestData
} from '../utils/security';
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  LogOut,
  HelpCircle,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { playClickSound, playCoinSound } from '../utils/audio';

interface AuthModalProps {
  currentUser: UserAccount | null;
  currentGuestData?: UserGameData;
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'security';
  onClose: () => void;
  onLoginSuccess: (user: UserAccount, importedGuestData?: boolean) => void;
  onLogout: () => void;
  onLockSession?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  currentGuestData,
  isOpen,
  initialMode = 'login',
  onClose,
  onLoginSuccess,
  onLogout,
  onLockSession,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'security' | 'forgot'>(
    currentUser ? 'security' : initialMode
  );

  // Form states - Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Register
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regAvatarId, setRegAvatarId] = useState('mage');
  const [regQuestion, setRegQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [regAnswer, setRegAnswer] = useState('');
  const [importGuestData, setImportGuestData] = useState(true);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Form states - Change Password / PIN
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');

  // Form states - Forgot Password
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotFoundUser, setForgotFoundUser] = useState<UserAccount | null>(null);
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotPin, setForgotPin] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Status & Error Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const passwordStrength = evaluatePasswordStrength(regPassword);
  const securityRating = calculateAccountSecurityRating(currentUser);

  // =========================================================================
  // 1. HANDLE LOGIN
  // =========================================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginUsername.trim() || !loginPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setIsProcessing(true);
    try {
      const user = findUserByUsername(loginUsername);
      if (!user) {
        setErrorMsg('Tài khoản không tồn tại! Vui lòng kiểm tra lại hoặc đăng ký mới.');
        setIsProcessing(false);
        return;
      }

      const inputHash = await sha256(loginPassword, user.salt);
      if (inputHash !== user.passwordHash) {
        setErrorMsg('Mật khẩu không chính xác. Vui lòng thử lại hoặc sử dụng Khôi phục mật khẩu.');
        setIsProcessing(false);
        return;
      }

      // Update last login
      const users = getAllUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx].lastLoginAt = new Date().toLocaleString('vi-VN');
        saveUsers(users);
      }

      playCoinSound();
      setSuccessMsg(`Đăng nhập thành công! Chào mừng trở lại, ${user.displayName}.`);
      setTimeout(() => {
        onLoginSuccess(user, false);
        onClose();
      }, 500);
    } catch {
      setErrorMsg('Có lỗi xảy ra khi xác thực mật mã. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // 2. HANDLE REGISTER
  // =========================================================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = regUsername.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự (chỉ gồm chữ và số).');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setErrorMsg('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_).');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu bảo mật phải có tối thiểu 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Xác nhận mật khẩu không trùng khớp.');
      return;
    }
    if (regPin && !/^\d{4}$/.test(regPin)) {
      setErrorMsg('Mã PIN bảo mật phải gồm đúng 4 chữ số.');
      return;
    }
    if (!regAnswer.trim()) {
      setErrorMsg('Vui lòng trả lời câu hỏi bảo mật để dùng khi cần cứu hộ tài khoản.');
      return;
    }

    setIsProcessing(true);
    try {
      const existing = findUserByUsername(cleanUsername);
      if (existing) {
        setErrorMsg('Tên đăng nhập này đã có người sử dụng. Hãy chọn một tên khác.');
        setIsProcessing(false);
        return;
      }

      const salt = generateSalt();
      const passwordHash = await sha256(regPassword, salt);
      const pinHash = regPin ? await sha256(regPin, salt) : '';
      const answerHash = await sha256(regAnswer.trim().toLowerCase(), salt);

      const avatar = ACCOUNT_AVATARS.find(a => a.id === regAvatarId) || ACCOUNT_AVATARS[0];

      const newUser: UserAccount = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        username: cleanUsername,
        displayName: regDisplayName.trim() || cleanUsername,
        avatarId: avatar.id,
        avatarEmoji: avatar.emoji,
        passwordHash,
        salt,
        pinHash,
        securityQuestion: regQuestion,
        securityAnswerHash: answerHash,
        createdAt: new Date().toLocaleDateString('vi-VN'),
        lastLoginAt: new Date().toLocaleString('vi-VN'),
      };

      const users = getAllUsers();
      users.push(newUser);
      saveUsers(users);

      playCoinSound();
      setSuccessMsg(`Tạo tài khoản bảo mật thành công! Khởi tạo hồ sơ cho ${newUser.displayName}.`);

      setTimeout(() => {
        onLoginSuccess(newUser, importGuestData);
        onClose();
      }, 700);
    } catch {
      setErrorMsg('Lỗi khi thiết lập tài khoản. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // 3. HANDLE FORGOT PASSWORD
  // =========================================================================
  const handleCheckForgotUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const user = findUserByUsername(forgotUsername);
    if (!user) {
      setErrorMsg('Không tìm thấy tài khoản với tên đăng nhập này.');
      return;
    }
    setForgotFoundUser(user);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotFoundUser) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (forgotNewPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsProcessing(true);
    try {
      const inputAnswerHash = await sha256(forgotAnswer.trim().toLowerCase(), forgotFoundUser.salt);
      if (inputAnswerHash !== forgotFoundUser.securityAnswerHash) {
        setErrorMsg('Câu trả lời bảo mật không chính xác!');
        setIsProcessing(false);
        return;
      }

      if (forgotFoundUser.pinHash && forgotPin) {
        const inputPinHash = await sha256(forgotPin.trim(), forgotFoundUser.salt);
        if (inputPinHash !== forgotFoundUser.pinHash) {
          setErrorMsg('Mã PIN bảo mật 4 số không khớp!');
          setIsProcessing(false);
          return;
        }
      }

      // Reset password
      const newSalt = generateSalt();
      const newHash = await sha256(forgotNewPassword, newSalt);
      const newPinHash = forgotFoundUser.pinHash ? await sha256(forgotPin || '1234', newSalt) : '';
      const newAnswerHash = await sha256(forgotAnswer.trim().toLowerCase(), newSalt);

      const users = getAllUsers();
      const idx = users.findIndex(u => u.id === forgotFoundUser.id);
      if (idx !== -1) {
        users[idx].passwordHash = newHash;
        users[idx].salt = newSalt;
        users[idx].securityAnswerHash = newAnswerHash;
        if (newPinHash) users[idx].pinHash = newPinHash;
        saveUsers(users);
      }

      playCoinSound();
      setSuccessMsg('Khôi phục mật mã thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setTimeout(() => {
        setMode('login');
        setLoginUsername(forgotFoundUser.username);
        setForgotFoundUser(null);
      }, 1000);
    } catch {
      setErrorMsg('Lỗi khi khôi phục mật khẩu.');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // 4. HANDLE CHANGE PASSWORD / PIN IN SECURITY CENTER
  // =========================================================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsProcessing(true);
    try {
      const checkOld = await sha256(oldPassword, currentUser.salt);
      if (checkOld !== currentUser.passwordHash) {
        setErrorMsg('Mật khẩu hiện tại không chính xác!');
        setIsProcessing(false);
        return;
      }

      const newSalt = generateSalt();
      const newHash = await sha256(newPassword, newSalt);
      const users = getAllUsers();
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx].salt = newSalt;
        users[idx].passwordHash = newHash;
        saveUsers(users);
      }

      playCoinSound();
      setSuccessMsg('Đã đổi mật khẩu bảo mật thành công!');
      setOldPassword('');
      setNewPassword('');
    } catch {
      setErrorMsg('Lỗi khi đổi mật khẩu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!/^\d{4}$/.test(newPin)) {
      setErrorMsg('Mã PIN mới phải gồm đúng 4 chữ số!');
      return;
    }

    setIsProcessing(true);
    try {
      const pinHash = await sha256(newPin, currentUser.salt);
      const users = getAllUsers();
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx].pinHash = pinHash;
        saveUsers(users);
      }

      playCoinSound();
      setSuccessMsg('Đã cập nhật Mã PIN 4 Số thành công!');
      setNewPin('');
    } catch {
      setErrorMsg('Lỗi khi cập nhật PIN.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#160b24] via-[#0f071a] to-[#08030e] border-2 border-amber-500/40 p-5 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-white max-h-[92vh] overflow-y-auto font-sans">
        
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900/80 border border-neutral-700 text-neutral-400 hover:text-white hover:border-amber-400 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pb-4 border-b border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>HỆ THỐNG TÀI KHOẢN & BẢO MẬT POLYPLAY</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            {mode === 'login' && 'Đăng Nhập Tài Khoản'}
            {mode === 'register' && 'Khởi Tạo Tài Khoản Bảo Mật'}
            {mode === 'security' && 'Trung Tâm Quản Trị Bảo Mật'}
            {mode === 'forgot' && 'Cứu Hộ & Khôi Phục Mật Mã'}
          </h2>
        </div>

        {/* Navigation Tabs (If not logged in, show Login / Register) */}
        {!currentUser && mode !== 'forgot' && (
          <div className="flex bg-neutral-950/80 p-1 rounded-2xl border border-neutral-800 mt-4">
            <button
              onClick={() => {
                playClickSound();
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                playClickSound();
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Đăng Ký Mới
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 1: LOGIN */}
        {/* ================================================================= */}
        {mode === 'login' && !currentUser && (
          <form onSubmit={handleLogin} className="space-y-4 mt-5">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản của bạn..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none pl-10"
                  required
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-neutral-300">
                  Mật khẩu bảo mật
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none pl-10 pr-10"
                  required
                />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-white cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-sm transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Đang xác thực...' : 'ĐĂNG NHẬP NGAY'}
            </button>

            {/* Guest notice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs space-y-1 mt-4">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Chế độ Khách (Vãng lai):</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-300">
                Bạn hoàn toàn có thể chơi ngay với tư cách Khách mà không cần tài khoản.
                <strong className="text-amber-300"> Tuy nhiên: khi bạn thoát hoặc đóng trang web, dữ liệu sẽ không được lưu lại!</strong>
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold border border-amber-500/40 cursor-pointer"
                >
                  Chơi Tiếp Với Tư Cách Khách →
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: REGISTER */}
        {/* ================================================================= */}
        {mode === 'register' && !currentUser && (
          <form onSubmit={handleRegister} className="space-y-4 mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Tên đăng nhập (Tài khoản) *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="vd: phapsu_rong"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Biệt danh hiển thị
                </label>
                <input
                  type="text"
                  value={regDisplayName}
                  onChange={e => setRegDisplayName(e.target.value)}
                  placeholder="vd: Hỏa Long Tướng Quân"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Chọn Pháp Linh Đại Diện:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ACCOUNT_AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setRegAvatarId(avatar.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      regAvatarId === avatar.id
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-xl">{avatar.emoji}</span>
                    <span className="text-[10px] text-neutral-300 truncate w-full text-center">
                      {avatar.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Passwords */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự..."
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Nhập lại mật khẩu *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Khớp với mật khẩu trên..."
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password strength bar */}
              {regPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>Độ mạnh: <strong className="text-white">{passwordStrength.label}</strong></span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: passwordStrength.barWidth }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4-digit PIN for Quick Lock & Security */}
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Mã PIN Bảo Mật (4 Chữ Số) - Tùy chọn nhưng khuyến nghị
              </label>
              <input
                type="password"
                maxLength={4}
                value={regPin}
                onChange={e => setRegPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4 số bí mật để khóa nhanh phiên (vd: 1234)"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-xs outline-none tracking-widest"
              />
            </div>

            {/* Security Question for Account Recovery */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-neutral-300">
                Câu Hỏi Bảo Mật & Phục Hồi *
              </label>
              <select
                value={regQuestion}
                onChange={e => setRegQuestion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-xs outline-none"
              >
                {SECURITY_QUESTIONS.map((q, i) => (
                  <option key={i} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={regAnswer}
                onChange={e => setRegAnswer(e.target.value)}
                placeholder="Nhập câu trả lời bí mật (chỉ mình bạn biết)..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-xs outline-none"
                required
              />
            </div>

            {/* Import guest data checkbox */}
            {currentGuestData && currentGuestData.playerLevel > 1 && (
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importGuestData}
                  onChange={e => setImportGuestData(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>
                  Lưu chuyển cấp độ <strong>(LV {currentGuestData.playerLevel})</strong> và toàn bộ đồ chơi của khách vừa chơi vào tài khoản mới.
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-sm transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Đang khởi tạo bảo mật...' : 'ĐĂNG KÝ & BẢO VỆ DỮ LIỆU'}
            </button>
          </form>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: SECURITY CENTER (FOR LOGGED-IN USERS) */}
        {/* ================================================================= */}
        {mode === 'security' && currentUser && (
          <div className="space-y-5 mt-5">
            {/* Account Card */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl">
                  {currentUser.avatarEmoji || '🧙‍♂️'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{currentUser.displayName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      @{currentUser.username}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Tham gia: {currentUser.createdAt} | Lần cuối: {currentUser.lastLoginAt}
                  </p>
                </div>
              </div>

              {/* Quick Lock Button */}
              {onLockSession && (
                <button
                  onClick={() => {
                    playClickSound();
                    onLockSession();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Khóa nhanh màn hình bằng mã PIN khi rời máy"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Khóa Nhanh</span>
                </button>
              )}
            </div>

            {/* Security Shield Rating */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${securityRating.color}`} />
                  <span className="text-xs font-mono font-bold text-neutral-300">
                    LÁ CHẮN BẢO MẬT: <strong className={securityRating.color}>{securityRating.level}</strong>
                  </span>
                </div>
                <span className="text-xs font-mono font-black text-amber-300">
                  {securityRating.percent}%
                </span>
              </div>

              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${securityRating.percent}%` }}
                />
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {securityRating.shieldDesc}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {securityRating.badges.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Change Password Collapsible */}
            <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
              <h5 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Đổi Mật Khẩu Bảo Mật</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Mật khẩu cũ..."
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs outline-none"
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới (≥ 6 ký tự)..."
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer"
              >
                Cập Nhật Mật Khẩu
              </button>
            </form>

            {/* Change PIN */}
            <form onSubmit={handleUpdatePin} className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
              <h5 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Cài Đặt / Đổi Mã PIN 4 Số (Khóa Nhanh)</span>
              </h5>

              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập 4 chữ số bí mật..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs outline-none tracking-widest font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer"
                >
                  Lưu PIN
                </button>
              </div>
            </form>

            {/* Logout Action */}
            <div className="pt-2 flex justify-between items-center border-t border-neutral-800">
              <span className="text-xs text-neutral-400">
                Lưu toàn bộ dữ liệu & đăng xuất:
              </span>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Đăng Xuất An Toàn</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 4: FORGOT PASSWORD */}
        {/* ================================================================= */}
        {mode === 'forgot' && (
          <div className="space-y-4 mt-5">
            {!forgotFoundUser ? (
              <form onSubmit={handleCheckForgotUsername} className="space-y-3">
                <p className="text-xs text-neutral-300">
                  Nhập tên tài khoản của bạn để xác minh câu hỏi bảo mật:
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={forgotUsername}
                    onChange={e => setForgotUsername(e.target.value)}
                    placeholder="Tên tài khoản cần cứu hộ..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold cursor-pointer"
                  >
                    Quay Lại
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black cursor-pointer"
                  >
                    Tiếp Tục
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <span className="text-[10px] text-neutral-500 font-mono">CÂU HỎI BẢO MẬT CỦA BẠN:</span>
                  <p className="font-bold text-amber-300">{forgotFoundUser.securityQuestion}</p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Câu trả lời bí mật *
                  </label>
                  <input
                    type="text"
                    value={forgotAnswer}
                    onChange={e => setForgotAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời bí mật..."
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs outline-none"
                    required
                  />
                </div>

                {forgotFoundUser.pinHash && (
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">
                      Mã PIN 4 số (Xác thực phụ)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={forgotPin}
                      onChange={e => setForgotPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Nhập mã PIN 4 số..."
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs outline-none font-mono tracking-widest"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={e => setForgotNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotFoundUser(null)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold cursor-pointer"
                  >
                    Quay Lại
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black cursor-pointer"
                  >
                    {isProcessing ? 'Đang xác minh...' : 'ĐẶT LẠI MẬT KHẨU'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
