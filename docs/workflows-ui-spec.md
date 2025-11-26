# Workflows – UX & Content Spec

Workflows define the stages a project moves through in a shop.
Example: “Design → Milling → Assembly → Finish → Ready for Pickup”.

This spec covers:
- Workflows list page
- Workflow detail / editor
- Create / edit workflow modal
- Stage editor UX
- Empty states and microcopy

---

## 1. Workflows List Page

**Route:** `/workflows`  
**Goal:** Let the user see all workflows, pick a default, and jump into editing.

### 1.1 Page header

- Title: `Workflows`
- Subtitle:  
  > Different kinds of projects move differently. Set up workflows that match how your shop actually runs.

Primary action button (top-right):

- Label: `New workflow`
- Description (tooltip):  
  > Create a workflow with custom stages, colors, and order.

### 1.2 Workflow cards

Each workflow card shows:

- Name (e.g. `Custom Furniture`, `Cutting Boards`, `Repairs`)
- Badge: `Default` (if this is the default workflow)
- Mini stage preview:  
  Example text:  
  > `Design • Milling • Assembly • Finish • Ready for Pickup`
- Metadata line:
  > `Used by {{project_count}} projects`

Card actions:

- Primary button: `Edit`
  - Tooltip: `Edit stages, colors, and options for this workflow.`
- Secondary link/button: `Set as default`
  - Only shown if not already default.
  - Confirm text:
    > Set “{{workflow_name}}” as your default workflow?  
    > New projects will use this workflow unless you choose a different one.

### 1.3 Empty state (no workflows yet)

If the user has **zero** workflows:

- Title: `No workflows yet`
- Body:
  > Workflows define how projects move through your shop – from first idea to finished piece.  
  > Start with a simple workflow and adjust it as you go.

- Primary button: `Create your first workflow`

---

## 2. Workflow Detail / Editor

**Route:** `/workflows/:id`

High-level layout:

- Left / top: Workflow basics
- Main: Stages list (sortable, editable)
- Footer / top-right: Save / Cancel / Delete

### 2.1 Header

- Title: `Edit workflow`
- Subtitle:
  > Changes here affect how projects move across the board. Existing projects keep their current stage, but new stages will be available going forward.

Breadcrumb example:

- `Settings → Workflows → {{workflow_name}}`

### 2.2 Workflow basics form

Fields:

1. **Name**
   - Label: `Workflow name`
   - Placeholder: `Custom furniture`, `Small products`, `Repairs`
   - Helper text:
     > Pick a name that describes the kind of projects that use this workflow.

2. **Description** (optional)
   - Label: `Description`
   - Placeholder: `Use this for one-off furniture builds and larger commissions.`
   - Helper text:
     > Optional. This only shows up in settings to remind you what this workflow is for.

3. **Default toggle**
   - Label: `Make this my default workflow`
   - Helper text:
     > New projects will use this workflow unless you choose a different one.

---

## 3. Stages Editor

This is the core of the workflow editor.

### 3.1 Section header

- Title: `Stages`
- Subtitle:
  > Projects move left to right through these stages. Drag to reorder; rename them to match your shop’s language.

### 3.2 Stage list

Each stage row shows:

- Drag handle icon (for ordering)
- Stage name (editable text input)
- Color swatch (clickable for color picker)
- Type badge (optional):
  - Examples: `Start`, `In progress`, `Waiting`, `Done`
- Delete icon (trash)

Example row layout text:

- Name placeholder: `e.g. Design`, `e.g. Milling`, `e.g. Sand & Finish`
- Color picker helper tooltip:
  > Use color to make stages easy to spot on the board. Finish stages often work well as greens or blues.

### 3.3 Add stage button

Under the list:

- Button label: `Add stage`
- Helper text below:
  > Keep it simple at first — you can always add more stages once you’ve used this for a bit.

### 3.4 Delete stage confirmation

When deleting a stage:

- Title: `Delete stage?`
- Body:
  > “{{stage_name}}” will be removed from this workflow.  
  > Projects currently in this stage will need to be moved to a different stage.

- Confirm button: `Delete stage`
- Cancel button: `Keep stage`

---

## 4. Create / Edit Workflow Modal (Shared Copy)

Used by both “New workflow” and “Edit” when opened as a modal.

### 4.1 Create workflow

- Title: `New workflow`
- Intro text:
  > Start with a simple set of stages that matches how you actually build. You can rename and reorder them any time.

Default example stages for woodworking:

1. `Idea / Request`
2. `Design`
3. `Milling`
4. `Joinery`
5. `Assembly`
6. `Sand & Finish`
7. `Ready for Pickup`

Confirmation copy:

- Primary button: `Create workflow`
- Secondary: `Cancel`

### 4.2 Edit workflow (in modal)

- Title: `Edit workflow`
- Body text stays same as section 2 and 3.

Buttons:

- Primary: `Save changes`
- Secondary: `Cancel`
- Danger (footer or sidebar): `Delete workflow`

Delete workflow confirmation:

- Title: `Delete workflow?`
- Body:
  > This will delete the workflow “{{workflow_name}}”.  
  > Projects using this workflow will **not** be deleted, but you’ll need to assign them to another workflow before moving them.

- Confirm button: `Delete workflow`
- Cancel button: `Keep workflow`

---

## 5. Board-Level Microcopy Related to Workflows

These strings live in the **projects board**, but are tightly tied to workflows.

### 5.1 Stage column headers

Hover tooltip on column title:

> This stage comes from the “{{workflow_name}}” workflow.  
> Edit it from Settings → Workflows.

### 5.2 Change workflow for a project

When user changes a project’s workflow:

**Label on UI:**

- `Change workflow`

**Confirm dialog:**

- Title: `Change workflow for this project?`
- Body:
  > Switching workflows will reset the project’s stage to the first stage in the new workflow.  
  > This won’t delete any notes, files, or history.

- Primary button: `Change workflow`
- Secondary: `Cancel`

---

## 6. Error & Validation Messages

### 6.1 Validation

- Empty name:
  > Workflow name is required.

- Duplicate name (optional rule):
  > You already have a workflow with this name. Try another name or update the existing workflow.

- No stages:
  > A workflow must have at least one stage.

- Stage name empty:
  > Stage name can’t be empty.

### 6.2 Save errors

Generic error when saving fails:

> We couldn’t save your changes.  
> Please check your connection and try again.

Button:

- `Try again`

---

## 7. Future Enhancements (notes)

These are not implemented yet but useful to keep in the spec:

- Stage-level flags:
  - `Counts as “done” for metrics`
  - `Counts as “waiting on customer”`
- Workflow templates gallery:
  - “Custom furniture”
  - “Small products / Etsy”
  - “Repairs & refinishing”
- Sharing workflows:
  - Ability to export/import workflow definitions as JSON.
