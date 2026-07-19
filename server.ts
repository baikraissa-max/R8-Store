import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  loadDB, 
  saveDB, 
  addAdminLog 
} from "./server_db/db";
import { 
  User, 
  RobuxPackage, 
  GamePassItem, 
  Banner, 
  Review, 
  Transaction, 
  TransactionStatus,
  SystemSettings,
  LeaderboardEntry
} from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to generate transaction IDs
function generateTransactionId(): string {
  const num = Math.floor(1000000 + Math.random() * 9000000);
  return `R8-${num}`;
}

// ==========================================
// 1. ROBLOX API PROXY
// ==========================================
app.get("/api/roblox/user/:username", async (req, res) => {
  const { username } = req.params;
  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: "Username tidak boleh kosong" });
  }

  try {
    // Official Roblox usernames search API
    const userSearchResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
      })
    });

    if (!userSearchResponse.ok) {
      throw new Error(`Roblox API returned status ${userSearchResponse.status}`);
    }

    const searchData: any = await userSearchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      return res.status(404).json({ error: "Username Roblox tidak ditemukan" });
    }

    const robloxUser = searchData.data[0];
    const userId = robloxUser.id;
    const displayName = robloxUser.displayName || robloxUser.name;
    const resolvedUsername = robloxUser.name;

    // Fetch avatar headshot
    let avatarUrl = "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false";
    try {
      const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
      if (avatarResponse.ok) {
        const avatarData: any = await avatarResponse.json();
        if (avatarData.data && avatarData.data.length > 0) {
          avatarUrl = avatarData.data[0].imageUrl || avatarUrl;
        }
      }
    } catch (e) {
      console.warn("Gagal mengambil avatar Roblox, menggunakan default", e);
    }

    return res.json({
      id: String(userId),
      username: resolvedUsername,
      displayName: displayName,
      avatarUrl: avatarUrl
    });

  } catch (error: any) {
    console.error("Error fetching Roblox User:", error);
    // Graceful fallback for demo/sandbox if Roblox APIs are blocked or network is offline
    // Let's check if we want to simulate a successful user if we're in sandbox, 
    // but with a flag so they know it is a graceful fallback.
    const fakeDisplayName = username.charAt(0).toUpperCase() + username.slice(1);
    return res.json({
      id: String(Math.floor(1000000 + Math.random() * 9000000)),
      username: username,
      displayName: `${fakeDisplayName} (Guest)`,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
      isDemoFallback: true
    });
  }
});


// ==========================================
// 2. AUTHENTICATION & USERS
// ==========================================

// Register
app.post("/api/auth/register", (req, res) => {
  const { email, username, password, robloxUsername } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: "Lengkapi semua data pendaftaran" });
  }

  const db = loadDB();
  
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Email atau Username sudah terdaftar" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

  db.otps[email.toLowerCase()] = { otp, expiresAt };
  saveDB();

  console.log(`[R8 OTP Verification] OTP untuk ${email}: ${otp}`);

  // Return simulated registration details along with OTP for frictionless trial in sandbox
  return res.json({
    message: "OTP berhasil dikirim ke email Anda",
    email: email,
    otpDebug: otp // Debugging helper in UI
  });
});

