# VoiceLegacy — Full MVP Plan

> Preserve the voice, words, and phrases that make communication feel personal before speech loss occurs.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Full-stack in one repo. API routes built-in. Deploys to Vercel in 2 minutes. |
| **Styling** | Tailwind CSS | Fast to build, easy to keep consistent |
| **Database** | MongoDB Atlas | Required challenge. Natural fit for phrase bank (document model) |
| **Voice cloning + TTS** | ElevenLabs API | Instant Voice Clone endpoint + TTS generation |
| **AI reasoning** | Gemini API (Flash 2.0) | Phrase suggestions + tone rewriting |
| **Audio recording** | Browser MediaRecorder API | No extra library needed |
| **Deployment** | Vercel | Free tier, instant deploy from GitHub |

### Honest note on Snowflake
Snowflake does not fit VoiceLegacy naturally. Forcing it will hurt the product and judges will notice. You have Gemini + ElevenLabs + MongoDB — that's three strong API challenge entries. Drop Snowflake for this one.

### Note on Azure (dropped)
Azure AI Speech was originally planned to verify users were reading recording prompts correctly. It has been cut from the MVP to keep the demo focused; the recording flow trusts the user to read the prompt and uploads the audio directly to ElevenLabs.

---

## Data Models

### User
```js
{
  _id: ObjectId,
  consentedAt: Date,
  communicationStyle: String,     // "warm", "direct", "humorous" — set during onboarding
  voiceId: String,                // ElevenLabs voice_id after cloning
  voiceStatus: "none" | "recording" | "ready",
  createdAt: Date
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

### 1. `/` — Consent + Onboarding
- Clear statement of purpose
- Explicit consent checkbox: *"I confirm this is my voice, or I have explicit permission to preserve this voice."*
- Privacy note: data is private, never shared, deletable at any time
- "Not for impersonation" warning visible
- 2-question style setup: communication tone (warm / direct / humorous) + who this is for

### 2. `/record` — Voice Recording
- Guided prompts: 8–10 short phrases covering a range of sounds
- Progress bar: "3 of 8 phrases recorded"
- Upload all clips to ElevenLabs Instant Voice Clone → store returned `voice_id` in MongoDB
- Status: "Voice prototype ready" vs "Recording in progress"

### 3. `/phrases` — Legacy Phrase Bank
- Categories: Family · Daily Needs · Comfort · Humor · Emergency · Personal Names
- Add phrase manually or ask Gemini to suggest phrases for a category
- Mark favorites
- Export phrase bank as JSON or PDF
- Delete individual phrases or all data

### 4. `/speak` — Speak For Me
- Text input: "What do you want to say?"
- Four Gemini-powered rewrite options:
  - **Make warmer** — adds emotional warmth in the user's saved style
  - **Make shorter** — strips to the essential meaning
  - **Sound like me** — rewrites in the user's saved communication style
  - **Translate to saved phrase** — finds the closest match in their phrase bank
- ElevenLabs generates audio in the preserved voice
- Play button — speaks the message
- One-tap save to phrase bank

### 5. `/dashboard` — Profile + Settings
- Voice status + re-record option
- Phrase bank summary (count per category)
- Export phrase bank
- Delete voice data
- Delete all data
- Last active / recording timestamps

---

## API Routes

```
POST /api/user/create          → create user after consent
GET  /api/user/:id             → get profile

POST /api/voice/upload         → send audio blobs to ElevenLabs, store voice_id
GET  /api/voice/status/:id     → check voice clone status

GET  /api/phrases/:userId      → get all phrases
POST /api/phrases              → save new phrase
DELETE /api/phrases/:id        → delete phrase

POST /api/gemini/suggest       → suggest phrases for a category
POST /api/gemini/rewrite       → rewrite message in user's style

