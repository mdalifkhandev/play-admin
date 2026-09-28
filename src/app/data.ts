// Centralized mock data for the admin dashboard.

export const ACCENT = "#84CC16";

export const userGrowth = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  users: Math.round(1200 + i * 90 + Math.sin(i / 2) * 220),
}));

export const revenueTrend = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 51000 },
  { month: "Mar", revenue: 48500 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 73500 },
  { month: "Jun", revenue: 82000 },
  { month: "Jul", revenue: 94500 },
];

export const activeUsers = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  active: Math.round(3000 + Math.sin(i / 3) * 1800 + i * 40),
}));

export const recentActivity = [
  { id: "a1", type: "signup", text: "New user @mia.creates just signed up", time: "2m ago" },
  { id: "a2", type: "approval", text: "Creator application from @danceking is pending review", time: "14m ago" },
  { id: "a3", type: "flag", text: "Video #48213 flagged for community guideline violation", time: "38m ago" },
  { id: "a4", type: "signup", text: "New user @thegabriel joined via referral", time: "1h ago" },
  { id: "a5", type: "approval", text: "Creator application from @lofi.beats approved", time: "2h ago" },
  { id: "a6", type: "flag", text: "3 comments reported on video #47990", time: "3h ago" },
];

export type UserStatus = "Active" | "Banned" | "Suspended";
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  status: UserStatus;
  followers: number;
  avatar: string;
  bio: string;
  videos: number;
  reports: number;
}

const names = [
  "mia.creates", "danceking", "lofi.beats", "thegabriel", "sunny.vibes",
  "urban.explorer", "chef.marco", "fit.with.zoe", "retro.gamer", "the.painter",
  "night.owl", "coco.travels", "brick.builds", "vinyl.days", "hoops.daily",
];
const statuses: UserStatus[] = ["Active", "Active", "Active", "Banned", "Suspended", "Active"];

export const users: AdminUser[] = names.map((n, i) => ({
  id: `u${i + 1}`,
  username: `@${n}`,
  email: `${n.replace(/\./g, "")}@mail.com`,
  joinDate: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  status: statuses[i % statuses.length],
  followers: Math.round(1000 + Math.random() * 900000),
  avatar: `https://i.pravatar.cc/120?img=${i + 5}`,
  bio: "Short-form video creator sharing daily moments and creative edits.",
  videos: Math.round(20 + Math.random() * 400),
  reports: Math.round(Math.random() * 6),
}));

export interface PendingCreator {
  id: string;
  name: string;
  category: string;
  followers: number;
  applied: string;
  avatar: string;
}
export const pendingCreators: PendingCreator[] = [
  { id: "p1", name: "@danceking", category: "Dance", followers: 128000, applied: "2026-07-12", avatar: "https://i.pravatar.cc/120?img=12" },
  { id: "p2", name: "@chef.marco", category: "Food", followers: 84500, applied: "2026-07-14", avatar: "https://i.pravatar.cc/120?img=15" },
  { id: "p3", name: "@fit.with.zoe", category: "Fitness", followers: 203000, applied: "2026-07-15", avatar: "https://i.pravatar.cc/120?img=20" },
  { id: "p4", name: "@retro.gamer", category: "Gaming", followers: 56000, applied: "2026-07-16", avatar: "https://i.pravatar.cc/120?img=33" },
];

export interface ActiveCreator {
  id: string;
  name: string;
  followers: number;
  earnings: number;
  status: "Active" | "Warned";
  avatar: string;
}
export const activeCreators: ActiveCreator[] = [
  { id: "c1", name: "@mia.creates", followers: 512000, earnings: 48200, status: "Active", avatar: "https://i.pravatar.cc/120?img=5" },
  { id: "c2", name: "@lofi.beats", followers: 388000, earnings: 39100, status: "Active", avatar: "https://i.pravatar.cc/120?img=8" },
  { id: "c3", name: "@sunny.vibes", followers: 271000, earnings: 22750, status: "Warned", avatar: "https://i.pravatar.cc/120?img=9" },
  { id: "c4", name: "@urban.explorer", followers: 190000, earnings: 15400, status: "Active", avatar: "https://i.pravatar.cc/120?img=11" },
];

