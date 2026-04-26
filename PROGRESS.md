# VoiceLegacy - Progress Tracker

Living checklist of what is built versus what still needs to be implemented.
Source of truth for scope is [`voicelegacy-plan.md`](./voicelegacy-plan.md).

Legend: `[x]` done - `[~]` partially done - `[ ]` not started

---

## 1. Project setup

- [x] Next.js 14+ app scaffolded under `frontend/`
- [x] Tailwind v4 configured (`tailwind.config.ts`, `postcss.config.mjs`)
- [x] TypeScript + ESLint configured
- [x] `mongodb` driver added to dependencies (`frontend/package.json`)
- [x] `.env.local.example` documents every key + every mock flag (`frontend/.env.local.example`)
- [x] Real `.env.local` populated with live keys (Mongo, ElevenLabs; Gemini deferred)
- [x] MongoDB Atlas cluster provisioned + connection verified end-to-end (real Mongo, real ElevenLabs)
- [ ] Vercel project connected to GitHub for auto-deploy

---

## 2. Backend - `frontend/src/lib/*`

All shared infrastructure is in place.

- [x] `mongodb.ts` - cached `MongoClient` via `globalThis`
- [x] `db.ts` - typed repo functions, in-memory `MOCK_DB` fallback
- [x] `env.ts` - central env reader + mock flags
- [x] `api.ts` - `jsonOk` / `jsonError` / `readJsonBody` / `toObjectId`
- [x] `types.ts` - `UserDoc`, `PhraseDoc`, `PhraseCategory`, `CommunicationStyle`, `RewriteMode`
- [x] `elevenlabs.ts` - `cloneVoiceFromFiles` + `synthesizeSpeech`, mockable
- [x] `gemini.ts` - `suggestPhrases` + `rewriteMessage`, mockable

---

## 3. Backend - API routes (`frontend/app/api/*`)

Every route from the plan exists, validates input, and returns the
documented `{ success, ... }` shape. All were smoke-tested with the four
`MOCK_*` flags on.

- [x] `POST /api/user/create`
- [x] `GET  /api/user/[id]`
- [x] `POST /api/voice/upload` (also persists `voice_id` and flips `voiceStatus` when `userId` is supplied)
- [x] `GET  /api/voice/status/[id]`
- [x] `POST /api/phrases`
- [x] `GET  /api/phrases/[id]` (lists phrases for a userId; supports `?category=`)
- [x] `DELETE /api/phrases/[id]` (ownership enforced via body or `x-user-id` header)
- [x] `POST /api/gemini/suggest`
- [x] `POST /api/gemini/rewrite`
- [x] `POST /api/speak` (returns `audio/mpeg`)

### Backend gaps still to close

- [x] Verify routes against real Mongo + ElevenLabs (all pass; Gemini deferred - `MOCK_GEMINI_API=true`)
- [x] `POST /api/voice/delete` - deletes voice from ElevenLabs + clears user voiceId in DB; dashboard wired
- [x] `DELETE /api/user/:id` (cascade-delete phrases) for "Delete all data"
- [x] Phrase favorite-toggle endpoint (`PATCH /api/phrases/[id]`) - persists to DB with optimistic UI; plan says "Mark favorites" on `/phrases`
- [ ] Phrase bank export (`GET /api/phrases/[id]/export?format=json|pdf`) - plan calls for JSON + PDF export
- [x] Mongo indexes - `phrases.userId_1` and compound `phrases.userId_1_category_1` created via `scripts/ensure-indexes.ts`

---

## 4. Frontend - pages

All pages are wired to the backend via API routes. Client identity is
managed through `localStorage` helpers in `frontend/src/lib/userSession.ts`,
and protected pages use `useRequireUser()` to redirect unauthenticated
visitors to onboarding.

| Page | UI exists? | Wired to backend? | Notes |
|---|---|---|---|
| `/` (consent + onboarding) | [x] | [x] | `POST /api/user/create` on submit; stores `userId` + `communicationStyle` in localStorage. |
| `/record` | [x] | [x] | Sends `userId` with `POST /api/voice/upload`; persists returned `voiceId` to localStorage. |
| `/phrases` | [x] | [x] | Fetches `GET /api/phrases/[userId]`, creates via `POST /api/phrases`, deletes via `DELETE /api/phrases/[id]`, suggestions via `POST /api/gemini/suggest`. |
| `/speak` | [x] | [x] | Rewrites via `POST /api/gemini/rewrite`, TTS via `POST /api/speak` with real audio playback, save via `POST /api/phrases`. |
| `/dashboard` | [x] | [x] | Loads `GET /api/user/[id]` + `GET /api/phrases/[userId]`; client-side JSON export; session-clear delete. |

### Frontend gaps still to close

- [x] Persist `userId` after onboarding (cookie or `localStorage`) and read it from every page
- [x] Wire `/` to `POST /api/user/create` (block submit until 201, then store `userId`)
- [x] Wire `/record` to send `userId` with the upload
- [x] Wire `/phrases` to all phrase routes + Gemini suggest
- [x] Wire `/speak` to Gemini rewrite + ElevenLabs TTS + phrase save
- [x] Wire `/dashboard` to user fetch, phrase counts, export, and delete-all
- [x] Loading + error states for every API call
- [x] Mobile pass - Navbar has bottom nav for mobile; pages use responsive grid/flex layouts
- [x] Voice-status polling added to `/record` after upload (polls `GET /api/voice/status/[id]` until ready)
- [x] Dashboard "Delete all data" calls `DELETE /api/user/[id]` before clearing session

---

## 5. Demo readiness (per the plan's "Hours 18-24" block)

- [x] Pre-load a demo account with 14 banked phrases (`npx tsx scripts/seed-demo.ts`)
- [ ] Practice the 5-minute demo flow end to end (consent -> record -> save -> speak -> save)
- [x] One-liner pitch prepared (see below)
- [x] "How is this different?" answer prepared (see below)

### Pitch

> VoiceLegacy lets people preserve their natural voice, words, and phrases before speech loss - so they can always communicate in a way that sounds and feels like them.

### "How is this different from just using ElevenLabs directly?"

> ElevenLabs gives you a voice clone. VoiceLegacy gives you a communication toolkit: phrase bank, AI rewording in your tone, category-organized expressions, and one-tap playback - all built around the idea that what you say matters as much as how you sound. It is purpose-built for people facing speech loss, not a generic TTS playground.

---

## 6. Out of scope (intentionally not building)

- Auth / sessions - using a raw `userId` from the client is fine for MVP
- A standalone service in `backend/` - the plan is full-stack Next.js; that folder stays empty
- Snowflake - explicitly dropped in `voicelegacy-plan.md`

---

## At-a-glance summary

| Area | Status |
|---|---|
| Backend infrastructure (lib/) | Complete |
| Backend API routes (plan items) | Complete |
| Backend extras (delete-all, favorite, export) | Export only |
| Real-credential verification | Mongo + ElevenLabs complete; Gemini deferred |
| Frontend pages - UI | Complete |
| Frontend pages - backend wiring | Complete (all 5 pages) |
| Demo prep | Mostly complete |
