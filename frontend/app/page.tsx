"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Heart,
  Lock,
  Smile,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";

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

  const canContinue = consent && tone !== null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canContinue) return;
    router.push("/record");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md md:p-lg shadow-ambient"
    >
      <header className="flex flex-col gap-sm text-center">
        <h1
          className="animate-slidein text-headline-lg text-on-surface"
          style={{ animationDelay: "300ms" }}
        >
          Welcome to VoiceLegacy
        </h1>
        <p
          className="animate-slidein mx-auto max-w-2xl text-body-lg text-on-surface-variant"
          style={{ animationDelay: "500ms" }}
        >
          Safely preserve the voice, words, and phrases that make your
          communication feel personal — before anything changes.
        </p>
      </header>

      <section
        aria-labelledby="consent-heading"
        className="animate-slidein flex flex-col gap-sm rounded-xl border border-outline-variant/50 bg-surface-container-low p-md"
        style={{ animationDelay: "700ms" }}
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
      </section>

      <section
        aria-labelledby="tone-heading"
        className="animate-slidein flex flex-col gap-md"
        style={{ animationDelay: "700ms" }}
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
                  "group flex h-full min-h-[160px] flex-col items-center justify-center gap-sm rounded-xl border-2 p-md text-center transition-colors",
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

      <footer
        className="animate-slidein mt-sm flex justify-end border-t border-outline-variant/30 pt-md"
        style={{ animationDelay: "900ms" }}
      >
        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
          disabled={!canContinue}
        >
          Continue to Recording
        </Button>
      </footer>
    </form>
  );
}
