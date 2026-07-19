import fs from "fs";
import path from "path";
import { 
  User, 
  RobuxPackage, 
  GamePassItem, 
  Banner, 
  Review, 
  Transaction, 
  LeaderboardEntry, 
  AdminLog, 
  SystemSettings 
} from "../src/types";

const DB_PATH = path.join(process.cwd(), "src", "db-store.json");

interface DBStructure {
  users: User[];
  robuxPackages: RobuxPackage[];
  gamePassItems: GamePassItem[];
  banners: Banner[];
  reviews: Review[];
  transactions: Transaction[];
  adminLogs: AdminLog[];
  settings: SystemSettings;
  otps: Record<string, { otp: string; expiresAt: number }>;
}

// Ensure the directory exists
function ensureDirExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Default initial database records
const initialDB: DBStructure = {
  users: [
    {
      id: "usr-admin",
      email: "admin@r8.com",
      username: "admin",
      role: "admin",
      robloxUsername: "R8Admin",
      robloxAvatar: "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false",
      createdAt: new Date().toISOString(),
      balance: 1500000
    },
    {
      id: "usr-buyer",
      email: "buyer@r8.com",
      username: "buyer",
      role: "user",
      robloxUsername: "Builderman",
      robloxAvatar: "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false",
      createdAt: new Date().toISOString(),
      balance: 50000
    }
  ],
  robuxPackages: [
    { id: "pkg-80", amount: 80, bonusAmount: 0, price: 12000, originalPrice: 15000, active: true, orderIndex: 1 },
    { id: "pkg-400", amount: 400, bonusAmount: 20, price: 58000, originalPrice: 70000, active: true, orderIndex: 2 },
    { id: "pkg-800", amount: 800, bonusAmount: 50, price: 115000, originalPrice: 140000, isPopular: true, active: true, orderIndex: 3 },
    { id: "pkg-1700", amount: 1700, bonusAmount: 120, price: 230000, originalPrice: 280000, active: true, orderIndex: 4 },
    { id: "pkg-4500", amount: 4500, bonusAmount: 400, price: 590000, originalPrice: 700000, active: true, orderIndex: 5 },
    { id: "pkg-10000", amount: 10000, bonusAmount: 1000, price: 1250000, originalPrice: 1500000, active: true, orderIndex: 6 }
  ],
  gamePassItems: [
    { id: "gp-1", name: "Fruit Notifier", gameName: "Blox Fruits", price: 350000, originalPrice: 400000, category: "Blox Fruits", imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=60", active: true, orderIndex: 1 },
    { id: "gp-2", name: "Dark Blade (Yoru)", gameName: "Blox Fruits", price: 180000, originalPrice: 210000, category: "Blox Fruits", imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=300&auto=format&fit=crop&q=60", active: true, orderIndex: 2 },
    { id: "gp-3", name: "Fast Boats", gameName: "Blox Fruits", price: 450000, originalPrice: 55000, category: "Blox Fruits", imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&auto=format&fit=crop&q=60", active: true, orderIndex: 3 },
    { id: "gp-4", name: "Super Drops x15", gameName: "Pet Simulator 99", price: 150000, originalPrice: 180000, category: "Pet Simulator 99", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=60", active: true, orderIndex: 4 },
    { id: "gp-5", name: "Auto Farm VIP", gameName: "Pet Simulator 99", price: 25000, originalPrice: 35000, category: "Pet Simulator 99", imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=60", active: true, orderIndex: 5 },
    { id: "gp-6", name: "Premium Flying Glider", gameName: "Adopt Me", price: 30000, originalPrice: 45000, category: "Adopt Me", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=60", active: true, orderIndex: 6 }
  ],
  banners: [
    { id: "b-1", imageUrl: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=1200&auto=format&fit=crop&q=80", title: "PROMO WEEKEND SPECIAL R8", subtitle: "Diskon 10% untuk top up Robux Premium dengan metode pembayaran QRIS & DANA!", link: "/buy-robux", active: true },
    { id: "b-2", imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80", title: "GAME PASS BLOX FRUITS INSTANT", subtitle: "Dapatkan Fruit Notifier dan Yoru dalam hitungan menit secara otomatis tanpa ribet!", link: "/buy-items", active: true }
  ],
  reviews: [
    { id: "rev-1", username: "roblox_lover99", robloxUsername: "RbxGamerPro", rating: 5, comment: "Top up robux termurah dan tercepat! Kurang dari 2 menit langsung masuk ke akun saya. Sangat direkomendasikan!", status: "approved", createdAt: "2026-07-15T12:00:00Z" },
    { id: "rev-2", username: "sultan_blox", robloxUsername: "SultanSlayer", rating: 5, comment: "Beli Fruit Notifier Blox Fruits di R8 prosesnya super instant. Cs nya juga ramah bgt waktu nanya via WhatsApp.", status: "approved", createdAt: "2026-07-16T14:30:00Z" },
    { id: "rev-3", username: "giff_me_robux", robloxUsername: "NoobRBLX", rating: 4, comment: "Webnya keren bgt, modern dan responsif di hp android saya. Mantap lah R8!", status: "approved", createdAt: "2026-07-17T09:15:00Z" }
  ],
  transactions: [
    {
      id: "R8-7281920",
      userId: "usr-buyer",
      robloxUsername: "Builderman",
      robloxDisplayName: "Builderman",
      robloxAvatar: "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false",
      type: "Robux",
      productName: "800 Robux Premium",
      amount: 800,
      price: 115000,
      paymentMethod: "QRIS",
      status: "Berhasil",
      createdAt: "2026-07-17T11:45:00Z",
      updatedAt: "2026-07-17T11:47:00Z"
    },
    {
      id: "R8-1092837",
      userId: "usr-buyer",
      robloxUsername: "Builderman",
      robloxDisplayName: "Builderman",
      robloxAvatar: "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false",
      type: "Item",
      productName: "Fruit Notifier - Blox Fruits",
      amount: 1,
      price: 350000,
      paymentMethod: "DANA",
      status: "Diproses",
      createdAt: "2026-07-18T10:20:00Z",
      updatedAt: "2026-07-18T10:20:00Z"
    },
    {
      id: "R8-3849102",
      robloxUsername: "LuffyGamer",
      robloxDisplayName: "LuffyRBLX",
      robloxAvatar: "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png/isCircular=false",
      type: "Robux",
      productName: "1,700 Robux",
      amount: 1700,
      price: 230000,
      paymentMethod: "OVO",
      status: "Menunggu Pembayaran",
      createdAt: "2026-07-18T16:40:00Z",
      updatedAt: "2026-07-18T16:40:00Z"
    }
  ],
  adminLogs: [
    { id: "log-1", adminUsername: "admin", action: "UPDATE_SETTINGS", details: "Mengubah kontak WhatsApp dan mengupdate promo banner", timestamp: "2026-07-18T09:00:00Z" },
    { id: "log-2", adminUsername: "admin", action: "UPDATE_ORDER", details: "Mengubah status transaksi R8-7281920 menjadi Berhasil", timestamp: "2026-07-17T11:47:00Z" }
  ],
  settings: {
    logoText: "R8 Premium",
    contactEmail: "support@r8premium.com",
    whatsappContact: "6281234567890",
    instagramUrl: "https://instagram.com/r8.premium",
    discordUrl: "https://discord.gg/r8premium",
    primaryColor: "emerald"
  },
  otps: {}
};

// Local cache
let cachedDB: DBStructure | null = null;

export function loadDB(): DBStructure {
  if (cachedDB) {
    return cachedDB;
  }

  ensureDirExists();

  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      cachedDB = JSON.parse(data);
      // Guarantee nested fields
      if (cachedDB) {
        cachedDB.otps = cachedDB.otps || {};
        return cachedDB;
      }
    }
  } catch (error) {
    console.error("Error loading db-store.json, using fallback", error);
  }

  // Initialize and save if file doesn't exist
  cachedDB = JSON.parse(JSON.stringify(initialDB));
  saveDB();
  return cachedDB!;
}

export function saveDB() {
  if (!cachedDB) return;
  ensureDirExists();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(cachedDB, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving db-store.json", error);
  }
}

export function addAdminLog(adminUsername: string, action: string, details: string) {
  const db = loadDB();
  const log: AdminLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminUsername,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.adminLogs.unshift(log);
  saveDB();
}
