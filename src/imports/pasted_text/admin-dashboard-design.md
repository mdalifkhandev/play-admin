Design a complete web-based Admin Dashboard for a TikTok-style short video platform. 
This is a desktop web application with a left sidebar navigation and a main content area. 
Create all screens listed below with a modern, clean, data-focused admin UI aesthetic.

GLOBAL STYLE GUIDE:
- Background color: #090909 (deep black) for sidebar and main background
- Content card/panel background: #1A1A1A (slightly lighter dark gray)
- Primary text color: #FFFFFF (white)
- Primary accent/action color: #84CC16 (lime green) — use for active nav items, buttons, 
  charts, progress indicators, positive stats, and highlights
- Secondary/muted text: #A0A0A0 (light gray) for labels, timestamps, subtext
- Warning/negative state color: soft red/orange for flagged content, rejected items
- Font: Clean, modern sans-serif, medium-bold for headings, regular weight for body text
- Rounded corners on cards, buttons, and tables (8-12px radius)
- Data tables with alternating row shades for readability
- Icons: minimal line-style icons in white, lime green for active/selected states

LAYOUT STRUCTURE (applies to all screens):
- Left Sidebar (fixed, dark #090909 background, ~240px wide):
  - Logo/App name at top
  - Navigation menu items with icons: Dashboard, User Management, Creator Management, 
    Content Moderation, Ad Management, Monetization & Revenue, Withdrawal Management, 
    Subscription Management, Rewards & Leaderboard, Live Management, Notifications, Settings
  - Active menu item highlighted with lime green (#84CC16) left border and icon color
- Top Bar (within main content area): breadcrumb/page title on left, admin profile 
  avatar + notification bell icon on right
- Main Content Area: scrollable, contains page-specific widgets/tables

---

SCREEN 1: Dashboard (Overview)
- Top row: 4 stat cards side by side (Total Users, Total Creators, Total Revenue Today, 
  Total Revenue This Month) — each card shows large bold white number, label in light gray, 
  small lime green up/down arrow with percentage change
- Middle section: 2 chart cards side by side
  - "User Growth" line chart (lime green line on dark background, last 30 days)
  - "Revenue Trend" bar chart (lime green bars, monthly breakdown)
- Below charts: "Active Users" area chart (full width, lime green gradient fill)
- Bottom section: "Recent Activity" feed as a list card — rows showing: new user signups, 
  pending creator approvals, flagged content alerts, each with icon, description text, 
  and timestamp

SCREEN 2: User Management
- Page header: "User Management" with a search bar (top-right) and filter dropdown 
  (All/Active/Banned/Suspended)
- Data table with columns: Avatar, Username, Email, Join Date, Status (colored pill: 
  green=Active, red=Banned, yellow=Suspended), Followers, Actions (three-dot menu icon)
- Row click opens a side panel/drawer: "User Details" showing profile picture, bio, 
  activity stats, video count, report history, with action buttons "Ban User", 
  "Suspend User", "Send Warning", "Verify Account"

SCREEN 3: Creator Management
- Tab navigation at top: "Pending Applications" / "Active Creators"
- Pending Applications tab: table with columns: Avatar, Name, Content Category, 
  Followers, Applied Date, Actions (Approve button in lime green, Reject button in 
  outline red)
- Active Creators tab: table with columns: Avatar, Name, Followers, Total Earnings, 
  Status, Actions (View Performance, Revoke Creator Status)
- Clicking "View Performance" opens detail view with individual stats: earnings graph, 
  video performance, engagement rate

SCREEN 4: Content Moderation
- Tab navigation: "Reported Videos" / "Reported Comments" / "Violation Log"
- Reported Videos tab: grid/list of video thumbnails with reporter count badge, 
  report reason tag, and action buttons: "Remove" (red), "Warn Creator" (yellow outline), 
  "Ignore" (gray outline)
- Violation Log tab: table showing user, violation type, date, action taken, strike count

SCREEN 5: Ad Management
- Tab navigation: "Advertisers" / "Campaign Approvals" / "Active Campaigns"
- Advertisers tab: table with columns: Business Name, Contact Email, Total Spend, 
  Account Status
- Campaign Approvals tab: cards showing ad creative preview, campaign name, budget, 
  target audience, with "Approve" (lime green) / "Reject" (red outline) buttons
- Active Campaigns tab: table with Campaign Name, Status (Active/Paused), Impressions, 
  Clicks, Spend, Actions (Pause/Edit)
- Bottom: "Ad Revenue Report" chart card showing revenue over time

SCREEN 6: Monetization & Revenue
- Top: revenue breakdown donut/pie chart showing split between "Ad Revenue" and 
  "Premium Subscription" (lime green and white/gray segments)
- Below: "Creator Earnings Overview" table — Creator Name, Total Earnings, This Month, 
  Payout Status
- Bottom card: "Revenue Share Settings" — slider/input control for setting percentage 
  split between Creator and Admin (e.g., "Creator: 60% / Admin: 40%"), with "Save" button

SCREEN 7: Withdrawal Management
- Tab navigation: "Pending Requests" / "KYC Verification" / "History"
- Pending Requests tab: table with Creator Name, Amount, Requested Date, Payment Method, 
  Actions (Approve lime green button, Reject red outline button)
- KYC Verification tab: list of submitted ID documents (thumbnail previews), creator name, 
  submission date, Approve/Reject buttons
- History tab: table with Date, Creator, Amount, Status (Completed/Rejected), Reference ID

SCREEN 8: Subscription Management
- Top: 3 stat cards — Total Premium Subscribers, Monthly Subscribers count, Yearly 
  Subscribers count
- Chart: "Subscription Revenue Trend" line chart
- Below: table listing subscribers — Username, Plan Type (Monthly/Yearly), Start Date, 
  Status (Active/Cancelled/Expired, colored pill)

SCREEN 9: Rewards & Leaderboard
- Top: "Leaderboard Overview" table showing Rank, Creator Name, Followers, Likes, 
  Engagement Score, Total Score — Top 10 rows highlighted with lime green left border
- Section: "Ranking Criteria Settings" — sliders/input fields to set weight percentage 
  for Followers/Likes/Engagement, with "Save Settings" button
- Section: "Reward Configuration" — cards for each reward type: "Vehicle Giveaway" 
  (cycle: Yearly, toggle Active/Inactive), "Scholarship Fund" (eligibility criteria text 
  field), "Cash/Fund Support" (criteria field)
- Section: "Winner Management" — table of finalized winners by year, with 
  "Finalize Current Cycle Winners" button (lime green)

SCREEN 10: Live Management
- Tab navigation: "Ongoing Streams" / "Reported Streams" / "History"
- Ongoing Streams tab: grid of live stream thumbnail cards showing creator name, 
  viewer count (live badge in red "LIVE"), "Force End" action button
- Reported Streams tab: list with creator name, report reason, timestamp, action buttons
- History tab: table with Creator, Date, Duration, Peak Viewers, Status

SCREEN 11: Notifications & Announcements
- Form section: "Create New Announcement" — Title input, Message textarea, 
  Target Audience dropdown (All Users/Creators Only/Premium Users), 
  Schedule toggle (Send Now/Schedule for Later) with date-time picker
- "Send Announcement" button in lime green
- Below: table of past sent announcements — Title, Sent Date, Audience, Status

SCREEN 12: Settings & Configuration
- Sectioned form layout with cards:
  - "Milestone Thresholds" — input fields for Follower count, View count, Account age 
    required for Creator status
  - "Ad Frequency" — input for number of videos between ads
  - "Payout Rate" — input for per-1000-view rate, region-based rate table
  - "Admin Roles & Permissions" — table listing admin team members, role dropdown 
    (Super Admin/Moderator/Support), Actions (Edit/Remove)
  - "Language Management" — list of 5 active languages with toggle switches, 
    "Add Language" button

---

Ensure consistent spacing, clear data hierarchy, and readable tables throughout. Maintain 
dark theme (#090909 background, #1A1A1A cards) with #84CC16 as the singular accent color 
for all charts, active states, approval buttons, and highlights. Use #FFFFFF for primary 
text and #A0A0A0 for secondary/muted text and table subtext. All data tables should have 
clear column alignment, hover states, and pagination controls at the bottom.