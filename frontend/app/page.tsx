"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Heart,
  Lock,
  ShieldAlert,
  Smile,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { ArrowRight, Mic, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  {
    icon: Mic,
    title: "Clone your voice",
    description: "Read a few phrases and we create a private voice prototype in seconds.",
  },
  {
    icon: Sparkles,
    title: "Build your phrase bank",
    description:
      "Save the words and expressions that matter most — with AI help to capture your tone.",
  },
  {
    icon: Shield,
    title: "Private and yours",
    description:
      "Your voice data is never shared. Delete it any time, no questions asked.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center gap-12 py-8 md:py-16">
      <header className="flex max-w-3xl flex-col items-center gap-md text-center">
        <h1
          className="animate-slidein text-4xl font-bold leading-tight text-on-surface md:text-5xl lg:text-6xl"
          style={{ animationDelay: "300ms" }}
        >
          Preserve the voice that makes you,{" "}
          <span className="text-primary">you.</span>
        </h1>
        <p
          className="animate-slidein max-w-2xl text-lg text-on-surface-variant md:text-xl"
          style={{ animationDelay: "500ms" }}
        >
          VoiceLegacy lets you record, clone, and protect your natural voice —
          so the people you love can always hear <em>you</em>.
        </p>
      </header>

      <section
        aria-labelledby="consent-heading"
        className="flex flex-col gap-sm rounded-xl border border-outline-variant/50 bg-surface-container-low p-md"
      >
        <div className="flex items-start gap-md">
          <button
            type="button"
            role="checkbox"
            aria-checked={consent}
            aria-labelledby="consent-heading"
            onClick={() => setConsent((prev) => !prev)}
            className={cn(
              "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-low",
              consent
                ? "border-primary bg-primary text-on-primary"
                : "border-primary bg-surface-container-lowest text-transparent hover:bg-primary-fixed/20",
            )}
          >
            <Check
              className={cn("h-5 w-5", consent ? "opacity-100" : "opacity-0")}
              aria-hidden="true"
              strokeWidth={3}
            />
          </button>
          <div className="flex flex-col gap-xs">
            <span
              id="consent-heading"
              className="cursor-pointer select-none text-headline-sm text-on-surface"
              onClick={() => setConsent((prev) => !prev)}
            >
              I confirm this is my voice, or I have explicit permission to
              preserve this voice.
            </span>
            <span className="mt-xs flex items-center gap-xs text-on-surface-variant">
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span className="text-body-sm">
                Your data is private, never shared, and can be deleted at any
                time.
              </span>
            </span>
          </div>
        </div>

        <div
          role="note"
          className="mt-sm flex items-start gap-xs rounded-md border border-error/30 bg-error-container/40 p-sm text-on-error-container"
        >
          <ShieldAlert
            className="mt-[2px] h-4 w-4 shrink-0 text-error"
            aria-hidden="true"
          />
          <p className="text-body-sm">
            <span className="font-semibold">This is not for impersonation.</span>{" "}
            Voices may only be cloned with the speaker&apos;s explicit consent.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="tone-heading"
        className="flex flex-col gap-md"
      >
        <div className="flex flex-col gap-xs border-b border-outline-variant/30 pb-sm">
          <h2
            id="tone-heading"
            className="text-headline-md text-on-surface"
          >
            Communication Style
          </h2>
          <p className="text-label-lg text-on-surface-variant">
            How would friends describe your natural tone?
          </p>
        </div>

        <div
          className="animate-slidein mt-md"
          style={{ animationDelay: "700ms" }}
        >
          <Link href="/record">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
              className="text-lg hover:!text-white hover:[&_svg]:!text-white"
            >
              Record your voice — free
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
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <article
              key={f.title}
              className="animate-slidein flex flex-col items-center gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center shadow-ambient"
              style={{ animationDelay: `${900 + i * 150}ms` }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="text-headline-sm text-on-surface">{f.title}</h2>
              <p className="text-body-md text-on-surface-variant">
                {f.description}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
