# VoiceLegacy — Full MVP Plan

> Preserve the voice, words, and phrases that make communication feel personal before speech loss occurs.

---

## What is VoiceLegacy?

Every year, millions of people lose the ability to speak — due to ALS, stroke, throat cancer, Parkinson's, or progressive neurological conditions. When that happens, they don't just lose words. They lose the sound of themselves. The laugh their kids recognize. The way they say "I love you" that nobody else says quite the same way.

VoiceLegacy is a web app that lets people **preserve their natural voice before it changes** — and then use it to keep communicating in a way that sounds and feels like them.

Here's what it does:

1. **Voice cloning** — The user reads a set of short phrases out loud. We send those recordings to ElevenLabs, which creates a private voice clone. From that point on, any text can be spoken back in their voice.

2. **Phrase bank** — The user builds a personal library of the things they actually say: "I love you more than you know," "Could I have some water, please?", "Don't let me lose my reputation for timing." Organized by category — family, daily needs, comfort, humor, emergency, personal. Each phrase is playable in their cloned voice with one tap.

3. **AI-powered communication** — Using Gemini, the app can suggest phrases for any category, rewrite a message to sound warmer or shorter, or restyle it to match the user's saved communication tone. The user types what they want to say, the AI shapes it, and the cloned voice speaks it.

4. **Privacy-first design** — Explicit consent before anything is recorded. All data is private, never shared, and deletable at any time. The user owns their voice.

The emotional hook of the product: you record your voice, hear it cloned back to you immediately, and *then* we ask you to create an account. By that point, you've already heard yourself preserved — the reason to sign up is real and felt, not theoretical.

This is not a generic text-to-speech tool. It's a **communication toolkit built for people facing speech loss** — so they can always sound like themselves when it matters most.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) | Full-stack in one repo. API routes built-in. Deploys to Vercel. |
| **Styling** | Tailwind CSS v4 | Fast to build, easy to keep consistent |
| **Authentication** | Clerk (`@clerk/nextjs` v7) | Managed auth with social login, middleware route protection, `UserButton` |
| **Database** | MongoDB Atlas | Document model is a natural fit for the phrase bank |
| **Voice cloning + TTS** | ElevenLabs API | Instant Voice Clone endpoint + TTS generation |
| **AI reasoning** | Gemini API (Flash 2.0) | Phrase suggestions + tone rewriting |
| **Audio recording** | Browser MediaRecorder API | No extra library needed |
| **Deployment** | Vercel | Free tier, instant deploy from GitHub |

### Honest note on Snowflake
Snowflake does not fit VoiceLegacy naturally. Forcing it will hurt the product and judges will notice. You have Gemini + ElevenLabs + MongoDB — that's three strong API challenge entries. Drop Snowflake for this one.

### Note on Azure (dropped)
Azure AI Speech was originally planned to verify users were reading recording prompts correctly. It has been cut from the MVP to keep the demo focused; the recording flow trusts the user to read the prompt and uploads the audio directly to ElevenLabs.

---

## Authentication Flow (Clerk)

The key insight: **the emotional hook happens before the ask.**

```
/ (landing)              → No auth — hero page with CTA to /record
  ↓
/record                  → No auth — read phrases, record voice, create clone
  ↓
/preview                 → No auth — hear the clone auto-play a demo phrase
  ↓                        "This is your voice. Create a free account to save it."
Clerk sign-up (modal)    → Clerk handles auth
  ↓
/consent                 → Auth required — privacy consent + communication style
  ↓                        Creates user in MongoDB, claims pending voiceId
/phrases                 → Auth required — build phrase bank
  ↓
/speak                   → Auth required — AI rewrites + TTS playback
  ↓
/dashboard               → Auth required — profile, export, delete data
```

The voice clone is created **anonymously** — `voiceId` is held in `sessionStorage` between recording and account creation. After Clerk sign-up, `/consent` calls `POST /api/voice/claim` to write `{ clerkUserId, voiceId }` to MongoDB.

---

## Data Models

### User
```js
{
  _id: ObjectId,
  clerkUserId: String,              // Clerk's user ID — links auth to DB
  consentedAt: Date,
  communicationStyle: String,       // "warm", "direct", "humorous" — set during consent
  audience: String,                 // optional — "my grandchildren", "my partner", etc.
  voiceId: String,                  // ElevenLabs voice_id after cloning
  voiceStatus: "none" | "recording" | "ready",
  createdAt: Date,
  updatedAt: Date
}
```

### Phrase
```js
{
  _id: ObjectId,
  userId: ObjectId,
  category: "family" | "daily" | "comfort" | "humor" | "emergency" | "personal",
  text: String,
  isFavorite: Boolean,
  createdAt: Date
}
```

