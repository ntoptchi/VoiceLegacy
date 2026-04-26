"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Heart,
  Loader2,
  Lock,
  Smile,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import { setCommunicationStyle, setUserId } from "@/lib/userSession";

type Tone = "warm" | "direct" | "humorous";

type ToneOption = {
  id: Tone;
  label: string;
  description: string;
  icon: LucideIcon;
};

const toneOptions: ToneOption[] = [
  {
    id: "warm",
    label: "Warm",
    description: "Expressive and gentle",
    icon: Heart,
  },
  {
    id: "direct",
    label: "Direct",
    description: "Clear and to the point",
    icon: Zap,
  },
  {
    id: "humorous",
    label: "Humorous",
    description: "Playful and light",
    icon: Smile,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [tone, setTone] = useState<Tone | null>(null);
  const [audience, setAudience] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = consent && tone !== null && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canContinue || !tone) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/user/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
          communicationStyle: tone,
          audience: audience.trim() || undefined,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.success || !payload.userId) {
        throw new Error(
          payload.error ?? `Failed to create user (status ${response.status}).`,
        );
      }

      setUserId(payload.userId);
      setCommunicationStyle(tone);
      router.push("/record");
    } catch (err) {
      console.error("[onboarding] submit failed", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient sm:p-6 md:gap-lg md:p-lg"
    >
      <header className="flex flex-col gap-sm text-center">
        <h1
          className="animate-slidein text-3xl font-bold leading-tight text-on-surface md:text-headline-lg"
          style={{ animationDelay: "300ms" }}
        >
          Welcome to VoiceLegacy
        </h1>
        <p
          className="animate-slidein mx-auto max-w-2xl text-body-lg text-on-surface-variant"
          style={{ animationDelay: "500ms" }}
        >
          Safely preserve the voice, words, and phrases that make your
          communication feel personal before anything changes.
        </p>
      </header>

      <section
        aria-labelledby="consent-heading"
        className="animate-slidein flex flex-col gap-sm rounded-xl border border-outline-variant/50 bg-surface-container-low p-md"
        style={{ animationDelay: "700ms" }}
      >
        <div className="flex items-start gap-sm sm:gap-md">
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
              className="cursor-pointer select-none text-xl font-semibold leading-snug text-on-surface md:text-headline-sm"
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
      </section>

      <section
        aria-labelledby="tone-heading"
        className="animate-slidein flex flex-col gap-md"
        style={{ animationDelay: "700ms" }}
      >
        <div className="flex flex-col gap-xs border-b border-outline-variant/30 pb-sm">
          <h2
            id="tone-heading"
            className="text-2xl font-semibold leading-tight text-on-surface md:text-headline-md"
          >
            Communication Style
          </h2>
          <p className="text-label-lg text-on-surface-variant">
            How would friends describe your natural tone?
          </p>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="tone-heading"
          className="grid grid-cols-1 gap-md md:grid-cols-3"
        >
          {toneOptions.map(({ id, label, description, icon: Icon }) => {
            const selected = tone === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTone(id)}
                className={cn(
                  "group flex h-full min-h-[140px] flex-col items-center justify-center gap-sm rounded-xl border-2 p-md text-center transition-colors md:min-h-[160px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest",
                  selected
                    ? "border-primary bg-primary-fixed/40 text-on-primary-fixed"
                    : "border-outline-variant/50 bg-surface-container-lowest text-on-surface hover:border-primary/50 hover:bg-primary-fixed/10",
                )}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-105",
                    selected
                      ? "bg-primary text-on-primary"
                      : "bg-primary-fixed text-on-primary-fixed",
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-headline-sm">{label}</span>
                <span className="text-body-sm text-on-surface-variant">
                  {description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="animate-slidein flex flex-col gap-sm"
        style={{ animationDelay: "700ms" }}
      >
        <TextInput
          label="Who is this primarily for? (Optional)"
          placeholder="e.g., My grandchildren, my partner, my future self..."
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
          autoComplete="off"
        />
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error-container/40 px-md py-sm text-body-sm text-on-error-container"
        >
          {error}
        </div>
      ) : null}

      <footer
        className="animate-slidein mt-sm flex justify-stretch border-t border-outline-variant/30 pt-md sm:justify-end"
        style={{ animationDelay: "900ms" }}
      >
        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={
            isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            )
          }
          disabled={!canContinue}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Setting up..." : "Continue to Recording"}
        </Button>
      </footer>
    </form>
  );
}
