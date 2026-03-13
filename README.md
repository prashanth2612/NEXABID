# NexaBid — B2B Manufacturing Marketplace

## Project Structure

```
nexabid/
├── package.json             ← ROOT — one npm install for everything
├── nexabid-client/          ← Buyer App           → localhost:5173
├── nexabid-manufacturer/    ← Manufacturer App     → localhost:5174
├── nexabid-admin/           ← Admin Panel          → localhost:5175
└── nexabid-backend/         ← Backend API          → localhost:3000
```

---

## ⚡ Setup — Only Once Ever

```bash
cd nexabid
npm install
```

That's it. All 4 apps are ready.

---

## Running Apps

```bash
# Run buyer app only
npm run dev:client

# Run manufacturer app only
npm run dev:manufacturer

# Run both frontend apps simultaneously
npm run dev:all

# Run backend only
npm run dev:backend
```

---

## Building for Production

```bash
# Build a specific app
npm run build:client
npm run build:manufacturer

# Build all apps at once
npm run build:all
```

---

## What's Built

### ✅ nexabid-client — Buyer App (localhost:5173)
- Login page
- Register page (name, email, phone, optional company + GST)
- Forgot password page
- Protected routes + Zustand auth store
- Full Zod validation

### ✅ nexabid-manufacturer — Manufacturer App (localhost:5174)
- Login page
- Register page (name, email, phone, optional factory + GST + category)
- Forgot password page
- Protected routes + Zustand auth store
- Full Zod validation

### 🔜 nexabid-admin (localhost:5175)
- Coming in Step 9

### 🔜 nexabid-backend (localhost:3000)
- Coming in Step 5

---

## Build Roadmap

| Step | What | Status |
|------|------|--------|
| 1 | nexabid-client auth pages | ✅ Done |
| 2 | nexabid-manufacturer auth pages | ✅ Done |
| 3 | Client dashboard + post order | 🔜 Next |
| 4 | Manufacturer swipe dashboard | 🔜 |
| 5 | Backend — auth + order APIs | 🔜 |
| 6 | Connect frontend ↔ backend | 🔜 |
| 7 | Escrow payment (Razorpay) | 🔜 |
| 8 | Chat + real-time (Socket.io) | 🔜 |
| 9 | Admin panel | 🔜 |
| 10 | AI bid suggestions | 🔜 |
| 11 | Notifications | 🔜 |
| 12 | Testing + deployment | 🔜 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js, Express, TypeScript |
| Primary DB | PostgreSQL (TypeORM) |
| Documents DB | MongoDB (Mongoose) |
| Cache | Redis |
| Payments | Razorpay (Escrow) |
| Real-time | Socket.io |
| SMS / OTP | Twilio |
| File Storage | AWS S3 |
| AI | OpenAI GPT-4 |
