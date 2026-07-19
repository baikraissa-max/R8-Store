import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Loader2, ArrowRight, ShieldCheck, CreditCard, ShoppingBag, Calendar, User, Clock, AlertTriangle } from "lucide-react";
import { Transaction } from "../types";

interface CheckTransactionProps {
  initialTxId?: string;
  onClearInitial?: () => void;
}

export default function CheckTransaction({ initialTxId, onClearInitial }: CheckTransactionProps) {
  const [searchId, setSearchId] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [simulationLoading, setSimulationLoading] = useState(false);

  useEffect(() => {
    if (initialTxId) {
      setSearchId(initialTxId);
      fetchTransaction(initialTxId);
    }
  }, [initialTxId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    fetchTransaction(searchId);
  };

  const fetchTransaction = async (id: string) => {
    setIsLoading(true);
    setError("");
    setTransaction(null);

    try {
      const response = await fetch(`/api/transactions/${id.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ID Transaksi tidak ditemukan.");
      }

      setTransaction(data);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data transaksi");
    } finally {
      setIsLoading(false);
      if (onClearInitial) onClearInitial();
    }
  };

  // Development simulation helper
  const simulatePaymentSuccess = async () => {
    if (!transaction) return;
    setSimulationLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Berhasil", adminUsername: "Buyer (Simulation)" })
      });
      const data = await response.json();
      if (response.ok) {
        setTransaction(data.transaction);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulationLoading(false);
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "Menunggu Pembayaran":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Diproses":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "Berhasil":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "Gagal":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getStatusStepIndex = (status: Transaction["status"]) => {
    switch (status) {
      case "Menunggu Pembayaran": return 1;
      case "Diproses": return 2;
      case "Berhasil": return 3;
      case "Gagal": return 3;
      default: return 1;
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title section */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 text-xs font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-display uppercase">
          Pelacakan Pesanan
        </span>
        <h1 className="text-3xl font-bold font-display text-white mt-3">
          Cek Transaksi R8
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Pantau status pengiriman Robux atau Game Pass Anda secara real-time cukup dengan ID Transaksi.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <Search size={18} />
            </span>
            <input
              id="search-tx-id"
              type="text"
              required
              placeholder="Masukkan ID Transaksi (Contoh: R8-7281920)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono tracking-wider"
            />
          </div>
          <button
            id="search-tx-btn"
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-black font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>Lacak Pesanan</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 items-center text-xs text-gray-500">
          <span>Contoh ID transaksi untuk dicoba:</span>
          <button
            type="button"
            onClick={() => { setSearchId("R8-7281920"); fetchTransaction("R8-7281920"); }}
            className="px-2 py-0.5 bg-gray-950 border border-gray-800 rounded text-emerald-400 font-mono hover:border-emerald-500 transition-colors"
          >
            R8-7281920
          </button>
          <button
            type="button"
            onClick={() => { setSearchId("R8-1092837"); fetchTransaction("R8-1092837"); }}
            className="px-2 py-0.5 bg-gray-950 border border-gray-800 rounded text-emerald-400 font-mono hover:border-emerald-500 transition-colors"
          >
            R8-1092837
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 border border-red-500/20 bg-red-500/10 rounded-2xl flex items-start gap-3.5"
          >
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-400 text-sm">ID Transaksi Tidak Ditemukan</h3>
              <p className="text-xs text-gray-400 mt-1">
                Silakan periksa kembali ID Transaksi yang Anda masukkan. Pastikan penulisannya persis termasuk tanda strip (misalnya <strong className="font-mono text-white">R8-1234567</strong>). Jika masalah berlanjut, hubungi Bantuan R8.
              </p>
            </div>
          </motion.div>
        )}

        {transaction && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Status Flow Banner */}
            <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
                <div>
                  <span className="text-xs text-gray-500">ID TRANSAKSI</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h2 className="text-xl font-bold font-mono text-white tracking-wider">{transaction.id}</h2>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-xs text-gray-500">WAKTU PEMBELIAN</span>
                  <p className="text-sm text-gray-300 font-medium mt-0.5">
                    {new Date(transaction.createdAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div className="pt-8 pb-4">
                <div className="relative flex justify-between items-center max-w-xl mx-auto">
                  {/* Progress Line */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-800 rounded">
                    <div 
                      className={`h-full bg-emerald-500 transition-all duration-500 ${
                        getStatusStepIndex(transaction.status) === 1 ? "w-1/4" :
                        getStatusStepIndex(transaction.status) === 2 ? "w-2/3" : "w-full"
                      }`}
                    />
                  </div>

                  {/* Step 1: Created */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                      getStatusStepIndex(transaction.status) >= 1
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "bg-gray-900 border-gray-800 text-gray-500"
                    }`}>
                      1
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-300 mt-2 text-center">
                      Pesanan Dibuat
                    </span>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                      getStatusStepIndex(transaction.status) >= 2
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "bg-gray-900 border-gray-800 text-gray-500"
                    }`}>
                      2
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-300 mt-2 text-center">
                      Diproses
                    </span>
                  </div>

                  {/* Step 3: Finished / Failed */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                      transaction.status === "Gagal"
                        ? "bg-red-500 border-red-500 text-white"
                        : getStatusStepIndex(transaction.status) >= 3
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "bg-gray-900 border-gray-800 text-gray-500"
                    }`}>
                      3
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold mt-2 text-center ${
                      transaction.status === "Gagal" ? "text-red-400" : "text-gray-300"
                    }`}>
                      {transaction.status === "Gagal" ? "Gagal" : "Selesai"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split layout for buyer and purchase summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product & Payment Summary Card */}
              <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                    <ShoppingBag size={16} className="text-emerald-500" />
                    Rincian Pembelian
                  </h3>

                  <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Kategori Layanan</span>
                      <span className="font-semibold text-white">{transaction.type === "Robux" ? "Top Up Robux" : "Game Pass & Item"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Nama Produk</span>
                      <span className="font-semibold text-emerald-400">{transaction.productName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Jumlah Pembelian</span>
                      <span className="font-semibold text-white">{transaction.amount}x</span>
                    </div>
                    <div className="h-px bg-gray-800 my-2"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Total Tagihan</span>
                      <span className="font-bold text-white text-emerald-400">{formatIDR(transaction.price)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <CreditCard size={16} className="text-emerald-500 shrink-0" />
                    <span>Metode Pembayaran: <strong className="text-white">{transaction.paymentMethod}</strong></span>
                  </div>
                </div>

                {transaction.status === "Menunggu Pembayaran" && (
                  <div className="pt-4 mt-4 border-t border-gray-800">
                    <button
                      onClick={simulatePaymentSuccess}
                      disabled={simulationLoading}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      {simulationLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck size={14} />
                          <span>Simulasi Bayar Instan (Sandbox Devs)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Roblox Account Target Card */}
              <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2 mb-4">
                    <User size={16} className="text-emerald-500" />
                    Target Akun Roblox
                  </h3>

                  <div className="flex items-center gap-4 p-4 bg-gray-950 border border-gray-800 rounded-xl">
                    <img
                      src={transaction.robloxAvatar}
                      alt="Roblox Avatar"
                      className="w-16 h-16 rounded-xl bg-gray-900 border border-gray-800 p-1"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        Verifikasi Berhasil
                      </div>
                      <h4 className="font-bold text-white text-base mt-1">{transaction.robloxDisplayName}</h4>
                      <p className="text-xs text-gray-500 font-mono">@{transaction.robloxUsername}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-950/50 border border-gray-800 rounded-xl mt-4 text-[11px] text-gray-400 leading-relaxed flex gap-2">
                  <Clock size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    {transaction.status === "Menunggu Pembayaran" && "Silakan lakukan pembayaran sesuai nominal total tagihan sebelum masa tenggang habis."}
                    {transaction.status === "Diproses" && "Pesanan Anda sedang diantarkan secara otomatis oleh server R8. Estimasi 1 - 5 menit."}
                    {transaction.status === "Berhasil" && "Transaksi telah sukses terkirim ke saldo akun Roblox Anda. Terima kasih telah memilih R8 Premium!"}
                    {transaction.status === "Gagal" && "Maaf, transaksi gagal dikirim. Saldo Anda tidak berkurang. Silakan hubungi customer service kami."}
                  </span>
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            {transaction.status === "Menunggu Pembayaran" && transaction.paymentDetails && (
              <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2 mb-4">
                  <CreditCard size={16} className="text-emerald-500" />
                  Petunjuk Pembayaran
                </h3>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {transaction.paymentDetails.qrCodeUrl && (
                    <div className="w-40 h-40 bg-white p-2 rounded-xl border border-gray-800 shrink-0">
                      <img
                        src={transaction.paymentDetails.qrCodeUrl}
                        alt="QR Code QRIS"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="space-y-3 text-left">
                    {transaction.paymentDetails.vaNumber && (
                      <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl inline-block">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">No. Rekening / VA / E-wallet</span>
                        <span className="text-base font-mono font-bold text-white tracking-wider">{transaction.paymentDetails.vaNumber}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      {transaction.paymentDetails.instructions}
                    </p>
                    <ul className="text-[11px] text-gray-500 list-disc list-inside space-y-1 leading-normal">
                      <li>Gunakan nominal pas agar sistem kami mendeteksi otomatis.</li>
                      <li>Proses verifikasi transfer QRIS / VA berlangsung <strong>instant 10 detik</strong>.</li>
                      <li>Simpan screenshot bukti pembayaran untuk backup pelaporan CS.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
