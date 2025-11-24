# ShopOps – Architecture Overview

## High-Level Stack

- **Backend:** Django + Django REST Framework
- **Frontend (Web):** React (SPA) consuming REST API
- **Mobile (Later):** React Native app using the same API
- **Database:** PostgreSQL (recommended) or SQLite for local development
- **Auth:** Django auth (email/username + password), session or token-based (TBD)
- **Hosting (future):** Flexible; backend and frontend can be deployed separately

Repo structure (top-level):

- `/backend` – Django project and apps
- `/frontend` – React web app
- `/mobile` – React Native app (later)
- `/docs` – Documentation and specs

---

## Backend Architecture (Django)

### Apps

- `core`
  - Shop
  - Customer
  - (Auth will use Django’s built-in User)
- `workflows`
  - WorkflowRecipe
  - WorkflowDefinition
  - WorkflowStage
  - ProjectStageHistory
- `inventory`
  - Material
  - Consumable
  - Equipment
- `products`
  - ProductTemplate
  - BOMItem
- `projects`
  - Project
- `sales`
  - Sale

Each app gets its own `models.py`, `serializers.py`, `views.py`, `urls.py` and tests.

### API Style

- REST API with DRF
- Standard patterns:
  - ModelViewSet where appropriate
  - Routers for app-level URL registration
- Authentication:
  - Start with session-based or simple token
  - Later upgrade to JWT if needed

---

## Frontend (Web)

- React SPA in `/frontend`
- Uses:
  - React Router for navigation
  - Data fetching via a standard library (e.g., React Query or fetch abstractions)
- Talks to Django API via `/api/...` endpoints

Key screens:
- Workflow Selection
- Board (per workflow)
- Templates (list + detail)
- Project creation + detail
- Inventory
- Sales
- Insights
- Settings (Shop + Workflow + Appearance)

---

## Data Flow (Core)

1. **User logs in**
   - Frontend obtains session or token
   - Frontend fetches `/api/shop/` and `/api/workflows/` to hydrate initial state

2. **Workflow Coach**
   - Frontend collects answers
   - Backend selects `WorkflowRecipe`
   - Frontend shows editable stage list
   - On save, backend creates `WorkflowDefinition` + `WorkflowStage` for the shop

3. **Board**
   - Frontend calls `/api/workflows/{id}/board/`
   - Backend returns stages + projects for that workflow
   - Moves are sent via `/api/projects/{id}/move/` POST

4. **Templates and Projects**
   - Template defines BOM + labor + pricing defaults
   - Project created from template, linked to workflow, initial stage set
   - Stage moves logged via ProjectStageHistory

5. **Money & Cancellations**
   - Projects store `expected_price`, `status`, and cancellation fields
   - Sales store actual `price`
   - Insights compute revenue, lost revenue, and rates from these fields

---

## Non-Goals (MVP)

- Full CRM
- Full accounting
- Marketplace integrations (Etsy API, Shopify, etc.)
- Offline sync
- Complex ML models (start with simple statistics and improve later)

