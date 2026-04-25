"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  BookmarkPlus,
  HeartHandshake,
  Library,
  Loader2,
  MessageSquareQuote,
  Play,
  Scissors,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

type RewriteAction =
  | "warmer"
  | "shorter"
  | "sound-like-me"
  | "translate-to-saved";

type RewriteChip = {
  id: RewriteAction;
  mode: "warmer" | "shorter" | "sound_like_me" | "translate";
  label: string;
  description: string;
  icon: LucideIcon;
};

type RewriteResult = RewriteChip & {
  text: string;
};

const chips: RewriteChip[] = [
  {
    id: "warmer",
    mode: "warmer",
    label: "Make warmer",
    description: "Add warmth and emotional softness.",
    icon: HeartHandshake,
  },
  {
    id: "shorter",
    mode: "shorter",
    label: "Make shorter",
    description: "Strip to the essential meaning.",
    icon: Scissors,
  },
  {
    id: "sound-like-me",
    mode: "sound_like_me",
    label: "Sound like me",
    description: "Rewrite in your saved communication style.",
    icon: MessageSquareQuote,
  },
  {
    id: "translate-to-saved",
    mode: "translate",
    label: "Translate to saved phrase",
    description: "Find the closest match in your phrase bank.",
    icon: Library,
  },
];

const SAMPLE_PROMPT = "Tell my daughter I'm really glad she came today.";

const rewriteResponses: Record<RewriteAction, string> = {
  warmer:
    "My darling daughter, having you here today means more to me than I know how to say. Truly. It made my whole week.",
  shorter: "So glad you came today.",
  "sound-like-me":
    "Sweetheart, I'm really glad you came by today, really glad. It meant a lot.",
  "translate-to-saved": "I love you all so much. (matched from your phrase bank)",
};

const REWRITE_DELAY_MS = 1000;
const PLAY_DURATION_MS = 3000;

