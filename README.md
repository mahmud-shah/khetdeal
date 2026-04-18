# KhetDeal — Pre-Harvest Farm-Gate Marketplace

Bangladesh's first platform where farmers list standing crops BEFORE harvest, buyers browse by geography, and deals happen directly with full price transparency.

## Key Architecture Principles

- **NO demo/mock data.** Every user starts with an empty profile, empty listings, empty offers.
- **All data is user-specific and real-time** — data lives in Supabase and is fetched per-user.
- **Three roles**: Farmer, Buyer, Local Trader
- **Full CRUD** — farmers and traders can create, read, update, delete their own listings.
- **Profile system** — every user has a public profile others can view.
- **Guest browsing** — anyone can view the Explore page; actions (offer, list) require login.

## Project Structure

```
khetdeal/
├── frontend/                                   React + Vite + Tailwind
│   ├── src/
│   │   ├── main.jsx · App.jsx · index.css
│   │   ├── config/supabase.js                  Storage uploads
│   │   ├── services/api.js                     All backend calls
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx                 Real backend auth, no demo mode
│   │   │   ├── ThemeContext.jsx
│   │   │   └── LangContext.jsx
│   │   ├── i18n/en.js · bn.js
│   │   ├── lib/crops.js                        Static emoji/division lookups
│   │   ├── components/
│   │   │   ├── Navbar.jsx                      Role-specific menu
│   │   │   ├── Footer.jsx
│   │   │   ├── ListingCard.jsx                 Photo, owner link, edit/delete
│   │   │   ├── OfferModal.jsx
│   │   │   ├── ListingFormModal.jsx            Create + Edit in one component
│   │   │   └── PhotoUpload.jsx                 Supabase Storage uploads
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── Login.jsx · Register.jsx
│   │       ├── Explore.jsx                     Crop-gated geo browse
│   │       ├── Dashboard.jsx                   Role-aware, loads own data
│   │       ├── Profile.jsx                     Edit own, view others
│   │       └── Orders.jsx                      Completed order history
│   ├── vite.config.js · tailwind.config.js · package.json · index.html · .env.example
│
├── backend/                                    Node + Express + Supabase
│   ├── server.js
│   ├── config/supabase.js
│   ├── middleware/
│   │   ├── auth.js                             JWT + role check
│   │   └── validate.js                         Zod schemas
│   ├── routes/
│   │   ├── auth.js                             register, login, /me
│   │   ├── profiles.js                         GET /:id, PUT /me
│   │   ├── listings.js                         Full CRUD + state machine
│   │   ├── offers.js                           Auto-creates order on accept
│   │   ├── notifications.js
│   │   ├── orders.js                           Completed order history
│   │   ├── stats.js                            Real user-specific stats
│   │   └── geo.js                              Crop-gated aggregation
│   ├── sql/schema.sql                          5 tables + Storage buckets + RPC
│   └── package.json · .env.example
│
├── README.md
└── .gitignore
```

## Setup Instructions

### Step 1 — Create Supabase Project
1. Go to https://supabase.com → New Project (free tier)
2. Save your database password
3. Wait 2-3 minutes for provisioning

### Step 2 — Get API Keys
In Supabase dashboard → Settings → API, copy:
- **Project URL** (e.g. `https://abcd.supabase.co`)
- **anon public key** (long string)
- **service_role key** (keep this SECRET)

### Step 3 — Run Database Schema
1. Open Supabase SQL Editor → New Query
2. Paste the entire contents of `backend/sql/schema.sql`
3. Click Run
4. Verify: 5 tables (users, listings, offers, notifications, orders) + 2 storage buckets (listing-photos, avatars)

### Step 4 — Configure Backend
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=any-random-32-plus-char-string
```
Then:
```bash
npm install
npm run dev
```
API runs at `http://localhost:5000`

### Step 5 — Configure Frontend
```bash
cd frontend
cp .env.example .env
```
Edit `frontend/.env`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Then:
```bash
npm install
npm run dev
```
Open `http://localhost:5173`

### Step 6 — Test
1. Register a new account (farmer, buyer, or trader) with a Bangladesh phone (01XXXXXXXXX)
2. New account will have **zero** listings, offers, orders — this is correct
3. As farmer/trader: create a listing, upload photos, edit, delete
4. As buyer: visit Explore, find crops, send offers
5. As farmer/trader: accept an offer → automatically creates an order

## Role Permissions

| Action                    | Farmer | Buyer | Trader | Guest |
|---------------------------|:------:|:-----:|:------:|:-----:|
| Browse Explore page       |   ✅   |  ✅   |   ✅   |  ✅   |
| View public profiles      |   ✅   |  ✅   |   ✅   |  ✅   |
| Create listing            |   ✅   |  ❌   |   ✅   |  ❌   |
| Edit/delete own listing   |   ✅   |  ❌   |   ✅   |  ❌   |
| Send offer                |   ❌   |  ✅   |   ✅   |  ❌   |
| Accept/reject offer       |   ✅   |  ❌   |   ✅   |  ❌   |
| Edit own profile          |   ✅   |  ✅   |   ✅   |  ❌   |

## Navigation Menu

**Farmer / Trader**: Home · Explore · Dashboard · My Profile · My Listings · Completed Orders · Logout

**Buyer**: Home · Explore · Dashboard · My Profile · Completed Orders · Logout

**Guest**: Home · Explore · Login · Register

## Editing Guide

| To change... | Edit this file |
|---|---|
| Any text on website | `frontend/src/i18n/en.js` or `bn.js` |
| Colors | `frontend/tailwind.config.js` |
| Crop emojis | `frontend/src/lib/crops.js` |
| Database schema | `backend/sql/schema.sql` |
| API routes | `backend/routes/*.js` |
| Components | `frontend/src/components/` |
| Pages | `frontend/src/pages/` |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | Supabase PostgreSQL (free tier) |
| Storage | Supabase Storage (free tier) |
| Auth | JWT + bcrypt (phone-based) |
| Validation | Zod |

## GitHub Workflow

```bash
cd khetdeal
git init
git add .
git commit -m "Initial KhetDeal project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/khetdeal.git
git push -u origin main
```
`.gitignore` excludes `node_modules/` and `.env` so your secrets stay private.
