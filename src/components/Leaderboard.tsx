import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Medal, Loader2, Calendar, TrendingUp, Users } from "lucide-react";
import { LeaderboardEntry } from "../types";

export default function Leaderboard() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "alltime">("alltime");
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?period=${period}`);
      const data = await response.json();
      if (response.ok) {
        setLeaders(data);
      }
    } catch (e) {
      console.error("Gagal memuat leaderboard:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 animate-ping"></span>
            <Trophy className="text-yellow-400 relative z-10" size={24} />
          </div>
        );
      case 2:
        return <Medal className="text-gray-300" size={22} />;
      case 3:
        return <Medal className="text-amber-600" size={22} />;
      default:
        return <span className="font-mono font-bold text-gray-500 text-sm">#{rank}</span>;
    }
  };

  const getPodiumRing = (rank: number) => {
    switch (rank) {
      case 1: return "ring-4 ring-yellow-400/50 shadow-lg shadow-yellow-500/10 scale-105 border-yellow-400";
      case 2: return "ring-2 ring-gray-400/30 shadow-md shadow-gray-400/5 border-gray-400";
      case 3: return "ring-2 ring-amber-700/30 shadow-md shadow-amber-800/5 border-amber-800";
      default: return "border-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Section */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 text-xs font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-display uppercase">
          Komunitas R8
        </span>
        <h1 className="text-3xl font-bold font-display text-white mt-3">
          Leaderboard Pelanggan
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Daftar apresiasi pelanggan premium sultan dengan total pembelian tertinggi di platform R8.
        </p>
      </div>

      {/* Period Select Bar */}
      <div className="flex justify-center mb-8">
        <div className="p-1 bg-gray-900 border border-gray-800 rounded-xl flex gap-1">
          <button
            id="period-daily-btn"
            onClick={() => setPeriod("daily")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === "daily" ? "bg-emerald-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Harian
          </button>
          <button
            id="period-weekly-btn"
            onClick={() => setPeriod("weekly")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === "weekly" ? "bg-emerald-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Mingguan
          </button>
          <button
            id="period-monthly-btn"
            onClick={() => setPeriod("monthly")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === "monthly" ? "bg-emerald-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Bulanan
          </button>
          <button
            id="period-alltime-btn"
            onClick={() => setPeriod("alltime")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === "alltime" ? "bg-emerald-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Semua Waktu
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="text-emerald-500 animate-spin mb-4" size={32} />
            <p className="text-xs text-gray-500">Mengkalkulasi total transaksi para sultan...</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Podium layout for top 3 users */}
            {leaders.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 items-end mb-8 pt-8 max-w-2xl mx-auto">
                {/* 2nd Place */}
                <div className="flex flex-col items-center order-1 text-center">
                  <div className="relative mb-3">
                    <img
                      src={leaders[1].robloxAvatar || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false"}
                      alt={leaders[1].username}
                      className={`w-16 h-16 rounded-full bg-gray-950 border p-1 ${getPodiumRing(2)}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-2 -right-1 bg-gray-900 border border-gray-800 text-gray-300 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-white truncate max-w-[90px]">{leaders[1].username}</h3>
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">{formatIDR(leaders[1].totalSpent)}</p>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center order-2 text-center pb-4">
                  <div className="relative mb-3">
                    <img
                      src={leaders[0].robloxAvatar || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false"}
                      alt={leaders[0].username}
                      className={`w-20 h-20 rounded-full bg-gray-950 border p-1 ${getPodiumRing(1)}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-2 -right-1 bg-yellow-500 text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow shadow-yellow-500/30">
                      👑
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-yellow-400 truncate max-w-[120px]">{leaders[0].username}</h3>
                  <p className="text-xs text-yellow-500 font-bold mt-1">{formatIDR(leaders[0].totalSpent)}</p>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center order-3 text-center">
                  <div className="relative mb-3">
                    <img
                      src={leaders[2].robloxAvatar || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false"}
                      alt={leaders[2].username}
                      className={`w-14 h-14 rounded-full bg-gray-950 border p-1 ${getPodiumRing(3)}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-2 -right-1 bg-gray-900 border border-gray-800 text-amber-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                      3
                    </div>
                  </div>
                  <h3 className="font-bold text-xs text-white truncate max-w-[90px]">{leaders[2].username}</h3>
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">{formatIDR(leaders[2].totalSpent)}</p>
                </div>
              </div>
            )}

            {/* List Layout for Leaderboard Entries */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <Users size={14} />
                  <span>Daftar Sultan R8</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <TrendingUp size={14} />
                  <span>Update Otomatis</span>
                </div>
              </div>

              {leaders.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  Belum ada riwayat transaksi pada periode ini.
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {leaders.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                        idx === 0 ? "bg-yellow-500/5 hover:bg-yellow-500/10" : "hover:bg-gray-800/35"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Position */}
                        <div className="w-8 flex justify-center shrink-0">
                          {getRankBadge(idx + 1)}
                        </div>

                        {/* Roblox Avatar */}
                        <img
                          src={entry.robloxAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.username}`}
                          alt={entry.username}
                          className="w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 p-0.5 object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />

                        {/* Username & Metadata */}
                        <div>
                          <span className="font-bold text-sm text-white block hover:text-emerald-400 transition-colors">
                            {entry.username}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono block">Roblox: @{entry.robloxUsername || "Not linked"}</span>
                        </div>
                      </div>

                      {/* Total Expenditure */}
                      <div className="text-right">
                        <span className={`text-sm font-bold block ${idx === 0 ? "text-yellow-500" : "text-white"}`}>
                          {formatIDR(entry.totalSpent)}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold font-sans">
                          SULTAN VIP
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
