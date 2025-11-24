# ShopOps

ShopOps is a lightweight “shop command center” for makers, woodworkers, and small craft businesses.

It helps users:

- Define workflows for different kinds of projects
- Track projects visually through stages
- Manage materials, consumables, and equipment
- Define reusable product templates
- Record sales and cancelled projects
- See basic insights about revenue, lost revenue, and performance

This repo contains:

- `/backend` – Django + DRF API
- `/frontend` – React web app
- `/mobile` – React Native app (future)
- `/docs` – Specs and architecture

---

## Tech Stack

- Backend: Django, Django REST Framework
- Frontend: React
- Database: PostgreSQL (recommended) or SQLite for development
- Auth: Django’s built-in auth system

---

## Local Development – Backend

From the repo root:

```bash
cd backend

# create and activate a virtual environment (example using venv)
python -m venv env
source env/bin/activate  # on Windows: env\Scripts\activate

# install dependencies (minimal to start)
pip install django djangorestframework
