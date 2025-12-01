# ShopOps Page Wireframe Templates

Use these wireframes as starting points for building new pages so we keep structure consistent.

---

## 1. List Page (e.g., Customers, Projects, Inventory)

**URL pattern:** `/customers`, `/projects`, `/inventory`

Wireframe:

- **Header Row**
  - [Title] [Breadcrumbs optional]
  - Right side: [Filter Dropdown] [Sort Dropdown] [Search Input] [Primary Button]

- **Filter Row (optional)**
  - Status filters, tags, date range.

- **Main Content**
  - Card containing:
    - Data table with:
      - Column headers
      - Rows
      - Pagination footer

---

## 2. Detail Page (e.g., Customer Detail, Project Detail)

**URL pattern:** `/customers/:id`, `/projects/:id`

Wireframe:

- **Header Row**
  - Left: Name, status badge
  - Right: [Edit] [More actions] [Back]

- **Body Layout: Two-column**

Left (primary, 8–9 columns):
- Summary card (key fields)
- Tab bar:
  - Tab 1: Timeline / Activity
  - Tab 2: Related entities (Projects for customer; Tasks, Sales for project)
  - Tab 3: Notes / Internal comments

Right (secondary, 3–4 columns):
- Stats mini-cards
- Contact info / key metadata
- Quick actions

---

## 3. Dashboard Page

**URL pattern:** `/dashboard`

Wireframe:

- **Header Row**
  - Title: "Dashboard"
  - Right: Date range selector

- **Row 1: Metric cards**
  - 3–4 small cards: Revenue, Orders/Projects, Active Customers, Open Projects.

- **Row 2: Charts**
  - Left: Revenue over time line chart
  - Right: Breakdown donut/pie by category (product type, channel, etc.)

- **Row 3: Tables / Lists**
  - Recent Projects
  - Recent Sales

---

## 4. Kanban Board (Projects by Stage)

**URL pattern:** `/projects/board`

Wireframe:

- **Header Row**
  - Title: "Project Board"
  - Right: [Add Project] [Filter Workflow] [Search]

- **Kanban Area**
  - Horizontal scrollable row of columns:
    - Each column:
      - Header: stage name + count
      - List of cards (ProjectKanbanCard)
      - Footer: "+ Add New" button

---

## 5. Auth Pages (Login, Forgot Password)

**URL pattern:** `/login`, `/forgot-password`

Wireframe:

- Centered card on a light or subtle background image.
- Card contains:
  - Logo / app name
  - Title: "Log in to your account"
  - Email input
  - Password input
  - Remember me + Forgot password link
  - Primary button
  - Link to sign up (later: invite only or disabled)

---
