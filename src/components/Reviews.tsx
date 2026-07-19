import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, ShieldAlert, Check, Loader2, Sparkles, StarHalf, ShieldCheck } from "lucide-react";
import { Review, User } from "../types";
import { safeFetchJson } from "../utils/api";

interface ReviewsProps {
  currentUser: User | null;
}

export default function Reviews({ currentUser }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [robloxUsername, setRobloxUsername] = useState("");
  const [formName, setFormName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    fetchReviews();
    if (currentUser) {
      setFormName(currentUser.username);
      setRobloxUsername(currentUser.robloxUsername || "");
    }
  }, [currentUser]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await safeFetchJson<Review[]>("/api/reviews");
      setReviews(data);
    } catch (e: any) {
      console.error("Gagal mengambil reviews:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    const nameToSubmit = currentUser ? currentUser.username : formName;

    if (!nameToSubmit.trim()) {
      setSubmitError("Silakan masukkan nama Anda.");
      setIsSubmitting(false);
      return;
    }

    if (!comment.trim()) {
      setSubmitError("Tulis komentar ulasan Anda.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await safeFetchJson<any>("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: nameToSubmit,
          robloxUsername,
          rating,
          comment
        })
      });

      setSubmitSuccess(data.message || "Ulasan berhasil dikirim!");
      setComment("");
      if (!currentUser) {
        setFormName("");
        setRobloxUsername("");
      }
      setRating(5);
      
      // Reload reviews
      fetchReviews();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 text-xs font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-display uppercase">
          Testimoni
        </span>
        <h1 className="text-3xl font-bold font-display text-white mt-3">
          Ulasan Pembeli R8
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Bagikan pengalaman Anda berbelanja di R8 Premium atau lihat kepuasan para gamer lainnya.
        </p>
      </div>

      {/* Grid Layout: Stats + Form left, Reviews right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Stats and Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Average Stats Card */}
          <div className="p-6 premium-glass border border-emerald-500/10 rounded-2xl shadow-xl text-center relative overflow-hidden">
            <span className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></span>
            
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Rating Rata-rata</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-extrabold font-display text-white">{getAverageRating()}</span>
              <span className="text-xl text-gray-500 font-bold">/ 5.0</span>
            </div>

            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={s <= Math.round(Number(getAverageRating())) ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}
                />
              ))}
            </div>

            <p className="text-xs text-gray-500">
              Diambil dari total <span className="text-emerald-400 font-semibold">{reviews.length}</span> ulasan pembeli terverifikasi.
            </p>
          </div>

          {/* Submission Form Card */}
          <div className="p-6 premium-glass border border-emerald-500/10 rounded-2xl shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-500" />
              Tulis Ulasan Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form alerts */}
              {submitError && (
                <div className="p-3 text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded-xl">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="p-3 text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-xl flex items-start gap-2">
                  <Check size={16} className="shrink-0 mt-0.5" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {/* Stars Selection */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-400">Rating Kepuasan</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-transform active:scale-90 hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= (hoverRating ?? rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-700"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input (If Guest) */}
              {!currentUser && (
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-400">Nama Lengkap</label>
                  <input
                    id="review-form-name"
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Optional Roblox username link */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-400">
                  Username Roblox <span className="text-gray-500 font-normal">(Opsional)</span>
                </label>
                <input
                  id="review-form-roblox"
                  type="text"
                  placeholder="Contoh: SultanLover"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Comment Text Area */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-400 font-sans">Komentar Ulasan</label>
                <textarea
                  id="review-form-comment"
                  rows={4}
                  required
                  placeholder="Tulis pendapat jujur Anda mengenai platform R8..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                ></textarea>
              </div>

              <button
                id="review-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-black font-semibold rounded-xl text-sm transition-all"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Kirim Ulasan"
                )}
              </button>
              
              <div className="flex gap-2 p-3 bg-gray-950 border border-gray-800 rounded-xl">
                <ShieldAlert size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500 leading-normal">
                  Demi menghindari spam dan fitnah, semua ulasan akan masuk antrean moderasi Admin R8 sebelum ditampilkan ke publik.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Approved Reviews Cards Grid */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="text-emerald-500 animate-spin mb-4" size={32} />
              <p className="text-xs text-gray-500">Memuat ulasan pelanggan R8...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-800">
                <span>MENAMPILKAN {reviews.length} ULASAN TERBARU</span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <Sparkles size={12} />
                  100% Real Testimoni
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="py-16 text-center text-gray-500 text-xs">
                  Belum ada ulasan yang disetujui admin. Jadilah yang pertama memberikan review!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="p-5 premium-glass border border-emerald-500/10 rounded-2xl shadow-lg flex flex-col justify-between hover:-translate-y-0.5 transition-premium premium-glass-hover"
                    >
                      <div>
                        {/* Rating Stars */}
                        <div className="flex gap-0.5 mb-3.5">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              size={14}
                              className={st <= rev.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}
                            />
                          ))}
                        </div>

                        {/* Comment text */}
                        <p className="text-sm text-gray-300 italic leading-relaxed mb-4">
                          "{rev.comment}"
                        </p>
                      </div>

                      {/* Reviewer Details */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-800">
                        <img
                          src={rev.robloxUsername ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${rev.robloxUsername}` : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${rev.username}`}
                          alt="Reviewer avatar"
                          className="w-10 h-10 rounded-full bg-gray-950 border border-gray-800 p-0.5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">{rev.username}</h4>
                          {rev.robloxUsername ? (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                              <ShieldCheck size={12} />
                              <span className="truncate">Roblox: @{rev.robloxUsername}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-sans block">Pembeli Terverifikasi</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
