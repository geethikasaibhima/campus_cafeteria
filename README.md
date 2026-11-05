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

### Step 3: Open the Frontend
You can open the application in any of the following ways:
- **Direct in browser**: [http://localhost:5000/](http://localhost:5000/) (Served directly by Express backend)
- **Local file**: Double-click `campus_cafeteria_queue_display.html` or `frontend/index.html` (auto-connects to `http://localhost:5000`).

---

