# ShopOps – Data Model (MVP)

This document defines the core data entities for ShopOps. It reflects MVP priorities:
- Project-centered workflow
- Expected vs actual revenue
- Cancellations (lost revenue)
- Lightweight customer tracking
- Multi-workflow system using recipes
- Inventory, templates, and costing

---

## 1. User

Represents a human login.

**Fields**
- id
- email
- password_hash
- name
- created_at
- last_login_at

**Relationships**
- One User → One Shop (MVP)

---

## 2. Shop

Represents the user's business/workshop.

**Fields**
- id
- owner_user (FK to User)
- name
- timezone
- currency (default: USD)
- default_hourly_rate
- default_markup_pct
- theme (light/dark/system)
- logo_image (optional)
- description (optional)
- shipping_zones_config (JSON)
- created_at
- updated_at

**Relationships**
- One shop → many:
  - Workflows
  - Templates
  - Inventory items
  - Projects
  - Sales
  - Customers

---

## 3. WorkflowRecipe (pattern)

Reusable JSON blueprint for workflows.

**Fields**
- id
- name
- slug
- craft_type
- detail_level (simple/standard/detailed)
- project_type_tags (JSON array)
- is_system (bool)
- visibility (system/private/public)
- created_by (nullable FK to User)
- data (JSON with stages[])
- created_at
- updated_at

---

## 4. WorkflowDefinition (shop-owned workflow)

Actual workflow used by a shop.

**Fields**
- id
- shop (FK)
- name
- description
- source_recipe (nullable FK)
- is_default (bool)
- is_active (bool)
- created_at
- updated_at

**Relationships**
- One WorkflowDefinition → many WorkflowStage
- One WorkflowDefinition → many Projects
- One WorkflowDefinition → many Templates

---

## 5. WorkflowStage

Single stage inside workflow.

**Fields**
- id
- workflow (FK)
- name
- order
- role (semantic group: pre_production/production/finishing/etc.)
- key (optional canonical key)

---

## 6. Material

Physical materials.

**Fields**
- id
- shop
- name
- category
- unit
- quantity
- cost_per_unit
- supplier_name (optional)
- notes (optional)
- is_active (bool)
- created_at
- updated_at

---

## 7. Consumable

Used-up materials.

**Fields**
- id
- shop
- name
- unit
- cost_per_unit
- quantity (optional)
- notes
- is_active (bool)
- created_at
- updated_at

---

## 8. Equipment

Tools.

**Fields**
- id
- shop
- name
- purchase_date
- purchase_cost
- notes
- is_active (bool)
- created_at
- updated_at

---

## 9. ProductTemplate

Reusable definition of a product.

**Fields**
- id
- shop
- name
- description
- category
- image
- workflow (FK to WorkflowDefinition, nullable)
- estimated_labor_hours
- hourly_rate (optional override)
- estimated_consumables_cost
- base_price
- is_active (bool)
- created_at
- updated_at

**Relationships**
- One Template → many BOMItems
- One Template → many Projects
- Many Template ↔ many Equipment

---

## 10. BOMItem (bill of materials)

Links template to materials.

**Fields**
- id
- template (FK)
- material (FK)
- quantity
- unit
- created_at
- updated_at

---

## 11. Customer

Lightweight customer record.

**Fields**
- id
- shop
- name (required)
- email (optional)
- phone (optional)
- channel (optional)
- notes (optional)
- is_active (bool)
- created_at
- updated_at

---

## 12. Project

Single instance of work.

**Fields**
- id
- shop (FK)
- template (FK, nullable)
- workflow (FK)
- current_stage (FK)
- customer (FK, nullable)

- name
- quantity
- image
- due_date

- estimated_hours
- actual_hours (final total, optional)

- status ("active", "completed", "cancelled")

- expected_price (optional)
- expected_currency (default shop.currency)

Cancellation fields:
- cancel_reason (optional)
- cancel_stage (FK to WorkflowStage, nullable)
- cancelled_at (datetime, nullable)

- notes
- created_at
- updated_at

---

## 13. ProjectStageHistory

Stage transitions.

**Fields**
- id
- project (FK)
- stage (FK)
- entered_at

---

## 14. Sale (real revenue only)

Actual money received.

**Fields**
- id
- shop
- project (FK, nullable)
- template (FK, nullable)
- customer (FK, nullable)

- channel
- price
- fees (optional)
- currency
- sold_at

- notes
- created_at
- updated_at
