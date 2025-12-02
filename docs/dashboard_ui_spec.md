# ShopOps Dashboard UI Specification (ApexCharts)

## 1. Purpose

The Dashboard is the **home screen** for ShopOps. It should give the shop owner a quick, visual overview of:

- Orders
- Revenue
- Customers
- Projects
- Cancellations
- Channel mix (where sales are coming from)
- Revenue vs expenses by month
- Top products
- Low inventory
- Recent activity

The dashboard must:

- Work in **light and dark mode** using existing theme tokens.
- Match the **Adminto-style grid** and current ShopOps shell (topbar + sidebar).
- Be built in a way that is **extensible** (easy to add new panels and filters).

Tech assumptions:

- Frontend: React
- Charts: **ApexCharts**, via `react-apexcharts`
- Layout: existing `AppLayout` (sidebar + topbar + content area)
- Styling: `theme.css` tokens + `index.css` component styles

---

## 2. Layout & Grid

### 2.1 Overall layout

- Route: `/dashboard` → `Dashboard.jsx`
- Dashboard uses existing `AppLayout`:
  - Sidebar on the left
  - Topbar on top
  - Main content inside `.app-shell__content`

### 2.2 Grid (Desktop ≥ 1280px)

**Row 1 – Metric cards (5 cards)**

All default to **“In the last 30 days”**:

1. Total Orders (radial chart)
2. Total Revenue (trend indicator)
3. New Customers (trend indicator)
4. Active Projects (trend indicator)
5. Cancelled Orders (trend indicator)

**Row 2 – Charts (2 cards)**

6. Order Statistics (channel pie/donut) – 2/3 width  
7. Project Status (status pie/donut) – 1/3 width  

**Row 3 – Charts (2 cards)**

8. Sales by Month (bar chart) – 1/2 width  
9. Revenue vs Expenses (line chart) – 1/2 width  

**Row 4 – Extra panels (3 cards)**

10. Top Products by Revenue (table) – 1/2 width  
11. Low Inventory / At-Risk Items (table) – 1/2 width  
12. Recent Activity Feed (list) – full width (or shared row depending on space)

### 2.3 Card styling

- Wrapper class: `.dashboard-card` (or equivalent)
- Background: `var(--color-bg-surface)`
- Border: `1px solid var(--color-border-subtle)`
- Border radius: **5px**
- Padding:
  - Header: `0.75rem 1rem`
  - Body: `0.75rem 1rem 1rem`
- Shadow:
  - Light mode: `0 8px 18px rgba(15, 23, 42, 0.08)`
  - Dark mode: `0 10px 24px rgba(0, 0, 0, 0.45)`
- Title:
  - `font-weight: 600`
  - Color: `var(--color-text-primary)`
- Subtitle / caption:
  - Font size: ~0.8–0.85rem
  - Color: `var(--color-text-secondary)`

---

## 3. Card Header & Actions

### 3.1 Card header layout

Every card header contains:

- Left:
  - Title (e.g. `"Total Orders"`)
  - Optional subtitle (e.g. `"In the last 30 days"`)
- Right:
  - Card actions dropdown button (three-dot icon, e.g. lucide `MoreHorizontal`)

### 3.2 Card actions dropdown

Each card has a dropdown menu with:

1. **Fullscreen**
   - Behavior:
     - Expands the selected card to fill the content area under the topbar.
     - Other cards are hidden/dimmed (implementation: state like `fullscreenCardId` in `Dashboard.jsx`).
   - Fullscreen mode:
     - Card occupies the grid alone (or overlay).
     - Show “Exit Fullscreen” action in the card header (e.g. an `X` icon or button).

2. **Reports**
   - Placeholder for now; confirm click works.
   - Later will navigate or open detailed reports for that metric (e.g. `/reports/orders`).

Dropdown styling:

- Background: `var(--color-bg-surface)`
- Border: `1px solid var(--color-border-subtle)`
- Border radius: ~`0.5rem`
- Hover:
  - Light mode: `#e4e9f2`
  - Dark mode: `#373847`
