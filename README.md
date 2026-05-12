# Anki Dashboard

A weekly Anki stats tracker for communication skills classes.

## Stack
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Backend**: Express.js (Node.js ESM)
- **DB**: In-memory for now — structured for Postgres migration

---

## Quick start

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Run backend & frontend concurrently
```bash
npm run start
# Backend APIs Runs on http://localhost:3001
# Frontend Runs on http://localhost:5173
```

### 3. Login
- Username: `teacher`
- Password: `teach123`

---

## How it works

1. Students export their Anki stats on Friday using the **LLM Stats plugin**
2. They name the file `Firstname_Surname.jsonl` and include deck name in the export
3. You drop all files into the Upload page — they're processed immediately
4. View per-student breakdowns or the class comparison view

---

## File naming convention
```
Firstname_Surname.jsonl     ✅
export_final.jsonl          ❌ (can't identify student)
```

## Validation checks
| Check | Level |
|---|---|
| No reviews in current week window | Error |
| Reviews from a previous week included | Warning |
| >60% of reviews hit the 60s cap | Warning |
| Deck name field missing | Error |
| All reviews in one day, total <3 min | Error |

---

## Expanding later

### Adding Postgres
Replace the `sessionStore` Map in `backend/src/routes/upload.js` with:
```js
import { pool } from '../lib/db.js'
await pool.query('INSERT INTO sessions ...', [...])
```
Add a `backend/src/lib/db.js` with your pg pool config.

### Adding student logins
`backend/src/routes/auth.js` already has the structure — swap `USERS` object for a DB query:
```js
const user = await pool.query('SELECT * FROM users WHERE username=$1', [username])
```

### Adding more metrics
All analysis logic lives in `backend/src/lib/analyzer.js` — add any new metric there and it will flow through to the frontend automatically via the `/api/stats/:id` endpoint.