---

## Pages

### 1. `/` — Landing Page
- Hero headline: "Preserve the voice that makes you, you."
- Three feature cards (Clone, Phrase bank, Privacy)
- CTA: "Record your voice — free" → links to `/record`
- No account needed to start

### 2. `/record` — Voice Recording (anonymous)
- Guided prompts: 8 short phrases covering a range of sounds
- Progress bar: "3 of 8 phrases recorded"
- Upload all clips to ElevenLabs Instant Voice Clone → `voiceId` stored in `sessionStorage`
- On completion → navigates to `/preview`

### 3. `/preview` — Hear Your Clone (anonymous)
- Auto-plays TTS of a demo phrase in the user's cloned voice
- Replay button
- Clerk `SignUpButton` CTA: "Create a free account to save and protect this forever."
- After sign-up → redirects to `/consent`

### 4. `/consent` — Privacy Agreement (auth required)
- Explicit consent checkbox: *"I confirm this is my voice, or I have explicit permission to preserve this voice."*
- Communication style selection (warm / direct / humorous)
- Optional audience field ("Who is this for?")
- On submit: `POST /api/user/create` + `POST /api/voice/claim` (claims `pendingVoiceId` from session)
- Navigates to `/phrases`

### 5. `/phrases` — Legacy Phrase Bank (auth required)
- Categories: Family · Daily Needs · Comfort · Humor · Emergency · Personal
- Add phrase manually or ask Gemini to suggest phrases for a category
- **Play button on every phrase card** — calls `/api/speak` with the phrase text + user's `voiceId`, plays audio inline
  - Loading state: "Generating..."
  - Playing state: pause button + pulsing speaker icon
  - Only one phrase plays at a time
- Mark favorites (persisted via `PATCH /api/phrases/[id]`)
- Delete individual phrases
- Export phrase bank as JSON (client-side)

### 6. `/speak` — Speak For Me (auth required)
- Text input: "What do you want to say?"
- Four Gemini-powered rewrite options:
  - **Make warmer** — adds emotional warmth in the user's saved style
  - **Make shorter** — strips to the essential meaning
  - **Sound like me** — rewrites in the user's saved communication style
  - **Translate to saved phrase** — finds the closest match in their phrase bank
- ElevenLabs generates audio in the preserved voice
- Play button — speaks the message
- One-tap save to phrase bank

### 7. `/dashboard` — Profile + Settings (auth required)
- Voice status + re-record option
- Phrase bank summary (count per category)
- Export phrase bank (JSON)
- Communication style picker (changeable)
- Delete voice data (removes clone from ElevenLabs + clears DB)
- Delete all data (cascade-deletes everything + signs out)
- Clerk `UserButton` for account management

---

## API Routes

```
# Authentication
POST /api/user/create          → Clerk auth; create user in MongoDB (idempotent)
GET  /api/user/me              → Clerk auth; get current user profile
GET  /api/user/:id             → Clerk auth; get profile (ownership check)
DELETE /api/user/:id           → Clerk auth; cascade-delete user + phrases
PATCH /api/user/:id            → Clerk auth; update communicationStyle

# Voice
POST /api/voice/upload         → Anonymous; send audio to ElevenLabs, return voiceId
POST /api/voice/claim          → Clerk auth; link pending voiceId to user after signup
POST /api/voice/delete         → Clerk auth; delete voice from ElevenLabs + clear DB
GET  /api/voice/status/:id     → Check voice clone status

# Phrases
POST /api/phrases              → Clerk auth; save new phrase
GET  /api/phrases/:userId      → Clerk auth; get all phrases (ownership check)
PATCH /api/phrases/:id         → Clerk auth; toggle favorite
DELETE /api/phrases/:id        → Clerk auth; delete phrase

# AI
POST /api/gemini/suggest       → Clerk auth; suggest phrases for a category
POST /api/gemini/rewrite       → Clerk auth; rewrite message in user's style

# TTS
POST /api/speak                → Anonymous; send text + voiceId to ElevenLabs TTS → return audio
```

---

## Shared Infrastructure (`frontend/src/lib/`)