- Align menu to right edge of card header.
- Close when clicking outside or on an item.

---

## 4. Time Window & Trend Logic

### 4.1 Default time window

For widgets unless explicitly noted:

- **Rolling last 30 days**, based on current date.
- UI text: show “In the last 30 days” (or similar) on metric cards and relevant charts.

Charts by month:

- Use the **last 12 months**, including the current month (even if partial).

### 4.2 Period comparison for trends

Trend metrics compare:

- **Current period:** latest 30 days
- **Previous period:** 30 days immediately before current period

Trend percentage formula:

```text
pct_change = (current - previous) / previous * 100
```

When previous is 0:

- Avoid divide-by-zero.

- Use null and display "—" or "New" in the UI.

- Don’t show an arrow or color if there is no meaningful baseline.

### 4.3 Trend semantics & colors
Use the following rules:

- **Total Revenue**

  - Green: current > previous

  - Red: current < previous

- **New Customers**

  - Green: current > previous

  - Red: current < previous

- **Active Projects**

  - Green: current > previous

  - Red: current < previous

- **Cancelled Orders**

  - Green: current < previous (cancellations decreased)

  - Red: current > previous (cancellations increased)

- **Trend badge UI:**

  - Displays arrow and percentage, e.g. ▲ +12.3% or ▼ -5.1%

  - Colors:

    - Green background for “good“:

      - Based on var(--color-success) (tinted if needed)

    - Red background for “bad“:

      - Based on var(--color-danger) (tinted if needed)

  - Text color: white in both themes.

## 5. Widgets & Panels
### 5.1 Metric Cards (Row 1)

**5.1.1 Total Orders (Radial Chart)**
- ID: totalOrders

- Title: “Total Orders”

- Subtitle: “In the last 30 days”

- Metric: integer count of all orders created in last 30 days.

- Chart: ApexCharts radialBar.

Radial chart spec (conceptual):

- Type: radialBar

- Center label: total orders (e.g., 256)

- Outer progress: could represent

  - % change vs previous period, or

  - progress toward some “goal”; for now, likely % vs previous.

- Colors:

  - Primary arc: var(--color-primary)

  - Track/background: light neutral in light mode, dark-muted in dark mode.

- Tooltip: show absolute current and previous values, plus % change.

**5.1.2 Total Revenue**
- ID: totalRevenue

- Title: “Total Revenue”

- Subtitle: “In the last 30 days”

- Metric: sum of order totals in last 30 days.

- Display: currency; use existing formatting helper or implement formatMoney.

- Trend: totalRevenuePctChange vs previous 30 days.

  - Trend badge colors:

    - Green if revenue increased.

    - Red if revenue decreased.

**5.1.3 New Customers**
- ID: newCustomers

- Title: “New Customers”

- Subtitle: “In the last 30 days”

- Metric: count of customers created in last 30 days.

- Trend: newCustomersPctChange vs previous 30 days.

**5.1.4 Active Projects**
- ID: activeProjects

- Title: “Active Projects”

- Subtitle: “Currently active”

- Metric: count of projects in non-completed / non-cancelled statuses.

- Trend:

  - Compare today’s active project count vs the active project count 30 days ago.

**5.1.5 Cancelled Orders**
- ID: cancelledOrders

- Title: “Cancelled Orders”

- Subtitle: “In the last 30 days”

- Metric: count of orders with cancelled status in last 30 days.

- Trend:

  - cancelledOrdersPctChange, where **decreases are good** (green) and **increases are bad** (red).

### 5.2 Charts (Rows 2 & 3)

**5.2.1 Order Statistics (Channel Pie / Donut)**
- ID: orderStatsByChannel

- Title: “Order Statistics”

- Subtitle: “Orders by channel – last 30 days”

- Chart: ApexCharts pie or donut.