// Verify OTP & Complete Register
app.post("/api/auth/verify-otp", (req, res) => {
  const { email, username, password, robloxUsername, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Data OTP tidak lengkap" });
  }

  const db = loadDB();
  const storedOtpData = db.otps[email.toLowerCase()];

  if (!storedOtpData) {
    return res.status(400).json({ error: "OTP tidak ditemukan atau telah kedaluwarsa" });
  }

  if (Date.now() > storedOtpData.expiresAt) {
    delete db.otps[email.toLowerCase()];
    saveDB();
    return res.status(400).json({ error: "OTP telah kedaluwarsa, silakan kirim ulang" });
  }

  if (storedOtpData.otp !== otp) {
    return res.status(400).json({ error: "Kode OTP salah" });
  }

  // Clear OTP
  delete db.otps[email.toLowerCase()];

  // Create real user
  const newUser: User = {
    id: "usr-" + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    username: username,
    role: username === "admin" ? "admin" : "user",
    robloxUsername: robloxUsername || "",
    robloxAvatar: robloxUsername ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${robloxUsername}` : "",
    createdAt: new Date().toISOString(),
    balance: 0
  };

  db.users.push(newUser);
  saveDB();

  return res.json({
    message: "Verifikasi berhasil! Akun Anda aktif.",
    user: newUser
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: "Masukkan username/email dan password" });
  }

  const db = loadDB();
  const user = db.users.find(u => 
    (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
     u.email.toLowerCase() === usernameOrEmail.toLowerCase())
  );

  if (!user) {
    return res.status(400).json({ error: "Akun tidak ditemukan" });
  }

  // Password hashing simulation: simple check for demo purposes
  // In a demo app, we accept password if it matches preset passwords (e.g. admin123, buyer123)
  // or allow any password for newly registered accounts
  if (user.id === "usr-admin" && password !== "admin123") {
    return res.status(400).json({ error: "Password Admin salah" });
  }
  if (user.id === "usr-buyer" && password !== "buyer123") {
    return res.status(400).json({ error: "Password salah" });
  }

  // Trigger login OTP check simulation from new device
  // If user logs in with a verified account, we can proceed directly for smooth UI flow
  return res.json({
    message: "Login berhasil",
    user: user
  });
});

// Google Login
app.post("/api/auth/google-login", (req, res) => {
  const { email, displayName, photoUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Google Auth gagal" });
  }

  const db = loadDB();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    const cleanUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    user = {
      id: "usr-" + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      username: cleanUsername,
      role: "user",
      robloxUsername: "",
      robloxAvatar: photoUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${cleanUsername}`,
      createdAt: new Date().toISOString(),
      balance: 100000 // Give new Google users some starting R8 coins for easy purchasing testing
    };
    db.users.push(user);
    saveDB();
  }

  return res.json({
    message: "Login Google Berhasil",
    user
  });
});

// Update Profile
app.put("/api/auth/profile", (req, res) => {
  const { userId, robloxUsername, robloxAvatar } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID diperlukan" });
  }

  const db = loadDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User tidak ditemukan" });
  }

  db.users[userIndex].robloxUsername = robloxUsername;
  db.users[userIndex].robloxAvatar = robloxAvatar;
  saveDB();

  return res.json({
    message: "Profil berhasil diperbarui",
    user: db.users[userIndex]
  });
});


// ==========================================
// 3. ROBUX PACKAGES (PRODUCTS)
// ==========================================
app.get("/api/products", (req, res) => {
  const db = loadDB();
  // Filter active products on user view, return all to admin
  const { admin } = req.query;
  if (admin === "true") {
    return res.json(db.robuxPackages.sort((a, b) => a.orderIndex - b.orderIndex));
  }
  return res.json(db.robuxPackages.filter(p => p.active).sort((a, b) => a.orderIndex - b.orderIndex));
});

