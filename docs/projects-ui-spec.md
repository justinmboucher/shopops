# Projects – UX & Content Spec

Projects represent real work in the shop: commissions, products, repairs.

This spec covers:
- Projects board
- New project form
- Project detail panel/page
- Empty states and microcopy

---

## 1. Projects Board

**Route:** `/projects`  
**Goal:** Show all active projects by stage, for a single workflow at a time.

### 1.1 Page header

- Title: `Projects`
- Subtitle:  
  > Drag projects through your stages to see what needs attention right now.

Controls:

- Workflow selector label: `Workflow`
  - Placeholder: `Select a workflow`
  - Helper text:
    > Different workflows show different sets of stages on the board.

- Primary button: `New project`

---

### 1.2 Columns (stages)

Each column:

- Header: stage name (e.g. `Design`, `Milling`, `Finish`)
- Subtext:
  > `{{project_count}} projects`

Empty column text examples:

- For early stage:
  > No projects here yet. Time to start something new.

- For “in progress”:
  > Nothing in this stage. Either you’re ahead… or you forgot to move a card.

- For “done / ready”:
  > Nothing ready yet. Future you will love seeing this column full.

Tooltip on column title:

> This stage comes from the “{{workflow_name}}” workflow.  
> Edit it under Settings → Workflows.

---

### 1.3 Project cards

Each card shows:

- Project name
- Optional thumbnail (first image if present)
- Line 2 (small text):
  - `{{customer_name}}` or `No customer`
- Line 3 (metadata chips):
  - Due date: `Due {{date}}` or `No due date`
  - Status: `Overdue` / `Due soon` / nothing
  - Estimated price or sell price (if known): `${{amount}}`

Hover text:

> Click for full project details, notes, and materials.

Context menu options (three-dot menu):

- `Open details`
- `Move to stage…`
- `Change workflow…`
- `Mark as cancelled`
- `Archive project`

---

## 2. New Project Form

**Route:** `/projects/new` or modal from `New project` button.

Title:

- `New project`

Intro text:

> Capture just enough to start. You can add more details once the project is in motion.

### 2.1 Fields

1. **Project name**
   - Label: `Project name`
   - Placeholder: `Walnut dining table`, `Set of cutting boards`, `Chair repair`
   - Error: `Project name is required.`

2. **Workflow**
   - Label: `Workflow`
   - Placeholder: `Select workflow`
   - Helper text:
     > This decides which stages this project will move through.

3. **Initial stage**
   - Label: `Start in stage`
   - Default: first stage of selected workflow
   - Helper text:
     > Most projects start in the first stage, but you can drop them directly into where they actually are.

4. **Customer (optional)**
   - Label: `Customer name`
   - Placeholder: `Optional`

5. **Due date (optional)**
   - Label: `Due date`
   - Helper text:
     > Use this for promised delivery dates or internal deadlines.

6. **Estimated price (optional)**
   - Label: `Estimated price`
   - Placeholder: `$0.00`
   - Helper text:
     > What you expect to charge for this project. You can revise it later.

7. **Notes (optional)**
   - Label: `Notes`
   - Placeholder: `Key details, constraints, or reference links.`

Buttons:

- Primary: `Create project`
- Secondary: `Cancel`

Error on save failure:

> We couldn’t create this project.  
> Please check your connection and try again.

---

## 3. Project Detail View

Can be a side panel or dedicated page: `/projects/:id`.

### 3.1 Header

- Title: project name
- Subtext:
  > `Workflow: {{workflow_name}} · Stage: {{stage_name}}`

Primary actions:

- Button: `Advance stage`
  - Tooltip: `Move this project to the next stage in the workflow.`
- Button/Link: `Change stage`
- More menu:
  - `Change workflow`
  - `Mark as done`
  - `Mark as cancelled`
  - `Archive project`

---

### 3.2 Overview section

Labels and suggested content:

- `Customer` → `{{customer_name}}` or `No customer`
- `Stage` → `{{stage_name}}`
- `Workflow` → `{{workflow_name}}`
- `Due date` → `{{date}}` or `No due date`
- `Estimated price` → `$ {{amount}}` or `Not set`
- `Created` → `{{created_at}}`
- `Last updated` → `{{updated_at}}`

---

### 3.3 Notes

Section title:

- `Notes`

Empty state:

> No notes yet. Use this space for measurements, design decisions, and “don’t forget” details.

Add note placeholder:

> Add a note…

---

### 3.4 Materials / Inventory (stub for later)

Section title:

- `Materials`

Stub text for now:

> Soon you’ll be able to link materials and consumables to this project so you can see real costs and margins. For now, this section is just a placeholder.

---

### 3.5 Status changes

#### Mark as done

Confirm dialog:

- Title: `Mark project as done?`
- Body:
  > This will move “{{project_name}}” to the final stage of its workflow and mark it as completed.
- Primary: `Mark as done`
- Secondary: `Cancel`

#### Mark as cancelled

- Title: `Cancel project?`
- Body:
  > “{{project_name}}” will be marked as cancelled and removed from active boards. You can still see it in reports and history.
- Reason label: `Reason for cancellation (optional)`
- Primary: `Cancel project`
- Secondary: `Keep project active`

---

## 4. Board and Project Empty States

### 4.1 No projects at all

Page-level empty state on `/projects`:

- Title: `No projects yet`
- Body:
  > Get your first project out of your head and into the board.  
  > Start with something you’re already working on, even if it’s halfway done.

- Primary: `Create your first project`

### 4.2 No projects for selected workflow

- Title: `No projects in this workflow`
- Body:
  > You haven’t created any projects using “{{workflow_name}}” yet.
- Button: `Create project in this workflow`