export default function SpeakPage() {
  const [text, setText] = useState(SAMPLE_PROMPT);
  const [rewriting, setRewriting] = useState(false);
  const [activeAction, setActiveAction] = useState<RewriteAction | null>(null);
  const [rewriteResults, setRewriteResults] = useState<RewriteResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedToBank, setSavedToBank] = useState(false);

  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const generateRewrites = async () => {
    if (rewriting) return;
    const message = text.trim();
    if (message.length === 0) return;

    setRewriting(true);
    setRewriteResults([]);
    try {
      await new Promise((resolve) => setTimeout(resolve, REWRITE_DELAY_MS));
      const results = await Promise.all(
        chips.map(async (chip) => {
          const response = await fetch("/api/gemini/rewrite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              mode: chip.mode,
              communicationStyle: "warm",
            }),
          });
          if (!response.ok) {
            throw new Error(`Failed to generate ${chip.label}.`);
          }

          const data = (await response.json()) as {
            success: boolean;
            rewritten?: string;
          };
          return {
            ...chip,
            text:
              data.success && data.rewritten
                ? data.rewritten
                : rewriteResponses[chip.id],
          };
        }),
      );
      setRewriteResults(results);
      setActiveAction(null);
    } catch (error) {
      console.error("[SpeakPage] Failed to generate rewrites:", error);
    } finally {
      setRewriting(false);
    }
  };

  const handlePlay = () => {
    if (isPlaying || text.trim().length === 0) return;
    setIsPlaying(true);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    playTimerRef.current = setTimeout(() => {
      setIsPlaying(false);
      playTimerRef.current = null;
    }, PLAY_DURATION_MS);
  };

  const handleSaveToBank = () => {
    if (text.trim().length === 0) return;
    setSavedToBank(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => {
      setSavedToBank(false);
      savedTimerRef.current = null;
    }, 2200);
  };

  const canPlay = text.trim().length > 0 && !isPlaying;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-lg">
      <header
        className="animate-slidein flex flex-col gap-sm text-center"
        style={{ animationDelay: "300ms" }}
      >
        <h1 className="text-headline-lg text-on-surface">Speak For Me</h1>
        <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
          Type what you&apos;d like to say. Reshape it in your own voice, then
          play it back in your preserved sound.
        </p>
      </header>

      <article
        className="animate-slidein flex flex-col gap-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-ambient md:p-lg"
        style={{ animationDelay: "500ms" }}
      >
        <label htmlFor="speak-input" className="sr-only">
          What do you want to say?
        </label>
        <textarea
          id="speak-input"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setActiveAction(null);
            setRewriteResults([]);
          }}
          placeholder="What do you want to say?"
          rows={4}
          className={cn(
            "w-full resize-none rounded-xl border-2 border-outline-variant/50 bg-surface-container-lowest p-md text-body-lg text-on-surface",
            "placeholder:text-outline",
            "transition-colors duration-200",
            "focus:border-primary focus:outline-none focus:ring-0",
          )}
        />

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="md"
            leftIcon={
              rewriting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )
            }
            onClick={() => void generateRewrites()}
            disabled={rewriting || text.trim().length === 0}
            aria-busy={rewriting}
          >
            {rewriting ? "Rewriting..." : "Generate rewrites"}
          </Button>
        </div>

        {rewriteResults.length > 0 ? (
          <div
            role="group"
            aria-label="Gemini rewrite results"
            className="grid grid-cols-1 gap-sm sm:grid-cols-2"
          >
            {rewriteResults.map((result, index) => {
              const Icon = result.icon;
              const isActive = activeAction === result.id;
              return (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => {
                    setText(result.text);
                    setActiveAction(result.id);
                  }}
                  aria-pressed={isActive}
                  className={cn(
                    "animate-slidein group flex items-start gap-sm rounded-xl border p-sm text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest",
                    isActive
                      ? "border-primary bg-primary-fixed/40 text-on-primary-fixed"
                      : "border-outline-variant/50 bg-surface-container-low text-on-surface hover:border-primary/50 hover:bg-primary-fixed/15",
                  )}
                  style={{ animationDelay: `${300 + index * 200}ms` }}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                      isActive
                        ? "bg-primary text-on-primary"
                        : "bg-primary-fixed text-on-primary-fixed",
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex flex-col gap-xs">
                    <span className="text-label-lg">{result.label}</span>
                    <span className="text-body-sm text-on-surface-variant">
                      {result.text}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </article>

      <div className="relative flex flex-col items-center gap-md">
        {isPlaying ? (
          <>
            <span
              className="absolute inset-x-0 top-2 mx-auto h-32 w-32 animate-ping rounded-full bg-primary/20"
              aria-hidden="true"
            />
            <span
              className="absolute inset-x-0 top-4 mx-auto h-28 w-28 animate-pulse rounded-full bg-primary/15"
              aria-hidden="true"
            />
          </>
        ) : null}

        <Button
          variant="primary"
          size="lg"
          onClick={handlePlay}
          disabled={!canPlay}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? "Audio is playing" : "Play audio"}
          className={cn(
            "relative z-10 h-28 w-28 min-h-0 gap-0 rounded-full border-4 border-surface px-0 shadow-ambient",
            isPlaying && "bg-primary-container",
          )}
        >
          {isPlaying ? (
            <Volume2 className="h-10 w-10 animate-pulse" aria-hidden="true" />
          ) : (
            <Play className="h-10 w-10 fill-current" aria-hidden="true" />
          )}
        </Button>

        <p
          aria-live="polite"
          className={cn(
            "text-body-md transition-colors",
            isPlaying ? "text-primary" : "text-on-surface-variant",
          )}
        >
          {isPlaying
            ? "Playing audio in your preserved voice..."
            : canPlay
              ? "Tap play to hear it in your voice."
              : "Type something above, then play it back."}
        </p>

        <Button
          variant="tertiary"
          size="md"
          leftIcon={<BookmarkPlus className="h-5 w-5" aria-hidden="true" />}
          onClick={handleSaveToBank}
          disabled={text.trim().length === 0}
        >
          Save to phrase bank
        </Button>

        {savedToBank ? (
          <div
            role="status"
            className="flex items-center gap-xs rounded-full bg-primary-fixed/60 px-md py-xs text-label-md text-on-primary-fixed"
          >
            <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
            Saved to your phrase bank
          </div>
        ) : null}
      </div>
    </section>
  );
}
