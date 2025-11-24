# ShopOps – Screen Specifications (MVP)

This document defines UI-level functional behavior for major screens in ShopOps.

---

## 0. Workflow Selection Screen

**Purpose:**  
Select which workflow’s Board to view.

**Elements:**
- Search bar (“Search workflows…”)
- Workflow cards:
  - Name
  - Description
  - Active project count
  - Default workflow badge
- “New Workflow” button

**Behavior:**
- Clicking a workflow opens that workflow’s Board.
- If no workflows exist, show Workflow Coach prompt.

---

## 1. Workflow Coach

**Purpose:**  
Create a workflow through guided questions.

**Stages:**
1. Craft type selection
2. Detail level selection
3. Custom order support
4. Shipping support
5. Preview and customize stages
6. Save workflow

**Output:**  
One WorkflowDefinition + associated WorkflowStages.

---

## 2. Board (Project Board)

**Purpose:**  
Display projects for a selected workflow.

**Elements:**
- Workflow context indicator
- Columns = ordered stages
- Cards = projects in stage
- Drag-and-drop interactions

**Card data:**
- Thumbnail
- Name
- Template name
- Quantity
- Due date
- Estimated hours
- Stock status indicator

---

## 3. Template List

**Purpose:**  
View and manage product templates.

**Elements:**
- Search bar
- Template cards:
  - Image
  - Name
  - Category
  - Active status

**Actions:**
- New Template
- Edit Template
- Archive Template

---

## 4. Template Detail / Template Editor

**Purpose:**  
Define product attributes, BOM, workflow, and pricing.

**Sections:**
- Basic info (name, description, category, image)
- Workflow selection
- Materials (BOM)
- Labor & costing
- Pricing
- Equipment (optional)
- Archive button

---

## 5. Project Creation

**Purpose:**  
Start a new project from a template.

**Fields:**
- Project name
- Quantity
- Due date
- Image (optional)
- Customer selection/creation
- Expected price
- Inventory check results

**Behavior:**
- Assign workflow
- Set first stage
- Create project

---

## 6. Project Detail

**Purpose:**  
View full project info, status, and actions.

**Sections:**
- Header (name, template, customer)
- Image
- Stage and workflow
- Estimated vs actual hours
- Pricing details
- Notes

**Actions:**
- Move to next stage (if not using drag-and-drop)
- Log Sale
- Cancel Project

---

## 7. Log Sale Screen

**Purpose:**  
Record realized revenue for a completed project.

**Fields:**
- Price
- Channel
- Fees
- Sold at
- Customer (optional)

**Behavior:**
- Create Sale record
- Mark project completed

---

## 8. Cancel Project Screen

**Purpose:**  
Record cancellation and lost revenue.

**Fields:**
- Confirm expected_price
- Cancel reason
- Notes

**Behavior:**
- status = cancelled
- cancel_stage = current_stage
- cancelled_at = now

---

## 9. Insights Dashboard

**Purpose:**  
Show shop performance metrics.

**Key metrics:**
- Total revenue
- Lost revenue
- Completed vs cancelled projects
- Template performance
- Cancellation stages
- Workflow efficiency

**Optional future additions:**
- Basic risk predictions