| File | Purpose |
|---|---|
| `mongodb.ts` | Cached `MongoClient` via `globalThis` |
| `db.ts` | Typed repo functions (`createUser`, `findUserByClerkId`, `listPhrases`, etc.) with `MOCK_DB` fallback |
| `env.ts` | Central env reader + mock flags (`MOCK_DB`, `MOCK_VOICE_API`, `MOCK_GEMINI_API`) |
| `api.ts` | `jsonOk` / `jsonError` / `readJsonBody` / `toObjectId` helpers |
| `auth.ts` | `requireAuth()` — Clerk `auth()` → `findUserByClerkId` → returns user or 401/404 |
| `types.ts` | `UserDoc`, `PhraseDoc`, `PhraseCategory`, `CommunicationStyle`, `RewriteMode` |
| `elevenlabs.ts` | `cloneVoiceFromFiles` + `synthesizeSpeech` + `deleteVoice` (mockable) |
| `gemini.ts` | `suggestPhrases` + `rewriteMessage` (mockable) |
| `useRequireUser.ts` | Client hook: Clerk `useAuth()` → fetch `/api/user/me` → redirect if not found |
| `userSession.ts` | Legacy `localStorage` helpers (kept for backward compat, not used for auth) |

---

## Build Order (Critical Path)

**Phase 1: Setup + Voice (highest risk)**
- [x] Create Next.js app
- [x] Connect MongoDB Atlas
- [x] Set up `.env.local` with all API keys
- [x] Test ElevenLabs Instant Voice Clone endpoint
- [x] Build `/api/voice/upload` route
- [x] Build recording UI with MediaRecorder API
- [x] Confirm voice_id round-trip + TTS works

**Phase 2: Phrase Bank + Gemini**
- [x] MongoDB Phrase model + CRUD API routes
- [x] `/phrases` page — add, categorize, favorite, delete, play in voice
- [x] `/api/gemini/suggest` + `/api/gemini/rewrite`
- [x] Wire Gemini into `/speak` page

**Phase 3: Authentication (Clerk)**
- [x] Install `@clerk/nextjs`, add `ClerkProvider` to layout
- [x] Create `middleware.ts` — protect `/consent`, `/phrases`, `/speak`, `/dashboard`
- [x] Add `clerkUserId` to `UserDoc` + `findUserByClerkId` in `db.ts`
- [x] Create `requireAuth()` helper
- [x] Add Clerk auth to all protected API routes
- [x] Create `/preview` page (anonymous, emotional hook)
- [x] Create `/consent` page (post-signup)
- [x] Create `POST /api/voice/claim` route
- [x] Update Navbar with `UserButton` + conditional nav

**Phase 4: Polish + Demo Prep**
- [x] Pre-load demo account with 14 banked phrases (`scripts/seed-demo.ts`)
- [x] Mongo indexes (`phrases.userId`, compound `{ userId, category }`)
- [x] Full flow verified: landing → record → preview → signup → consent → phrases → speak → dashboard
- [ ] Practice the 5-minute demo flow
- [ ] Deploy to Vercel

---

## The Demo Flow (5 minutes)

1. **Open landing page** — read the tagline. Click "Record your voice — free."
2. **Record 8 phrases** — show the guided prompts and progress bar.
3. **Preview page** — hear the clone speak automatically. The emotional hook.
4. **Sign up** — Clerk modal. Quick and clean.
5. **Consent page** — check the box, pick a tone, continue.
6. **Show the phrase bank** — pre-loaded with real categories. Click play on a phrase — hear it in their voice.
7. **Type a message** into Speak For Me: *"Tell my daughter I'm really glad she came today."*
8. **Hit "Make warmer"** — watch Gemini rewrite it in real time.
9. **Hit play** — the preserved voice speaks it back.
10. **Save to phrase bank** — one tap.
11. **Close with the line:** *"This was recorded by a consenting teammate for the demo. The real use case is someone who knows their voice will change — and wants to still sound like themselves when it does."*

---

## The Answer to the Hard Judge Question

**"How is this different from just using ElevenLabs directly?"**

> ElevenLabs clones a voice. VoiceLegacy banks a person. The phrase bank, the communication style profile, the Gemini tone layer, the categorized personal vocabulary — none of that exists in ElevenLabs. We're not a wrapper. We're the product layer that makes voice preservation feel personal instead of technical.

---

## What "Make It Sound Like Me" Actually Does

During onboarding (now on the `/consent` page), the user picks a communication style (warm / direct / humorous).

That choice gets stored in MongoDB as `communicationStyle`.

Every Gemini rewrite prompt includes it:
```
You are rewriting a message for someone who communicates in a warm and expressive style.
Rewrite this in their voice, keeping it personal and genuine.
Original: [message]
```

Simple, defensible, demonstrably useful.

---

## API Keys You Need Before You Start

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — dashboard.clerk.com
- `CLERK_SECRET_KEY` — dashboard.clerk.com
- `ELEVENLABS_API_KEY` — elevenlabs.io
- `GEMINI_API_KEY` — aistudio.google.com
- `MONGODB_URI` — MongoDB Atlas (create free cluster)
