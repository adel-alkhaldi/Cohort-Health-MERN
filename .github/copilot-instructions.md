# Copilot Instructions for Al-Falah Admin Dashboard (Cohort-Health-MERN)

## Overview
This is a MERN stack admin dashboard for managing cohorts, sessions, participants, attendance, incidents, and reports. The project is split into two main parts:
- **Backend** (`server/`): Node.js/Express REST API, MongoDB models, controllers, and services.
- **Frontend** (`client/frontend/`): React app using Vite, with modular components and pages.

## Key Architectural Patterns
- **Service/Controller Separation:** Backend logic is split into `controllers/` (request handling) and `services/` (business/data logic). Always add new business logic to `services/` and keep controllers thin.
- **RESTful Routing:** All API endpoints are defined in `server/routes/route.js` and follow REST conventions.
- **MongoDB Models:** Data schemas are in `server/models/`. Reference these for data structure and relationships.
- **Frontend Structure:** UI is organized by `components/` (reusable widgets) and `pages/` (route-level views). Data fetching is handled in `src/services/api.js`.

## Developer Workflows
- **Install dependencies:**
  - Backend: `cd server && npm install`
  - Frontend: `cd client/frontend && npm install`
- **Environment setup:**
  - Backend: Create `server/.env` with `PORT` and `MONGO_URI`.
  - Frontend: Port can be changed in `client/frontend/vite.config.js`.
- **Run servers:**
  - Backend: `npm run dev` in `server/` (default port 3000)
  - Frontend: `npm run dev` in `client/frontend/` (default port 5000)
- **Data:** MongoDB Atlas is pre-populated; no local seeding required for development.

## Project-Specific Conventions
- **API Calls:** Use `src/services/api.js` for all frontend API requests. Do not call backend endpoints directly in components/pages.
- **Adding Features:**
  - Backend: Add new endpoints in `routes/route.js`, logic in `controllers/`, and data operations in `services/`.
  - Frontend: Add new UI in `components/` or `pages/`, and fetch data via `api.js`.
- **Error Handling:** Backend errors are handled in controllers and returned as JSON. Frontend should display error messages from API responses.
- **Navigation:** Sidebar navigation in frontend controls page routing; add new pages to `src/pages/` and update sidebar if needed.

## Integration Points
- **Frontend/Backend Communication:** All data flows through REST API endpoints defined in backend and consumed via `api.js` in frontend.
- **External Dependencies:**
  - Backend: Express, Mongoose, dotenv
  - Frontend: React, Vite, ESLint

## Examples
- To add a new report type:
  - Backend: Create model in `models/`, service in `services/`, controller in `controllers/`, and route in `routes/route.js`.
  - Frontend: Add page in `pages/`, component in `components/`, and API call in `api.js`.

## References
- Main backend entry: `server/index.js`
- Main frontend entry: `client/frontend/src/main.jsx`
- API definitions: `server/routes/route.js`
- Data models: `server/models/`
- UI structure: `client/frontend/src/components/`, `client/frontend/src/pages/`

---
For questions or unclear conventions, review the main `README.md` or ask for clarification.
