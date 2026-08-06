// ===== User Types =====
export type UserRole = "producer" | "buyer" | "both";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  bio: string;
  socialLinks: SocialLink[];
  createdAt: Date;
  totalSales?: number;
  totalEarnings?: number;
  avgRating?: number;
}

export interface SocialLink {
  platform: string;
  url: string;
}

// ===== Beat Types =====
export type BeatFormat = "wav" | "mp3" | "flac" | "stems";

export interface Beat {
  id: string;
  producerId: string;
  producerName: string;
  producerAvatar: string;
  title: string;
  description: string;
  genres: string[];
  tags: string[];
  formats: BeatFormat[];
  bpm: number;
  key: string;
  duration: number; // seconds
  prices: Record<BeatFormat, number>;
  previewUrl: string;
  waveformData: number[];
  coverArtUrl: string;
  avgRating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: Date;
  isActive: boolean;
  isFree?: boolean;
  energyArc?: "slow-build" | "anthemic" | "minimal";
  hasVocalChopStem?: boolean;
}

// ===== Beat Pack Types =====
export interface BeatPack {
  id: string;
  producerId: string;
  producerName: string;
  title: string;
  description: string;
  coverArtUrl: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  allowMixMatch: boolean;
  maxBeats: number;
  beatIds: string[];
  beats?: Beat[];
  createdAt: Date;
  isFreeStarterPack?: boolean;
}

// ===== Order Types =====
export type OrderStatus = "pending" | "paid" | "refunded";

export interface Order {
  id: string;
  buyerId: string;
  stripePaymentId: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  beatId: string;
  beatTitle: string;
  beatCoverUrl: string;
  packId?: string;
  format: BeatFormat;
  licenseType: string;
  price: number;
  downloadUrl: string;
  downloadCount: number;
}

// ===== Review Types =====
export interface Review {
  id: string;
  beatId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// ===== Wishlist Types =====
export interface WishlistItem {
  id: string;
  userId: string;
  beatId: string;
  beat?: Beat;
  addedAt: Date;
}

// ===== Notification Types =====
export type NotificationType = "sale" | "review" | "release" | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

// ===== Cart Types =====
export interface CartItem {
  beatId: string;
  beat: Beat;
  format: BeatFormat;
  price: number;
  packId?: string;
}

// ===== Genre & Format Constants =====
export const GENRES = [
  "Fred Again Type",
  "UK Garage",
  "Hip Hop",
  "Trap",
  "R&B",
  "Pop",
  "Lo-Fi",
  "Drill",
  "Afrobeats",
  "House",
  "Techno",
  "Reggaeton",
  "Soul",
  "Jazz",
  "Boom Bap",
  "EDM",
  "Dancehall",
  "Ambient",
] as const;

export const FRED_AGAIN_SUBTAGS = [
  "chopped-vocal",
  "garage-house",
  "emotional-build",
  "festival-drop",
  "two-step",
  "drone-intro",
  "rolling-bass",
] as const;

export const FORMATS: { value: BeatFormat; label: string; description: string }[] = [
  { value: "mp3", label: "MP3", description: "320kbps • Previewing & Basic Use" },
  { value: "wav", label: "WAV", description: "24-bit • Studio Quality" },
  { value: "flac", label: "FLAC", description: "Lossless • Archival Quality" },
  { value: "stems", label: "STEMS", description: "Individual Tracks • Full Control" },
];

export const MUSICAL_KEYS = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
  "Cm", "C#m", "Dm", "D#m", "Em", "Fm",
  "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
] as const;
