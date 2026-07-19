import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown, MessageSquare, ShieldCheck, Mail, Send, CheckCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function Help() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "Bagaimana cara melakukan pembelian Robux di R8 Premium?",
      answer: "Langkahnya sangat mudah! 1) Masuk ke menu 'Beli Robux'. 2) Masukkan Username Roblox Anda dan klik verifikasi akun. 3) Pilih nominal Robux yang Anda inginkan. 4) Pilih metode pembayaran favorit (QRIS, DANA, OVO, dll). 5) Lakukan pembayaran sesuai nominal. 6) Robux Anda akan terproses otomatis dalam 1 - 5 menit!"
    },
    {
      question: "Berapa lama waktu proses pengiriman Game Pass?",
      answer: "Sebagian besar Game Pass di platform R8 Premium dikirim menggunakan sistem gift otomatis atau direct transfer, yang memakan waktu antara 1 hingga 5 menit setelah pembayaran Anda berhasil terverifikasi oleh gateway pembayaran kami."
    },
    {
      question: "Apakah transaksi di R8 Premium aman untuk akun Roblox saya?",
      answer: "100% Aman. R8 Premium hanya menggunakan jalur legal dan API resmi Roblox untuk pengiriman Robux dan Item Game Pass. Kami sama sekali tidak pernah meminta password akun Roblox Anda, sehingga akun Anda sepenuhnya terlindungi dari resiko banned."
    },
    {
      question: "Mengapa Username Roblox saya terdeteksi tidak valid?",
      answer: "Pastikan Anda memasukkan Username Roblox utama Anda (bukan Display Name) dengan ejaan huruf besar/kecil yang tepat. Jika akun Anda berumur kurang dari 1 minggu atau merupakan akun baru, terkadang sistem API Roblox memerlukan waktu sinkronisasi. Silakan hubungi CS kami jika tetap gagal."
    },
    {
      question: "Bagaimana jika status pesanan saya 'Gagal'?",
      answer: "Jika transaksi dideteksi gagal oleh sistem (misalnya karena username salah tulis atau server Roblox down), saldo Anda sama sekali tidak akan terpotong. Anda dapat menghubungi layanan pelanggan WhatsApp kami dengan menyertakan screenshot ID Transaksi Anda untuk pengembalian dana penuh atau pengiriman ulang."
    },
    {
      question: "Apa itu R8 Coins / saldo internal?",
      answer: "R8 Coins adalah saldo di dalam website R8 yang dapat diisi ulang menggunakan transfer bank atau e-wallet. Dengan memiliki R8 Coins, Anda dapat melakukan pembelian instan sekali klik tanpa harus melakukan checkout transfer manual setiap kali membeli."
    }
  ];

  const steps = [
    {
      title: "1. Verifikasi Akun",
      desc: "Masukkan Username Roblox Anda. Sistem akan mencari dan menampilkan avatar visual Anda untuk memastikan tidak salah kirim."
    },
    {
      title: "2. Pilih Nominal / Produk",
      desc: "Tentukan berapa banyak Robux atau item Game Pass Blox Fruits / Pet Simulator yang ingin Anda beli dengan harga premium termurah."
    },
    {
      title: "3. Pilih Pembayaran",
      desc: "Gunakan QRIS (Otomatis), DANA, OVO, ShopeePay, GoPay, atau Virtual Account Bank (BCA, Mandiri, BNI, BRI) sesuai kenyamanan Anda."
    },
    {
      title: "4. Terima Produk",
      desc: "Sistem robotik R8 memproses pengiriman dalam waktu 1-5 menit. Anda dapat memantau statusnya real-time di halaman Cek Transaksi."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 text-xs font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-display uppercase">
          Pusat Bantuan
        </span>
        <h1 className="text-3xl font-bold font-display text-white mt-3">
          Bantuan & Panduan R8
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Temukan jawaban pertanyaan Anda, panduan berbelanja, atau hubungi customer service kami yang bersedia melayani 24/7.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Step Guide Bento (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={20} />
              Langkah Sederhana Pembelian
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="p-4 bg-gray-950 border border-gray-800 rounded-xl relative overflow-hidden group">
                  <span className="absolute -bottom-6 -right-6 text-7xl font-extrabold text-emerald-500/5 select-none font-display">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-white text-sm mb-1.5">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="text-emerald-500" size={20} />
              Pertanyaan Sering Diajukan (FAQ)
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaqIndex === idx;
                return (
                  <div key={idx} className="border border-gray-800 rounded-xl bg-gray-950/50 overflow-hidden">
                    <button
                      onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-gray-800/20 transition-all focus:outline-none"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-gray-200">{faq.question}</span>
                      <ChevronDown
                        size={16}
                        className={`text-emerald-500 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      />
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
                          <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed border-t border-gray-800 pt-3">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Support Channels Card (1 col) */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl space-y-5 text-center relative overflow-hidden">
            <span className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></span>
            
            <MessageSquare className="text-emerald-500 mx-auto" size={32} />
            
            <div>
              <h3 className="font-bold text-white text-base">Butuh Bantuan CS?</h3>
              <p className="text-xs text-gray-400 mt-1 leading-normal">
                Customer service kami siap membantu kendala top up, pengembalian saldo, atau keluhan layanan lainnya.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href="https://wa.me/6281234567890?text=Halo%20R8%20Premium,%20saya%20butuh%20bantuan%20terkait%20transaksi%20saya"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-500/10"
              >
                <CheckCircle size={16} />
                <span>Hubungi via WhatsApp</span>
              </a>

              <a
                href="https://discord.gg/r8premium"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-800 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl text-xs transition-all"
              >
                <Send size={16} className="text-emerald-500" />
                <span>Join Server Discord</span>
              </a>
            </div>

            <div className="border-t border-gray-800 pt-4 flex flex-col gap-2 text-left">
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <Mail size={14} className="text-emerald-500" />
                <span>support@r8premium.com</span>
              </div>
              <div className="text-[10px] text-gray-500 leading-normal">
                Waktu operasional CS: <strong className="text-gray-400">24 Jam Nonstop</strong>. Rata-rata waktu respon kurang dari 5 menit.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
