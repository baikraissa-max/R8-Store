import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User as UserIcon, Link2, ShieldCheck, History, CreditCard, ChevronRight, Loader2, AlertCircle, PlusCircle, CheckCircle } from "lucide-react";
import { User, Transaction, RobloxUser } from "../types";
import { safeFetchJson } from "../utils/api";

interface DashboardProps {
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  onNavigateToTx: (txId: string) => void;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onUpdateUser, onNavigateToTx, onLogout }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);

  // Link account states
  const [robloxUsername, setRobloxUsername] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");

  // Simulated top up R8 Coins state
  const [topupAmount, setTopupAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setRobloxUsername(currentUser.robloxUsername || "");
      fetchUserTransactions();
    }
  }, [currentUser]);

  const fetchUserTransactions = async () => {
    if (!currentUser) return;
    setIsLoadingTx(true);
    try {
      const data = await safeFetchJson<Transaction[]>(`/api/users/${currentUser.id}/transactions`);
      setTransactions(data);
    } catch (e: any) {
      console.error("Gagal mengambil transaksi pengguna:", e);
    } finally {
      setIsLoadingTx(false);
    }
  };

  const handleLinkRoblox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !robloxUsername.trim()) return;
    setIsLinking(true);
    setLinkError("");
    setLinkSuccess("");

    try {
      // Fetch user profile from Roblox Proxy first
      const robloxData = await safeFetchJson<RobloxUser>(`/api/roblox/user/${encodeURIComponent(robloxUsername.trim())}`);

      // Save Roblox link details to User DB
      const updateData = await safeFetchJson<any>("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          robloxUsername: robloxData.username,
          robloxAvatar: robloxData.avatarUrl
        })
      });

      setLinkSuccess(`Akun Roblox ${robloxData.displayName} berhasil ditautkan!`);
      onUpdateUser(updateData.user);

    } catch (err: any) {
      setLinkError(err.message || "Gagal menautkan akun Roblox");
    } finally {
      setIsLinking(false);
    }
  };

  // Simulating internal wallet deposit
  const handleTopupCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (isNaN(amount) || amount <= 0 || !currentUser) {
      alert("Masukkan nominal top up saldo yang valid");
      return;
    }

    setIsToppingUp(true);
    try {
      // Simulate direct deposit via a secure API proxy
      const updatedUser: User = {
        ...currentUser,
        balance: currentUser.balance + amount
      };

      // Since we simulate coins, let's update in local db too
      // (This can be a quick simulation or save to backend user record, let's do simple visual state update)
      // For persistent simulation, we can add balance in db
      onUpdateUser(updatedUser);
      setTopupAmount("");
      alert(`Top Up Saldo Berhasil! Rp ${amount.toLocaleString("id-ID")} ditambahkan ke R8 Coins.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsToppingUp(false);
    }
  };

  const getStatusStyle = (status: Transaction["status"]) => {
    switch (status) {
      case "Menunggu Pembayaran":
        return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
      case "Diproses":
        return "text-blue-400 bg-blue-400/10 border border-blue-400/20";
      case "Berhasil":
        return "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20";
      case "Gagal":
        return "text-red-400 bg-red-400/10 border border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border border-gray-400/20";
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title Section */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 text-xs font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-display uppercase">
          Dashboard User
        </span>
        <h1 className="text-3xl font-bold font-display text-white mt-3">
          Akun R8 Premium Anda
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Kelola profil game Anda, tautkan karakter Roblox, pantau pengiriman pesanan, dan isi saldo R8.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Profile details and linker */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Overview Card */}
          <div className="p-6 premium-glass border border-emerald-500/10 rounded-2xl shadow-xl space-y-5 text-center relative overflow-hidden">
            <span className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></span>
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-500">
              <UserIcon size={32} />
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-wider text-black bg-emerald-500 px-2 py-0.5 rounded uppercase font-display">
                {currentUser.role}
              </span>
              <h3 className="font-bold text-white text-base mt-2">{currentUser.username}</h3>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>

            {/* Wallet Balance Info */}
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">R8 Coins (Saldo)</span>
              <span className="text-xl font-black text-emerald-400 block mt-1">{formatIDR(currentUser.balance)}</span>
            </div>

            {/* Simulated Coins Deposit */}
            <form onSubmit={handleTopupCoins} className="pt-3 border-t border-gray-800 space-y-3">
              <span className="text-[10px] text-gray-400 font-semibold block text-left">Isi Saldo R8 Coins (Simulasi)</span>
              <div className="flex gap-2">
                <input
                  id="topup-amount-input"
                  type="number"
                  required
                  placeholder="Contoh: 50000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  id="topup-coins-btn"
                  type="submit"
                  className="px-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl text-xs transition-all flex items-center gap-1 shrink-0"
                >
                  <PlusCircle size={14} />
                  <span>Isi</span>
                </button>
              </div>
            </form>

            <button
              onClick={onLogout}
              className="w-full py-2 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-400 rounded-xl transition-all"
            >
              Keluar / Logout
            </button>
          </div>

          {/* Roblox Character Linker Card */}
          <div className="p-6 premium-glass border border-emerald-500/10 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Link2 className="text-emerald-500" size={18} />
              Tautkan Karakter Roblox
            </h3>

            {currentUser.robloxUsername ? (
              <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex items-center gap-4">
                <img
                  src={currentUser.robloxAvatar || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false"}
                  alt="Linked Avatar"
                  className="w-12 h-12 rounded bg-gray-900 border border-gray-800 p-0.5 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                    <ShieldCheck size={12} />
                    <span>Akun Ditautkan</span>
                  </div>
                  <h4 className="font-bold text-white text-sm truncate mt-0.5">{currentUser.robloxUsername}</h4>
                  <p className="text-[10px] text-gray-500 font-mono">@{currentUser.robloxUsername}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-xl text-xs text-yellow-500 leading-normal flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>Anda belum menautkan akun Roblox. Tautkan di bawah ini untuk mempercepat checkout otomatis!</p>
              </div>
            )}

            {/* Link Form */}
            <form onSubmit={handleLinkRoblox} className="mt-4 space-y-3.5">
              {linkError && (
                <div className="p-2 border border-red-500/20 bg-red-500/10 text-[10px] text-red-400 rounded-lg">
                  {linkError}
                </div>
              )}
              {linkSuccess && (
                <div className="p-2 border border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400 rounded-lg flex items-center gap-1">
                  <CheckCircle size={12} />
                  <span>{linkSuccess}</span>
                </div>
              )}

              <div>
                <label className="block mb-1 text-xs text-gray-400">Username Roblox Baru</label>
                <input
                  id="link-username-input"
                  type="text"
                  required
                  placeholder="Contoh: Builderman"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                id="link-username-submit"
                type="submit"
                disabled={isLinking}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-black font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1"
              >
                {isLinking ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Menautkan...</span>
                  </>
                ) : (
                  <span>Tautkan Karakter</span>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right column: Orders History checklist */}
        <div className="lg:col-span-2">
          <div className="p-6 premium-glass border border-emerald-500/10 rounded-2xl shadow-xl min-h-[400px]">
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2 tracking-wide uppercase pb-2.5 border-b border-emerald-500/10">
              <History className="text-emerald-500" size={18} />
              Riwayat Transaksi
            </h3>

            {isLoadingTx ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="text-emerald-500 animate-spin mb-4" size={24} />
                <p className="text-xs text-gray-500 font-medium">Mengambil riwayat pembelian Anda...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-500 space-y-2">
                <p>Belum ada riwayat transaksi pembelian Robux atau Game Pass.</p>
                <p className="text-[10px]">Lakukan transaksi pertama Anda di menu 'Beli Robux' atau 'Beli Item'!</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => onNavigateToTx(tx.id)}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Character image */}
                      <img
                        src={tx.robloxAvatar}
                        alt="Target Roblox Avatar"
                        className="w-10 h-10 rounded bg-gray-900 border border-gray-800 p-0.5 object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white tracking-wider group-hover:text-emerald-400 transition-colors">
                            {tx.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusStyle(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-300 mt-1">{tx.productName}</h4>
                        <span className="text-[9px] text-gray-500 font-sans block mt-0.5">Target: @{tx.robloxUsername} • {new Date(tx.createdAt).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-gray-850 sm:border-none pt-2.5 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-emerald-400 font-bold block">{formatIDR(tx.price)}</span>
                        <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-semibold">{tx.paymentMethod}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