app.post("/api/products", (req, res) => {
  const { amount, bonusAmount, price, originalPrice, isPopular, active, adminUsername } = req.body;
  const db = loadDB();

  const newProduct: RobuxPackage = {
    id: "pkg-" + Math.random().toString(36).substr(2, 9),
    amount: Number(amount),
    bonusAmount: Number(bonusAmount || 0),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    isPopular: !!isPopular,
    active: active !== undefined ? !!active : true,
    orderIndex: db.robuxPackages.length + 1
  };

  db.robuxPackages.push(newProduct);
  saveDB();

  addAdminLog(adminUsername || "admin", "CREATE_PRODUCT", `Menambahkan produk Robux: ${amount} Robux (Harga: Rp ${price})`);

  return res.json({ message: "Produk Robux berhasil ditambahkan", product: newProduct });
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { amount, bonusAmount, price, originalPrice, isPopular, active, adminUsername } = req.body;
  const db = loadDB();

  const idx = db.robuxPackages.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Produk tidak ditemukan" });
  }

  db.robuxPackages[idx] = {
    ...db.robuxPackages[idx],
    amount: Number(amount),
    bonusAmount: Number(bonusAmount || 0),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    isPopular: !!isPopular,
    active: active !== undefined ? !!active : db.robuxPackages[idx].active
  };

  saveDB();

  addAdminLog(adminUsername || "admin", "EDIT_PRODUCT", `Mengubah produk Robux ID: ${id} (${amount} Robux)`);

  return res.json({ message: "Produk Robux berhasil diubah", product: db.robuxPackages[idx] });
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { adminUsername } = req.body;
  const db = loadDB();

  const idx = db.robuxPackages.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Produk tidak ditemukan" });
  }

  const deleted = db.robuxPackages.splice(idx, 1)[0];
  saveDB();

  addAdminLog(adminUsername || "admin", "DELETE_PRODUCT", `Menghapus produk Robux ID: ${id} (${deleted.amount} Robux)`);

  return res.json({ message: "Produk Robux berhasil dihapus" });
});


// ==========================================
// 4. GAME PASSES / ITEMS
// ==========================================
app.get("/api/items", (req, res) => {
  const db = loadDB();
  const { admin } = req.query;
  if (admin === "true") {
    return res.json(db.gamePassItems.sort((a, b) => a.orderIndex - b.orderIndex));
  }
  return res.json(db.gamePassItems.filter(p => p.active).sort((a, b) => a.orderIndex - b.orderIndex));
});

app.post("/api/items", (req, res) => {
  const { name, gameName, price, originalPrice, category, imageUrl, active, adminUsername } = req.body;
  const db = loadDB();

  const newItem: GamePassItem = {
    id: "gp-" + Math.random().toString(36).substr(2, 9),
    name,
    gameName,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category: category || "Lainnya",
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=300&auto=format&fit=crop&q=60",
    active: active !== undefined ? !!active : true,
    orderIndex: db.gamePassItems.length + 1
  };

  db.gamePassItems.push(newItem);
  saveDB();

  addAdminLog(adminUsername || "admin", "CREATE_ITEM", `Menambahkan Game Pass: ${name} di ${gameName}`);

  return res.json({ message: "Game Pass berhasil ditambahkan", item: newItem });
});

app.put("/api/items/:id", (req, res) => {
  const { id } = req.params;
  const { name, gameName, price, originalPrice, category, imageUrl, active, adminUsername } = req.body;
  const db = loadDB();

  const idx = db.gamePassItems.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Game Pass tidak ditemukan" });
  }

  db.gamePassItems[idx] = {
    ...db.gamePassItems[idx],
    name: name || db.gamePassItems[idx].name,
    gameName: gameName || db.gamePassItems[idx].gameName,
    price: price !== undefined ? Number(price) : db.gamePassItems[idx].price,
    originalPrice: originalPrice !== undefined ? Number(originalPrice) : db.gamePassItems[idx].originalPrice,
    category: category || db.gamePassItems[idx].category,
    imageUrl: imageUrl || db.gamePassItems[idx].imageUrl,
    active: active !== undefined ? !!active : db.gamePassItems[idx].active
  };

  saveDB();

  addAdminLog(adminUsername || "admin", "EDIT_ITEM", `Mengubah Game Pass ID: ${id} (${name})`);

  return res.json({ message: "Game Pass berhasil diubah", item: db.gamePassItems[idx] });
});

app.delete("/api/items/:id", (req, res) => {
  const { id } = req.params;
  const { adminUsername } = req.body;
  const db = loadDB();

  const idx = db.gamePassItems.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Game Pass tidak ditemukan" });
  }

  const deleted = db.gamePassItems.splice(idx, 1)[0];
  saveDB();

  addAdminLog(adminUsername || "admin", "DELETE_ITEM", `Menghapus Game Pass ID: ${id} (${deleted.name})`);

  return res.json({ message: "Game Pass berhasil dihapus" });
});


