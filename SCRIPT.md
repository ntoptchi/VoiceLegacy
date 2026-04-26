# VoiceLegacy — Demo Video Script

> **Target length:** 3–5 minutes
> **Tone:** Calm, genuine, purposeful. This isn't a sales pitch — it's a story about why this matters.
> **Setup:** Screen recording with voiceover. Browser open to `localhost:3000` (or deployed URL). Mic on.

---

## INTRO — The Problem (0:00 – 0:30)

**[Screen: landing page]**

> "Every year, millions of people lose the ability to speak — from ALS, stroke, throat cancer, Parkinson's, and other conditions. When that happens, they don't just lose words. They lose the *sound* of themselves. The way they say 'I love you' that nobody else says quite the same way."

**[Pause. Let the landing page headline sit for a beat.]**

> "VoiceLegacy is a web app that lets people preserve their natural voice *before* it changes — and then use it to keep communicating in a way that sounds and feels like them."

---

## ACT 1 — Record Your Voice (0:30 – 1:15)

**[Click "Record your voice — free"]**

> "You don't need an account to start. That's intentional. We wanted the first thing you do to be meaningful — not fill out a form."

**[Show the recording page. Read the first phrase aloud into the mic.]**

> "The app walks you through eight short phrases. Each one is designed to capture a range of how you naturally speak."

**[Record 2–3 phrases on camera. Show the progress bar advancing. Then skip ahead to show all 8 completed.]**

> "Once all eight are captured, we send the recordings to ElevenLabs, which creates a private voice clone in seconds."

**[Click "Create My Voice Clone" — show the processing state.]**

---

## ACT 2 — The Emotional Hook (1:15 – 1:45)

**[Preview page loads. Audio auto-plays: "This is your voice, preserved forever."]**

> "This is the moment. You hear your own voice — cloned — speaking back to you. Before you've signed up. Before you've entered an email address. The reason to create an account is already real."

**[Let the audio finish. Pause.]**

> "Now the sign-up makes sense."

**[Click "Sign up to save your voice" — show the Clerk modal briefly.]**

---

## ACT 3 — Consent (1:45 – 2:15)

**[Consent page loads. Show the step indicators at the top.]**

> "Privacy is the first thing we show after signup — not an afterthought. The user confirms this is their voice or that they have permission. They choose a communication style — warm, direct, or humorous — which shapes how the AI helps them later."

**[Check the consent box. Select "Warm." Optionally type an audience. Click "Save & Continue."]**

> "This page is a design choice. We're handling something deeply personal. We want people to feel that."

---

## ACT 4 — Phrase Bank (2:15 – 3:15)

**[Phrases page loads with pre-loaded phrases across categories.]**

> "This is the phrase bank — a personal library of the things you actually say. Organized by category: family, daily needs, comfort, humor, emergency, personal."

**[Click through 2–3 category filter tabs. Point out the colored dots.]**

> "Each category has its own color. You can favorite the phrases that matter most."

**[Click the star/Favorite button on a phrase. It changes to "Saved."]**

> "And every phrase is playable — in your cloned voice — with one tap."

**[Click Play on a phrase like "I love you more than you know." Let the audio play. Show the pulsing speaker icon.]**

> "That's not a robot. That's the person's actual voice — preserved — speaking words they chose."

**[Pause for emotional weight.]**

**[Click "AI Suggestions" to generate new phrases.]**

> "If you need help getting started, Gemini can suggest phrases for any category based on real communication patterns."

---

## ACT 5 — Speak For Me (3:15 – 4:15)

**[Navigate to /speak.]**

> "The Speak For Me page is for real-time communication. Type anything you want to say."

**[Type: "Tell my daughter I'm really glad she came today."]**

> "Then reshape it. 'Make warmer' adds emotional softness. 'Sound like me' rewrites it in your saved communication style. Each option has its own accent color so you know what you're reaching for."

**[Click "Make warmer." Show the rewrite happening. Read the new text aloud.]**

> "Now hit play."

**[Click the large amber play button. Audio plays in the cloned voice. Show the waveform animation.]**

> "That sentence was written by the user, shaped by AI to match their tone, and spoken in a voice that was preserved before it changed."

**[Click "Save to phrase bank."]**

> "One tap to save it. It's now in their library forever."

---

## ACT 6 — Dashboard + Privacy (4:15 – 4:30)

**[Navigate to /dashboard. Show the overview briefly.]**

> "The dashboard shows your phrase count, voice status, and gives you full control. Export your phrases. Re-record your voice. Or delete everything — voice data, phrases, your entire account — with one click. Your voice. Your data. Your choice."

---

## CLOSING — Why This Matters (4:30 – 5:00)

**[Navigate back to landing page. Or show a simple title card.]**

> "This demo was recorded by a consenting teammate. But the real use case is someone who knows their voice will change — and wants to still sound like themselves when it matters most."

**[Beat.]**

> "VoiceLegacy. Preserve the voice, words, and phrases that make communication feel personal."

**[Hold on the landing page for 3 seconds. End.]**

---

## Tips for Recording

- **Do a dry run first.** Walk through the whole flow once without recording to make sure everything loads.
- **Use a real voice clone.** The demo is 10x more powerful when the cloned voice is recognizable. Record with a teammate's voice and let them watch.
- **Don't rush the preview moment.** That's the emotional peak of the demo. Let the audio play. Let it land.
- **Keep the voiceover conversational.** You're explaining something you care about, not reading a script. If you go off-script and it sounds more natural, that's better.
- **Have phrases pre-loaded.** Run `npx tsx scripts/seed-demo.ts` before recording so the phrase bank isn't empty.
- **Test the Gemini rewrite.** If `MOCK_GEMINI_API=true`, the rewrite will return a canned response. For the demo, having the real Gemini key makes the "Make warmer" moment much more convincing.
- **Show the dark/light toggle.** It's in the navbar — one click. Judges notice polish like that.

---

## If Judges Ask

**"How is this different from just using ElevenLabs?"**

> ElevenLabs clones a voice. VoiceLegacy banks a person. The phrase bank, the communication style profile, the AI tone layer, the categorized personal vocabulary — none of that exists in ElevenLabs. We're the product layer that makes voice preservation feel personal instead of technical.

**"What APIs did you use?"**

> ElevenLabs for voice cloning and text-to-speech. Gemini Flash 2.0 for phrase suggestions and tone rewriting. MongoDB Atlas for the database. Clerk for authentication. All running inside Next.js 16 on Vercel.

**"What about consent and privacy?"**

> Consent is the first thing we ask for after signup — before you can use any feature. All voice data is private, never shared, and deletable at any time. We built the consent flow as a first-class page, not a checkbox in the footer.
