# Smart Waste Management Portal
### Professional Communication and Ethics (PCE) Academic Prototype v1.3
*Desktop-first, citizen-focused web platform for public cleanliness, domestic segregation, and municipal transparency.*

---

## 1. Project Overview & Folder Architecture

The application is structured into three clean, dedicated tiers:

```
e:\PCE\
├── frontend/                     # Tier 1: Client Application (SPA)
│   ├── index.html                # Modern desktop-first citizen portal & admin views
│   ├── css/
│   │   └── styles.css            # Custom card elevations, badges, timeline connectors, toasts
│   └── js/
│       ├── api.js                # REST API client connecting to backend
│       ├── map.js                # Interactive Leaflet map (pins, coordinates selector)
│       └── app.js                # View controller, forms, role toggle, toasts & quiz
│
├── backend/                      # Tier 2: Application Server & REST API
│   ├── package.json              # Express & CORS dependencies
│   ├── server.js                 # HTTP server, static file host & upload handler
│   ├── routes/
│   │   ├── complaints.js         # Report submission, tracking, feedback & status updates
│   │   ├── pickups.js            # Special & bulky collection scheduling
│   │   ├── wasteGuide.js         # Searchable waste segregation guide
│   │   ├── events.js             # Community cleanliness drives & registrations
│   │   ├── rewards.js            # Eco-Points ledger, redeem vouchers
│   │   └── dashboard.js          # Aggregated metrics, CSV export & admin audit trail
│   └── uploads/                  # Storage directory for uploaded issue photos
│
├── database/                     # Tier 3: Data Architecture & Persistence
│   ├── schema.sql                # Complete relational SQL schema (for academic report)
│   ├── db.js                     # Persistent JSON/relational database engine with ACID safety
│   ├── seedData.js               # Comprehensive pre-seeded dataset (complaints, guide, drives)
│   └── data.json                 # Persistent active database storage file
│
├── package.json                  # Root npm project definition
├── start_server.bat              # 1-Click double-clickable Windows launcher
└── README.md                     # Documentation & presentation guide
```

---

## 2. Refined UI & Features

1. **Clean Topbar**:
   - Location status indicator (`Ward 14 • Metro Central`).
   - Vibrant **Eco-Points** badge with subtle hover transition.
   - **1-Click Role Toggle**: Smoothly switches between **Resident Mode** and **Demo Admin Operations**.
   - Database reset button to return data to pristine presentation seed state anytime.

2. **Ward 14 Civic Health Analytics**:
   - Composite **Ward Cleanliness Index (88%)**.
   - Average Squad Response Time (**18.4 hrs** vs 24h municipal target).
   - Household Source Segregation Compliance Meter (**76%**).

3. **Interactive Waste Sorter Mini-Quiz**:
   - Pedagogical widget right in the Waste Guide testing domestic segregation (e.g., greasy pizza box disposal).
   - Instant educational feedback and +10 Eco-Points reward.

4. **Academic Demo Fast-Fill Helpers**:
   - **Hotspot Chips**: 1-click auto-fill for `Green Park Bus Stop`, `Metro Station Gate 2`, or `St. Mary School` (automatically positions the Leaflet map marker).
   - **Preset Sample Photos**: 1-click attachment of verified issue photos (`Overflowing Bin`, `Roadside Dump`, `Food Waste`) for swift demo presentations without browsing local files.

5. **Citizen Quality Evaluation & Feedback Loop**:
   - When a ticket is marked `Resolved`, residents can submit a **1 to 5 Star Rating** and constructive comment on cleanliness quality.
   - Rewards the resident with **+15 Eco-Points** for evaluating public services.

6. **Active Voucher Redemption Engine**:
   - Citizens can redeem their Eco-Points for illustrative demo rewards (saplings, composting kit discounts, civic certificates).
   - Generates unique redemption codes (e.g. `ECO-CPN-01-9060`) and updates ledger.

7. **Municipal Audit CSV Export**:
   - One-click export in Admin Portal to download a full CSV report of all complaint tickets, timestamps, assigned squads, and resolution notes.

8. **Floating Toast Notifications**:
   - Real-time visual feedback for ticket submission, status changes, GPS locks, and quiz answers.

---

## 3. How to Run

* **Double-click `start_server.bat`** in `e:\PCE\` (starts server and opens your browser).
* Or in PowerShell:
  ```powershell
  node backend/server.js
  ```
* Open in browser: `http://localhost:3000`
"# SmartWaste" 