// ==========================================
// 5. BANNER PROMOS
// ==========================================
app.get("/api/banners", (req, res) => {
  const db = loadDB();
  const { admin } = req.query;
  if (admin === "true") {
    return res.json(db.banners);
  }
  return res.json(db.banners.filter(b => b.active));
});

app.post("/api/banners", (req, res) => {
  const { imageUrl, title, subtitle, link, active, adminUsername } = req.body;
  const db = loadDB();

  const newBanner: Banner = {
    id: "b-" + Math.random().toString(36).substr(2, 9),
    imageUrl,
    title,
    subtitle,
    link: link || "/",
    active: active !== undefined ? !!active : true
  };

  db.banners.push(newBanner);
  saveDB();

  addAdminLog(adminUsername || "admin", "CREATE_BANNER", `Menambahkan banner promo: ${title}`);

  return res.json({ message: "Banner promo berhasil ditambahkan", banner: newBanner });
});

app.put("/api/banners/:id", (req, res) => {
  const { id } = req.params;
  const { imageUrl, title, subtitle, link, active, adminUsername } = req.body;
  const db = loadDB();

  const idx = db.banners.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Banner tidak ditemukan" });
  }

  db.banners[idx] = {
    ...db.banners[idx],
    imageUrl: imageUrl || db.banners[idx].imageUrl,
    title: title || db.banners[idx].title,
    subtitle: subtitle || db.banners[idx].subtitle,
    link: link || db.banners[idx].link,
    active: active !== undefined ? !!active : db.banners[idx].active
  };

  saveDB();

  addAdminLog(adminUsername || "admin", "EDIT_BANNER", `Mengubah banner promo ID: ${id}`);

  return res.json({ message: "Banner promo berhasil diubah", banner: db.banners[idx] });
});

app.delete("/api/banners/:id", (req, res) => {
  const { id } = req.params;
  const { adminUsername } = req.body;
  const db = loadDB();

  const idx = db.banners.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Banner tidak ditemukan" });
  }

  const deleted = db.banners.splice(idx, 1)[0];
  saveDB();

  addAdminLog(adminUsername || "admin", "DELETE_BANNER", `Menghapus banner promo ID: ${id} (${deleted.title})`);

  return res.json({ message: "Banner promo berhasil dihapus" });
});


// ==========================================
// 6. REVIEWS (ULASAN)
// ==========================================
app.get("/api/reviews", (req, res) => {
  const db = loadDB();
  // Approved reviews for home
  return res.json(db.reviews.filter(r => r.status === "approved"));
});

app.get("/api/admin/reviews", (req, res) => {
  const db = loadDB();
  return res.json(db.reviews);
});

app.post("/api/reviews", (req, res) => {
  const { username, robloxUsername, rating, comment } = req.body;
  if (!username || !rating || !comment) {
    return res.status(400).json({ error: "Lengkapi data ulasan" });
  }

  const db = loadDB();
  const newReview: Review = {
    id: "rev-" + Math.random().toString(36).substr(2, 9),
    username,
    robloxUsername: robloxUsername || undefined,
    rating: Number(rating),
    comment,
    status: "pending", // Always pending admin approval
    createdAt: new Date().toISOString()
  };

  db.reviews.unshift(newReview);
  saveDB();

  return res.json({ 
    message: "Ulasan berhasil dikirim! Akan ditampilkan setelah disetujui admin.", 
    review: newReview 
  });
});

app.put("/api/reviews/:id/approve", (req, res) => {
  const { id } = req.params;
  const { adminUsername } = req.body;
  const db = loadDB();

  const idx = db.reviews.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Ulasan tidak ditemukan" });
  }

  db.reviews[idx].status = "approved";
  saveDB();

  addAdminLog(adminUsername || "admin", "APPROVE_REVIEW", `Menyetujui ulasan dari: ${db.reviews[idx].username}`);

  return res.json({ message: "Ulasan berhasil disetujui", review: db.reviews[idx] });
});

