import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, ShoppingCart, Package, Sparkles, MessageSquare, Users, Settings, ScrollText, 
  Trash2, Plus, Edit2, Loader2, Check, X, ShieldAlert, AlertCircle, Save 
} from "lucide-react";
import { 
  User, RobuxPackage, GamePassItem, Banner, Review, Transaction, AdminLog, SystemSettings 
} from "../types";
import { safeFetchJson } from "../utils/api";

interface AdminPanelProps {
  currentUser: User | null;
}

type AdminSection = "stats" | "orders" | "robux" | "items" | "banners" | "reviews" | "users" | "settings" | "logs";

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("stats");
  const [isLoading, setIsLoading] = useState(true);

  // Database lists
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [robuxPackages, setRobuxPackages] = useState<RobuxPackage[]>([]);
  const [gamePassItems, setGamePassItems] = useState<GamePassItem[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  // Modals / Forms states
  const [showAddRobuxModal, setShowAddRobuxModal] = useState(false);
  const [showAddGamePassModal, setShowAddGamePassModal] = useState(false);
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);

  // Form Fields
  const [robuxForm, setRobuxForm] = useState({ amount: "", bonusAmount: "", price: "", originalPrice: "", isPopular: false, active: true });
  const [gamePassForm, setGamePassForm] = useState({ name: "", gameName: "", price: "", originalPrice: "", category: "Blox Fruits", imageUrl: "", active: true });
  const [bannerForm, setBannerForm] = useState({ imageUrl: "", title: "", subtitle: "", link: "", active: true });
  const [settingsForm, setSettingsForm] = useState({ logoText: "", contactEmail: "", whatsappContact: "", instagramUrl: "", discordUrl: "" });

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchAllAdminData();
    }
  }, [currentUser]);

  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [txs, pkgs, items, bns, revs, usrs, sets, logs] = await Promise.all([
        safeFetchJson<Transaction[]>("/api/admin/transactions"),
        safeFetchJson<RobuxPackage[]>("/api/products?admin=true"),
        safeFetchJson<GamePassItem[]>("/api/items?admin=true"),
        safeFetchJson<Banner[]>("/api/banners?admin=true"),
        safeFetchJson<Review[]>("/api/admin/reviews"),
        safeFetchJson<User[]>("/api/admin/users"),
        safeFetchJson<SystemSettings>("/api/settings"),
        safeFetchJson<AdminLog[]>("/api/admin/logs")
      ]);

      setTransactions(txs);
      setRobuxPackages(pkgs);
      setGamePassItems(items);
      setBanners(bns);
      setReviews(revs);
      setUsers(usrs);
      setSettings(sets);
      setSettingsForm(sets);
      setAdminLogs(logs);

    } catch (e) {
      console.error("Gagal memuat dashboard admin:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Status order changer
  const handleUpdateOrderStatus = async (txId: string, status: string) => {
    try {
      await safeFetchJson<any>(`/api/transactions/${txId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminUsername: currentUser?.username || "admin" })
      });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Add Robux Package
  const handleAddRobux = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson<any>("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...robuxForm, adminUsername: currentUser?.username })
      });
      setShowAddRobuxModal(false);
      setRobuxForm({ amount: "", bonusAmount: "", price: "", originalPrice: "", isPopular: false, active: true });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Robux Package
  const handleDeleteRobux = async (id: string) => {
    if (!confirm("Hapus produk Robux ini?")) return;
    try {
      await safeFetchJson<any>(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: currentUser?.username })
      });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Add Game Pass
  const handleAddGamePass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson<any>("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gamePassForm, adminUsername: currentUser?.username })
      });
      setShowAddGamePassModal(false);
      setGamePassForm({ name: "", gameName: "", price: "", originalPrice: "", category: "Blox Fruits", imageUrl: "", active: true });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Game Pass
  const handleDeleteGamePass = async (id: string) => {
    if (!confirm("Hapus Game Pass ini dari toko?")) return;
    try {
      await safeFetchJson<any>(`/api/items/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: currentUser?.username })
      });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Add Promo Banner
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson<any>("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bannerForm, adminUsername: currentUser?.username })
      });
      setShowAddBannerModal(false);
      setBannerForm({ imageUrl: "", title: "", subtitle: "", link: "", active: true });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Hapus banner promo ini?")) return;
    try {
      await safeFetchJson<any>(`/api/banners/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: currentUser?.username })
      });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Approve review testimonial
  const handleApproveReview = async (id: string) => {
    try {
      await safeFetchJson<any>(`/api/reviews/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: currentUser?.username })
      });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete testimonial
  const handleDeleteReview = async (id: string) => {
    try {
      await safeFetchJson<any>(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: currentUser?.username })
      });
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Save Config Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson<any>("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsForm, adminUsername: currentUser?.username })
      });
      alert("Konfigurasi website berhasil disimpan!");
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations
  const totalRevenue = transactions
    .filter(t => t.status === "Berhasil")
    .reduce((sum, t) => sum + t.price, 0);

  const pendingOrders = transactions.filter(t => t.status === "Diproses" || t.status === "Menunggu Pembayaran").length;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  // Render check for admin only
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="text-red-500 mx-auto" size={48} />
        <h2 className="text-xl font-bold text-white">Akses Ditolak / Forbidden</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Halaman panel admin ini hanya dapat diakses oleh akun dengan role administrator. Silakan login menggunakan akun administrator R8 Premium.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold text-black bg-emerald-500 rounded font-display uppercase tracking-wider">
            Admin Panel
          </span>
          <h1 className="text-2xl font-bold font-display text-white mt-1.5 flex items-center gap-2">
            R8 Control Center
          </h1>
          <p className="text-xs text-gray-400">
            Selamat datang, <strong className="text-white">{currentUser.username}</strong>. Kelola keuangan, produk, banner, ulasan, dan sistem secara real-time.
          </p>
        </div>

        {/* Sync Trigger */}
        <button
          onClick={fetchAllAdminData}
          className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-emerald-400 rounded-lg transition-all"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar menu (1 col) */}
        <div className="lg:col-span-1 space-y-2.5">
          <button
            onClick={() => setActiveSection("stats")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border ${
              activeSection === "stats" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <BarChart3 size={16} />
            <span>Dashboard Statistik</span>
          </button>
          <button
            onClick={() => setActiveSection("orders")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border ${
              activeSection === "orders" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={16} />
              <span>Kelola Pesanan</span>
            </div>
            {pendingOrders > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${activeSection === "orders" ? "bg-black text-emerald-400" : "bg-emerald-500 text-black"}`}>
                {pendingOrders}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection("robux")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border ${
              activeSection === "robux" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <Package size={16} />
            <span>Katalog Robux</span>
          </button>
          <button
            onClick={() => setActiveSection("items")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border ${
              activeSection === "items" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <Package size={16} />
            <span>Katalog Game Pass</span>
          </button>
          <button
            onClick={() => setActiveSection("banners")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border ${
              activeSection === "banners" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <Sparkles size={16} />
            <span>Banner Promo</span>
          </button>
          <button
            onClick={() => setActiveSection("reviews")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border ${
              activeSection === "reviews" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <MessageSquare size={16} />
            <span>Moderasi Ulasan</span>
          </button>
          <button
            onClick={() => setActiveSection("users")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border ${
              activeSection === "users" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <Users size={16} />
            <span>Kelola Pengguna</span>
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border ${
              activeSection === "settings" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <Settings size={16} />
            <span>Pengaturan Website</span>
          </button>
          <button
            onClick={() => setActiveSection("logs")}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border ${
              activeSection === "logs" ? "bg-emerald-500 text-black shadow-lg border-emerald-500" : "bg-black/35 text-gray-400 border-emerald-500/5 hover:text-white"
            }`}
          >
            <ScrollText size={16} />
            <span>Log Aktivitas</span>
          </button>
        </div>

        {/* Content Section Area (3 cols) */}
        <div className="lg:col-span-3 premium-glass border border-emerald-500/15 rounded-2xl p-6 min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="text-emerald-500 animate-spin mb-4" size={32} />
              <p className="text-xs text-gray-500">Menghubungkan ke secure R8 database server...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* SECTION: STATS STATISTICS */}
              {activeSection === "stats" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-white font-display">Dashboard Statistik Ringkasan</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Revenue Card */}
                    <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Total Omset</span>
                      <span className="text-lg font-extrabold text-emerald-400 block mt-1">{formatIDR(totalRevenue)}</span>
                    </div>
                    {/* Transactions Total */}
                    <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Total Transaksi</span>
                      <span className="text-lg font-extrabold text-white block mt-1">{transactions.length} Pesanan</span>
                    </div>
                    {/* Pending orders */}
                    <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Antrean Diproses</span>
                      <span className="text-lg font-extrabold text-yellow-500 block mt-1">{pendingOrders} Antrean</span>
                    </div>
                    {/* Active users */}
                    <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Total Gamer R8</span>
                      <span className="text-lg font-extrabold text-white block mt-1">{users.length} User</span>
                    </div>
                  </div>

                  {/* Recent Activity Log Preview on stats */}
                  <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Histori Log Aktivitas Terakhir</h3>
                    <div className="space-y-2 text-[11px]">
                      {adminLogs.slice(0, 4).map(l => (
                        <div key={l.id} className="flex justify-between items-start gap-4 border-b border-gray-900 pb-2 last:border-0 last:pb-0 text-gray-400">
                          <span>
                            <strong className="text-gray-300">@{l.adminUsername}</strong>: {l.details}
                          </span>
                          <span className="text-[9px] text-gray-600 shrink-0">{new Date(l.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: ORDERS LIST MANAGER */}
              {activeSection === "orders" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                    <h2 className="text-lg font-bold text-white font-display">Kelola Semua Pesanan Pelanggan</h2>
                    <span className="text-[10px] text-gray-500">TOTAL: {transactions.length}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                      <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-3">ID Transaksi</th>
                          <th className="p-3">Roblox</th>
                          <th className="p-3">Produk / Total</th>
                          <th className="p-3">Metode</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Ubah Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-950/40">
                            <td className="p-3 font-mono font-bold text-white">{tx.id}</td>
                            <td className="p-3">
                              <span className="font-bold text-gray-200">@{tx.robloxUsername}</span>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-emerald-400">{tx.productName}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">{formatIDR(tx.price)}</div>
                            </td>
                            <td className="p-3 uppercase font-semibold font-mono">{tx.paymentMethod}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                tx.status === "Berhasil" ? "text-emerald-400 bg-emerald-500/10" :
                                tx.status === "Diproses" ? "text-blue-400 bg-blue-500/10" :
                                tx.status === "Gagal" ? "text-red-400 bg-red-500/10" : "text-yellow-400 bg-yellow-500/10"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <select
                                id={`status-select-${tx.id}`}
                                value={tx.status}
                                onChange={(e) => handleUpdateOrderStatus(tx.id, e.target.value)}
                                className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                              >
                                <option value="Menunggu Pembayaran">Menunggu</option>
                                <option value="Diproses">Diproses</option>
                                <option value="Berhasil">Berhasil</option>
                                <option value="Gagal">Gagal</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: ROBUX CATALOG MANAGER */}
              {activeSection === "robux" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                    <h2 className="text-lg font-bold text-white font-display">Katalog Produk Robux Premium</h2>
                    <button
                      id="admin-add-robux-btn"
                      onClick={() => setShowAddRobuxModal(true)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Tambah Robux</span>
                    </button>
                  </div>

                  {/* Add Robux modal overlay inside admin panel container */}
                  {showAddRobuxModal && (
                    <form onSubmit={handleAddRobux} className="p-5 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-white">Tambah Paket Robux Baru</h4>
                        <button type="button" onClick={() => setShowAddRobuxModal(false)} className="text-gray-500 text-xs">Batal</button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Jumlah Robux</label>
                          <input
                            id="robux-form-amount"
                            type="number"
                            required
                            placeholder="Contoh: 800"
                            value={robuxForm.amount}
                            onChange={(e) => setRobuxForm({ ...robuxForm, amount: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Bonus Robux</label>
                          <input
                            id="robux-form-bonus"
                            type="number"
                            placeholder="Contoh: 50"
                            value={robuxForm.bonusAmount}
                            onChange={(e) => setRobuxForm({ ...robuxForm, bonusAmount: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Harga (Rupiah)</label>
                          <input
                            id="robux-form-price"
                            type="number"
                            required
                            placeholder="Contoh: 115000"
                            value={robuxForm.price}
                            onChange={(e) => setRobuxForm({ ...robuxForm, price: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Harga Coret (Original)</label>
                          <input
                            id="robux-form-original-price"
                            type="number"
                            placeholder="Contoh: 140000"
                            value={robuxForm.originalPrice}
                            onChange={(e) => setRobuxForm({ ...robuxForm, originalPrice: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-gray-300">
                          <input
                            id="robux-form-popular"
                            type="checkbox"
                            checked={robuxForm.isPopular}
                            onChange={(e) => setRobuxForm({ ...robuxForm, isPopular: e.target.checked })}
                          />
                          <span>Jadikan Terpopuler</span>
                        </label>
                      </div>

                      <button
                        id="robux-form-submit"
                        type="submit"
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-lg"
                      >
                        Simpan Produk Robux
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {robuxPackages.map((pkg) => (
                      <div key={pkg.id} className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex justify-between items-center">
                        <div>
                          <h4 className="font-extrabold text-sm text-white">
                            {pkg.amount.toLocaleString("id-ID")} Robux 
                            {pkg.bonusAmount > 0 && <span className="text-xs font-semibold text-emerald-400 ml-1.5">+{pkg.bonusAmount} Bonus</span>}
                          </h4>
                          <span className="text-xs text-gray-400 block mt-1">Harga: {formatIDR(pkg.price)}</span>
                        </div>

                        <button
                          id={`delete-robux-btn-${pkg.id}`}
                          onClick={() => handleDeleteRobux(pkg.id)}
                          className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors focus:outline-none"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: GAME PASS CATALOG MANAGER */}
              {activeSection === "items" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                    <h2 className="text-lg font-bold text-white font-display">Kelola Katalog Game Pass & Item</h2>
                    <button
                      id="admin-add-gamepass-btn"
                      onClick={() => setShowAddGamePassModal(true)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Tambah Item</span>
                    </button>
                  </div>

                  {/* Add Game Pass Form Box */}
                  {showAddGamePassModal && (
                    <form onSubmit={handleAddGamePass} className="p-5 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-white">Tambah Game Pass Baru</h4>
                        <button type="button" onClick={() => setShowAddGamePassModal(false)} className="text-gray-500 text-xs">Batal</button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Nama Item</label>
                          <input
                            id="gp-form-name"
                            type="text"
                            required
                            placeholder="Contoh: Fruit Notifier"
                            value={gamePassForm.name}
                            onChange={(e) => setGamePassForm({ ...gamePassForm, name: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Nama Game</label>
                          <input
                            id="gp-form-game"
                            type="text"
                            required
                            placeholder="Contoh: Blox Fruits"
                            value={gamePassForm.gameName}
                            onChange={(e) => setGamePassForm({ ...gamePassForm, gameName: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Harga (Rupiah)</label>
                          <input
                            id="gp-form-price"
                            type="number"
                            required
                            placeholder="Contoh: 150000"
                            value={gamePassForm.price}
                            onChange={(e) => setGamePassForm({ ...gamePassForm, price: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Kategori Filter</label>
                          <select
                            id="gp-form-category"
                            value={gamePassForm.category}
                            onChange={(e) => setGamePassForm({ ...gamePassForm, category: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          >
                            <option value="Blox Fruits">Blox Fruits</option>
                            <option value="Pet Simulator 99">Pet Simulator 99</option>
                            <option value="Adopt Me">Adopt Me</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Image URL (Tautan Gambar Unsplash / Roblox)</label>
                        <input
                          id="gp-form-image"
                          type="text"
                          required
                          placeholder="https://images.unsplash.com/..."
                          value={gamePassForm.imageUrl}
                          onChange={(e) => setGamePassForm({ ...gamePassForm, imageUrl: e.target.value })}
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <button
                        id="gp-form-submit"
                        type="submit"
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-lg"
                      >
                        Simpan Game Pass
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gamePassItems.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt="Item preview"
                            className="w-10 h-10 object-cover rounded bg-gray-900"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-white leading-snug">{item.name}</h4>
                            <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">{item.category} • {formatIDR(item.price)}</span>
                          </div>
                        </div>

                        <button
                          id={`delete-gamepass-btn-${item.id}`}
                          onClick={() => handleDeleteGamePass(item.id)}
                          className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors focus:outline-none shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PROMO BANNER MANAGER */}
              {activeSection === "banners" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                    <h2 className="text-lg font-bold text-white font-display">Kelola Banner Slide Promo Beranda</h2>
                    <button
                      id="admin-add-banner-btn"
                      onClick={() => setShowAddBannerModal(true)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Tambah Banner</span>
                    </button>
                  </div>

                  {showAddBannerModal && (
                    <form onSubmit={handleAddBanner} className="p-5 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-white">Tambah Banner Promo</h4>
                        <button type="button" onClick={() => setShowAddBannerModal(false)} className="text-gray-500 text-xs">Batal</button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Judul Banner</label>
                          <input
                            id="banner-form-title"
                            type="text"
                            required
                            placeholder="Contoh: PROMO MEGA SALE"
                            value={bannerForm.title}
                            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Sub-Judul / Deskripsi</label>
                          <input
                            id="banner-form-desc"
                            type="text"
                            required
                            placeholder="Contoh: Hemat 10% pembayaran QRIS"
                            value={bannerForm.subtitle}
                            onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">Tautan Gambar Banner URL</label>
                          <input
                            id="banner-form-image"
                            type="text"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={bannerForm.imageUrl}
                            onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>

                      <button
                        id="banner-form-submit"
                        type="submit"
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-lg"
                      >
                        Simpan Banner Slide
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {banners.map((bn) => (
                      <div key={bn.id} className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={bn.imageUrl}
                            alt="Banner slide"
                            className="w-24 h-12 object-cover rounded bg-gray-900"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-white">{bn.title}</h4>
                            <p className="text-[10px] text-gray-500 truncate max-w-sm">{bn.subtitle}</p>
                          </div>
                        </div>

                        <button
                          id={`delete-banner-btn-${bn.id}`}
                          onClick={() => handleDeleteBanner(bn.id)}
                          className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors focus:outline-none"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: REVIEWS MODERATION QUEUE */}
              {activeSection === "reviews" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white font-display border-b border-gray-850 pb-2">Antrean Moderasi Testimoni Pelanggan</h2>

                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center ${
                          rev.status === "pending" 
                            ? "bg-yellow-500/5 border-yellow-500/20" 
                            : "bg-gray-950 border-gray-800"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-white">{rev.username}</h4>
                            {rev.robloxUsername && <span className="text-[9px] font-mono text-gray-500">@{rev.robloxUsername}</span>}
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                              rev.status === "approved" ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"
                            }`}>
                              {rev.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 italic">"{rev.comment}"</p>
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-yellow-400">
                            <span>★ {rev.rating}</span>
                            <span className="text-gray-600 font-normal font-sans">• {new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0 w-full sm:w-auto border-t border-gray-850 sm:border-none pt-2 sm:pt-0">
                          {rev.status === "pending" && (
                            <button
                              id={`approve-review-btn-${rev.id}`}
                              onClick={() => handleApproveReview(rev.id)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-[10px] rounded flex items-center gap-1 w-full sm:w-auto justify-center"
                            >
                              <Check size={12} />
                              <span>Setujui</span>
                            </button>
                          )}
                          <button
                            id={`delete-review-btn-${rev.id}`}
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded flex items-center justify-center shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {reviews.length === 0 && (
                      <div className="py-12 text-center text-xs text-gray-500">
                        Tidak ada ulasan dalam antrean moderasi.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: USERS MANAGEMENT */}
              {activeSection === "users" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white font-display border-b border-gray-850 pb-2">Daftar Pengguna Platform R8</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                      <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-3">Nama User</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Roblox</th>
                          <th className="p-3">R8 Coins Balance</th>
                          <th className="p-3">Bergabung</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-950/40">
                            <td className="p-3">
                              <div className="font-bold text-white">{u.username}</div>
                              <div className="text-[10px] text-gray-500">{u.email}</div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                u.role === "admin" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3 text-gray-300 font-mono">@{u.robloxUsername || "Not linked"}</td>
                            <td className="p-3 font-semibold text-white">{formatIDR(u.balance)}</td>
                            <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: SYSTEM WEB SETTINGS */}
              {activeSection === "settings" && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <h2 className="text-lg font-bold text-white font-display border-b border-gray-850 pb-2">Pengaturan Platform Website</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Nama Logo Text</label>
                      <input
                        id="settings-logo-input"
                        type="text"
                        required
                        value={settingsForm.logoText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Email Layanan (Support)</label>
                      <input
                        id="settings-email-input"
                        type="email"
                        required
                        value={settingsForm.contactEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">WhatsApp CS (Format Internasional)</label>
                      <input
                        id="settings-wa-input"
                        type="text"
                        required
                        placeholder="Contoh: 6281234567890"
                        value={settingsForm.whatsappContact}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappContact: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Instagram URL</label>
                      <input
                        id="settings-ig-input"
                        type="text"
                        value={settingsForm.instagramUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Discord Invite URL</label>
                    <input
                      id="settings-discord-input"
                      type="text"
                      value={settingsForm.discordUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, discordUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <button
                    id="save-settings-submit"
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    <span>Simpan Pengaturan Platform</span>
                  </button>
                </form>
              )}

              {/* SECTION: SYSTEM ACTION LOGS */}
              {activeSection === "logs" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white font-display border-b border-gray-850 pb-2">Log Audit Aktivitas Admin</h2>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {adminLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-gray-950 border border-gray-800 rounded-xl text-[11px] leading-relaxed flex justify-between items-start gap-4">
                        <div>
                          <span className="font-bold text-emerald-400 font-mono mr-1.5">{log.action}</span>
                          <span className="text-gray-400">{log.details}</span>
                          <span className="block text-[9px] text-gray-600 mt-1 font-sans">Oleh: @{log.adminUsername}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 shrink-0 mt-0.5">
                          {new Date(log.timestamp).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short"
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
