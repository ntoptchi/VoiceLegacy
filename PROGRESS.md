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
- [x] `.env.local.example` documents every key + every mock flag (`frontend/.env.local.example`)
- [ ] Real `.env.local` populated with live keys (Mongo, ElevenLabs, Gemini)
- [ ] MongoDB Atlas cluster provisioned + connection verified end-to-end (currently only smoke-tested with `MOCK_DB=true`)
- [ ] Vercel project connected to GitHub for auto-deploy

---

## 2. Backend — `frontend/src/lib/*`

All shared infrastructure is in place.

- [x] `mongodb.ts` — cached `MongoClient` via `globalThis`
- [x] `db.ts` — typed repo functions, in-memory `MOCK_DB` fallback
- [x] `env.ts` — central env reader + mock flags
- [x] `api.ts` — `jsonOk` / `jsonError` / `readJsonBody` / `toObjectId`
- [x] `types.ts` — `UserDoc`, `PhraseDoc`, `PhraseCategory`, `CommunicationStyle`, `RewriteMode`
- [x] `elevenlabs.ts` — `cloneVoiceFromFiles` + `synthesizeSpeech`, mockable
- [x] `gemini.ts` — `suggestPhrases` + `rewriteMessage`, mockable

---

## 3. Backend — API routes (`frontend/app/api/*`)

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

- [ ] Verify each route against **real** ElevenLabs / Gemini / Mongo (only the mock paths are exercised so far)
- [ ] `DELETE /api/voice/:id` or equivalent for "Delete voice data" on the dashboard
- [ ] `DELETE /api/user/:id` (cascade-delete phrases) for "Delete all data"
- [ ] Phrase favorite-toggle endpoint (`PATCH /api/phrases/[id]`) — plan says "Mark favorites" on `/phrases`
- [ ] Phrase bank export (`GET /api/phrases/[id]/export?format=json|pdf`) — plan calls for JSON + PDF export
- [ ] Mongo indexes (`users._id` is automatic; add `phrases.userId` + `phrases.category`)

---

## 4. Frontend — pages

Static UI for every page already exists under `frontend/app/`. None of
them (except `/record`) are wired to the backend yet.

| Page | UI exists? | Wired to backend? | Notes |
|---|---|---|---|
| `/` (consent + onboarding) | [x] | [ ] | Calls `router.push("/record")` instead of `POST /api/user/create`. Selected tone/audience are not persisted. |
| `/record` | [x] | [~] | Calls `POST /api/voice/upload` (good), but does not pass a `userId` and does not poll `GET /api/voice/status/[id]`. |
| `/phrases` | [x] | [ ] | Add / list / favorite / delete are all local state — none of `GET /api/phrases/[id]`, `POST /api/phrases`, `DELETE /api/phrases/[id]`, `POST /api/gemini/suggest` are called. |
| `/speak` | [x] | [ ] | "Make warmer / shorter / sound like me / translate" buttons need `POST /api/gemini/rewrite`; play button needs `POST /api/speak`; "save" needs `POST /api/phrases`. |
| `/dashboard` | [x] | [ ] | Voice status, phrase counts, export, and delete actions all need backend wiring. |

### Frontend gaps still to close

- [ ] Persist `userId` after onboarding (cookie or `localStorage`) and read it from every page
- [ ] Wire `/` to `POST /api/user/create` (block submit until 201, then store `userId`)
- [ ] Wire `/record` to send `userId` with the upload, and to poll `GET /api/voice/status/[id]` until `"ready"`
- [ ] Wire `/phrases` to all phrase routes + Gemini suggest
- [ ] Wire `/speak` to Gemini rewrite + ElevenLabs TTS + phrase save
- [ ] Wire `/dashboard` to user fetch, phrase counts, export, and delete-voice / delete-all
- [ ] Loading + error states for every API call
- [ ] Mobile pass — judges may demo on phones

---

## 5. Demo readiness (per the plan's "Hours 18–24" block)

- [ ] Pre-load a demo account with 10–15 banked phrases
- [ ] Practice the 5-minute demo flow end to end (consent → record → save → speak → save)
- [ ] Prepare the one-liner pitch
- [ ] Prepare the answer to "how is this different from just using ElevenLabs directly?"

---

## 6. Out of scope (intentionally not building)

- Auth / sessions — using a raw `userId` from the client is fine for MVP
- A standalone service in `backend/` — the plan is full-stack Next.js; that folder stays empty
- Snowflake — explicitly dropped in `voicelegacy-plan.md`

---

## At-a-glance summary

| Area | Status |
|---|---|
| Backend infrastructure (lib/) | Complete |
| Backend API routes (plan items) | Complete |
| Backend extras (delete-all, favorite, export) | Not started |
| Real-credential verification | Not started |
| Frontend pages — UI | Complete |
| Frontend pages — backend wiring | ~10% (only `/record` partial) |
| Demo prep | Not started |
