# Inventory & Materials – UX & Content Spec

Inventory represents the boards, sheet goods, hardware, and consumables used in projects.

Covers:
- Inventory list page
- Material create/edit form
- Inventory item detail
- Empty states and microcopy

---

## 1. Inventory List Page

**Route:** `/inventory`  
**Goal:** Show what’s in the shop, how much is left, and what needs restocking.

### 1.1 Page header

- Title: `Inventory`
- Subtitle:  
  > Keep track of the materials and consumables your projects depend on.

Actions:

- Primary button: `Add material`
- Secondary filter controls:
  - Search: `Search by name or type`
  - Filter dropdown: `Type` (`All`, `Lumber`, `Sheet goods`, `Hardware`, `Finish`, `Consumable`, `Other`)

---

### 1.2 Inventory table / cards

Suggested columns:

- `Name` – e.g. `4/4 Walnut`, `Birch plywood 3/4"`, `Titebond III`
- `Type` – `Lumber`, `Sheet goods`, `Hardware`, `Finish`, `Consumable`, `Other`
- `In stock` – numeric + unit (e.g. `12 bd ft`, `6 sheets`, `3 bottles`)
- `Low stock?` – icon or badge
- `Last used` – date or `Not used yet`

Low stock badge text:

- `Low stock`
- Tooltip:
  > This material is at or below its low-stock threshold.

Row click:

> Opens material detail view.

---

### 1.3 Empty state (no inventory at all)

- Title: `No materials added yet`
- Body:
  > Start with the things you reach for constantly — boards, sheet goods, hardware, glue, finish, and sandpaper.
- Primary button: `Add your first material`

---

## 2. Add / Edit Material Form

Can be modal or page: `/inventory/new`, `/inventory/:id/edit`.

### 2.1 Header

- Create:
  - Title: `Add material`
  - Subtitle:
    > Add a material so you can track how often it’s used and when you’re running low.

- Edit:
  - Title: `Edit material`
  - Subtitle:
    > Update details for this material. Changes affect future projects that use it.

---

### 2.2 Fields

1. **Name**
   - Label: `Name`
   - Placeholder: `4/4 Walnut`, `Birch plywood 3/4"`, `1-1/4" pocket screws`
   - Error: `Name is required.`

2. **Type**
   - Label: `Type`
   - Options:
     - `Lumber`
     - `Sheet goods`
     - `Hardware`
     - `Finish`
     - `Consumable`
     - `Other`
   - Placeholder: `Select type`
   - Helper text:
     > This helps group and filter materials later.

3. **Unit**
   - Label: `Unit`
   - Examples for dropdown:
     - `Board feet`
     - `Linear feet`
     - `Sheets`
     - `Pieces`
     - `Bottles`
     - `Cans`
     - `Other`
   - Helper text:
     > How you normally count this material.

4. **Quantity in stock**
   - Label: `Quantity in stock`
   - Placeholder: `0`
   - Helper text:
     > Rough counts are okay — this doesn’t need to be perfect.

5. **Low-stock threshold (optional)**
   - Label: `Low-stock threshold`
   - Placeholder: `0`
   - Helper text:
     > When quantity falls at or below this number, we’ll flag it as low stock.

6. **Default cost per unit (optional)**
   - Label: `Cost per unit`
   - Placeholder: `$0.00`
   - Helper text:
     > Use this to estimate project costs. You can override it per project if needed.

7. **Notes (optional)**
   - Label: `Notes`
   - Placeholder: `Preferred supplier, dimensions, or anything else you want to remember.`

Buttons:

- Primary: `Save material`
- Secondary: `Cancel`

Save error:

> We couldn’t save this material.  
> Please check your connection and try again.

---

## 3. Material Detail View

**Route:** `/inventory/:id`

### 3.1 Header

- Title: material name
- Subtitle:
  > `Type: {{type}} · In stock: {{quantity}} {{unit}}`

Primary actions:

- Button: `Adjust stock`
- Button: `Edit`
- More menu:
  - `Archive material`

---

### 3.2 Overview section

Fields and labels:

- `Type` → `{{type}}`
- `Unit` → `{{unit}}`
- `In stock` → `{{quantity}} {{unit}}`
- `Low-stock threshold` → `{{threshold}}` or `Not set`
- `Cost per unit` → `$ {{amount}}` or `Not set`
- `Last used in project` → project name or `Not used yet`

---

### 3.3 Stock adjustments

When user clicks `Adjust stock`:

- Title: `Adjust stock`
- Body text:
  > Update the quantity on hand for this material. Use positive numbers to add stock and negative numbers to subtract.

Fields:

- `Change in quantity`
  - Placeholder: `e.g. 5` or `-2`
- `Reason (optional)`
  - Placeholder: `New delivery`, `Used on project without logging`, etc.

Buttons:

- Primary: `Apply adjustment`
- Secondary: `Cancel`

Success toast text:

> Stock updated for “{{material_name}}”.

---

### 3.4 Usage preview (stub)

Section title:

- `Recent usage`

Stub copy for now:

> As you link materials to projects, you’ll see where this material is being used and how often it shows up in profitable work.

---

## 4. Archive / Delete

For now, prefer **archive** over hard delete.

### 4.1 Archive material

Confirm dialog:

- Title: `Archive material?`
- Body:
  > “{{material_name}}” will be hidden from the main inventory list but kept for historical data.
  > You can unarchive it later if you need it again.
- Primary: `Archive material`
- Secondary: `Cancel`

Archived badge text:

- `Archived`

Empty state text when viewing archived filter:

> Archived materials stay here for history and reporting. Unarchive them if they come back into regular use.

---

## 5. Empty & Error States

### 5.1 Filtered view shows no results

- Title: `No materials match your filters`
- Body:
  > Try clearing your filters or searching for a different name.

### 5.2 Generic error loading inventory

- Title: `We couldn’t load your inventory`
- Body:
  > Please check your connection and try again.
- Button: `Retry`

