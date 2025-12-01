# ShopOps Layout Grid & Breakpoints

This document defines how pages should be structured on different screen sizes.

---

## 1. Breakpoints

- **Desktop:** ≥ 1200px
- **Tablet:** 768–1199px
- **Mobile:** < 768px

---

## 2. Grid System

### Desktop
- 12-column grid
- Gutter: 24px
- Max content width: 1440px (centered)
- Page padding: 24px left/right

Examples:
- Dashboard: 4–4–4 for top metric cards, 8–4 for main content.
- Two-column pages (e.g. customer detail): 8–4 or 9–3.

### Tablet
- 8-column grid
- Gutter: 16px
- Sidebar collapses to icon-only or off-canvas.
- Cards stack to 2-per-row where possible.

### Mobile
- Single column
- Full-width cards
- Sidebar becomes drawer overlay.

---

## 3. Page Structure Pattern

Every main page (Customers, Projects, Inventory, etc.) uses this skeleton:

1. **Page Header Row**
   - Left: Title + optional subtitle
   - Right: Filters, sort, search, primary CTA

2. **Filters Row (optional)**
   - Chips, dropdowns, date pickers

3. **Main Content**
   - Tables, cards, charts or kanban columns

4. **Footer Row (optional)**
   - Pagination, totals, secondary actions

---

## 4. Dashboard Layout Example

Desktop:
- Row 1: 3 metric tiles (4 columns each).
- Row 2: 6–6 split: large chart + donut chart.
- Row 3: 8–4 split: table + recent activity.

Tablet:
- Row 1: 2 tiles per row.
- Charts and tables stack vertically.

Mobile:
- Single-column stack: metrics → charts → tables.

---

## 5. Detail Page Layout Example (Customer Detail)

Desktop:
- Left (8 columns):
  - Customer summary card
  - Tabs: Projects, Sales, Notes
- Right (4 columns):
  - Contact details card
  - Stats mini-cards (`Lifetime value`, `Projects count`, etc.)

Tablet:
- 2-column layout with stacked cards.

Mobile:
- Single-column stack, most important info first.

---
