# ZeroWasteMess 🌿
### Hostel Food Waste Management System

A role-based web application that connects hostel mess kitchens with nearby NGOs — turning leftover food into meals for communities in need.

---

## What It Does

Hostel messes produce significant food waste daily. ZeroWasteMess creates a structured supply chain:

1. **Mess staff** logs leftover food with quantity, condition, and meal type
2. **NGOs** browse available food and submit pickup requests
3. **Admin** approves requests, assigns collection and delivery staff
4. **Delivery staff** collects from the mess and delivers to the NGO
5. **Everyone** tracks the delivery in real time and sees impact stats

---

## Role System

| Role | What They Can Do |
|------|-----------------|
| **Admin** | Full dashboard — manage workflow, approve NGO requests, assign staff, live tracking |
| **Mess Staff** | Log leftover food entries, view their own entry history and timeline |
| **NGO** | Browse available food, submit requests, view incoming deliveries, notifications |
| **Delivery Staff** | View assigned collection and delivery tasks, mark them complete |

---

## Features

### Core Workflow
- **Food Entry Form** — 3-step wizard: meal type → food details → review & submit
- **Admin Workflow Pipeline** — Pending Collection → Collection Assigned → Collected → In Transit → Delivered
- **NGO Request System** — NGOs request food; admin approves and assigns delivery staff
- **Live Delivery Tracking** — Progress bar, ETA, route history, status steps
- **Notification System** — NGOs notified on new food; bell dropdown with mark-all-read

### Dashboards
- **Admin** — Stats overview, workflow management, NGO requests, live tracking, staff directory
- **Mess Staff** — Personal food log, inline entry form, 4-step delivery timeline per entry
- **NGO** — Available food with request button (deduped), active deliveries, completion history
- **Delivery Staff** — Collection tasks (amber), delivery tasks (blue), completed history

### Public Pages
- **Hero** — Live stats (kg saved, active NGOs, meals delivered) computed from real data
- **Impact Stats** — Animated counters for food saved, NGO count, meals served, total entries
- **Kanban Dashboard** — 4-column pipeline: Pending / Collected / In Transit / Delivered
- **NGO Directory** — Partner cards with computed avg rating, contact links, distance

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 7 |
| Styling | Custom CSS, Plus Jakarta Sans, Inter (Google Fonts) |
| Icons | Lucide React |
| State | React useState + localStorage (no external state library) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |

---

## Project Structure

```
hostel-food-waste/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx / .css        # Fixed nav, role-aware links, user chip
│   │   ├── Hero.jsx / .css          # Landing hero with live stats
│   │   ├── Dashboard.jsx / .css     # 4-column Kanban pipeline + How It Works
│   │   ├── ImpactStats.jsx / .css   # Animated counters, bar chart
│   │   ├── FoodLog.jsx / .css       # Searchable table with status filter
│   │   ├── NGOList.jsx / .css       # NGO directory with computed stats
│   │   ├── LiveTracking.jsx / .css  # Delivery tracking modal
│   │   └── Footer.jsx / .css
│   │
│   ├── pages/
│   │   ├── Login.jsx / .css         # Two-panel login with clickable demo table
│   │   ├── AdminDashboard.jsx       # Full supply chain control center
│   │   ├── MessDashboard.jsx        # Mess staff food logging
│   │   ├── NGODashboard.jsx         # NGO request and delivery view
│   │   ├── DeliveryDashboard.jsx    # Driver task management
│   │   └── FoodEntry.jsx / .css     # 3-step food entry wizard
│   │
│   ├── services/
│   │   └── database.js              # All localStorage CRUD services
│   │
│   ├── constants/
│   │   └── status.js                # Single source of truth for status strings
│   │
│   ├── data/
│   │   └── database.json            # Seed data (users, food, NGOs, tracking)
│   │
│   ├── styles/
│   │   └── App.css                  # Global design tokens, buttons, badges
│   │
│   ├── App.jsx                      # Root component + role-based routing
│   └── main.jsx
│
├── backend/
│   ├── models/
│   │   ├── Food.js                  # MongoDB Food schema
│   │   └── NGO.js                   # MongoDB NGO schema
│   ├── routes/
│   │   ├── food.js                  # /api/food CRUD
│   │   ├── ngos.js                  # /api/ngos
│   │   └── users.js                 # /api/users (auth placeholder)
│   ├── server.js
│   └── package.json
│
├── vite.config.js
├── package.json
└── .env.example
```

---

## Run Locally

### Prerequisites
- Node.js 18+
- npm or yarn

### Frontend
```bash
npm install
npm run dev
```
Opens at **http://localhost:5173**

> The frontend runs fully without the backend — it uses localStorage as the database.