POST /api/speak                → send text + voice_id to ElevenLabs TTS → return audio
```

---

## Team Split (3–4 people)

| Person | Owns |
|---|---|
| **A — Integration** | ElevenLabs voice clone + TTS. This is the highest-risk integration — start here first. |
| **B — Backend** | MongoDB setup, all API routes |
| **C — Gemini** | Phrase suggestion endpoint, tone rewriting, "sound like me" prompt engineering |
| **D — UI/UX** | All pages, design system, consent flow, demo polish |

If 3 people: B takes both backend + Gemini. C and D should overlap on the `/speak` page since it's the demo centrepiece.

---

## Build Order (Critical Path)

**Hours 0–1: Setup**
- [ ] Create Next.js app (`npx create-next-app voicelegacy`)
- [ ] Connect MongoDB Atlas
- [ ] Set up `.env.local` with all API keys
- [ ] Push to GitHub, connect Vercel

**Hours 1–3: ElevenLabs (do this first — highest risk)**
- [ ] Test Instant Voice Clone endpoint with a sample audio file
- [ ] Build `/api/voice/upload` route
- [ ] Build basic recording UI with MediaRecorder API
- [ ] Confirm you can get a `voice_id` back and generate TTS from it

**Hours 3–5: Phrase Bank**
- [ ] MongoDB Phrase model
- [ ] CRUD API routes
- [ ] `/phrases` page — add, categorize, favorite, delete

**Hours 5–7: Gemini**
- [ ] `/api/gemini/suggest` — prompt: "Suggest 5 meaningful phrases for the [category] category for someone preserving their voice"
- [ ] `/api/gemini/rewrite` — prompt: "Rewrite this message in a [warm/direct/humorous] tone while keeping the meaning: [message]"
- [ ] Wire into `/speak` page

**Hours 7–10: Speak For Me page**
- [ ] Text input → Gemini rewrite options → ElevenLabs TTS → audio playback
- [ ] Save to phrase bank button
- [ ] This is your demo centrepiece — make it feel good

**Hours 10–14: Consent + UI Polish**
- [ ] `/` consent + onboarding flow
- [ ] `/dashboard` profile + data management
- [ ] Consistent design across all pages

**Hours 14–18: Integration + Bug Fixes**
- [ ] Full demo flow end to end: consent → record → save phrase → speak → hear it back
- [ ] Handle error states (what if ElevenLabs fails?)
- [ ] Mobile check — judges may demo on phones

**Hours 18–24: Demo Prep**
- [ ] Pre-load a demo account with 10–15 phrases already banked
- [ ] Practice the 5-minute demo flow
- [ ] Prepare the one-liner pitch
- [ ] Prepare answer to "how is this different from just using ElevenLabs directly?"

---

## The Demo Flow (5 minutes)

1. **Open consent screen** — read the privacy statement out loud. Own it.
2. **Show the phrase bank** — pre-loaded with real categories. Family, humor, emergency. Make it feel human.
3. **Type a message** into Speak For Me: *"Tell my daughter I'm really glad she came today."*
4. **Hit "Make warmer"** — watch Gemini rewrite it in real time
5. **Hit play** — the preserved voice speaks it back
6. **Save to phrase bank** — one tap
7. **Close with the line:** *"This was recorded by a consenting teammate for the demo. The real use case is someone who knows their voice will change — and wants to still sound like themselves when it does."*

---

## The Answer to the Hard Judge Question

**"How is this different from just using ElevenLabs directly?"**

> ElevenLabs clones a voice. VoiceLegacy banks a person. The phrase bank, the communication style profile, the Gemini tone layer, the categorized personal vocabulary — none of that exists in ElevenLabs. We're not a wrapper. We're the product layer that makes voice preservation feel personal instead of technical.

---

## What "Make It Sound Like Me" Actually Does

This is the feature you need a real answer for before you build it.

During onboarding, the user answers: *"How would your friends describe how you talk?"* and picks a style (warm and expressive / dry and direct / playful and funny / calm and gentle).

That choice gets stored in MongoDB as `communicationStyle`.

Every Gemini rewrite prompt includes it:
```
You are rewriting a message for someone who communicates in a warm and expressive style.
Rewrite this in their voice, keeping it personal and genuine.
Original: [message]
```

That's it. Simple, defensible, demonstrably useful.

---

## API Keys You Need Before You Start

- `ELEVENLABS_API_KEY` — elevenlabs.io
- `GEMINI_API_KEY` — aistudio.google.com
- `MONGODB_URI` — MongoDB Atlas (create free cluster)
