export interface RobloxUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface RobuxPackage {
  id: string;
  amount: number;
  bonusAmount: number;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
  active: boolean;
  orderIndex: number;
}

export interface GamePassItem {
  id: string;
  name: string;
  gameName: string;
  price: number;
  originalPrice?: number;
  category: string; // e.g. "Blox Fruits", "Pet Simulator", "Adopt Me"
  imageUrl: string;
  active: boolean;
  orderIndex: number;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
  active: boolean;
}

export interface Review {
  id: string;
  username: string;
  robloxUsername?: string;
  rating: number; // 1 to 5
  comment: string;
  status: "approved" | "pending";
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  robloxUsername?: string;
  robloxAvatar?: string;
  createdAt: string;
  balance: number;
}

export type TransactionStatus = "Menunggu Pembayaran" | "Diproses" | "Berhasil" | "Gagal";

export interface Transaction {
  id: string;
  userId?: string;
  robloxUsername: string;
  robloxDisplayName: string;
  robloxAvatar: string;
  type: "Robux" | "Item";
  productName: string; // e.g. "1,000 Robux" or "Fruit Notifier"
  amount: number; // Robux count or item count
  price: number;
  paymentMethod: string; // e.g. "QRIS", "DANA"
  paymentDetails?: {
    qrCodeUrl?: string;
    vaNumber?: string;
    instructions?: string;
  };
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  robloxUsername?: string;
  robloxAvatar?: string;
  totalSpent: number;
}

export interface AdminLog {
  id: string;
  adminUsername: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  logoText: string;
  contactEmail: string;
  whatsappContact: string;
  instagramUrl: string;
  discordUrl: string;
  primaryColor: string; // CSS class/hex or configuration
}
