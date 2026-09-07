# ZeroWasteMess 🌿
### Hostel Food Waste Management System

A role-based web application that connects hostel mess kitchens with nearby NGOs — turning leftover food into meals for communities in need.


---

## What It Does

Hostel messes produce significant food waste daily. ZeroWasteMess creates a structured supply chain:

1. **Mess staff** logs leftover food (single or multiple items at once) with quantity, condition, and meal type
2. **NGOs** browse available food and submit pickup requests
3. **Admin** approves requests, assigns collection and delivery staff
4. **Delivery staff** accepts/declines tasks, collects from the mess, and delivers to the NGO
5. **Everyone** tracks the delivery in real time and sees impact stats

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 7 |
| Styling | Custom CSS, Plus Jakarta Sans, Inter (Google Fonts) |
| Icons | Lucide React |
| State | React `useState` + `localStorage` (no external state library) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |

> The frontend runs **fully without the backend** — it uses `localStorage` as the database. The backend (MongoDB) is scaffolded and ready to connect.

---

## Role System

| Role | Credentials | What They Can Do |
|------|-------------|-----------------|
| **Admin** | `admin@hostel.com` / `admin123` | Full dashboard — manage workflow, approve NGO requests, assign staff, live tracking, roadmap |
| **Mess Staff** | `mess1@hostel.com` / `mess123` | Log single or multiple food entries, cancel own pending entries, view 5-step delivery timeline |
| **NGO** | `ngo1@ngo.org` / `ngo123` | Browse available food, submit requests, confirm receipt, cancel own pending requests |
| **Delivery Staff** | `delivery1@hostel.com` / `delivery123` | Accept/decline assigned tasks, report issues, mark collection & delivery complete |

> 10 accounts exist for each role (mess1–mess10, ngo1–ngo10, delivery1–delivery10).

---

## Features

### Core Workflow
- **Batch Food Entry** — Log multiple food items in one submission (Add Another Item)
- **Admin Workflow Pipeline** — `Pending Collection → Collection Assigned → Collected → In Transit → Delivered`
- **NGO Request System** — NGOs request food; admin approves and assigns delivery staff
- **Live Delivery Tracking** — Progress bar, ETA, route history, status steps
- **Notification System** — NGOs notified on new food; bell dropdown with mark-all-read

### Dashboards

**Admin**
- Animated stat counters, pipeline bar, activity feed
- 6 tabs: Overview · Workflow · NGO Requests · Live Tracking · Staff & Users · 🚀 Roadmap
- Workflow cards with dropdowns to assign staff and advance status

**Mess Staff**
- Log single or multiple food items at once
- 5-step delivery timeline per entry (Pending → Collection Assigned → Collected → In Transit → Delivered)
- Cancel own entries (only while `Pending Collection`)
- Permission notice showing what actions are allowed

**NGO**
- Available food with freshness timers (🟢 Fresh / 🟡 Good / 🟠 Fair)
- Request food, cancel own pending requests, confirm receipt on delivery
- Request history and notification bell

**Delivery Staff**
- Accept / Decline tasks with reason modal
- Report issues mid-delivery
- Route visual animation, completed history

### Public Pages
- **Hero** — Live stats (kg saved, active NGOs, meals delivered) from real data
- **Impact Stats** — Animated counters for food saved, NGO count, meals served, total entries
- **Kanban Dashboard** — 4-column pipeline: Pending / Collected / In Transit / Delivered
- **NGO Directory** — Partner cards with computed avg rating, contact links, distance

---

## Project Structure

