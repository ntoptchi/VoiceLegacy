# VoiceLegacy — Progress Tracker

Living checklist of what is built versus what still needs to be implemented.
Source of truth for scope is [`voicelegacy-plan.md`](./voicelegacy-plan.md).

Legend: `[x]` done · `[~]` partially done · `[ ]` not started

---

## 1. Project setup

- [x] Next.js 14+ app scaffolded under `frontend/`
- [x] Tailwind v4 configured (`tailwind.config.ts`, `postcss.config.mjs`)
- [x] TypeScript + ESLint configured
- [x] `mongodb` driver added to dependencies (`frontend/package.json`)
- [x] `@clerk/nextjs` installed and wired (ClerkProvider, middleware, sign-in/up pages)
- [x] `.env.local.example` documents every key + every mock flag + Clerk keys
- [x] Real `.env.local` populated with live keys (Mongo, ElevenLabs; Gemini deferred)
- [x] MongoDB Atlas cluster provisioned + connection verified end-to-end
- [ ] Vercel project connected to GitHub for auto-deploy

---

## 2. Authentication — Clerk

- [x] `ClerkProvider` wraps root layout (`app/layout.tsx`)
- [x] `middleware.ts` protects `/consent`, `/phrases`, `/speak`, `/dashboard` via `clerkMiddleware`
- [x] `/sign-in` and `/sign-up` pages with Clerk hosted UI
- [x] `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/consent` sends new users to consent page
- [x] `UserDoc.clerkUserId` field added; `findUserByClerkId()` in `db.ts`
- [x] `requireAuth()` helper in `auth.ts` — extracts Clerk userId → looks up Mongo user
- [x] All protected API routes use `requireAuth()` (no more userId in request body)
- [x] Navbar shows `UserButton` + Sign in/Sign up buttons conditionally

---

## 3. Backend — `frontend/src/lib/*`

All shared infrastructure is in place.

- [x] `mongodb.ts` — cached `MongoClient` via `globalThis`
- [x] `db.ts` — typed repo functions, in-memory `MOCK_DB` fallback, `findUserByClerkId`, `clearUserVoice`
- [x] `env.ts` — central env reader + mock flags
- [x] `api.ts` — `jsonOk` / `jsonError` / `readJsonBody` / `toObjectId`
- [x] `auth.ts` — `requireAuth()` helper (Clerk → Mongo user)
- [x] `types.ts` — `UserDoc` (with `clerkUserId`), `PhraseDoc`, `PhraseCategory`, `CommunicationStyle`, `RewriteMode`
- [x] `elevenlabs.ts` — `cloneVoiceFromFiles` + `synthesizeSpeech` + `deleteVoice`, mockable
- [x] `gemini.ts` — `suggestPhrases` + `rewriteMessage`, mockable

---

## 4. Backend — API routes (`frontend/app/api/*`)

Every route validates input and returns `{ success, ... }`. Protected routes use Clerk auth.

- [x] `POST /api/user/create` (Clerk auth; idempotent — returns existing user if found)
- [x] `GET  /api/user/me` (Clerk auth; returns current user profile)
- [x] `GET  /api/user/[id]` (Clerk auth; ownership check)
- [x] `DELETE /api/user/[id]` (Clerk auth; cascade-deletes phrases)
- [x] `PATCH /api/user/[id]` (Clerk auth; update communicationStyle)
- [x] `POST /api/voice/upload` (anonymous — pre-auth voice clone)
- [x] `POST /api/voice/claim` (Clerk auth; links pending voiceId to user after signup)
- [x] `POST /api/voice/delete` (Clerk auth; deletes voice from ElevenLabs + DB)
- [x] `GET  /api/voice/status/[id]`
- [x] `POST /api/phrases` (Clerk auth)
- [x] `GET  /api/phrases/[id]` (Clerk auth; ownership check)
- [x] `PATCH /api/phrases/[id]` (Clerk auth; favorite toggle)
- [x] `DELETE /api/phrases/[id]` (Clerk auth)
- [x] `POST /api/gemini/suggest` (Clerk auth)
- [x] `POST /api/gemini/rewrite` (Clerk auth)
- [x] `POST /api/speak` (anonymous — needed for `/preview` pre-auth)

### Remaining gaps

- [ ] Phrase bank export (`GET /api/phrases/[id]/export?format=json|pdf`) — optional
- [x] Mongo indexes — `phrases.userId_1` and compound `phrases.userId_1_category_1`

---

## 5. Frontend — pages

New "emotional hook" flow: record anonymously → hear your clone → sign up → consent → use.

| Page | Auth? | Wired? | Notes |
|---|---|---|---|
| `/` (landing) | No | — | Hero page with CTA to `/record` |
| `/record` | No | [x] | Anonymous recording; stores `voiceId` in `sessionStorage`; navigates to `/preview` |
| `/preview` | No | [x] | Auto-plays TTS demo; Clerk `SignUpButton` CTA → redirects to `/consent` |
| `/sign-up` | — | [x] | Clerk hosted sign-up UI |
| `/sign-in` | — | [x] | Clerk hosted sign-in UI |
| `/consent` | Yes | [x] | Consent + tone + audience form; `POST /api/user/create` + `POST /api/voice/claim` |
| `/phrases` | Yes | [x] | CRUD phrases, Gemini suggestions, favorite toggle |
| `/speak` | Yes | [x] | Gemini rewrite + ElevenLabs TTS + save to bank |
| `/dashboard` | Yes | [x] | User profile, phrase stats, export, delete voice/data |

---

## 6. Demo readiness

- [x] Pre-load a demo account with 14 banked phrases (`npx tsx scripts/seed-demo.ts`)
- [ ] Practice the 5-minute demo flow end to end
- [x] One-liner pitch prepared (see below)
- [x] "How is this different?" answer prepared (see below)

### Pitch

> VoiceLegacy lets people preserve their natural voice, words, and phrases before speech loss — so they can always communicate in a way that sounds and feels like them.

### "How is this different from just using ElevenLabs directly?"

> ElevenLabs gives you a voice clone. VoiceLegacy gives you a **communication toolkit**: phrase bank, AI rewording in your tone, category-organized expressions, and one-tap playback — all built around the idea that *what* you say matters as much as *how* you sound. It is purpose-built for people facing speech loss, not a generic TTS playground.

---

## 7. Out of scope

- A standalone service in `backend/` — full-stack Next.js
- Snowflake — explicitly dropped in `voicelegacy-plan.md`

---

## At-a-glance summary

| Area | Status |
|---|---|
| Authentication (Clerk) | Complete |
| Backend infrastructure (lib/) | Complete |
| Backend API routes | Complete |
| Real-credential verification | Mongo + ElevenLabs complete; Gemini deferred |
| Frontend pages — UI + wiring | Complete (9 pages) |
| Emotional hook flow | Complete (record → preview → signup → consent) |
| Demo prep | Mostly complete (need rehearsal) |
| Vercel deployment | Deferred |