app.delete("/api/reviews/:id", (req, res) => {
  const { id } = req.params;
  const { adminUsername } = req.body;
  const db = loadDB();

  const idx = db.reviews.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Ulasan tidak ditemukan" });
  }

  const deleted = db.reviews.splice(idx, 1)[0];
  saveDB();

  addAdminLog(adminUsername || "admin", "DELETE_REVIEW", `Menghapus ulasan dari: ${deleted.username}`);

  return res.json({ message: "Ulasan berhasil dihapus" });
});


// ==========================================
// 7. TRANSACTIONS (CHECKOUT & CHECK)
// ==========================================

// Create Transaction
app.post("/api/transactions", (req, res) => {
  const { 
    userId, 
    robloxUsername, 
    robloxDisplayName, 
    robloxAvatar, 
    type, 
    productName, 
    amount, 
    price, 
    paymentMethod 
  } = req.body;

  if (!robloxUsername || !productName || !price || !paymentMethod) {
    return res.status(400).json({ error: "Data transaksi tidak lengkap" });
  }

  const db = loadDB();
  const txId = generateTransactionId();

  // Mock-up QRIS or VA numbers
  let paymentDetails: any = {};
  if (paymentMethod === "QRIS") {
    paymentDetails.qrCodeUrl = "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&auto=format&fit=crop&q=80"; // A handsome dummy QR Code pattern
    paymentDetails.instructions = "Silakan scan kode QRIS di atas menggunakan aplikasi e-wallet Anda (DANA, OVO, GoPay, LinkAja) untuk menyelesaikan pembayaran.";
  } else if (["DANA", "OVO", "GoPay", "ShopeePay"].includes(paymentMethod)) {
    paymentDetails.vaNumber = "0812-3456-7890";
    paymentDetails.instructions = `Silakan transfer tepat sebesar Rp ${price.toLocaleString("id-ID")} ke Nomor Akun ${paymentMethod} Kami: 0812-3456-7890 a.n. R8 PREMIUM.`;
  } else {
    // Virtual Account
    const randomVA = "88012" + Math.floor(1000000000 + Math.random() * 9000000000);
    paymentDetails.vaNumber = randomVA;
    paymentDetails.instructions = `Silakan transfer ke Virtual Account ${paymentMethod}: ${randomVA} sebelum waktu pembayaran kedaluwarsa.`;
  }

  const newTx: Transaction = {
    id: txId,
    userId: userId || undefined,
    robloxUsername,
    robloxDisplayName: robloxDisplayName || robloxUsername,
    robloxAvatar: robloxAvatar || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false",
    type,
    productName,
    amount: Number(amount),
    price: Number(price),
    paymentMethod,
    paymentDetails,
    status: "Menunggu Pembayaran",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);

  // If a logged-in user made this transaction, update their transaction history or deduct balance if they used internal balance (optional, but let's keep it simple: transactions are stored server-side)
  saveDB();

  return res.json({
    message: "Transaksi berhasil dibuat",
    transaction: newTx
  });
});

// Get single transaction by ID (Cek Transaksi)
app.get("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  const tx = db.transactions.find(t => t.id.toLowerCase() === id.toLowerCase().trim());
  if (!tx) {
    return res.status(404).json({ error: "ID Transaksi tidak ditemukan" });
  }

  return res.json(tx);
});

// Get user transaction history
app.get("/api/users/:userId/transactions", (req, res) => {
  const { userId } = req.params;
  const db = loadDB();
  const txs = db.transactions.filter(t => t.userId === userId);
  return res.json(txs);
});

// Admin Get All Transactions
app.get("/api/admin/transactions", (req, res) => {
  const db = loadDB();
  return res.json(db.transactions);
});

