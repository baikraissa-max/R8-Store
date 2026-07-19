import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Zap, Heart, MessageSquare, ArrowRight, HelpCircle, ChevronDown, Award, Star } from "lucide-react";
import { Banner, Review } from "../types";

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchBanners();
    fetchHomeReviews();
  }, []);

  // Slide autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners");
      const data = await response.json();
      if (response.ok) {
        setBanners(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHomeReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      if (response.ok) {
        // Show up to 3 highest reviews
        setReviews(data.slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const advantages = [
    {
      title: "Pengiriman Super Instant",
      desc: "Sistem robotik R8 memproses pengiriman Robux secara otomatis hanya dalam 1-5 menit setelah pembayaran terverifikasi.",
      icon: <Zap className="text-emerald-500" size={24} />
    },
    {
      title: "Jaminan Keamanan 100%",
      desc: "Kami menggunakan API resmi Roblox. Kami tidak pernah meminta password akun Anda, menjamin akun Anda aman dari banned.",
      icon: <ShieldCheck className="text-emerald-500" size={24} />
    },
    {
      title: "Harga Premium Termurah",
      desc: "Dapatkan penawaran harga terbaik dengan promo diskon harian untuk semua paket Robux premium dan Game Pass.",
      icon: <Award className="text-emerald-500" size={24} />
    },
    {
      title: "Customer Service 24/7",
      desc: "Customer service kami bersedia melayani kendala pembelian Anda kapan saja melalui WhatsApp & Discord.",
      icon: <Heart className="text-emerald-500" size={24} />
    }
  ];

  const steps = [
    { title: "Verifikasi Akun", text: "Masukkan Username Roblox utama Anda." },
    { title: "Pilih Nominal", text: "Pilih Robux atau Game Pass yang diinginkan." },
    { title: "Lakukan Pembayaran", text: "Scan QRIS otomatis atau transfer e-wallet." },
    { title: "Robux Masuk!", text: "Selesai! Robux mendarat di akun Anda otomatis." }
  ];

  const homeFaqs = [
    { q: "Apakah top up di R8 legal?", a: "Tentu saja. R8 Premium memproses top up menggunakan sirkulasi Robux legal 100% dari developer exchange Roblox resmi, sehingga sangat aman untuk akun utama Anda." },
    { q: "Mengapa harus memilih R8?", a: "R8 menawarkan kualitas UI yang bersih, proses pengiriman secepat kilat (10 detik - 5 menit), proteksi pembeli penuh, tanpa mewajibkan memasukkan kata sandi akun Roblox Anda." },
    { q: "Bagaimana jika Robux belum masuk dalam 10 menit?", a: "Harap periksa status pesanan Anda di menu 'Cek Transaksi'. Jika terjadi hambatan jaringan server Roblox, silakan hubungi CS WhatsApp kami untuk bantuan instant langsung dibantu." }
  ];

  return (
    <div className="space-y-16">
      
      {/* 1. HERO PROMO SLIDER SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl h-[340px] sm:h-[400px]">
        {banners.length > 0 ? (
          <div className="relative h-full w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBannerIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {/* Background Banner Image with sophisticated gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10"></div>
                <img
                  src={banners[activeBannerIndex].imageUrl}
                  alt={banners[activeBannerIndex].title}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />

                {/* Banner Content Card overlay */}
                <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center px-6 sm:px-12 max-w-xl space-y-4">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-md inline-block uppercase w-fit">
                    R8 PROMO SPECIAL
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-none">
                    {banners[activeBannerIndex].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                    {banners[activeBannerIndex].subtitle}
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button
                      id="hero-buy-robux-cta"
                      onClick={() => onNavigate("buy-robux")}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all uppercase tracking-wider"
                    >
                      Beli Robux
                    </button>
                    <button
                      id="hero-buy-item-cta"
                      onClick={() => onNavigate("buy-items")}
                      className="px-5 py-2.5 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
                    >
                      Beli Game Pass
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Bullet indicators */}
            {banners.length > 1 && (
              <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === activeBannerIndex ? "bg-emerald-500 w-6" : "bg-gray-700"
                    }`}
                  ></button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-950">
            <span className="text-gray-500 text-xs">Memuat penawaran R8...</span>
          </div>
        )}
      </section>

      {/* 2. ADVANTAGES SECTION BENTO GRID */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-500 uppercase">Mengapa Memilih Kami?</span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">Keunggulan R8 Premium</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">Platform top up Roblox terpercaya yang memprioritaskan keamanan dan kenyamanan pembeli.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {advantages.map((adv, idx) => (
            <div key={idx} className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-md hover:border-gray-700 transition-colors">
              <div className="p-3 bg-gray-950 border border-gray-850 rounded-xl w-fit mb-4">
                {adv.icon}
              </div>
              <h3 className="font-bold text-white text-sm mb-2">{adv.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">{adv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WORKFLOW PURCHASE STEPS */}
      <section className="p-8 bg-gray-900 border border-gray-800 rounded-3xl shadow-xl relative overflow-hidden">
        <span className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full"></span>
        
        <div className="text-center mb-8">
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-500 uppercase">Cara Kerja</span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">Langkah Mudah Pembelian</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((st, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-extrabold flex items-center justify-center shadow-lg shadow-emerald-500/20 font-display mb-3 text-sm">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-white text-xs mb-1">{st.title}</h3>
              <p className="text-[11px] text-gray-400 leading-normal font-sans max-w-[150px]">{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CUSTOMER TESTIMONIALS HIGHLIGHT */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-emerald-500 uppercase">Testimoni</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">Ulasan Kepuasan Pembeli</h2>
          </div>
          <button
            onClick={() => onNavigate("reviews")}
            className="text-xs text-emerald-500 font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Semua Ulasan</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col justify-between h-48">
                <div>
                  <div className="flex gap-0.5 mb-2.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= rev.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 italic leading-relaxed line-clamp-3">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-3 border-t border-gray-800/60 mt-3">
                  <img
                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${rev.robloxUsername || rev.username}`}
                    alt="Review user"
                    className="w-8 h-8 rounded-full bg-gray-950 p-0.5 border border-gray-800"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{rev.username}</h4>
                    <span className="text-[9px] text-emerald-400 font-bold font-mono">Roblox Verified</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-gray-500">
              Belum ada ulasan testimoni.
            </div>
          )}
        </div>
      </section>

      {/* 5. QUICK FAQ ACCORDIONS PREVIEW */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-500 uppercase">FAQ</span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">Pertanyaan Umum</h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {homeFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="border border-gray-800 rounded-xl bg-gray-900/50 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-gray-800/10 focus:outline-none"
                >
                  <span className="text-xs sm:text-sm font-semibold text-gray-200">{faq.q}</span>
                  <ChevronDown size={14} className={`text-emerald-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-xs text-gray-400 leading-relaxed pt-2 border-t border-gray-800">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
