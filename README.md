# VoiceLegacy

**Preserve the voice, words, and phrases that make communication feel personal before speech loss occurs.**

Every year, millions of people lose the ability to speak — due to ALS, stroke, throat cancer, Parkinson's, or progressive neurological conditions. VoiceLegacy lets people preserve their natural voice and build a personal communication toolkit — so they can always sound like themselves when it matters most.

---

## What It Does

1. **Voice Cloning** — Read 8 short phrases into your microphone. ElevenLabs creates a private clone of your voice in seconds. From that point on, any text can be spoken back in *your* voice.

2. **Phrase Bank** — Build a personal library of the things you actually say, organized by category: Family, Daily Needs, Comfort, Humor, Emergency, Personal. Every phrase is playable in your cloned voice with one tap.

3. **AI-Powered Communication** — Gemini suggests phrases, rewrites messages to sound warmer or shorter, and restyles text to match your saved communication tone. You type what you want to say. The AI shapes it. Your preserved voice speaks it.

4. **Privacy-First Design** — Explicit consent before anything is recorded. All data is private, never shared, and deletable at any time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Authentication | [Clerk](https://clerk.com/) (`@clerk/nextjs` v7) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Voice Cloning + TTS | [ElevenLabs API](https://elevenlabs.io/) |
| AI Reasoning | [Gemini API](https://ai.google.dev/) (Flash 2.0) |
| Audio Recording | Browser MediaRecorder API |
| Deployment | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- API keys for: Clerk, MongoDB Atlas, ElevenLabs, Gemini (optional)

### Setup

```bash
# Clone the repo
git clone https://github.com/ntoptchi/VoiceLegacy.git
cd VoiceLegacy/frontend

# Install dependencies
npm install

# Copy the env template and fill in your keys
cp .env.local.example .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `frontend/.env.local.example` to `frontend/.env.local` and fill in the values:

| Variable | Required | Source |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Yes | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `MONGODB_URI` | Yes | [cloud.mongodb.com](https://cloud.mongodb.com) |
| `ELEVENLABS_API_KEY` | Yes | [elevenlabs.io](https://elevenlabs.io/app/settings/api-keys) |
| `GEMINI_API_KEY` | Optional | [aistudio.google.com](https://aistudio.google.com/apikey) |

If you don't have a key yet, set the matching `MOCK_*` flag to `true`:

```env
MOCK_DB=true            # In-memory store, no MongoDB needed
MOCK_VOICE_API=true     # Stub ElevenLabs responses
MOCK_GEMINI_API=true    # Stub Gemini responses
```

---

## User Flow

```
Landing Page (/)          → No auth required
    ↓
Record Voice (/record)    → No auth — record 8 phrases, create voice clone
    ↓
Preview (/preview)        → No auth — hear your clone speak for the first time
    ↓
Sign Up (Clerk)           → Create account after hearing the emotional hook
    ↓
Consent (/consent)        → Privacy agreement + communication style
    ↓
Phrase Bank (/phrases)    → Build your personal phrase library
    ↓
Speak For Me (/speak)     → AI rewrites + TTS playback in your voice
    ↓
Dashboard (/dashboard)    → Profile, export, delete data
```

---

## Project Structure

```
VoiceLegacy/
├── frontend/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── api/                # Backend API routes
│   │   │   ├── user/           # User CRUD (Clerk auth)
│   │   │   ├── voice/          # Upload, claim, delete voice
│   │   │   ├── phrases/        # Phrase CRUD
│   │   │   ├── gemini/         # AI suggest + rewrite
│   │   │   └── speak/          # Text-to-speech
│   │   ├── record/             # Voice recording page
│   │   ├── preview/            # Clone preview page
│   │   ├── consent/            # Privacy consent page
│   │   ├── phrases/            # Phrase bank page
│   │   ├── speak/              # Speak For Me page
│   │   └── dashboard/          # User dashboard
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   └── lib/                # Backend helpers, DB, API clients
│   ├── public/                 # Static assets
│   ├── scripts/                # Seed + index scripts
│   └── .env.local.example      # Environment variable template
├── voicelegacy-plan.md         # Full project plan
├── PROGRESS.md                 # Build progress tracker
├── PITCH.md                    # Pitch guide for judges
└── SCRIPT.md                   # Demo video script
```

---

## Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Seed demo data (requires MONGODB_URI in .env.local)
npx tsx scripts/seed-demo.ts

# Create database indexes
npx tsx scripts/ensure-indexes.ts
```

---

## Deployment

The app deploys to Vercel:

1. Import the GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Import environment variables from `.env.local`
4. In MongoDB Atlas, add `0.0.0.0/0` to the IP Access List for serverless
5. In Clerk, add the Vercel domain to allowed origins
6. Deploy

---

## Team

Built at Hackabull by:
- Nicholas Toptchi
- Jackson Bopp
- Amrit Selva Ganesh
- Connor Kouznetsov

---

## License

This project was built for a hackathon. All rights reserved.
