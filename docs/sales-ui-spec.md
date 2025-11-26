# Sales – UX & Content Spec

Sales track money actually collected from customers.
Later, this will tie to projects and templates to show margins.

Covers:
- Sales list page
- "Log sale" flow
- Sale detail view
- Cancelled / lost sales
- Empty states & microcopy

---

## 1. Sales List Page

**Route:** `/sales`  
**Goal:** Show a simple history of sales, with basic filters.

### 1.1 Page header

- Title: `Sales`
- Subtitle:  
  > See what’s selling and how much your shop is bringing in.

Actions:

- Primary button: `Log sale`
- Filters:
  - Date range:
    - `This week`, `This month`, `Last 30 days`, `This year`, `All time`
  - Optional dropdown:
    - `Projects & customs`
    - `Products & templates`
    - `All`

---

### 1.2 Sales table

Columns:

- `Date`
- `Customer`
- `Item`
  - Project name or product template name
- `Type`
  - `Project` or `Product`
- `Price`
- `Status`
  - `Paid`, `Refunded`, `Cancelled`

Example row:

- `2025-11-24 | Sarah M. | Walnut dining table | Project | $2,400 | Paid`

Row actions (three-dot menu):

- `View`
- `Edit`
- `Mark as refunded`
- `Delete`

---

### 1.3 Summary bar (optional, top or bottom)

Shows simple aggregates for current filter range:

- `Total sales: ${{total}}`
- `Number of sales: {{count}}`
- `Average sale: ${{avg}}`

---

### 1.4 Empty states

**No sales at all:**

- Title: `No sales logged yet`
- Body:
  > Once you log your first sale, this page will show what’s actually coming in, not just what’s on the bench.
- Button: `Log your first sale`

**No sales in current filters:**

- Title: `No sales match your filters`
- Body:
  > Try adjusting the date range or showing all sale types.

---

## 2. Log Sale Flow

Triggered from `Log sale` button or from a project detail page.

**Route:** `/sales/new` or modal.

### 2.1 Title and intro

- Title: `Log sale`
- Intro text:
  > Record a sale so you can see how much this work actually brought in.

### 2.2 Fields

1. **Linked item**
   - Label: `Linked to`
   - Control: searchable dropdown
     - Sections:
       - `Projects`
       - `Product templates`
   - Placeholder:
     > Select a project or product (optional)
   - Helper:
     > Linking helps you see which projects and products are making you money. You can leave this blank for quick one-off sales.

2. **Customer name (optional)**
   - Label: `Customer`
   - Placeholder: `Customer name (optional)`
   - Helper:
     > Useful for repeat customers and basic history. Not required.

3. **Sale date**
   - Label: `Date`
   - Default: today
   - Helper:
     > Use the date payment was actually received.

4. **Sale amount**
   - Label: `Amount`
   - Placeholder: `$0.00`
   - Helper:
     > Final amount collected from the customer for this sale.

5. **Payment method (optional)**
   - Label: `Payment method`
   - Options:
     - `Cash`
     - `Card`
     - `Bank transfer`
     - `Check`
     - `Other`
   - Placeholder: `Select method`

6. **Status**
   - Label: `Status`
   - Options:
     - `Paid` (default)
     - `Pending`
     - `Refunded`
   - Helper:
     > Use “Pending” for orders that are agreed but not yet paid.

7. **Notes (optional)**
   - Label: `Notes`
   - Placeholder:  
     `Example: Repeat customer from Instagram, requested darker finish.`

Buttons:

- Primary: `Save sale`
- Secondary: `Cancel`

Error on save failure:

> We couldn’t save this sale.  
> Please check your connection and try again.

---

## 3. Sale Detail View

**Route:** `/sales/:id`

### 3.1 Header

- Title: `$ {{amount}}`
- Subtext:
  > `{{status}} · {{date}}`

If linked to a project/template:

- Line:
  > `Linked to: {{item_name}} ({{type}})`

Actions:

- Button: `Edit sale`
- Button: `Mark as refunded` (if not already refunded)
- Menu:
  - `Delete sale`

---

### 3.2 Overview section

Fields and labels:

- `Customer` → `{{customer}}` or `No customer`
- `Date` → `{{date}}`
- `Amount` → `$ {{amount}}`
- `Status` → `Paid / Pending / Refunded`
- `Payment method` → `{{method}}` or `Not set`
- `Linked item` → name + type, if present
- `Created` → `{{created_at}}`
- `Last updated` → `{{updated_at}}`

---

### 3.3 Notes section

- Title: `Notes`

Empty state:

> No notes added for this sale.

---

## 4. Status changes & cancellations

### 4.1 Mark as refunded

Dialog:

- Title: `Mark sale as refunded?`
- Body:
  > This won’t delete the sale, but it will change its status to “Refunded” so it doesn’t count towards your paid totals.

- Optional field:
  - Label: `Refund reason (optional)`

Buttons:

- Primary: `Mark as refunded`
- Secondary: `Cancel`

Toast (optional):

> Sale marked as refunded.

---

### 4.2 Delete sale

Dialog:

- Title: `Delete sale?`
- Body:
  > This will permanently remove this sale from your records. This doesn’t delete the linked project or product.
- Primary (danger): `Delete sale`
- Secondary: `Cancel`

---

## 5. Integration with Projects

When logging a sale *from* a project:

- Button on project detail: `Log sale`
- Pre-filled fields in sale form:
  - `Linked to` → that project
  - `Estimated price` → can be suggested as default `Amount` (if you store it)

After successful save:

- Toast:
  > Sale logged for “{{project_name}}”.

Optional line on project detail:

- `Last sale: ${{amount}} on {{date}}`
