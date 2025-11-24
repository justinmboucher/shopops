# ShopOps – Core User Journeys (MVP)

This document describes the primary user interactions that define how ShopOps behaves from first login through daily use. They are used to guide UI design, API behavior, and model relationships.

---

## Journey 1: First-Time Setup – Create a Workflow

**Goal:** Help a new user create their initial workflow using the Workflow Coach.

1. User signs in for the first time.
2. The system checks for existing workflows.  
   - If none exist, it prompts: “Let’s set up your workflow.”
3. User starts the Workflow Coach.
4. Coach asks:
   - Primary craft type
   - Desired detail level (simple / standard / detailed)
   - Whether they take custom orders
   - Whether they ship products
5. The system selects a matching Workflow Recipe.
6. The user reviews the proposed workflow:
   - Can rename stages
   - Add/remove stages
   - Reorder stages via drag-and-drop
7. User saves the workflow.
8. The workflow is stored as the shop’s default workflow.
9. User is redirected to the Workflow Selection screen.

---

## Journey 2: Select a Workflow (Workflow Selection Screen)

**Goal:** Help users choose which workflow’s Board to open.

1. User navigates to **Board**.
2. If more than one workflow exists, the Workflow Selection screen appears.
3. Screen shows:
   - Search box to filter workflows by name
   - Workflow cards displaying name, description, active project count
4. User selects a workflow.
5. System opens the Board for that specific workflow.
6. If no workflows exist:
   - System prompts: “Set up a workflow”
   - Starts Workflow Coach

---

## Journey 3: Create a Product Template

**Goal:** Let the user create reusable definitions for commonly built products.

1. User navigates to **Products/Templates**.
2. Clicks **“New Template”**.
3. Enters:
   - Name
   - Description
   - Category
   - Image (optional)
4. Selects:
   - Workflow (or default workflow)
5. Adds materials (BOM) with quantities and units.
6. System calculates material cost.
7. User enters:
   - Estimated labor hours
   - Optional hourly rate override
   - Estimated consumables cost
8. System calculates:
   - Estimated total cost
   - Suggested price (based on markup)
9. User may set a base price.
10. Template is saved.

---

## Journey 4: Create a Project

**Goal:** Create a specific instance of work tied to a template or made from scratch.

1. User selects a template and clicks **“Create Project”**.
2. User enters:
   - Project name
   - Quantity
   - Due date
   - Image (optional)
3. User selects or creates Customer.
4. System calculates:
   - Estimated hours (template × quantity)
   - Expected price (from template base price or user entry)
5. Inventory check runs:
   - Indicates shortages when applicable
6. User confirms creation.
7. System:
   - Assigns project to the correct workflow
   - Sets stage to first stage
   - Stores expected_price
8. Project appears on the Board for that workflow.

---

## Journey 5: Track Project Progress

**Goal:** Allow users to move projects through the workflow.

1. User opens a workflow’s Board.
2. Columns represent stages for the selected workflow.
3. Projects appear as cards under their current stage.
4. User drags a card to another stage.
5. System:
   - Updates current_stage
   - Inserts a row in ProjectStageHistory with timestamp
6. Board updates immediately.

---

## Journey 6: Complete a Project and Log a Sale

**Goal:** Record real revenue from a completed project.

1. User opens Project Detail or Board card menu.
2. Selects **“Log Sale”**.
3. System pre-fills:
   - Project reference
   - Customer
   - Suggested sale price
4. User confirms or edits:
   - Sale price
   - Channel (Etsy, Market, etc.)
   - Sold date
   - Fees (optional)
5. System:
   - Creates a Sale record
   - Marks project as completed
6. Project no longer appears on active Board.

---

## Journey 7: Cancel a Project (Client Bailed)

**Goal:** Track lost revenue and cancellation patterns.

1. User opens Project Detail.
2. Clicks **“Cancel Project”**.
3. System shows:
   - Confirm dialog
   - Expected_price (or prompts user to enter one)
4. User selects:
   - Cancel reason
   - Optional notes
5. System:
   - status = “cancelled”
   - cancel_stage = current_stage
   - cancelled_at = now
6. Project disappears from active Board.
7. Cancellation appears in insights as lost revenue.

---

## Journey 8: Insights & Performance

**Goal:** Give the user visibility into revenue, lost revenue, and workflow performance.

1. User opens **Insights**.
2. System displays:
   - Total revenue
   - Lost revenue (from cancellations)
   - Completed vs cancelled project counts
   - Per-template performance
   - Stages where cancellations occur
3. Over time, system may offer predictions (e.g., high cancellation risk templates).