```
hostel-food-waste/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx / .css        # Fixed nav, role-aware links, user chip
│   │   ├── Hero.jsx / .css          # Landing hero with live stats
│   │   ├── Dashboard.jsx / .css     # 4-column Kanban pipeline
│   │   ├── ImpactStats.jsx / .css   # Animated counters, bar chart
│   │   ├── FoodLog.jsx / .css       # Searchable table with status filter
│   │   ├── NGOList.jsx / .css       # NGO directory with computed stats
│   │   ├── LiveTracking.jsx / .css  # Delivery tracking modal
│   │   └── Footer.jsx / .css
│   │
│   ├── pages/
│   │   ├── Login.jsx / .css         # 4 role tabs, user cards with auto-fill
│   │   ├── AdminDashboard.jsx       # Full supply chain control center
│   │   ├── MessDashboard.jsx        # Mess staff food logging (batch support)
│   │   ├── NGODashboard.jsx         # NGO request and delivery view
│   │   ├── DeliveryDashboard.jsx    # Driver task management
│   │   └── FoodEntry.jsx / .css     # 3-step food entry wizard
│   │
│   ├── services/
│   │   └── database.js              # All localStorage CRUD services
│   │
│   ├── constants/
│   │   ├── status.js                # Single source of truth for status strings
│   │   └── permissions.js           # Role-based permission map + can() helper
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
- npm

### Frontend
```bash
git clone https://github.com/sakshi-walunjkar/Food-Waste-Management-System-.git
cd hostel-food-waste
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

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hostel.com` | `admin123` |
| Mess Staff | `mess1@hostel.com` | `mess123` |
| NGO | `ngo1@ngo.org` | `ngo123` |
| Delivery | `delivery1@hostel.com` | `delivery123` |

> You can also click any user card on the login page to auto-fill credentials.

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

## Data Flow

The frontend is fully decoupled from the backend. All reads and writes go through `src/services/database.js`, which wraps localStorage.

```
Component → service function (database.js) → localStorage → JSON.parse/stringify
```

### Service Layer

| Service | Key Functions |
|---------|---------------|
| `foodService` | `getAll()`, `getById(id)`, `create(entry)`, `updateStatus(id, status)`, `delete(id)` |
| `ngoService` | `getAll()`, `getById(id)`, `update(id, data)` |
| `userService` | `getAll()`, `getByEmail(email)` |
| `workflowService` | `assignCollection`, `markCollected`, `assignDelivery`, `markDelivered`, `cancelOwnEntry`, `declineTask`, `confirmReceipt` |
| `notificationService` | `notifyNGOs(foodEntry)`, `getForNGO(ngoId)`, `markAllRead(ngoId)` |
| `trackingService` | `getByFoodId(foodId)`, `addCheckpoint(foodId, coords)` |
| `statsService` | `getStats()` |

### Status Flow

```
PENDING_COLLECTION → COLLECTION_ASSIGNED → COLLECTED → IN_TRANSIT → DELIVERED
```

All status strings are defined in `src/constants/status.js`. Never use raw strings in components.

### Seed Data & Reset

To reset all data back to seed:
1. Bump `DB_VERSION` in `src/services/database.js` (e.g. `'2.1.0'` → `'2.2.0'`)
2. Reload the app — localStorage is wiped and re-seeded automatically

---

## Environment Variables

### Frontend (`.env` in root)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`.env` in `/backend`)
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/foodwaste
PORT=5000
JWT_SECRET=replace_with_a_long_random_string
```

---

## Connecting Frontend to Backend

The backend API is ready. To wire it up:

1. Create `.env` in the project root with `VITE_API_URL=http://localhost:5000/api`
2. Replace service functions in `database.js` with `fetch` calls:

```js
// Before (localStorage)
getAll: () => getStore('food')

// After (API)
getAll: async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/food`);
  return res.json();
}
```

3. Update components to handle the returned Promise (`async/await`)

---

## Known Limitations

- **localStorage only** — data is per-browser and resets on `DB_VERSION` bump. MongoDB backend is ready but not yet called by the frontend.
- **No real auth** — login matches credentials against seed data. JWT is scaffolded but not wired.
- **Map is a placeholder** — live tracking shows a progress bar and route history. Leaflet.js can be added without an API key.

---

## Roadmap

- [ ] Connect frontend to MongoDB backend
- [ ] JWT authentication for all roles
- [ ] Leaflet.js map in live tracking modal
- [ ] Email/SMS notifications via Nodemailer / Twilio
- [ ] Admin analytics page with charts
- [ ] QR code scan for delivery confirmation
- [ ] Mobile app (React Native)

---

## Difference from Previous Version

| | [Previous (HTML/CSS/JS)](https://github.com/sakshi-walunjkar/Food-Waste-Management-System-) | This Version (React + Node) |
|---|---|---|
| Frontend | Plain HTML, CSS, JavaScript | React 18 + Vite 7 |
| State | DOM manipulation | React `useState` + localStorage |
| Roles | Basic | 4 roles with permission system |
| Backend | None | Node.js + Express + MongoDB |
| Food Entry | Single item | Batch (multiple items at once) |
| Tracking | Static | Live progress + route history |
| Notifications | None | In-app bell with mark-all-read |

---

## License

MIT — free to use, modify, and distribute.

---

**"Turning today's leftovers into tomorrow's hope."** 🌿
