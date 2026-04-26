# VoiceLegacy — Pitch Guide

Use this as your reference for talking to judges. Don't memorize it word-for-word — know the beats and speak naturally.

---

## The One-Liner (have this ready cold)

> "VoiceLegacy lets people preserve their natural voice before speech loss — so they can always communicate in a way that sounds and feels like them."

---

## The Opening (30 seconds)

Every year, millions of people lose the ability to speak. ALS. Stroke. Throat cancer. Parkinson's. When that happens, they don't just lose words — they lose the *sound* of themselves. The laugh their kids recognize. The way they say "I love you" that nobody else says quite the same way.

We built VoiceLegacy so that doesn't have to happen.

---

## What It Does (60 seconds)

VoiceLegacy is a web app with three core features:

1. **Voice cloning** — You read eight short phrases into your microphone. We send those recordings to ElevenLabs, which creates a private clone of your voice. From that point on, anything you type can be spoken back in *your* voice.

2. **A personal phrase bank** — You build a library of the things you actually say. "I love you more than you know." "Could I have some water?" "Don't let me lose my reputation for timing." Organized by category — family, daily needs, comfort, humor, emergency. Every phrase is playable in your cloned voice with one tap.

3. **AI-powered communication** — Using Gemini, the app can suggest phrases, rewrite a message to sound warmer or shorter, or restyle it to match how you naturally talk. You type what you want to say. The AI shapes it. Your preserved voice speaks it.

---

## The Design Choice That Matters (30 seconds)

The first thing you do in VoiceLegacy isn't sign up. It's record your voice and hear it cloned back to you. No account. No email. You hear yourself preserved — and *then* we ask you to create an account.

By that point, the reason to sign up is real. You've already felt it.

We also put privacy consent on its own dedicated page — not buried in terms of service. This is someone's voice. We treat it like it matters.

---

## Tech Stack (15 seconds — only if asked)

- **Next.js 16** — full-stack framework, API routes and frontend in one repo
- **ElevenLabs** — voice cloning and text-to-speech
- **Gemini Flash 2.0** — phrase suggestions and tone rewriting
- **MongoDB Atlas** — stores users, phrases, voice metadata
- **Clerk** — authentication with social login and route protection
- **Tailwind CSS v4** — styling
- Deployed on **Vercel**

---

## Anticipated Judge Questions

### "How is this different from just using ElevenLabs?"

> ElevenLabs clones a voice. VoiceLegacy banks a *person*. The phrase bank, the communication style profile, the AI tone layer, the categorized personal vocabulary — none of that exists in ElevenLabs. We're not a wrapper around an API. We're the product layer that makes voice preservation feel personal instead of technical.

### "Who is this actually for?"

> People who know their voice is going to change — or their families. ALS patients. People preparing for throat surgery. Stroke survivors in early recovery. Parkinson's patients. Anyone who wants to preserve how they sound before they can't. It's also for caregivers who want to help a loved one still sound like themselves.

### "How do you handle privacy?"

> Consent is the first thing we ask for after signup — before you can use any feature. All voice data is private, never shared, and deletable at any time. The user can delete their voice clone, their phrases, or their entire account with one click from the dashboard. We built the consent flow as a first-class page because we're handling something deeply personal.

### "What does the AI actually do?"

> Two things. First, Gemini suggests phrases for any category — so if someone is building out their "family" phrases, the AI can give them a starting point based on real communication patterns. Second, when someone types a message on the Speak For Me page, they can hit "Make warmer" or "Sound like me" and Gemini rewrites the message to match their saved communication style. Then ElevenLabs speaks it in their cloned voice. The AI makes the communication feel natural — not robotic.

### "What was the hardest part?"

> Getting the emotional flow right. The technical integration — ElevenLabs, Gemini, MongoDB, Clerk — that's API work. The hard part was designing an experience where someone records their voice, hears it cloned, and immediately understands why this matters. That preview moment — hearing yourself preserved for the first time — is the entire product. Everything else supports that.

### "Could this be a real product?"

> Yes. The voice banking space exists — organizations like ModelTalker and MyOwnVoice do this clinically, but they're slow, clinical, and inaccessible. VoiceLegacy does it in minutes, in a browser, with AI that helps you build a real communication toolkit — not just a voice file. The emotional barrier to adoption is low because you hear your voice before you commit to anything.

### "What would you build next?"

> Three things: (1) A mobile-first companion app for daily use — someone in a hospital bed needs a phone, not a laptop. (2) Multi-language support — ElevenLabs supports it, we just need to build the UI. (3) Shared family access — let a caregiver manage the phrase bank and trigger playback on behalf of the user.

---

## Closing Line (memorize this one)

> "This demo was recorded by a consenting teammate. But the real use case is someone who knows their voice will change — and wants to still sound like themselves when it matters most."

---

## Quick Reference — Demo Flow

If you're doing a live demo while pitching:

1. **Landing page** — read the tagline, click "Record your voice"
2. **Record 2–3 phrases** — show the guided prompts
3. **Preview** — let the clone auto-play. This is the moment. Don't rush it.
4. **Sign up** — quick Clerk modal
5. **Consent** — check the box, pick a tone
6. **Phrase bank** — tap Play on a phrase. Let the audio play.
7. **Speak For Me** — type a message, hit "Make warmer", hit play
8. **Close** with the closing line above

---

## Things to Remember

- **Speak slowly at the emotional parts.** The preview moment and the phrase playback are where judges feel the product. Give them space.
- **Don't apologize for anything.** If Gemini is mocked, don't mention it. If something is loading, narrate over it.
- **Use the word "preserve" not "clone."** Clone sounds technical. Preserve sounds human.
- **Make eye contact when you say the closing line.** It's the sentence judges will remember.
- **If they ask a question you don't know, say:** "That's a great question — we haven't built that yet, but here's how we'd approach it." Then think out loud. Judges respect honesty more than bluffing.
