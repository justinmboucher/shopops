# ShopOps – Domain Rules (MVP)

## Workflow Rules
- Only one default workflow per shop.
- Workflow can be archived (soft delete).
- Hard delete is only allowed if:
  - No templates reference it.
  - No projects reference it.

## Template Rules
- Template can be archived.
- Hard delete allowed only when:
  - No projects reference it.
  - No BOMItems reference it.

## Material/Consumable/Equipment Rules
- Archivable, not hard deleted unless unused.

## Project Rules
- On creation:
  - Assign workflow (from template or default).
  - Set stage = first stage.
  - Set expected_price if provided.
- On cancellation:
  - status = "cancelled"
  - cancel_stage = current_stage
  - cancelled_at = now

## Sale Rules
- Sale represents real revenue only.
- Projects marked completed do not auto-create sales.

## Customer Rules
- Customer is created/selected during project creation.
- Not a CRM. Only name required.

