# Inventory App — Design Spec
**Date:** 2026-06-07

## Overview

A Progressive Web App for restaurant inventory management. Managers add it to their iPad home screens and use it to track stock across three storage areas. Every change is logged with who made it, when, and why.

---

## Tech Stack

- **Framework:** Next.js (frontend + API routes in one app)
- **Database:** MongoDB Atlas
- **Auth:** NextAuth.js with credentials provider (username/password)
- **Hosting:** Railway, auto-deployed from GitHub
- **PWA:** Web app manifest + service worker for iPad home screen install

---

## Access Control

- Username/password login required — no public access
- All authenticated managers have the same role and permissions
- Sessions stored in a cookie via NextAuth

---

## Inventory Categories

Three categories, each displayed as its own tab:
- **Cooler/Freezer** — produce and refrigerated items
- **Dry Storage** — take-out containers, soda cans, etc.
- **Bar** — alcohol (tracked by bottle count)

---

## Item Model

Each item belongs to one category and tracks either count, lbs, or both fields present (but only one actively used per item).

```
items collection:
{
  _id,
  name,
  category: "cooler" | "dry" | "bar",
  unit: "count" | "lbs",
  currentCount,   // null if unused
  currentLbs,     // null if unused
  createdAt
}
```

---

## Data Model

**`users`**
```
{ _id, username, passwordHash, displayName, createdAt }
```

**`items`**
```
{ _id, name, category, unit, currentCount, currentLbs, createdAt }
```

**`sessions`**
```
{ _id, userId, displayName, direction: "in" | "out", note, createdAt }
```

**`logs`**
```
{ _id, sessionId, itemId, itemName, oldValue, newValue, delta, unit, createdAt }
```

`itemName` is denormalized onto each log entry so history remains readable if an item is renamed or deleted. The 30-day history window is enforced by filtering `logs.createdAt`.

---

## UI Structure

### Navigation

Bottom tab bar with four tabs:
```
[ Cooler/Freezer ]  [ Dry Storage ]  [ Bar ]  [ History ]
```

### Category Tabs (Cooler, Dry Storage, Bar)

- Full-screen table of items for that category
- Items sorted alphabetically
- Each row shows: item name, current value (count or lbs)
- **Pencil icon** on each row — opens edit form to rename, change unit type, or delete the item
- **+ button** — opens add item form (name, category pre-filled, unit type, starting value)
- **"Start Update" button** — begins a batch update session

### Batch Update Flow

1. Tap **"Start Update"**
2. Select direction: **In** or **Out**
3. Write a note (required — e.g., "Shipment from Sysco arrived", "Prep for dinner service")
4. Adjust item values inline — manager can switch between category tabs freely while the session is active; all changes across all categories are grouped under the same session
5. Tap **"Submit"** — all changed items are saved; a session record is created with the manager's name, timestamp, direction, and note; one log entry per changed item records old value, new value, and delta
6. Session state is held client-side until submitted — navigating away or closing the app will lose unsaved changes

### History Tab

- Feed of past sessions, newest first, rolling 30-day window
- Each session entry shows:
  - Manager display name
  - Timestamp
  - Direction (In / Out)
  - Note
  - List of changed items: `Tito's Vodka: 7 → 5 (−2)`

---

## API Routes (Next.js)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/[...nextauth]` | NextAuth login/logout |
| GET | `/api/items` | List all items (optionally filter by category) |
| POST | `/api/items` | Create a new item |
| PATCH | `/api/items/[id]` | Edit item name, unit, or delete |
| POST | `/api/sessions` | Submit a batch update (creates session + logs) |
| GET | `/api/history` | Fetch sessions + logs for last 30 days |

---

## PWA Configuration

- `manifest.json` with app name, icons, `display: "standalone"`, `orientation: "portrait"`
- Service worker for offline shell (read-only cache — writes require connectivity)
- Optimized for iPad viewport

---

## Out of Scope (v1)

- Automated alerts or par-level notifications
- Purchase orders or supplier management
- Role-based access control
- History beyond 30 days
