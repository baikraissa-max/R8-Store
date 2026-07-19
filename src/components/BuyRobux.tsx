import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, CheckCircle2, AlertTriangle, ChevronRight, Loader2, CreditCard, Sparkles, ShieldCheck } from "lucide-react";
import { RobloxUser, RobuxPackage, Transaction, User as UserType } from "../types";

interface BuyRobuxProps {
  currentUser: UserType | null;
  onNavigateToTx: (txId: string) => void;
}

export default function BuyRobux({ currentUser, onNavigateToTx }: BuyRobuxProps) {
  // Username validation states
  const [username, setUsername] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validatedUser, setValidatedUser] = useState<RobloxUser | null>(null);
  const [validationError, setValidationError] = useState("");

  // Packages and selection states
  const [packages, setPackages] = useState<RobuxPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<RobuxPackage | null>(null);

  // Payment methods and selection
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Load username from logged-in user if available
  useEffect(() => {
    if (currentUser?.robloxUsername) {
      setUsername(currentUser.robloxUsername);
      validateRobloxUser(currentUser.robloxUsername);
    }
    fetchPackages();
  }, [currentUser]);

  const fetchPackages = async () => {
    setIsLoadingPackages(true);
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (response.ok) {
        setPackages(data);
      }
    } catch (e) {
      console.error("Gagal memuat produk Robux:", e);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const handleValidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    validateRobloxUser(username);
  };

  const validateRobloxUser = async (userStr: string) => {
    setIsValidating(true);
    setValidationError("");
    setValidatedUser(null);
    try {
      const response = await fetch(`/api/roblox/user/${encodeURIComponent(userStr.trim())}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal memverifikasi akun Roblox");
      }
      setValidatedUser(data);
    } catch (err: any) {
      setValidationError(err.message || "Nama akun Roblox tidak valid");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckout = async () => {
    if (!validatedUser || !selectedPackage || !selectedPayment) return;
    setIsSubmittingTx(true);

    try {
      const txPayload = {
        userId: currentUser?.id || undefined,
        robloxUsername: validatedUser.username,
        robloxDisplayName: validatedUser.displayName,
        robloxAvatar: validatedUser.avatarUrl,
        type: "Robux",
        productName: `${selectedPackage.amount} Robux Premium ${selectedPackage.bonusAmount > 0 ? `(+${selectedPackage.bonusAmount} Bonus)` : ""}`,
        amount: selectedPackage.amount,
        price: selectedPackage.price,
        paymentMethod: selectedPayment
      };

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat checkout transaksi");
      }

      // Redirect user to tracking page
      onNavigateToTx(data.transaction.id);
    } catch (e: any) {
      alert(e.message || "Checkout gagal diproses");
    } finally {
      setIsSubmittingTx(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  // Payment gateways options
  const paymentOptions = [
    { id: "QRIS", name: "QRIS", subtitle: "Instant Verification", logo: "⚡", category: "E-Wallet" },
    { id: "DANA", name: "DANA", subtitle: "Saldo E-Wallet", logo: "🔵", category: "E-Wallet" },
    { id: "OVO", name: "OVO", subtitle: "Saldo E-Wallet", logo: "🟣", category: "E-Wallet" },
    { id: "GoPay", name: "GoPay", subtitle: "Saldo E-Wallet", logo: "🟢", category: "E-Wallet" },
    { id: "ShopeePay", name: "ShopeePay", subtitle: "Saldo E-Wallet", logo: "🟠", category: "E-Wallet" },
    { id: "BCA", name: "BCA Virtual Account", subtitle: "Transfer Bank", logo: "🏦", category: "Virtual Account" },
    { id: "Mandiri", name: "Mandiri Virtual Account", subtitle: "Transfer Bank", logo: "🏦", category: "Virtual Account" },
    { id: "BNI", name: "BNI Virtual Account", subtitle: "Transfer Bank", logo: "🏦", category: "Virtual Account" }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 text-xs font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-display uppercase">
          Top Up Robux
        </span>
        <h1 className="text-3xl font-bold font-display text-white mt-3">
          Beli Robux Premium
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Top up Robux instant 24 jam legal 100%, aman dari ban, tanpa membutuhkan password akun Roblox Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step Columns 1 & 2 (Left & Middle) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Roblox Account Linker */}
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-black text-xs flex items-center justify-center font-bold">1</span>
              Verifikasi Akun Roblox
            </h2>

            <form onSubmit={handleValidateSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                  <User size={16} />
                </span>
                <input
                  id="robux-username-input"
                  type="text"
                  required
                  placeholder="Masukkan Username Roblox (Contoh: Builderman)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
              <button
                id="verify-robux-btn"
                type="submit"
                disabled={isValidating}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-black font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                {isValidating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  "Verifikasi Akun"
                )}
              </button>
            </form>

            {/* Validation Display Result */}
            <AnimatePresence mode="wait">
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 border border-red-500/20 bg-red-500/10 rounded-xl flex items-start gap-2.5"
                >
                  <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-red-400">
                    {validationError}. Periksa kembali penulisan username Roblox utama Anda.
                  </p>
                </motion.div>
              )}

              {validatedUser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={validatedUser.avatarUrl}
                      alt="Roblox Profile Avatar"
                      className="w-12 h-12 rounded-lg bg-gray-950 border border-gray-800 p-0.5"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Akun Roblox Ditemukan</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-0.5">{validatedUser.displayName}</h4>
                      <p className="text-xs text-gray-500 font-mono">@{validatedUser.username}</p>
                    </div>
                  </div>
                  
                  {validatedUser.isDemoFallback && (
                    <span className="text-[9px] font-semibold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded font-mono shrink-0">
                      Sandbox Demo Mode
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 2: Choose Robux Nominal Package */}
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-black text-xs flex items-center justify-center font-bold">2</span>
              Pilih Nominal Robux
            </h2>

            {isLoadingPackages ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="text-emerald-500 animate-spin" size={24} />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {packages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative p-4 rounded-xl border bg-gray-950/70 text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-32 focus:outline-none ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500"
                          : "border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-2.5 right-2 bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Terpopuler
                        </span>
                      )}

                      <div>
                        <span className="text-lg font-black text-white font-display block">
                          {pkg.amount.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                          Robux Premium
                        </span>
                        {pkg.bonusAmount > 0 && (
                          <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                            +{pkg.bonusAmount} Bonus
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5">
                        {pkg.originalPrice && (
                          <span className="text-[10px] text-gray-500 line-through block">
                            {formatIDR(pkg.originalPrice)}
                          </span>
                        )}
                        <span className="text-xs font-bold text-gray-200 block">
                          {formatIDR(pkg.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Select Payment Gateways */}
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-black text-xs flex items-center justify-center font-bold">3</span>
              Pilih Metode Pembayaran
            </h2>

            {/* Grouped by Categories */}
            {["E-Wallet", "Virtual Account"].map((cat) => (
              <div key={cat} className="mb-5 last:mb-0">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2.5">{cat}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {paymentOptions
                    .filter((opt) => opt.category === cat)
                    .map((opt) => {
                      const isSelected = selectedPayment === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedPayment(opt.id)}
                          className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 bg-gray-950/40 transition-all focus:outline-none ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500"
                              : "border-gray-800 hover:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl shrink-0">{opt.logo}</span>
                            <div>
                              <span className="text-xs font-bold text-white block">{opt.name}</span>
                              <span className="text-[10px] text-gray-500 block">{opt.subtitle}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-[10px]">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Sidebar Summary Card (Right) */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl sticky top-6 space-y-5">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase pb-3 border-b border-gray-800">
              Ringkasan Checkout
            </h3>

            {/* Dynamic details listing */}
            <div className="space-y-4">
              {/* Account details */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Tujuan Akun</span>
                {validatedUser ? (
                  <div className="flex items-center gap-2 p-2 bg-gray-950 border border-gray-800 rounded-lg">
                    <img
                      src={validatedUser.avatarUrl}
                      alt="Avatar thumbnail"
                      className="w-8 h-8 rounded p-0.5 bg-gray-900"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">
                      {validatedUser.displayName}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-red-400 italic block">Belum memverifikasi akun Roblox (Langkah 1)</span>
                )}
              </div>

              {/* Package details */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Paket Robux</span>
                {selectedPackage ? (
                  <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">{selectedPackage.amount} Robux</span>
                    <span className="text-gray-400">{formatIDR(selectedPackage.price)}</span>
                  </div>
                ) : (
                  <span className="text-xs text-yellow-500 italic block">Belum memilih paket Robux (Langkah 2)</span>
                )}
              </div>

              {/* Payment selection */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Metode Pembayaran</span>
                {selectedPayment ? (
                  <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                    {selectedPayment}
                  </div>
                ) : (
                  <span className="text-xs text-yellow-500 italic block">Belum memilih pembayaran (Langkah 3)</span>
                )}
              </div>

              {/* Price Calculation details */}
              {selectedPackage && (
                <div className="pt-3 border-t border-gray-800 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Harga Paket</span>
                    <span>{formatIDR(selectedPackage.price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Biaya Layanan</span>
                    <span className="text-emerald-400 font-semibold">Rp 0 (FREE)</span>
                  </div>
                  <div className="h-px bg-gray-800 my-2"></div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white">Total Tagihan</span>
                    <span className="text-emerald-400 text-base">{formatIDR(selectedPackage.price)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout CTA */}
            <button
              id="confirm-checkout-btn"
              onClick={handleCheckout}
              disabled={!validatedUser || !selectedPackage || !selectedPayment || isSubmittingTx}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmittingTx ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sedang Checkout...</span>
                </>
              ) : (
                <>
                  <span>Proses Pembelian</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            <div className="flex gap-2 p-3 bg-gray-950 border border-gray-800 rounded-xl">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-normal font-sans">
                Dengan mengklik tombol, Anda menyetujui Ketentuan R8. Pembayaran dienkripsi aman 256-bit SSL.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