- Data:

  - For orders in last 30 days, group by sales channel:

    - e.g. Instagram, Etsy, Website, Craft Fair, Referral, Other, etc.

- Series:

  - Values: order count per channel (or revenue per channel if desired).

  - Labels: channel names.

- Legend: shown below or to the right depending on available width/theme.

**5.2.2 Project Status (Pie / Donut)**
- ID: projectStatus

- Title: “Project Status”

- Subtitle: “Current projects by status”

- Chart: ApexCharts pie or donut.

- Data:

  - Group all current (non-archived) projects by status:

    - e.g. New, In Progress, Queued, Completed, Cancelled.

- Series:

    - Values: count per status.

    - Labels: status names.

**5.2.3 Sales by Month (Bar Chart)**
- ID: salesByMonth

- Title: “Sales by Month”

- Subtitle: “Last 12 months”

- Chart: ApexCharts bar (vertical).

  - X-axis:

    - Categories: month names (Jan, Feb, Mar, …) for last 12 months.

  - Y-axis:

    - Revenue amount (currency).

- Series:

  - Single series: Revenue.

- Data:

  -Per month: sum of revenue.

**5.2.4 Revenue vs Expenses (Line Chart)**
- ID: revenueVsExpenses

- Title: “Revenue vs Expenses”

- Subtitle: “Last 12 months”

- Chart: ApexCharts line (multi-series).

- X-axis:

  - Month names (Jan–Dec style labeling for last 12 months).

- Y-axis:

  - Currency amount.

- Series:

  - Revenue

  - Expenses

- Data:

  - Array of { month, revenue, expenses }.

- If expenses are not fully available:

  - Use backend-derived or fallback demo data for now for the demo user.

- Tooltip:

  - Show both revenue and expenses for hovered month.

### 5.3 Extra Panels (Row 4)
**5.3.1 Top Products by Revenue (Table)**
- ID: topProducts

- Title: “Top Products by Revenue”

- Subtitle: “In the last 30 days”

- Type: table inside a card.

- Data:

 - Group orders by product/template within last 30 days.

 - Sum revenue per product.

 - Sort by revenue descending.

 - Show top N (e.g., 5–10).

- Columns:

 - Product name

 - Units sold

 - Revenue (formatted currency)

 - Primary channels (optional summary: e.g. “Etsy, Instagram”)

**5.3.2 Low Inventory / At-Risk Items (Table)**
- ID: lowInventory

- Title: “Low Inventory”

- Subtitle: “Items below threshold”

- Type: table.

- Data:

  - Inventory items where quantity < threshold.

  - Threshold can be per-item or a default (e.g., < 5 units).

- Columns:

  - Item name

  - Category: material | consumable | equipment

  - Current quantity

  - Threshold (if present)

  - Action/link to open Inventory

**5.3.3 Recent Activity Feed (List)**
- ID: recentActivity

- Title: “Recent Activity”

- Subtitle: “Last 30 days”

- Type: list of events.

- Events:

  - New orders

  - New customers

  - Project stage changes

  - Order cancellations

- Fields:

  - Icon (by type: order / customer / project / inventory)

  - Message text (short human-readable description)

  - Timestamp (pretty-printed; optionally relative like “2h ago”)

## 6. Data & API Shape
### 6.1 DashboardSummary contract
Frontend should depend on a single aggregated shape, regardless of how backend is implemented.

