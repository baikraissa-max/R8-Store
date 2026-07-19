import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, Loader2, AlertTriangle, User, CheckCircle2, ChevronRight, ShoppingCart } from "lucide-react";
import { GamePassItem, RobloxUser, User as UserType } from "../types";

interface BuyItemsProps {
  currentUser: UserType | null;
  onNavigateToTx: (txId: string) => void;
}

export default function BuyItems({ currentUser, onNavigateToTx }: BuyItemsProps) {
  const [items, setItems] = useState<GamePassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("orderIndex"); // priceAsc, priceDesc, orderIndex

  // Checkout modal states
  const [checkoutItem, setCheckoutItem] = useState<GamePassItem | null>(null);
  const [robloxUsername, setRobloxUsername] = useState("");
  const [isValidatingUser, setIsValidatingUser] = useState(false);
  const [validatedUser, setValidatedUser] = useState<RobloxUser | null>(null);
  const [validationError, setValidationError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("QRIS");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  useEffect(() => {
    fetchItems();
    if (currentUser?.robloxUsername) {
      setRobloxUsername(currentUser.robloxUsername);
      validateRobloxUser(currentUser.robloxUsername);
    }
  }, [currentUser]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      if (response.ok) {
        setItems(data);
      }
    } catch (e) {
      console.error("Gagal mengambil Game Pass:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const validateRobloxUser = async (userStr: string) => {
    if (!userStr.trim()) return;
    setIsValidatingUser(true);
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
      setIsValidatingUser(false);
    }
  };

  const handleOpenCheckout = (item: GamePassItem) => {
    setCheckoutItem(item);
    if (currentUser?.robloxUsername) {
      setRobloxUsername(currentUser.robloxUsername);
      validateRobloxUser(currentUser.robloxUsername);
    }
  };

  const handleCloseCheckout = () => {
    setCheckoutItem(null);
    if (!currentUser) {
      setRobloxUsername("");
      setValidatedUser(null);
    }
    setValidationError("");
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatedUser || !checkoutItem || !selectedPayment) return;
    setIsSubmittingTx(true);

    try {
      const txPayload = {
        userId: currentUser?.id || undefined,
        robloxUsername: validatedUser.username,
        robloxDisplayName: validatedUser.displayName,
        robloxAvatar: validatedUser.avatarUrl,
        type: "Item",
        productName: `${checkoutItem.name} (${checkoutItem.gameName})`,
        amount: 1,
        price: checkoutItem.price,
        paymentMethod: selectedPayment
      };

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal checkout Game Pass");
      }

      handleCloseCheckout();
      onNavigateToTx(data.transaction.id);
    } catch (err: any) {
      alert(err.message || "Gagal melakukan pemesanan");
    } finally {
      setIsSubmittingTx(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  // Get unique categories for tab filter
  const categories = ["Semua", ...Array.from(new Set(items.map(item => item.category)))];

  // Filtering and sorting logic
  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.gameName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "priceDesc") return b.price - a.price;
      return a.orderIndex - b.orderIndex;
    });

  // Payment gateways options
  const paymentOptions = [
    { id: "QRIS", name: "QRIS", detail: "Proses Instant 10 Detik" },
    { id: "DANA", name: "DANA Transfer" },
    { id: "OVO", name: "OVO Transfer" },
    { id: "GoPay", name: "GoPay Transfer" },
    { id: "BCA", name: "BCA Virtual Account" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 text-xs font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-display uppercase">
          Toko Roblox
        </span>
        <h1 className="text-3xl font-bold font-display text-white mt-3">
          Beli Game Pass & Item Roblox
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Miliki item premium, game passes terpopuler Blox Fruits, Pet Simulator 99, dan Adopt Me legal instan.
        </p>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-lg mb-6">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
            <Search size={16} />
          </span>
          <input
            id="item-search-input"
            type="text"
            placeholder="Cari Game Pass atau Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Categories select row inside filter */}
        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-black shadow"
                  : "bg-gray-950 text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort drop downs */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t border-gray-800 md:border-none pt-3 md:pt-0">
          <SlidersHorizontal size={14} className="text-emerald-500" />
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Urutkan:</span>
          <select
            id="item-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-950 border border-gray-800 text-xs text-white rounded-xl py-1.5 px-3 focus:outline-none focus:border-emerald-500"
          >
            <option value="orderIndex">Default R8</option>
            <option value="priceAsc">Harga Terendah</option>
            <option value="priceDesc">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Grid Cards Container */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="text-emerald-500 animate-spin mb-4" size={32} />
          <p className="text-xs text-gray-500">Menghubungkan ke katalog R8 Store...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-700 transition-all flex flex-col justify-between h-96"
            >
              {/* Product Thumbnail Banner */}
              <div className="h-44 w-full relative overflow-hidden bg-gray-950">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-emerald-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-display shadow">
                  {item.category}
                </span>
              </div>

              {/* Product Description */}
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono block uppercase">{item.gameName}</span>
                  <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800/65 flex items-end justify-between">
                  <div>
                    {item.originalPrice && (
                      <span className="text-[10px] text-gray-500 line-through block">
                        {formatIDR(item.originalPrice)}
                      </span>
                    )}
                    <span className="text-sm font-extrabold text-white text-emerald-400 font-display">
                      {formatIDR(item.price)}
                    </span>
                  </div>

                  <button
                    id={`buy-item-btn-${item.id}`}
                    onClick={() => handleOpenCheckout(item)}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-1 text-xs font-bold"
                  >
                    <ShoppingCart size={14} />
                    <span>Beli</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-gray-500">
              Tidak ada Game Pass atau Item yang cocok dengan kriteria pencarian Anda.
            </div>
          )}
        </div>
      )}

      {/* Integrated Checkout Slide Modal */}
      <AnimatePresence>
        {checkoutItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold text-black bg-emerald-500 rounded font-display uppercase">
                    R8 STORE
                  </span>
                  <h3 className="font-bold text-white text-sm">Checkout Game Pass</h3>
                </div>
                <button
                  onClick={handleCloseCheckout}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Batal
                </button>
              </div>

              {/* Modal form */}
              <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
                {/* Product Summary Mini Card */}
                <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl flex items-center gap-3">
                  <img
                    src={checkoutItem.imageUrl}
                    alt={checkoutItem.name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-900"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[9px] text-emerald-500 uppercase font-bold font-mono block">{checkoutItem.gameName}</span>
                    <h4 className="font-bold text-sm text-white">{checkoutItem.name}</h4>
                    <span className="text-xs font-bold text-emerald-400 block mt-1">{formatIDR(checkoutItem.price)}</span>
                  </div>
                </div>

                {/* Step 1: Roblox Username Linking */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-400">Username Target Roblox</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <User size={14} />
                      </span>
                      <input
                        id="modal-username-input"
                        type="text"
                        required
                        placeholder="Contoh: LuffyRBLX"
                        value={robloxUsername}
                        onChange={(e) => setRobloxUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      id="modal-verify-btn"
                      type="button"
                      onClick={() => validateRobloxUser(robloxUsername)}
                      disabled={isValidatingUser}
                      className="px-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-950 text-white font-semibold rounded-xl text-[10px] transition-all"
                    >
                      {isValidatingUser ? "Validasi..." : "Verifikasi"}
                    </button>
                  </div>

                  {/* Feedback display */}
                  {validationError && (
                    <div className="p-2 border border-red-500/20 bg-red-500/10 rounded-lg text-[10px] text-red-400 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {validatedUser && (
                    <div className="p-2 border border-emerald-500/20 bg-emerald-500/5 rounded-lg text-[10px] text-emerald-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={validatedUser.avatarUrl}
                          alt="Verification visual"
                          className="w-7 h-7 rounded bg-gray-900 border border-gray-800 p-0.5"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-white">{validatedUser.displayName} (@{validatedUser.username})</span>
                      </div>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded font-bold uppercase">Ready</span>
                    </div>
                  )}
                </div>

                {/* Step 2: Choose Payment */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-400">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedPayment(opt.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition-all focus:outline-none ${
                          selectedPayment === opt.id
                            ? "border-emerald-500 bg-emerald-500/5 text-white"
                            : "border-gray-800 hover:border-gray-700 text-gray-400"
                        }`}
                      >
                        <span>{opt.name}</span>
                        {selectedPayment === opt.id && (
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-black font-extrabold text-[8px]">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Calculation & Submit */}
                <div className="pt-4 border-t border-gray-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Total Pembayaran</span>
                    <span className="font-extrabold text-sm text-emerald-400">{formatIDR(checkoutItem.price)}</span>
                  </div>

                  <button
                    id="modal-checkout-submit"
                    type="submit"
                    disabled={!validatedUser || isSubmittingTx}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingTx ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>Lanjutkan Checkout</span>
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-gray-500">
                    Sistem R8 otomatis mengamankan transaksi Anda. Tidak meminta kata sandi Roblox.
                  </p>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
