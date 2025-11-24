# ShopOps – Workflow Recipes Specification

Workflow Recipes define reusable patterns for how work flows through a shop.  
They are stored as JSON and can be adapted into WorkflowDefinitions.

---

## Purpose

- Provide pre-built workflow templates for new users.
- Allow customization for each shop.
- Enable future community sharing.
- Provide context-aware workflows tailored to different crafts.

---

## Structure of a Workflow Recipe

A recipe is stored in the `WorkflowRecipe` model with a JSON `data` field.

### Example Structure

```json
{
  "supports_custom_orders": true,
  "supports_shipping": true,
  "stages": [
    {
      "key": "design",
      "label": "Design",
      "role": "pre_production",
      "order": 1
    },
    {
      "key": "materials_ready",
      "label": "Materials Ready",
      "role": "production",
      "order": 2
    },
    {
      "key": "build",
      "label": "Build",
      "role": "production",
      "order": 3
    },
    {
      "key": "finishing",
      "label": "Finishing",
      "role": "finishing",
      "order": 4
    },
    {
      "key": "ready_to_ship",
      "label": "Ready to Ship",
      "role": "fulfillment",
      "order": 5
    }
  ]
}
```

---

## Required Fields

### Model Fields

- `name`
- `slug`
- `craft_type`
- `detail_level`
- `project_type_tags` (optional)
- `is_system`
- `visibility` (system/private/public)
- `created_by` (nullable)
- `data` (JSON)
- `created_at`
- `updated_at`

### JSON Fields

Inside `data`:
- `supports_custom_orders` (bool)
- `supports_shipping` (bool)
- `stages[]`:
  - `key`
  - `label`
  - `role`
  - `order`

---

## Built-In Recipe Examples

### 1. Woodworking – Simple

```
Design → Materials Ready → Build → Finishing → Done
```

### 2. Woodworking – Standard (with Shipping)

```
Design → Materials Ready → Build → Finishing → Ready to Ship → Shipped
```

### 3. Sign Etching – Standard

```
Design → Prepare Material → Mask & Etch → Clean & Inspect → Ready for Pickup/Ship → Completed
```

### 4. Epoxy River Table – Detailed

```
Design & Dimensions → Mill Lumber → Build Form → Pour Epoxy → Cure → Flatten & Sand → Finish & Polish → Pack → Delivered
```

### 5. Generic Maker – Simple

```
Plan → Prepare Materials → Build → Finish → Deliver
```

---

## How Recipes Are Used

1. Workflow Coach asks user questions.
2. The system selects a recipe using:
   - craft_type
   - detail_level
   - shipping/custom order preferences
3. The recipe is cloned into:
   - WorkflowDefinition
   - WorkflowStage records
4. User edits the draft workflow.
5. The final workflow is saved as the shop’s default or an additional workflow.

---

## Future Sharing (Phase 3)

Users can:
- Convert their workflows into new recipes.
- Publish recipes (visibility = public).
- Browse community recipes by craft, popularity, and tags.
- Import a recipe and convert it into a workflow.