### Backend (optional)
```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env and set your MONGO_URI
npm run dev
```
API runs at **http://localhost:5000**

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food` | Get all food entries |
| GET | `/api/food?status=Pending` | Filter by status |
| POST | `/api/food` | Create food entry |
| PATCH | `/api/food/:id/status` | Update status |
| DELETE | `/api/food/:id` | Delete entry |
| GET | `/api/ngos` | Get all NGOs |
| POST | `/api/ngos` | Register NGO |

---

## Development Guide

### Data Flow

The frontend is fully decoupled from the backend. All reads and writes go through `src/services/database.js`, which wraps localStorage.

```
Component → service function (database.js) → localStorage → JSON.parse/stringify
```

The backend (`/backend`) exposes a REST API connected to MongoDB but is **not called by the frontend yet**. When ready, replace the service functions in `database.js` with `fetch` calls to the API.

---

### Service Layer

All data access goes through named service objects — never read localStorage directly in components.

| Service | Key Functions |
|---------|---------------|
| `foodService` | `getAll()`, `getById(id)`, `create(entry)`, `updateStatus(id, status)`, `delete(id)` |
| `ngoService` | `getAll()`, `getById(id)`, `update(id, data)` |
| `userService` | `getAll()`, `getByEmail(email)` |
| `workflowService` | `assignCollection(foodId, staffId)`, `markCollected(foodId)`, `assignDelivery(foodId, staffId, ngoId)`, `markDelivered(foodId)` |
| `notificationService` | `notifyNGOs(foodEntry)`, `getForNGO(ngoId)`, `markAllRead(ngoId)` |
| `trackingService` | `getByFoodId(foodId)`, `addCheckpoint(foodId, coords)` |
| `statsService` | `getStats()` |

---

### Seed Data & DB Reset

Seed data lives in `src/data/database.json`. On first load (or after a version bump), `database.js` writes this into localStorage.

To reset all data back to seed:
1. Bump `DB_VERSION` in `src/services/database.js` (e.g. `'1.1.0'` → `'1.2.0'`)
2. Reload the app — localStorage is wiped and re-seeded automatically

To add new seed users, NGOs, or food entries, edit `src/data/database.json` and bump the version.

---

### Status Flow

All status strings are defined in `src/constants/status.js`. Never use raw strings.

```
PENDING_COLLECTION → COLLECTION_ASSIGNED → COLLECTED → IN_TRANSIT → DELIVERED
```

```js
import { STATUS, PENDING_STATUSES } from '../constants/status';
```

`PENDING_STATUSES` is an array of the first two statuses — used to filter entries that haven't been collected yet.

---

### Adding a New Role

1. Add the user to `src/data/database.json` with a `role` field
2. Add a route case in `src/App.jsx` inside the role-based render block
3. Add nav links to the `ROLE_LINKS` map in `src/components/Navbar.jsx`
4. Create `src/pages/YourRoleDashboard.jsx`
5. Bump `DB_VERSION` to re-seed

---

### Adding a New Food Status

1. Add the constant to `src/constants/status.js`
2. Add a column to the Kanban in `src/components/Dashboard.jsx` (update the `COLS` array)
3. Add a `col-header-*` CSS class in `src/styles/Dashboard.css`
4. Add the transition logic in `src/services/database.js` under `workflowService`

---

### Connecting Frontend to Backend

The backend API is ready at `http://localhost:5000/api`. To wire it up:

1. Create a `.env` file in the project root:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
2. In `src/services/database.js`, replace service functions with `fetch` calls:
   ```js
   // Before (localStorage)
   getAll: () => getStore('food')

   // After (API)
   getAll: async () => {
     const res = await fetch(`${import.meta.env.VITE_API_URL}/food`);
     return res.json();
   }
   ```
3. Update all components that call these services to handle the returned Promise (add `async/await` or `.then()`)

---

### Useful Scripts

```bash
npm run dev        # Start dev server at localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

Backend:
```bash
cd backend
npm run dev        # nodemon — auto-restarts on file change
npm start          # Plain node server.js
```

---

## Environment Variables

### Frontend (`.env` in root)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`.env` in `/backend`)
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/foodwaste
PORT=5000
JWT_SECRET=replace_with_a_long_random_string
```

---

## Known Limitations

- **Frontend uses localStorage** — data is per-browser and resets when `DB_VERSION` is bumped. The backend (MongoDB) is ready to connect but the frontend currently doesn't call it.
- **No real authentication** — login is credential matching against seed data. JWT auth is scaffolded but not wired.
- **Map is a visual placeholder** — live tracking shows a progress bar and route history. A real map (Leaflet.js) can be added without an API key.

---

## Roadmap

- [ ] Connect frontend to MongoDB backend (replace localStorage calls with fetch)
- [ ] JWT authentication for all roles
- [ ] Leaflet.js map in live tracking modal
- [ ] Email/SMS notifications to NGOs via Nodemailer / Twilio
- [ ] Admin analytics page with charts
- [ ] QR code scan for delivery confirmation
- [ ] Mobile app (React Native)

---

## Contributing

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "add: your feature description"
git push origin feature/your-feature
# Open a Pull Request
```

---

## License

MIT — free to use, modify, and distribute.

---

**"Turning today's leftovers into tomorrow's hope."** 🌿
