import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Chrome, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { User as UserType } from "../types";
import { safeFetchJson } from "../utils/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

type AuthTab = "login" | "register" | "forgot" | "otp";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [robloxUsername, setRobloxUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const data = await safeFetchJson<any>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: email || username, password })
      });

      setSuccess("Login berhasil! Selamat datang di R8 Premium.");
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
        resetForm();
      }, 1200);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email || !username || !password) {
      setError("Silakan lengkapi semua field");
      setIsLoading(false);
      return;
    }

    try {
      const data = await safeFetchJson<any>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, robloxUsername })
      });

      setSuccess(data.message || "OTP terkirim!");
      if (data.otpDebug) {
        setDebugOtp(data.otpDebug);
      }
      setActiveTab("otp");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const data = await safeFetchJson<any>("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, robloxUsername, otp: otpCode })
      });

      setSuccess("Verifikasi Berhasil! Akun Anda telah aktif.");
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
        resetForm();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Simulate random user profile from Google
      const randId = Math.floor(Math.random() * 9000) + 1000;
      const demoEmail = `r8user_${randId}@gmail.com`;
      const demoName = `RbxMaster${randId}`;

      const data = await safeFetchJson<any>("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: demoEmail,
          displayName: demoName,
          photoUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${demoName}`
        })
      });

      setSuccess("Login dengan Google berhasil!");
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
        resetForm();
      }, 1200);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("Instruksi reset password telah dikirim ke email Anda.");
    setError("");
  };

  const resetForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setRobloxUsername("");
    setOtpCode("");
    setError("");
    setSuccess("");
    setDebugOtp(null);
    setActiveTab("login");
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        id="auth-modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md overflow-hidden premium-glass border border-emerald-500/15 rounded-2xl shadow-2xl shadow-emerald-500/10"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-emerald-500/10">
          <button 
            id="auth-close-btn"
            onClick={onClose}
            className="absolute top-6 right-6 p-1 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold tracking-widest text-black bg-emerald-500 rounded font-display uppercase">
              R8
            </span>
            <span className="text-lg font-bold tracking-tight font-display text-white">
              {activeTab === "login" && "Masuk Akun"}
              {activeTab === "register" && "Buat Akun Baru"}
              {activeTab === "forgot" && "Lupa Password"}
              {activeTab === "otp" && "Verifikasi OTP"}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {activeTab === "login" && "Akses profil, pesanan, dan riwayat top up Anda."}
            {activeTab === "register" && "Mulai top up Robux dengan aman dan kilat."}
            {activeTab === "forgot" && "Kami akan mengirim link untuk memulihkan password."}
            {activeTab === "otp" && "Masukkan kode OTP yang dikirim ke email Anda."}
          </p>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded-xl"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2 p-3 text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-xl"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Tabs */}
        <div className="p-6">
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-300">Username atau Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail size={16} />
                  </span>
                  <input
                    id="login-username-email"
                    type="text"
                    required
                    placeholder="Masukkan username atau email"
                    value={email || username}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setUsername(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-500">Gunakan akun demo: <strong className="text-gray-400">buyer</strong> atau <strong className="text-gray-400">admin</strong></p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("forgot")}
                    className="text-xs text-emerald-500 hover:underline hover:text-emerald-400"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock size={16} />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-500">Password demo: <strong className="text-gray-400">buyer123</strong> atau <strong className="text-gray-400">admin123</strong></p>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                {isLoading ? "Memproses..." : "Masuk ke Akun"}
              </button>

              <div className="relative my-6 text-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-gray-800"></span>
                <span className="relative px-3 text-xs text-gray-500 bg-gray-900">ATAU</span>
              </div>

              <button
                id="login-google-btn"
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2.5 w-full py-2.5 border border-gray-800 bg-gray-950 hover:bg-gray-800/50 text-white rounded-xl text-sm transition-all"
              >
                <Chrome size={18} className="text-red-400" />
                <span>Masuk dengan Google</span>
              </button>

              <p className="pt-4 text-xs text-center text-gray-400">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="font-semibold text-emerald-500 hover:underline"
                >
                  Daftar Sekarang
                </button>
              </p>
            </form>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-300">Username R8</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User size={16} />
                  </span>
                  <input
                    id="register-username"
                    type="text"
                    required
                    placeholder="Contoh: r8gamer"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-300 font-sans">Alamat Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail size={16} />
                  </span>
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder="Contoh: gamer@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-300">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock size={16} />
                  </span>
                  <input
                    id="register-password"
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-300">
                  Username Roblox <span className="text-gray-500 font-normal">(Opsional)</span>
                </label>
                <input
                  id="register-roblox-username"
                  type="text"
                  placeholder="Contoh: Builderman"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-black font-semibold rounded-xl text-sm transition-all"
              >
                {isLoading ? "Mengirim OTP..." : "Kirim Kode Verifikasi OTP"}
              </button>

              <p className="pt-4 text-xs text-center text-gray-400">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="font-semibold text-emerald-500 hover:underline"
                >
                  Login Sekarang
                </button>
              </p>
            </form>
          )}

          {activeTab === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-center">
                <ShieldCheck className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-xs text-gray-300">
                  Kami telah mensimulasikan pengiriman 6 digit kode OTP ke <span className="font-semibold text-white">{email}</span>.
                </p>
              </div>

              {debugOtp && (
                <div className="p-3 border border-yellow-500/20 bg-yellow-500/10 rounded-xl text-center">
                  <p className="text-[10px] text-yellow-400 font-mono tracking-tight">
                    [SANDBOX DEVS DETECTED] Kode OTP Rahasia: <span className="text-sm font-bold text-white px-2 py-0.5 bg-yellow-500/20 rounded">{debugOtp}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-300 text-center">Masukkan Kode OTP</label>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[12px] text-lg font-bold py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>

              <button
                id="otp-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-black font-semibold rounded-xl text-sm transition-all"
              >
                {isLoading ? "Memverifikasi..." : "Verifikasi & Aktifkan Akun"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("Kode OTP baru telah dikirim ke konsol!");
                  const otp = Math.floor(100000 + Math.random() * 900000).toString();
                  setDebugOtp(otp);
                }}
                className="w-full text-center text-xs font-semibold text-gray-400 hover:text-emerald-400 mt-2 hover:underline"
              >
                Kirim Ulang Kode OTP
              </button>

              <p className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-xs text-gray-500 hover:text-white underline"
                >
                  Kembali ke form Daftar
                </button>
              </p>
            </form>
          )}

          {activeTab === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-300">Masukkan Alamat Email Anda</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail size={16} />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="Contoh: email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-sm transition-all"
              >
                Kirim Link Pemulihan
              </button>

              <p className="pt-4 text-xs text-center text-gray-400">
                Ingat password Anda?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="font-semibold text-emerald-500 hover:underline"
                >
                  Login Sekarang
                </button>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
