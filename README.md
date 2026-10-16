Ref: KL-7Q4

# BreakFree 🌿

> **Break the chain. One day at a time.**  
> A gamified habit-quitting web app built for the Kenpath Labs Full Stack Engineer build task.

---

## Live Demo

🔗 **[https://breakfree-iota.vercel.app](https://breakfree-iota.vercel.app)**

> Open it on your phone — it is designed mobile-first.

---

## What It Does

BreakFree helps people quit smoking, alcohol, or any habit by making the journey feel rewarding. Users register once with a username and password, log in from any device, and come back daily to check in and earn rewards.

**Daily loop:**
1. Open the app → see how long you have been free (live timer, ticks every second)
2. Hit **Daily Check-in** → earn +50 points, keep your streak alive
3. Hit a craving? → **Craving SOS** → get a 5-minute distraction activity → earn +10 points
4. Track your level, badges, and money saved
5. Check the leaderboard — compete with others

---

## Features

| Feature | Details |
|---------|---------|
| 🔐 **Auth** | Register with username + password. Log in from any device. |
| ⏱ **Live Free Timer** | Days : Hours : Minutes : Seconds since quit time, updates every second |
| 🎯 **Daily Check-in** | +50 pts once per day — server-side duplicate prevention |
| 🔥 **Streaks** | Consecutive daily check-ins. Bonus: +200 pts at 7 days, +500 pts at 30 days |
| ⭐ **Points & Levels** | 5 levels: Starter → Fighter → Warrior → Champion → Legend |
| 🏅 **Badges** | 6 unlockable badges based on days free, streak length, and points |
| 🆘 **Craving SOS** | 6 distraction activities (breathing, stretching, counting…) · +10 pts |
| 🏆 **Leaderboard** | Top 10 users by points. Current user highlighted. |
| 💰 **Money Saved** | Calculated from daily cost × days free |
| 📱 **Mobile-first** | Designed for 375 px screens, large tap targets, simple English |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Vanilla CSS — no Tailwind, full control |
| Auth | bcryptjs — username + hashed password, userId in localStorage |
| Database | MongoDB Atlas via Mongoose (free M0 cluster) |
| Deployment | Vercel free tier |
| Font | Google Fonts — Inter |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### 1. Clone the repo
```bash
git clone https://github.com/Devanshu-17/breakfree.git
cd breakfree
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/breakfree?retryWrites=true&w=majority
```

Get your URI from MongoDB Atlas → Connect → Drivers. Make sure your IP is whitelisted under Network Access.

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # Dashboard (home)
│   ├── layout.tsx              # Root layout + SEO meta
│   ├── globals.css             # Full design system (vanilla CSS)
│   ├── login/page.tsx          # Login page
│   ├── onboarding/page.tsx     # Registration page
│   ├── leaderboard/page.tsx    # Top 10 leaderboard
│   ├── sos/page.tsx            # Craving SOS distraction
│   └── api/
│       ├── user/route.ts       # POST — register user
│       ├── user/[id]/route.ts  # GET — fetch user by ID
│       ├── login/route.ts      # POST — login, verify password
│       ├── checkin/route.ts    # POST — daily check-in
│       ├── sos/route.ts        # POST — SOS activity +10 pts
│       └── leaderboard/route.ts# GET — top 10 users
├── lib/
│   ├── mongodb.ts              # DB connection singleton
│   ├── gameLogic.ts            # Pure functions: levels, badges, streaks, SOS
│   └── models/User.ts          # Mongoose schema
└── types/index.ts              # Shared TypeScript types
```

---

## Architecture

```
Browser (localStorage: userId)
    │
    ├── POST /api/user          → Register (bcrypt hash password)
    ├── POST /api/login         → Login (bcrypt compare)
    ├── GET  /api/user/:id      → Load user data
    ├── POST /api/checkin       → Daily check-in, streak + points
    ├── POST /api/sos           → SOS completion +10 pts
    └── GET  /api/leaderboard   → Top 10 by points
            │
         MongoDB Atlas (free M0)
```

---

## Design Decisions

**Why username + password instead of OAuth?**  
The target users are on modest Android phones, often using apps in their second language. OAuth flows (Google, GitHub) add friction and confusion. A simple username + password that works offline is faster and clearer.

**Why server-side point validation?**  
Points are awarded by the backend only — the client cannot call an API twice and double-earn. The `/api/checkin` route checks `lastCheckin` date before awarding anything.

**Why localStorage for session?**  
No cookies, no JWT expiry — a returning user is always logged in on their own device. Logging out clears it. Simple for contributors, easy to reason about.

**Why vanilla CSS instead of Tailwind?**  
One `globals.css` file with CSS custom properties gives full control over every pixel without generated class noise. The design system is easy to read and extend.

---

## What I Left Out (and Why)

| Feature | Reason |
|---------|--------|
| Push notifications | Requires service worker — adds significant complexity beyond scope |
| Real money payouts | Would need KYC + payment gateway — not relevant for a prototype |
| Password reset | Would need email sending (Resend/Nodemailer) — out of scope |
| Full test suite | Time trade-off — focused on correct behaviour over test coverage |
| Android APK | The web app is installable as a PWA (Add to Home Screen) without a separate build |

---

## AI Usage

I used AI coding tools (Antigravity / Gemini) to:
- Scaffold the Next.js project structure and boilerplate
- Draft the CSS design system tokens
- Generate the 6 SOS activity descriptions

All business logic — streak computation, level calculations, badge unlocking, server-side API validation, bcrypt auth — was reviewed and verified by me. Every API route was manually tested for the duplicate check-in edge case and wrong-password response.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel env add MONGODB_URI production
vercel --prod --yes
```

---

Made with 💚 by Devanshu Joshi
