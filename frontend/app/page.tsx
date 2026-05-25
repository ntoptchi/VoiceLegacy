"use client";

import Link from "next/link";
import { ArrowRight, Mic, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  {
    icon: Mic,
    title: "Clone your voice",
    description:
      "Read a few phrases and we create a private voice prototype in seconds.",
  },
  {
    icon: Sparkles,
    title: "Build your phrase bank",
    description:
      "Save the words and expressions that matter most - with AI help to capture your tone.",
  },
  {
    icon: Shield,
    title: "Private and yours",
    description:
      "Your voice data is never shared. Delete it any time, no questions asked.",
  },
];

const testimonials = [
  {
    quote:
      "I didn’t realize how much my everyday phrases mattered until I heard them back in my own voice.",
    author: "Early tester",
  },
  {
    quote:
      "The phrase bank makes this feel personal. It is not just text-to-speech — it sounds like the things I would actually say.",
    author: "Caregiver feedback",
  },
  {
    quote:
      "Being able to try the voice preview before signing up made the whole experience feel safer and less intimidating.",
    author: "VoiceLegacy user",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center gap-12 py-8 md:py-16">
      <header className="flex max-w-3xl flex-col items-center gap-md text-center">
        <h1
          className="animate-slidein font-[family-name:var(--font-lora)] text-4xl font-semibold leading-tight text-on-surface md:text-5xl lg:text-6xl"
          style={{ animationDelay: "300ms" }}
        >
          Preserve the voice, words, and phrases that make communication feel{" "}
          <span className="text-primary">personal.</span>
        </h1>
        <p
          className="animate-slidein max-w-2xl text-lg text-on-surface-variant md:text-xl"
          style={{ animationDelay: "500ms" }}
        >
          VoiceLegacy lets you record, clone, and protect your natural voice -
          so the people you love can always hear <em>you</em>.
        </p>
        <div
          className="animate-slidein mt-md"
          style={{ animationDelay: "700ms" }}
        >
          <Link href="/record">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
              className="landing-cta text-lg"
            >
              Record your voice - free
            </Button>
          </Link>
        </div>
        <p
          className="animate-slidein text-body-sm text-on-surface-variant"
          style={{ animationDelay: "800ms" }}
        >
          No account needed to start. Hear your clone before you sign up.
        </p>
      </header>

      <section className="grid w-full max-w-4xl grid-cols-1 gap-md md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="animate-slidein flex flex-col items-center gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center shadow-ambient"
              style={{ animationDelay: `${900 + index * 150}ms` }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="text-headline-sm text-on-surface">
                {feature.title}
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                {feature.description}
              </p>
            </article>
          );
        })}
      </section>

      <section
        aria-labelledby="testimonials-heading"
        className="flex w-full max-w-4xl flex-col items-center gap-md"
      >
        <div
          className="animate-slidein flex max-w-2xl flex-col items-center gap-sm text-center"
          style={{ animationDelay: "1350ms" }}
        >
          <p className="text-label-md uppercase text-primary">
            Loved by families, caregivers, and people planning ahead
          </p>
          <h2
            id="testimonials-heading"
            className="font-[family-name:var(--font-lora)] text-headline-md text-on-surface"
          >
            Why people start early
          </h2>
        </div>

        <div className="grid w-full grid-cols-1 gap-md md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <figure
              key={testimonial.author}
              className="animate-slidein flex h-full flex-col justify-between gap-md rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-md text-left shadow-[0_8px_28px_-20px_rgba(0,0,0,0.35)]"
              style={{ animationDelay: `${1500 + index * 120}ms` }}
            >
              <blockquote className="text-body-sm text-on-surface-variant">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="text-label-md text-on-surface">
                {testimonial.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
