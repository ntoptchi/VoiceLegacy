"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  BookmarkPlus,
  HeartHandshake,
  Library,
  Loader2,
  MessageSquareQuote,
  Mic,
  Scissors,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useRequireUser } from "@/lib/useRequireUser";
import {
  getCommunicationStyle,
  getVoiceId,
} from "@/lib/userSession";

type RewriteAction = "warmer" | "shorter" | "sound_like_me" | "translate";

type RewriteChip = {
  id: RewriteAction;
  label: string;
  description: string;
  icon: LucideIcon;
};

const chips: RewriteChip[] = [
  {
    id: "warmer",
    label: "Make warmer",
    description: "Add warmth and emotional softness.",
    icon: HeartHandshake,
  },
  {
    id: "shorter",
    label: "Make shorter",
    description: "Strip to the essential meaning.",
    icon: Scissors,
  },
  {
    id: "sound_like_me",
    label: "Sound like me",
    description: "Rewrite in your saved communication style.",
    icon: MessageSquareQuote,
  },
  {
    id: "translate",
    label: "Translate to saved phrase",
    description: "Find the closest match in your phrase bank.",
    icon: Library,
  },
];

export default function SpeakPage() {
  const userId = useRequireUser();
  const [text, setText] = useState(
    "Tell my daughter I'm really glad she came today.",
  );
  const [rewriting, setRewriting] = useState<RewriteAction | null>(null);
  const [activeAction, setActiveAction] = useState<RewriteAction | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [savedToBank, setSavedToBank] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const runRewrite = async (action: RewriteAction) => {
    if (rewriting || text.trim().length === 0) return;
    setRewriting(action);
    setError(null);

    const communicationStyle = getCommunicationStyle() ?? "warm";

    try {
      const res = await fetch("/api/gemini/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          mode: action,
          communicationStyle,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || typeof data.rewritten !== "string") {
        throw new Error(data.error ?? "Rewrite failed.");
      }

      setText(data.rewritten);
      setActiveAction(action);
      cleanupAudio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed.");
    } finally {
      setRewriting(null);
    }
  };

  const handlePlay = async () => {
    if (isPlaying || isLoadingAudio || text.trim().length === 0) return;

    const voiceId = getVoiceId();
    if (!voiceId) {
      setError("No voice clone found. Please record your voice first.");
      return;
    }

    setIsLoadingAudio(true);
    setError(null);
    cleanupAudio();

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), voiceId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error ??
            `Speech synthesis failed (${res.status}).`,
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError("Audio playback failed.");
      };

      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play audio.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleSaveToBank = async () => {
    if (text.trim().length === 0 || !userId) return;
    setSavedToBank(false);
    setError(null);

    try {
      const res = await fetch("/api/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          category: "personal",
          text: text.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(
          (data as { error?: string }).error ?? "Could not save phrase.",
        );
      }
      setSavedToBank(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => {
        setSavedToBank(false);
        savedTimerRef.current = null;
      }, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save phrase.");
    }
  };

  const canPlay = text.trim().length > 0 && !isPlaying && !isLoadingAudio;

  if (!userId) return null;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-lg">
      <header className="flex flex-col gap-sm text-center">
        <h1 className="text-headline-lg text-on-surface">Speak For Me</h1>
        <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
          Type what you&apos;d like to say. Reshape it in your own voice, then
          play it back in your preserved sound.
        </p>
      </header>

      <article className="flex flex-col gap-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-ambient md:p-lg">
        <label htmlFor="speak-input" className="sr-only">
          What do you want to say?
        </label>
        <textarea
          id="speak-input"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setActiveAction(null);
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

        <div
          role="group"
          aria-label="Rewrite suggestions"
          className="grid grid-cols-1 gap-sm sm:grid-cols-2"
        >
          {chips.map((chip) => {
            const Icon = chip.icon;
            const isLoading = rewriting === chip.id;
            const isActive = activeAction === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => void runRewrite(chip.id)}
                disabled={rewriting !== null}
                aria-busy={isLoading}
                aria-pressed={isActive}
                className={cn(
                  "group flex items-start gap-sm rounded-xl border p-sm text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest",
                  isActive
                    ? "border-primary bg-primary-fixed/40 text-on-primary-fixed"
                    : "border-outline-variant/50 bg-surface-container-low text-on-surface hover:border-primary/50 hover:bg-primary-fixed/15",
                  rewriting !== null && !isLoading && "opacity-60",
                )}
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
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <span className="flex flex-col gap-xs">
                  <span className="text-label-lg">
                    {isLoading ? "Rewriting…" : chip.label}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    {chip.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </article>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error-container/40 px-md py-sm text-body-sm text-on-error-container"
        >
          {error}
        </div>
      ) : null}

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
          onClick={() => void handlePlay()}
          disabled={!canPlay}
          aria-pressed={isPlaying}
          aria-label={
            isLoadingAudio
              ? "Loading audio"
              : isPlaying
                ? "Audio is playing"
                : "Speak this aloud"
          }
          className={cn(
            "relative z-10 h-28 w-28 min-h-0 gap-0 rounded-full border-4 border-surface px-0 shadow-ambient",
            isPlaying && "bg-primary-container",
          )}
        >
          {isLoadingAudio ? (
            <Loader2 className="h-10 w-10 animate-spin" aria-hidden="true" />
          ) : isPlaying ? (
            <Volume2 className="h-10 w-10 animate-pulse" aria-hidden="true" />
          ) : (
            <Mic className="h-10 w-10" aria-hidden="true" />
          )}
        </Button>

        <p
          aria-live="polite"
          className={cn(
            "text-body-md transition-colors",
            isPlaying ? "text-primary" : "text-on-surface-variant",
          )}
        >
          {isLoadingAudio
            ? "Generating audio…"
            : isPlaying
              ? "Playing audio in your preserved voice…"
              : canPlay
                ? "Tap play to hear it in your voice."
                : "Type something above, then play it back."}
        </p>

        <Button
          variant="tertiary"
          size="md"
          leftIcon={<BookmarkPlus className="h-5 w-5" aria-hidden="true" />}
          onClick={() => void handleSaveToBank()}
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
