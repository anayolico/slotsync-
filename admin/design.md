# SlotSync Admin Dashboard - Design Specification (`design.md`)

This document outlines the visual design system, layout grid, typography, colors, and component hierarchy for the SlotSync Admin Dashboard based on the reference UI design mockup.

---

## 1. Visual Theme & Color Palette

### Colors
- **App Background**: `#f4f6fa` (Soft slate light background)
- **Card Background**: `#ffffff` (Crisp white panels)
- **Primary Accent Gradient**: `linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)` (Deep Indigo / Royal Purple)
- **Secondary Metric Cards**: `#f0f7ff` (Ice blue light tint) & `#eefcfd` (Cyan light tint)
- **Chart Bars & Accent Highlights**:
  - Indigo / Violet: `#4338ca`
  - Vibrant Cyan: `#22d3ee`
  - Soft Coral / Orange: `#fb923c`
  - Success Green: `#10b981`
- **Text Palette**:
  - Primary Headers: `#1e293b` (Dark Slate)
  - Secondary Text: `#64748b` (Muted Slate)
  - Dim Hints: `#94a3b8`
- **Borders & Dividers**: `1px solid #e2e8f0`

---

## 2. Layout Structure

The layout uses a 3-column architecture (Sidebar + Main Content Grid + Right Panel Widget Column):

```
+------------------+-----------------------------------------------+---------------------+
| SIDEBAR          | MAIN CONTENT AREA                             | RIGHT PANEL         |
|                  |                                               |                     |
| [SlotSync Logo]  | [Header: Title, Plan Badge, Profile]          | [Interactive        |
|                  |                                               |  Calendar Widget]   |
| Menu Links:      | [Hero Stats: 1 Big Gradient Card + 2 Stacked] |                     |
| - Dashboard      |                                               | [Upcoming           |
| - Creators       | [Bar Chart: Booking Sources]                  |  Appointments       |
| - Services       |                                               |  List]              |
| - Appointments   | [Data Table: Recent Bookings]                 |                     |
| - Settings       |                                               |                     |
|                  |                                               |                     |
| [PRO Promo Card] |                                               |                     |
+------------------+-----------------------------------------------+---------------------+
```

---

## 3. Detailed Component Breakdown

### A. Left Navigation Sidebar
- **Header**: Brand logo with icon badge and "SlotSync" title.
- **Navigation Links**:
  - Dashboard (Active state with indigo background indicator)
  - Team & Availability / Creators
  - Services / Slots
  - Clients / Appointments
  - Settings
  - Notifications
- **Upgrade Banner**: Soft gradient promo box at the bottom featuring a rocket icon, upgrade description, and "Upgrade Now" call-to-action button.

### B. Main Header & Top Controls
- **Page Title**: "SlotSync Statistics"
- **Controls**:
  - "Free Plan" coffee cup badge
  - Notification icon with active notification dot
  - User avatar with dropdown indicator

### C. Hero Metric Cards (Top Main Section)
- **Primary Hero Card**:
  - Vibrant gradient background (`#4f46e5` to `#6366f1`).
  - Organic glowing vector loops overlay.
  - Large main stat counter (e.g. `1,436 Total Bookings`).
  - Action link with diagonal arrow (`See details ↗`).
- **Stacked Secondary Cards**:
  - Top Card: Violet icon badge, `424` Confirmed Slots indicator.
  - Bottom Card: Cyan icon badge, `103` Active Creators indicator.

### D. Activity & Booking Sources Bar Chart
- **Header**: Title "Top Booking Sources" with legend toggle dots (Direct, Organic, App).
- **Chart**: Custom SVG / CSS bar chart with grouped rounded bars in violet, cyan, and orange.

### E. Data Table ("Recent Bookings")
- **Columns**: Service Title, Client / Category, Date Period, Status / Options.
- **Styling**: Minimalist borderless table with subtle hover state and clean typography.

### F. Right Panel: Interactive Calendar & Upcoming Schedule
- **Monthly Calendar Widget**:
  - Header with Month / Year and navigation arrows (`<` `>`).
  - Grid showing day abbreviations (`S M T W T F S`) and day numbers.
  - Current day circle highlight with active event dots below scheduled dates.
- **Upcoming Appointments List**:
  - List items showing user avatar, name, appointment role, and clock time badge (e.g. `10:00 - 12:45`).

---

## 4. Typography & Styling Tokens

```css
font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
border-radius: 16px; /* Cards */
border-radius: 12px; /* Buttons & Inputs */
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
```
