# ShopOps UI Component Inventory

This document tracks the core UI components used throughout ShopOps and how they should look/behave. Use it as a checklist while building out the React component library.

---

## 1. Layout Components

### 1.1 AppShell
- **Purpose:** Wraps the entire app: sidebar, top navbar, content area.
- **Contains:**
  - `<Sidebar />`
  - `<Topbar />`
  - `<MainContent />`
- **Behavior:**
  - Responsive: collapsible sidebar at smaller widths.
  - Provides layout padding and background.

### 1.2 Sidebar
- **Sections:**
  - Logo + app name
  - Primary nav: Dashboard, Customers, Projects, Inventory, Sales, Settings
  - Secondary nav: Help, Account, etc.
- **Visual:**
  - Dark panel with accent strip for active item.
  - Icons + labels.
- **State:**
  - Expanded / collapsed.
  - Active item highlight.

### 1.3 Topbar
- **Contains:**
  - Page title (optional)
  - Global search bar
  - Notifications icon
  - Theme toggle
  - User avatar + menu
- **Behavior:**
  - Stays fixed at top.
  - On smaller screens, search collapses to icon or drawer.

### 1.4 PageHeader
- **Layout pattern:**

  `Title | Subtitle` on left  
  `Filters | Sort | Search | Primary Action` on right

- **Used on:**
  - Customers list
  - Projects list
  - Inventory list
  - Sales / Invoices
  - Reports / Dashboard

---

## 2. Basic UI Elements

### 2.1 Buttons
Types:
- Primary (solid, accent color)
- Secondary (outline or subtle)
- Ghost / Icon-only
- Destructive (danger color)

States:
- Default, hover, active, disabled, loading.

Sizes:
- Small, default, large.

### 2.2 Badges
Types:
- Status badges: `Active`, `Completed`, `Cancelled`, `Overdue`, `Pending`.
- Pill-shaped, small text.

Colors:
- Success: `#31C48D`
- Warning: `#F4BD0E`
- Danger: `#E02424`
- Info/Neutral: `#4F8AFE`

### 2.3 Inputs
- Text input
- Textarea
- Select / Dropdown
- Date picker
- Search input (with icon)
- Toggle / Switch
- Checkbox / Radio

Style:
- Dark background, light text.
- Border radius 6–8px.
- Focus ring with primary accent.

---

## 3. Data Display Components

### 3.1 Card
- **Variants:**
  - Summary card (metric, delta, icon)
  - Content card (title + body + footer)
  - Project card (for grid views)
- **Props:**
  - `title`, `subtitle`, `actions`, `children`, `footer`.

### 3.2 MetricTile
- Shows:
  - Label (`Total Revenue`)
  - Value (`$54,230`)
  - Delta badge (`+12.3% vs last month`)
- Used on Dashboard and high-level summary areas.

### 3.3 Table
- **Features:**
  - Sortable columns
  - Hover highlight
  - Optional row selection
  - Pagination footer
- **Use cases:**
  - Customers list
  - Projects list
  - Inventory
  - Sales/Invoices

### 3.4 EmptyState
- **Used when:**
  - No data (no customers, no projects)
- **Content:**
  - Icon / illustration
  - Title (`No customers yet`)
  - Short explanation
  - Primary CTA (`Add your first customer`)

---

## 4. Overlays

### 4.1 Modal
- Centered card with header, body, footer.
- Used for:
  - Create / Edit customer
  - Create project
  - Log sale
  - Confirm destructive actions

### 4.2 Drawer (future)
- Slide-in panel from right.
- Used for:
  - Quick edit details
  - Activity feed / logs

---

## 5. Domain-Specific Components

### 5.1 CustomerCard
- For detail view right-rail or mobile:
  - Name, contact info
  - Tags (VIP, repeat customer)
  - Lifetime value
  - Recent projects summary

### 5.2 ProjectKanbanColumn
- Header: stage name + count
- Body: list of `ProjectKanbanCard`.
- Footer: `+ Add Project` button.

### 5.3 ProjectKanbanCard
- Shows:
  - Project name
  - Customer
  - Due date
  - Status badge / priority
- Drag-and-drop support between columns.

### 5.4 InvoiceRow / SaleRow
- For invoices / sales tables:
  - ID, customer, amount, status (badge), due/paid date, actions.

---

## 6. Utility Components

- `Tag` (small pill label)
- `Avatar` / AvatarGroup
- `Breadcrumbs`
- `Tabs`
- `Spinner` / Loading overlay
- `Toast` / Notification banner

---

Keep this inventory updated as new UI patterns solidify, and delete any component types that don’t fit the product.