export const creatorEarningsGraph = revenueTrend.map((r) => ({ month: r.month, earnings: Math.round(r.revenue / 12) }));

export interface ReportedVideo {
  id: string;
  creator: string;
  reason: string;
  reports: number;
  thumb: string;
}
export const reportedVideos: ReportedVideo[] = [
  { id: "v1", creator: "@night.owl", reason: "Nudity", reports: 42, thumb: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80" },
  { id: "v2", creator: "@retro.gamer", reason: "Hate speech", reports: 18, thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80" },
  { id: "v3", creator: "@brick.builds", reason: "Spam", reports: 9, thumb: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400&q=80" },
  { id: "v4", creator: "@vinyl.days", reason: "Violence", reports: 27, thumb: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80" },
];

export const violationLog = [
  { id: "vl1", user: "@night.owl", type: "Nudity", date: "2026-07-10", action: "Video removed", strikes: 2 },
  { id: "vl2", user: "@retro.gamer", type: "Hate speech", date: "2026-07-11", action: "Creator warned", strikes: 1 },
  { id: "vl3", user: "@vinyl.days", type: "Violence", date: "2026-07-12", action: "Account suspended", strikes: 3 },
  { id: "vl4", user: "@brick.builds", type: "Spam", date: "2026-07-13", action: "Ignored", strikes: 0 },
];

export const advertisers = [
  { id: "ad1", business: "Nova Sneakers", email: "ads@novasneakers.com", spend: 128000, status: "Active" },
  { id: "ad2", business: "GlowUp Cosmetics", email: "media@glowup.com", spend: 84500, status: "Active" },
  { id: "ad3", business: "PixelPlay Games", email: "growth@pixelplay.io", spend: 46000, status: "Paused" },
  { id: "ad4", business: "FreshBox Meals", email: "hello@freshbox.com", spend: 21000, status: "Active" },
];

export const campaignApprovals = [
  { id: "ca1", name: "Summer Sneaker Drop", budget: 40000, audience: "18-24, Sports", thumb: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { id: "ca2", name: "Glow Serum Launch", budget: 25000, audience: "18-34, Beauty", thumb: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80" },
  { id: "ca3", name: "Battle Royale Season", budget: 60000, audience: "16-28, Gaming", thumb: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80" },
];

export const activeCampaigns = [
  { id: "ac1", name: "Summer Sneaker Drop", status: "Active", impressions: 2400000, clicks: 84000, spend: 32000 },
  { id: "ac2", name: "Glow Serum Launch", status: "Paused", impressions: 1200000, clicks: 41000, spend: 18500 },
  { id: "ac3", name: "FreshBox Weekly", status: "Active", impressions: 890000, clicks: 22000, spend: 9800 },
];

export const adRevenue = revenueTrend.map((r) => ({ month: r.month, revenue: Math.round(r.revenue * 0.6) }));

export const revenueSplit = [
  { name: "Ad Revenue", value: 68 },
  { name: "Premium Subscription", value: 32 },
];

export const payoutStatuses = ["Paid", "Pending", "Paid", "Processing"] as const;
export const creatorEarnings = activeCreators.map((c, i) => ({
  id: c.id,
  name: c.name,
  total: c.earnings,
  thisMonth: Math.round(c.earnings / 6),
  payout: payoutStatuses[i % payoutStatuses.length],
}));

export const withdrawalRequests = [
  { id: "w1", creator: "@mia.creates", amount: 4200, date: "2026-07-18", method: "Bank Transfer" },
  { id: "w2", creator: "@lofi.beats", amount: 3100, date: "2026-07-18", method: "PayPal" },
  { id: "w3", creator: "@sunny.vibes", amount: 1850, date: "2026-07-19", method: "Bank Transfer" },
  { id: "w4", creator: "@urban.explorer", amount: 920, date: "2026-07-19", method: "Stripe" },
];

export const kycSubmissions = [
  { id: "k1", creator: "@chef.marco", date: "2026-07-15", doc: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&q=80" },
  { id: "k2", creator: "@fit.with.zoe", date: "2026-07-16", doc: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&q=80" },
  { id: "k3", creator: "@retro.gamer", date: "2026-07-17", doc: "https://images.unsplash.com/photo-1568057373467-2b47bb7f5c25?w=300&q=80" },
];

export const withdrawalHistory = [
  { id: "h1", date: "2026-07-10", creator: "@mia.creates", amount: 3800, status: "Completed", ref: "TXN-88213" },
  { id: "h2", date: "2026-07-08", creator: "@night.owl", amount: 1200, status: "Rejected", ref: "TXN-88117" },
  { id: "h3", date: "2026-07-05", creator: "@lofi.beats", amount: 2600, status: "Completed", ref: "TXN-87995" },
  { id: "h4", date: "2026-07-02", creator: "@sunny.vibes", amount: 1500, status: "Completed", ref: "TXN-87810" },
];

export const subscriptionRevenue = revenueTrend.map((r) => ({ month: r.month, revenue: Math.round(r.revenue * 0.35) }));

export const subscribers = [
  { id: "s1", username: "@mia.creates", plan: "Yearly", start: "2025-09-01", status: "Active" },
  { id: "s2", username: "@thegabriel", plan: "Monthly", start: "2026-06-12", status: "Active" },
  { id: "s3", username: "@coco.travels", plan: "Monthly", start: "2026-05-20", status: "Canceled" },
  { id: "s4", username: "@hoops.daily", plan: "Yearly", start: "2025-11-11", status: "Active" },
  { id: "s5", username: "@vinyl.days", plan: "Monthly", start: "2026-01-03", status: "Expired" },
];

export const leaderboard = Array.from({ length: 12 }, (_, i) => ({
  rank: i + 1,
  name: `@${names[i]}`,
  followers: Math.round(600000 - i * 42000),
  likes: Math.round(12000000 - i * 700000),
  engagement: (9.8 - i * 0.4).toFixed(1),
  score: Math.round(9800 - i * 420),
}));

export const winners = [
  { id: "wn1", year: "2025", name: "@mia.creates", reward: "Vehicle Giveaway" },
  { id: "wn2", year: "2024", name: "@lofi.beats", reward: "Scholarship Fund" },
  { id: "wn3", year: "2023", name: "@urban.explorer", reward: "Cash Support" },
];

export const ongoingStreams = [
  { id: "ls1", creator: "@sunny.vibes", viewers: 12400, thumb: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80" },
  { id: "ls2", creator: "@fit.with.zoe", viewers: 8600, thumb: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { id: "ls3", creator: "@retro.gamer", viewers: 5300, thumb: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&q=80" },
  { id: "ls4", creator: "@chef.marco", viewers: 3100, thumb: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80" },
];

export const reportedStreams = [
  { id: "rs1", creator: "@night.owl", reason: "Inappropriate content", time: "5m ago" },
  { id: "rs2", creator: "@vinyl.days", reason: "Harassment", time: "22m ago" },
];

export const streamHistory = [
  { id: "sh1", creator: "@sunny.vibes", date: "2026-07-18", duration: "1h 42m", peak: 18200, status: "Ended" },
  { id: "sh2", creator: "@fit.with.zoe", date: "2026-07-17", duration: "58m", peak: 9400, status: "Ended" },
  { id: "sh3", creator: "@night.owl", date: "2026-07-16", duration: "12m", peak: 2100, status: "Force ended" },
];

export const pastAnnouncements = [
  { id: "an1", title: "New Creator Fund launched", date: "2026-07-15", audience: "Creators Only", status: "Sent" },
  { id: "an2", title: "Scheduled maintenance July 20", date: "2026-07-14", audience: "All Users", status: "Sent" },
  { id: "an3", title: "Premium price update", date: "2026-07-10", audience: "Premium Users", status: "Sent" },
];

export const adminTeam = [
  { id: "at1", name: "Alex Reed", email: "alex@platform.com", role: "Super Admin" },
  { id: "at2", name: "Priya Nair", email: "priya@platform.com", role: "Moderator" },
  { id: "at3", name: "Sam Cole", email: "sam@platform.com", role: "Support" },
];

export const languages = [
  { id: "l1", name: "English", active: true },
  { id: "l2", name: "Spanish", active: true },
  { id: "l3", name: "French", active: true },
  { id: "l4", name: "Hindi", active: true },
  { id: "l5", name: "Japanese", active: false },
];

export const kidsTaggedContent = [
  { id: "kt1", uploader: "@lofi.beats", date: "2026-07-14", tagged: true, thumb: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80" },
  { id: "kt2", uploader: "@coco.travels", date: "2026-07-13", tagged: true, thumb: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80" },
  { id: "kt3", uploader: "@brick.builds", date: "2026-07-12", tagged: true, thumb: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=80" },
  { id: "kt4", uploader: "@chef.marco", date: "2026-07-11", tagged: false, thumb: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80" },
  { id: "kt5", uploader: "@the.painter", date: "2026-07-10", tagged: true, thumb: "https://images.unsplash.com/photo-1499084732479-de2c02d45fcc?w=400&q=80" },
];

export const kidsReportedContent = [
  { id: "kr1", uploader: "@night.owl", reports: 34, reason: "Not age-appropriate", date: "2026-07-15", thumb: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80" },
  { id: "kr2", uploader: "@retro.gamer", reports: 18, reason: "Violent content", date: "2026-07-14", thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80" },
  { id: "kr3", uploader: "@vinyl.days", reports: 9, reason: "Inappropriate language", date: "2026-07-13", thumb: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80" },
];

export const kidsAgeBreakdown = [
  { range: "3-6", users: 28400 },
  { range: "7-9", users: 41200 },
  { range: "10-12", users: 36700 },
];

export const coinPackages = [
  { id: "cp1", coins: 100, price: "0.99", active: true },
  { id: "cp2", coins: 500, price: "4.99", active: true },
  { id: "cp3", coins: 1000, price: "9.99", active: true },
  { id: "cp4", coins: 5000, price: "44.99", active: false },
  { id: "cp5", coins: 10000, price: "84.99", active: true },
];

export const giftCatalog = [
  { id: "g1", name: "Rose", icon: "🌹", cost: 1, active: true },
  { id: "g2", name: "Rocket", icon: "🚀", cost: 500, active: true },
  { id: "g3", name: "Diamond", icon: "💎", cost: 1000, active: true },
  { id: "g4", name: "Crown", icon: "👑", cost: 2000, active: true },
  { id: "g5", name: "Heart", icon: "❤️", cost: 5, active: true },
  { id: "g6", name: "Lion", icon: "🦁", cost: 3000, active: false },
];

export const coinTransactions = [
  { id: "ct1", user: "@mia.creates", type: "Purchase", amount: "1,000 Coins", date: "2026-07-19", status: "Completed" },
  { id: "ct2", user: "@thegabriel", type: "Gift Sent", amount: "Rocket (500)", date: "2026-07-19", status: "Completed" },
  { id: "ct3", user: "@coco.travels", type: "Purchase", amount: "500 Coins", date: "2026-07-18", status: "Completed" },
  { id: "ct4", user: "@hoops.daily", type: "Gift Sent", amount: "Diamond (1,000)", date: "2026-07-18", status: "Pending" },
  { id: "ct5", user: "@vinyl.days", type: "Purchase", amount: "100 Coins", date: "2026-07-17", status: "Rejected" },
  { id: "ct6", user: "@sunny.vibes", type: "Gift Sent", amount: "Rose (1)", date: "2026-07-17", status: "Completed" },
];

export const formatNumber = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;

export const formatMoney = (n: number) => `$${n.toLocaleString()}`;
