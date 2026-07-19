import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, ShieldAlert, Sparkles, User as UserIcon, LogOut, CheckCircle2, 
  MessageSquare, LayoutDashboard, ShoppingCart, HelpCircle, Trophy, Compass, SearchCheck 
} from "lucide-react";
import { User, SystemSettings } from "./types";
import { safeFetchJson } from "./utils/api";

// Modular Components Imports
import Home from "./components/Home";
import BuyRobux from "./components/BuyRobux";
import BuyItems from "./components/BuyItems";
import CheckTransaction from "./components/CheckTransaction";
import Leaderboard from "./components/Leaderboard";
import Reviews from "./components/Reviews";
import Help from "./components/Help";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";

export default function App() {
  // Navigation Routing States
  const [activePage, setActivePage] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dynamic system settings (from DB)
  const [settings, setSettings] = useState<SystemSettings>({
    logoText: "R8 Premium",
    contactEmail: "support@r8premium.com",
    whatsappContact: "6281234567890",
    instagramUrl: "https://instagram.com/r8.premium",
    discordUrl: "https://discord.gg/r8premium",
    primaryColor: "emerald"
  });

  // Track single transaction session parameters (redirected from checkouts)
  const [targetedTxId, setTargetedTxId] = useState<string | undefined>(undefined);

  // Toast notifier alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check localStorage on boot for session memory
  useEffect(() => {
    const savedUser = localStorage.getItem("r8_user_session");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("r8_user_session");
      }
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await safeFetchJson<SystemSettings>("/api/settings");
      setSettings(data);
    } catch (e: any) {
      console.error("Gagal memuat settings:", e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("r8_user_session", JSON.stringify(user));
    showToast(`Selamat datang kembali, ${user.username}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("r8_user_session");
    setActivePage("home");
    showToast("Anda telah keluar dari akun.");
  };

  const navigateToTracking = (txId: string) => {
    setTargetedTxId(txId);
    setActivePage("check-transaction");
  };

  // Menu lists
  const navLinks = [
    { id: "home", label: "Beranda", icon: <Compass size={14} /> },
    { id: "buy-robux", label: "Beli Robux", icon: <ShoppingCart size={14} /> },
    { id: "buy-items", label: "Beli Item", icon: <ShoppingCart size={14} /> },
    { id: "reviews", label: "Ulasan", icon: <MessageSquare size={14} /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={14} /> },
    { id: "check-transaction", label: "Cek Transaksi", icon: <SearchCheck size={14} /> },
    { id: "help", label: "Bantuan", icon: <HelpCircle size={14} /> }
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-[#f3f4f6] font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      
      {/* 1. TOAST NOTIFIER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-emerald-500 text-black font-semibold text-xs rounded-full shadow-lg shadow-emerald-500/25 font-sans border border-emerald-400 animate-pulse-ring"
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. AUTH MODAL WINDOW */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      {/* 3. PLATFORM HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-black/65 backdrop-blur-md border-b border-emerald-500/10 px-4 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo container */}
          <div 
            onClick={() => setActivePage("home")} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="px-2.5 py-1 text-xs font-black tracking-widest text-black bg-emerald-500 rounded font-display select-none animate-float">
              R8
            </span>
            <span className="text-base font-black tracking-tight text-white font-display group-hover:text-emerald-400 transition-colors">
              {settings.logoText}
            </span>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActivePage(link.id);
                  setTargetedTxId(undefined);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border focus:outline-none ${
                  activePage === link.id
                    ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/15 font-extrabold"
                    : "text-gray-400 border-transparent hover:text-white hover:bg-gray-900/40"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>

          {/* CTA & Profile triggers */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === "admin" && (
                  <button
                    id="nav-admin-btn"
                    onClick={() => setActivePage("admin")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      activePage === "admin"
                        ? "bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20 font-extrabold"
                        : "bg-transparent text-gray-400 border-gray-800 hover:text-white hover:bg-gray-900/40"
                    }`}
                  >
                    Admin Control
                  </button>
                )}
                
                <button
                  id="nav-dashboard-btn"
                  onClick={() => setActivePage("dashboard")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    activePage === "dashboard"
                      ? "bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20 font-extrabold"
                      : "bg-gray-900 text-gray-300 border-gray-800 hover:text-white hover:bg-gray-800/80"
                  }`}
                >
                  <UserIcon size={14} />
                  <span>{currentUser.username}</span>
                </button>
              </div>
            ) : (
              <button
                id="nav-auth-open-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                Login / Daftar
              </button>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <button
            id="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white transition-colors border border-transparent hover:border-gray-800 rounded-lg"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </header>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/90 backdrop-blur-md border-b border-emerald-500/10 overflow-hidden"
          >
            <div className="p-4 space-y-2 flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActivePage(link.id);
                    setTargetedTxId(undefined);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs font-bold transition-all flex items-center gap-3 border ${
                    activePage === link.id
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/15 font-extrabold"
                      : "text-gray-400 border-transparent hover:text-white hover:bg-gray-900/40"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}

              <div className="h-px bg-emerald-500/10 my-3"></div>

              {currentUser ? (
                <div className="space-y-2 flex flex-col">
                  {currentUser.role === "admin" && (
                    <button
                      onClick={() => {
                        setActivePage("admin");
                        setMobileMenuOpen(false);
                      }}
                      className="p-2.5 rounded-lg text-left text-xs font-bold text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 flex items-center gap-3"
                    >
                      <LayoutDashboard size={14} />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActivePage("dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className="p-2.5 rounded-lg text-left text-xs font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 flex items-center gap-3"
                  >
                    <UserIcon size={14} />
                    <span>Profil: {currentUser.username}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Masuk / Daftar Akun
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. PRIMARY LAYOUT MAIN ROUTER PANEL */}
      <main className="flex-grow py-6 sm:py-10 max-w-7xl w-full mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {activePage === "home" && <Home onNavigate={(page) => setActivePage(page)} />}
            
            {activePage === "buy-robux" && (
              <BuyRobux 
                currentUser={currentUser} 
                onNavigateToTx={navigateToTracking}
              />
            )}
            
            {activePage === "buy-items" && (
              <BuyItems 
                currentUser={currentUser} 
                onNavigateToTx={navigateToTracking}
              />
            )}
            
            {activePage === "check-transaction" && (
              <CheckTransaction 
                initialTxId={targetedTxId} 
                onClearInitial={() => setTargetedTxId(undefined)}
              />
            )}
            
            {activePage === "leaderboard" && <Leaderboard />}
            
            {activePage === "reviews" && <Reviews currentUser={currentUser} />}
            
            {activePage === "help" && <Help />}
            
            {activePage === "dashboard" && currentUser && (
              <Dashboard
                currentUser={currentUser}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  localStorage.setItem("r8_user_session", JSON.stringify(updated));
                }}
                onNavigateToTx={navigateToTracking}
                onLogout={handleLogout}
              />
            )}

            {activePage === "admin" && currentUser?.role === "admin" && (
              <AdminPanel currentUser={currentUser} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 6. PLATFORM SYSTEM FOOTER */}
      <footer className="bg-gray-950 border-t border-gray-900 py-10 px-4 text-center text-xs text-gray-500 space-y-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left space-y-2 max-w-sm">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 font-bold text-[10px] text-black bg-emerald-500 rounded font-display uppercase select-none">
                R8
              </span>
              <span className="text-sm font-bold text-white tracking-tight">{settings.logoText}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Pusat top up Robux legal premium murah dan terpercaya. R8 Premium berkomitmen melayani transaksi secepat kilat dengan perlindungan privasi tertinggi.
            </p>
          </div>

          {/* Social media links */}
          <div className="flex flex-col md:items-end gap-3 text-left md:text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Hubungi Kami</span>
            <div className="flex flex-wrap gap-3.5">
              <a 
                href={`https://wa.me/${settings.whatsappContact}`} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-emerald-400 transition-colors"
              >
                WhatsApp Support
              </a>
              <a 
                href={settings.instagramUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-emerald-400 transition-colors"
              >
                Instagram
              </a>
              <a 
                href={settings.discordUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-emerald-400 transition-colors"
              >
                Discord Server
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] max-w-7xl mx-auto">
          <p>© {new Date().getFullYear()} R8 Premium. All Roblox assets are property of Roblox Corporation. We are an independent legal seller.</p>
          <div className="flex gap-4">
            <span className="text-emerald-500 font-bold uppercase tracking-widest">SSL SECURED 256-BIT</span>
            <span>Syarat & Ketentuan</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