```ts
type DashboardSummary = {
  totals: {
    totalOrders: number;
    totalRevenue: number;
    newCustomers: number;
    activeProjects: number;
    cancelledOrders: number;
  };
  trends: {
    totalOrdersPctChange: number | null;
    totalRevenuePctChange: number | null;
    newCustomersPctChange: number | null;
    activeProjectsPctChange: number | null;
    cancelledOrdersPctChange: number | null;
  };
  channels: Array<{
    channel: string;
    orders: number;
  }>;
  projectStatus: Array<{
    status: string;
    count: number;
  }>;
  salesByMonth: Array<{
    month: string;   // e.g. "2025-01" or "Jan 2025"
    revenue: number;
  }>;
  revenueVsExpenses: Array<{
    month: string;   // same scheme as salesByMonth for alignment
    revenue: number;
    expenses: number;
  }>;
  topProducts: Array<{
    productName: string;
    unitsSold: number;
    revenue: number;
    primaryChannels?: string[];
  }>;
  lowInventory: Array<{
    itemName: string;
    category: "material" | "consumable" | "equipment";
    quantity: number;
    threshold?: number;
  }>;
  recentActivity: Array<{
    id: string | number;
    type: "order" | "customer" | "project" | "inventory";
    message: string;
    timestamp: string; // ISO datetime string
  }>;
};
```
Frontend API wrapper (in src/api/dashboard.js):

```ts
async function fetchDashboardSummary(): Promise<DashboardSummary>;
```

Implementation notes:

- For now, use existing endpoints for the backend demo user and aggregate client-side or server-side.

- Long-term, add a dedicated endpoint like GET /api/dashboard/summary/ to return this shape directly.

## 7. Charting Library: ApexCharts
### 7.1 Library choice
- Use ApexCharts with React wrapper:

```bash
npm install apexcharts react-apexcharts
```
### 7.2 Base chart wrapper component
Create BaseChart.jsx (or similar) to keep charts theme-aware and consistent.

Responsibilities:

- Wrap ReactApexChart from react-apexcharts.

- Accept props:

  - type ("radialBar" | "bar" | "line" | "pie" | "donut")

  - series

  - options

  - height, width (optional)

- Read theme (isDark) via props or context (useTheme()).

- Apply:

  - Palette from CSS tokens:

    - Primary series colors: var(--color-primary), var(--color-success), var(--color-warning), var(--color-danger), etc.

  - Axis label color: var(--color-text-secondary)

  - Gridline color: subtle lines that look good in both themes

  - Tooltip theme: match dark/light modes

Goal: Cards only know “I want a bar chart with these values”, not the theme wiring details.

## 8. Theming & Typography
- Use existing theme.css tokens:

  - --color-bg-app

  - --color-bg-surface

  - --color-text-primary

  - --color-text-secondary

  - --color-primary

  - --color-success

  - --color-warning

  - --color-danger

- Light mode:

  - --color-text-primary: #3c4a58

  - --color-text-secondary: #7b8794

  - --color-bg-app: #f5f7fa

  - --color-topbar-bg: #eef2f7

- Dark mode:

  - Use existing dark colors defined in theme.css.

- Sidebar link labels:

  - Slightly bold: font-weight: 600.

- Topbar user name:

  - font-weight: 600;

  - Color: var(--color-text-primary).

## 9. Responsiveness
**Desktop (≥ 1280px):**

- 5 metric cards in first row.

- Row 2: 2/3 – 1/3 layout.

- Row 3: 1/2 – 1/2 layout.

- Row 4: two half-width tables + full-width activity feed (or similar layout).

**Tablet (768–1279px):**

- Metric cards: 2 per row.

- Charts: full-width stacked below.

- Extra panels: full-width or 2-per-row depending on space.

**Mobile (< 768px):**

- All cards full-width stacked vertically.

- Dropdown menus tap-friendly with correct target sizes.

## 10. Components to Implement
Frontend components:

- src/pages/Dashboard.jsx

  - Main layout, grid, and fullscreen logic.

- src/components/dashboard/MetricCard.jsx

  - For metric summary + optional radial/trend.

- src/components/dashboard/ChartCard.jsx

  - For charts with header + dropdown.

- src/components/dashboard/DashboardDropdownMenu.jsx

  - Fullscreen/Reports dropdown per card (or inline within ChartCard / MetricCard).

- src/components/charts/BaseChart.jsx

  - ApexCharts wrapper for theme-aware charts.

API:

- src/api/dashboard.js

  - fetchDashboardSummary() returning DashboardSummary.

Backend (eventual):

- Optional GET /api/dashboard/summary/ aggregating:

  - Orders (sales app)

  - Projects (projects app)

  - Customers (core app)

  - Inventory (inventory app)

  - Any relevant financials

## 11. Relevant Files & Raw GitHub Links
This section lists files involved in the dashboard and surrounding layout/theme.
Raw GitHub links follow this pattern:

```text
Copy code
https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/<PATH_FROM_REPO_ROOT>
```
### 11.1 Docs
- **Dashboard UI Spec (this file)**

  - Path: docs/dashboard_ui_spec.md

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/docs/dashboard_ui_spec.md

### 11.2 Frontend – Layout & Theme
- **App layout shell**

  - Path: frontend/shopops-web/src/components/layout/AppLayout.jsx

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/components/layout/AppLayout.jsx

- **Sidebar**

  - Path: frontend/shopops-web/src/components/layout/Sidebar.jsx

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/components/layout/Sidebar.jsx

- **Topbar**

  - Path: frontend/shopops-web/src/components/layout/Topbar.jsx

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/components/layout/Topbar.jsx

- **Global CSS**

  - Path: frontend/shopops-web/src/index.css

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/index.css

- **Theme tokens**

  - Path: frontend/shopops-web/src/styles/theme.css

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/styles/theme.css

- **Theme helper (JS)**

  - Path: frontend/shopops-web/src/theme/shopopsTheme.js

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/theme/shopopsTheme.js

- **Theme hook**

  - Path: frontend/shopops-web/src/theme/useTheme.js

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/theme/useTheme.js

### 11.3 Frontend – Routing & Pages
- **Main router**

  - Path: frontend/shopops-web/src/router/AppRouter.jsx

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/router/AppRouter.jsx

- **RequireAuth**

  - Path: frontend/shopops-web/src/router/RequireAuth.jsx

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/router/RequireAuth.jsx

- **Dashboard page**

  - Path: frontend/shopops-web/src/pages/Dashboard.jsx

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/pages/Dashboard.jsx

- **Other pages (for context / navigation integrity):**

  - Customers: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/pages/Customers.jsx

  - Projects: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/pages/Projects.jsx

  - Projects Board: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/pages/ProjectsBoard.jsx

  - Inventory: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/pages/Inventory.jsx

  - Settings: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/pages/Settings.jsx

  - Shops / ShopDetail, etc.


### 11.4 Frontend – API Layer
- **Dashboard API (to be created)**

  - Path: frontend/shopops-web/src/api/dashboard.js

  - Raw: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/dashboard.js (once created)

- Existing APIs (used for aggregating data for demo user):

  - Auth:

    - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/auth.js

  - Client:

    - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/client.js

  - Customers:

    - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/customers.js

  - Inventory:

    - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/inventory.js

  - Products:

    - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/products.js

  - Projects:

    - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/projects.js

  - Shops:

    - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/shops.js

  - Workflows:

    - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/frontend/shopops-web/src/api/workflows.js


### 11.5 Backend – Data Sources for Dashboard
For the backend demo user, dashboard data will likely be aggregated from:

 - **Sales app**

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/sales/models.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/sales/serializers.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/sales/views.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/sales/urls.py

- **Projects app**

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/projects/models.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/projects/serializers.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/projects/views.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/projects/urls.py

- **Core app (customers, shops)**

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/core/models.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/core/serializers.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/core/views.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/core/urls.py

- **Inventory app**

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/inventory/models.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/inventory/serializers.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/inventory/views.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/inventory/urls.py

- **Seed data for demo shop**

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/core/management/commands/seed_demo_shopops.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/projects/management/commands/seed_projects.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/workflows/management/commands/seed_workflows.py

  - Path: https://raw.githubusercontent.com/justinmboucher/shopops/refs/heads/main/backend/sales/migrations/* (for reference on schema)
