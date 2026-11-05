# Campus Cafeteria Sync – Queue Display & Dispatch

A complete, high-performance cafeteria queue management system powered by **Node.js, Express.js, MongoDB Atlas (Mongoose), Socket.IO**, and an interactive **React 18** real-time multi-station frontend.

---

## 1. Project Overview & Features

The system connects four real-time operational touchpoints in a synchronized workflow pipeline:
- **Station 1: Student Self-Ordering Kiosk & Tracker**
  - Dynamic menu loading directly from MongoDB with category filtering.
  - Cart addition/removal with automatic total calculation on frontend and server-side verification.
  - Dine-In Table selection or Dine-Out Takeaway packing options.
  - Student Name / Roll Number and special cooking instructions.
  - Atomic, collision-free sequential token ticket generation.
  - Live Token Status Tracker with instant lookup from MongoDB.
- **Station 2: Kitchen Display System (Chef Making)**
  - Real-time order stream from MongoDB.
  - Interactive item-by-item preparation checklist.
  - One-tap status advancement from `ordered` &rarr; `cooking` &rarr; `ready`.
  - Immediate database persistence and Socket.IO broadcast across all screens.
- **Station 3: Delivery & Dispatch Station (Delivering)**
  - Live ready queue view for dining tables and takeaway handovers.
  - Audio chime buzzer triggering Web Audio API chime on all connected devices.
  - Dispatches orders to `delivered` status with delivery history.
- **Station 4: Dining Hall TV Signage Board**
  - High-visibility public board showing **Now Ready For Pickup** (with glowing badges) and **Preparing Now** queue.
  - Real-time audio chime sound when tickets transition to ready (with deduplication).
  - Live up-to-the-minute queue waitlist.


## 2. MongoDB Database & Collection Design

### Database Name
`campus_cafeteria`

## 3. Installation & Running Instructions

### Step 1: Install Dependencies
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
```

### Step 2: Seed the Database
Populate initial menu items, counters, users, and starter orders:
```bash
npm run seed
# or
node seed/seedMenu.js
```

### Step 3: Start the Backend Server
```bash
npm start
# or for live reloading during development:
npm run dev
```

The server will display:
```
======================================================
 Campus Cafeteria Backend Server Running on Port 5000
 API URL:      http://localhost:5000/api
 Web Frontend: http://localhost:5000/
 Mode:         development
======================================================
[MongoDB Connected]: Host=..., Database=campus_cafeteria
```

### Step 4: Open the Frontend
You can open the application in any of the following ways:
- **Direct in browser**: [http://localhost:5000/](http://localhost:5000/) (Served directly by Express backend)
- **Local file**: Double-click `campus_cafeteria_queue_display.html` or `frontend/index.html` (auto-connects to `http://localhost:5000`).

---

## 7. REST API Endpoints Summary

### Menu APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/menu` | Get all menu items (optional `?category=...&available=true`) |
| `GET` | `/api/menu/:id` | Get details of a single menu item |
| `POST` | `/api/menu` | Add a new menu item |
| `PUT` | `/api/menu/:id` | Update menu item details |
| `PATCH` | `/api/menu/:id/availability` | Toggle or set menu item availability |
| `DELETE` | `/api/menu/:id` | Delete a menu item |

### Order APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Place a new order (validates items, auto-calculates total, assigns counter, generates unique sequential token) |
| `GET` | `/api/orders` | Get all orders sorted by newest first |
| `GET` | `/api/orders/:id` | Get order by ID or orderId |
| `GET` | `/api/orders/token/:token` | Track order by token number (e.g. `/api/orders/token/104`) |
| `PATCH` | `/api/orders/:id/status` | Advance status (`ordered` &rarr; `cooking` &rarr; `ready` &rarr; `delivered`) |
| `DELETE` | `/api/orders/:id` | Delete/cancel an order ticket |
| `POST` | `/api/orders/reset-demo` | Restore demo orders and sync to MongoDB |

### Dashboard & Status Queue APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Returns `{ totalOrders, ordered, cooking, ready, delivered, totalRevenue }` |
| `GET` | `/api/orders/status/ordered` | Newly placed orders queue |
| `GET` | `/api/orders/status/cooking` | Active kitchen grill queue |
| `GET` | `/api/orders/status/ready` | Orders ready for delivery pickup |
| `GET` | `/api/orders/status/delivered`| Delivered orders history |

### Authentication APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token |
| `GET` | `/api/auth/profile` | Protected endpoint returning current user details |

---

## 8. Postman API Testing Instructions

A complete, pre-configured collection is saved at:
[`backend/Campus_Cafeteria_Postman_Collection.json`](file:///c:/Users/geeth/OneDrive/Documents/cafteria/backend/Campus_Cafeteria_Postman_Collection.json)

### How to Import:
1. Open Postman.
2. Click **Import** (top left).
3. Drag & drop or select `backend/Campus_Cafeteria_Postman_Collection.json`.
4. The **Campus Cafeteria Sync API** collection will appear with all 19 endpoints neatly organized in folders:
   - `Health Check`
   - `Auth` (Register, Login with auto-token capture, Profile)
   - `Menu` (Get All, Get By ID, Create, Update, Patch Availability, Delete)
   - `Orders` (Place Dine-In, Place Dine-Out, Get All, Track By Token, Update Statuses, Delete, Reset)
   - `Dashboard & Queue Status` (Stats, Ordered, Cooking, Ready, Delivered)
5. Run tests against `http://localhost:5000`.

---

## 9. Verification & Tested Features

| # | Verified Feature | Result |
|---|---|---|
| 1 | **Menu items load from MongoDB** | Passed (`GET /api/menu` returns all 9 dishes) |
| 2 | **Students can place orders** | Passed (`POST /api/orders` saves order with items and notes) |
| 3 | **Orders saved permanently** | Passed (Persisted in MongoDB `orders` collection) |
| 4 | **Token numbers are unique & sequential** | Passed (Atomically increments 106 &rarr; 107 &rarr; 108 without duplicates) |
| 5 | **Empty cart validation** | Passed (Returns 400 Bad Request if cart is empty) |
| 6 | **Server-side total calculation** | Passed (Prices recalculated on backend rather than trusting client) |
| 7 | **Kitchen staff can update order statuses** | Passed (`PATCH /api/orders/:id/status` transitions `ordered` &rarr; `cooking` &rarr; `ready`) |
| 8 | **Ready orders appear on delivery screen** | Passed (`GET /api/orders/status/ready` returns ready tickets) |
| 9 | **Delivered orders stored in history** | Passed (`GET /api/orders/status/delivered` tracks completed meals) |
| 10 | **Token tracking works correctly** | Passed (`GET /api/orders/token/:token` fetches real-time status) |
| 11 | **Dashboard statistics are accurate** | Passed (`GET /api/dashboard/stats` matches real-time counts and revenue) |
| 12 | **Real-time synchronization** | Passed (Socket.IO broadcasts `order:created`, `order:updated`, `order:ready`, `order:deleted`) |
| 13 | **Audio chime notification** | Passed (Web Audio API synthesizes chime on ready, deduplicated) |
| 14 | **Existing UI/UX 100% preserved** | Passed (All Tailwind styles, dark theme, cards, animations intact) |
| 15 | **Data remains available after restart** | Passed (MongoDB retains all orders and sequence counters) |
