# ShopOps Visual Style Guide
This document defines the core visual language, layout rules, typography, colors, and component patterns for the ShopOps application UI. Use this guide to ensure consistency across all pages, components, and future features.

---

## 1. Layout Philosophy
ShopOps uses a **clean, modern, dark-panel dashboard style** inspired by themes like the Adminto template.

### Core Design Goals
- Maintain a **professional dashboard feel** (analytics-oriented, clean, precise).
- High information density without clutter.
- Clear visual hierarchy: page title → filters/actions → data/content.
- Consistent sidebar and top-bar interaction.
- A sense of depth using subtle shadows and elevation.

---

## 2. Global Layout

### Sidebar
- Fixed vertical left sidebar.
- Width: **240–260px**.
- Dark background: `#0E1117` to `#141821`.
- Active link: use accent color (ShopOps Blue).
- Icons before text, slight glow or highlight on hover.

### Top Navbar
- Stays fixed at the top on all pages.
- Contains:
  - Search bar (pill-shaped)
  - Language picker
  - Notifications
  - Dark/Light toggle
  - User avatar & name
- Flat background (semi-translucent dark or solid dark).

### Page Container
- Max width: full width, but layout should breathe (apply padding):
  - `padding: 24px 32px`.

---

## 3. Color Palette

### Primary Theme (Dark)
| Purpose | Color |
|--------|--------|
| Primary / Accent | `#4F8AFE` |
| Primary Hover | `#3C6FE0` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#A6A6A6` |
| Background (App) | `#0D1117` |
| Background (Card) | `#171C24` |
| Background (Hover) | `#1E242E` |
| Borders | `rgba(255,255,255,0.08)` |
| Success | `#31C48D` |
| Warning | `#F4BD0E` |
| Danger | `#E02424` |

### Light Mode (Future)
- Keep the same palette but invert background values.
- Cards: white `#FFFFFF`, text black `#111`, accents unchanged.

---

## 4. Typography

### Font Stack
Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif


### Type Scale
| Usage | Size | Weight |
|-------|------|---------|
| Page Title | 24–28px | 600 |
| Section Title | 18–20px | 600 |
| Body Main | 15–16px | 400–500 |
| Small Text | 13–14px | 400 |

### Rules
- Titles should always visually anchor the top-left of content.
- Avoid heavy weights except for emphasis (no 800–900).

---

## 5. Spacing & Sizing

Use a **4/8px modular scale**:
- Small spacing: 4px
- Standard spacing: 8px
- Section spacing: 16px
- Card spacing: 20–24px

Cards should feel roomy but not bloated:
- Padding: `20px 24px`
- Border radius: `8–12px`

---

## 6. Cards & Panels

### Card Rules
- Background: `#171C24`
- Border-radius: `10–12px`
- Soft shadow: subtle, `rgba(0,0,0,0.25)`
- Title at top-left, icons top-right.
- Footer or actions right-aligned.

### Examples Included in the Theme
- Dashboard summary cards
- Statistics panels
- Sales/cost/analytics charts
- Project summary cards

---

## 7. Tables

Tables should match the “DataTable” theme shown in reference images:

### Rules
- Row height: ~56px
- Alternating row hover color: `#1E242E`
- Header background: slightly darker than card (`#12161E`)
- Header text: **uppercase**, 12px, tracking 0.5–1px
- Right-aligned numeric columns
- Left-aligned everything else
- Action icons on far right, subtle hover effect

---

## 8. Forms & Modals

### Form Fields
- Rounded inputs (4–8px)
- Dark background input with lighter border
- Focus border: `#4F8AFE`
- Labels: small, semi-transparent white

### Modals
- Max width: 450–600px
- Centered content
- Header separated with a thin border
- Close icon aligned right

---

## 9. Charts

### Use
- Bar charts
- Line charts
- Doughnut/pie charts

### Style
- Rounded edges on bars
- Soft gridlines `rgba(255,255,255,0.05)`
- Primary line color: `#4F8AFE`
- Secondary line color: green `#31C48D`

---

## 10. Project Cards (future Kanban + Grid)

### For Kanban Columns
- Column width: **320–380px**
- Background: darker than card
- Card style:
  - Rounded corners
  - Light shadow
  - Status badge (color-coded)
  - Avatar group if team members (later: customer avatar?)

### For Project Grid
- Large card style matching template image shown
- Title left; status badge right
- Progress bar at bottom with bright accent color

---

## 11. Navigation Patterns

### Sidebar
- Groups: Dashboard, Customers, Projects, Inventory, Sales
- Subitems collapse under parents
- Active item: bright accent bar on the left

### Page Header Bar
Every page should begin with a consistent block:

[ Page Title ] [ Filters ] [ Search ] [ Actions ]


This gives everything a unified structure.

---

## 12. Component Library Rules

All future components should follow:

1. **Consistent corner radius (8–12px)**
2. **Consistent card padding (20–24px)**
3. **Consistent spacing scale (4/8/16/24px)**
4. **Consistent color usage (never random colors)**
5. **Consistent heading sizes**
6. **Consistent icons (use same icon library everywhere)**

---

## 13. Themes & Customization

### Dark Mode is default.
Light mode will be added later using:
- CSS variables
- Same palette, light backgrounds swapped in

---

## 14. Responsive Behavior

### Breakpoints
- Desktop (primary): 1200px+
- Tablet: 768–1199px
- Mobile: 0–767px

### Rules
- Sidebar collapses to icon-only around 1100–1200px
- Cards stack vertically on tablet
- Tables become collapsible or horizontal-scroll

---

## 15. Future-Proofing

This style guide supports:
- Dashboard charts & analytics pages
- Inventory management tables
- Customer overview pages
- Workflow/Kanban boards
- Invoicing modules
- ML insights dashboards (predictive pricing, project forecasting, etc.)

Keep adding updates here as new design decisions become consistent patterns.

---

# End of Document