// Admin Update Transaction Status
app.put("/api/transactions/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, adminUsername } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status diperlukan" });
  }

  const db = loadDB();
  const idx = db.transactions.findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Transaksi tidak ditemukan" });
  }

  const oldStatus = db.transactions[idx].status;
  db.transactions[idx].status = status as TransactionStatus;
  db.transactions[idx].updatedAt = new Date().toISOString();
  saveDB();

  addAdminLog(
    adminUsername || "admin", 
    "UPDATE_ORDER", 
    `Mengubah status transaksi ${id} dari "${oldStatus}" menjadi "${status}"`
  );

  return res.json({ 
    message: "Status transaksi berhasil diperbarui", 
    transaction: db.transactions[idx] 
  });
});


// ==========================================
// 8. LEADERBOARD
// ==========================================
app.get("/api/leaderboard", (req, res) => {
  const { period } = req.query; // daily, weekly, monthly, alltime
  const db = loadDB();

  // Filter successful transactions
  const successTxs = db.transactions.filter(t => t.status === "Berhasil");

  // Sum expenditure per robloxUsername
  const spendMap: Record<string, { robloxUsername: string; robloxAvatar: string; totalSpent: number }> = {};
  
  // Seed default entries if there are too few success transactions
  const defaultSeeds: Record<string, number> = {
    "RbxGamerPro": 2500000,
    "SultanSlayer": 4800000,
    "BloxLover": 1200000,
    "NoobRBLX": 450000,
    "Builderman": 115000
  };

  Object.entries(defaultSeeds).forEach(([user, spent]) => {
    // Add multiplier depending on period
    let multiplier = 1;
    if (period === "daily") multiplier = 0.1;
    if (period === "weekly") multiplier = 0.35;
    if (period === "monthly") multiplier = 0.7;

    spendMap[user] = {
      robloxUsername: user,
      robloxAvatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user}`,
      totalSpent: Math.floor(spent * multiplier)
    };
  });

  // Aggregate real transactions
  successTxs.forEach(t => {
    const key = t.robloxUsername;
    // Optional date filter
    const txDate = new Date(t.createdAt);
    const now = new Date();
    let matchesPeriod = true;

    if (period === "daily") {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      matchesPeriod = txDate >= oneDayAgo;
    } else if (period === "weekly") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesPeriod = txDate >= oneWeekAgo;
    } else if (period === "monthly") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesPeriod = txDate >= oneMonthAgo;
    }

    if (matchesPeriod) {
      if (spendMap[key]) {
        spendMap[key].totalSpent += t.price;
      } else {
        spendMap[key] = {
          robloxUsername: t.robloxUsername,
          robloxAvatar: t.robloxAvatar,
          totalSpent: t.price
        };
      }
    }
  });

  // Convert to array and sort
  const leaderboard: LeaderboardEntry[] = Object.values(spendMap)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .map((item, index) => ({
      id: `lb-${index + 1}`,
      username: item.robloxUsername,
      robloxUsername: item.robloxUsername,
      robloxAvatar: item.robloxAvatar,
      totalSpent: item.totalSpent
    }));

  return res.json(leaderboard);
});


// ==========================================
// 9. WEBSITE SETTINGS
// ==========================================
app.get("/api/settings", (req, res) => {
  const db = loadDB();
  return res.json(db.settings);
});

app.put("/api/settings", (req, res) => {
  const { settings, adminUsername } = req.body;
  if (!settings) {
    return res.status(400).json({ error: "Data settings diperlukan" });
  }

  const db = loadDB();
  db.settings = {
    ...db.settings,
    ...settings
  };
  saveDB();

  addAdminLog(adminUsername || "admin", "UPDATE_SETTINGS", "Memperbarui konfigurasi pengaturan website");

  return res.json({ message: "Pengaturan website berhasil diperbarui", settings: db.settings });
});

// Admin Logs
app.get("/api/admin/logs", (req, res) => {
  const db = loadDB();
  return res.json(db.adminLogs);
});

// Admin Get All Users
app.get("/api/admin/users", (req, res) => {
  const db = loadDB();
  // Filter passwords or sensitive keys, though we only have public credentials
  return res.json(db.users);
});


// ==========================================
// 10. VITE DEVELOPMENT MIDDLEWARE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`R8 Server is running on port ${PORT}`);
  });
}

// Only start local server if not on Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
export { app };

