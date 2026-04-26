"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SignUpButton } from "@clerk/nextjs";
import {
  Loader2,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui";

const DEMO_PHRASE = "This is your voice, preserved forever.";

export default function PreviewPage() {
  const router = useRouter();
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingVoiceId");
    if (!pending) {
      router.replace("/record");
      return;
    }
    setVoiceId(pending);
    setIsLoading(false);
  }, [router]);

  const playVoice = useCallback(async () => {
    if (!voiceId || isPlaying) return;

    setIsPlaying(true);
    setError(null);

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: DEMO_PHRASE, voiceId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ??
            `TTS failed (status ${res.status})`,
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setHasPlayed(true);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError("Audio playback failed. Try again.");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      setIsPlaying(false);
      setError(
        err instanceof Error ? err.message : "Could not play your voice.",
      );
    }
  }, [voiceId, isPlaying]);

  useEffect(() => {
    if (voiceId && !hasPlayed && !isPlaying && !error) {
      void playVoice();
    }
  }, [voiceId, hasPlayed, isPlaying, error, playVoice]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (isLoading) return null;

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-lg py-8 md:py-16">
      <header className="flex flex-col items-center gap-md text-center">
        <span
          className="animate-slidein flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed"
          style={{ animationDelay: "300ms" }}
        >
          <Sparkles className="h-10 w-10" aria-hidden="true" />
        </span>
        <h1
          className="animate-slidein text-3xl font-bold leading-tight text-on-surface md:text-headline-lg"
          style={{ animationDelay: "400ms" }}
        >
          This is <em>your</em> voice.
        </h1>
        <p
          className="animate-slidein max-w-prose text-body-lg text-on-surface-variant"
          style={{ animationDelay: "500ms" }}
        >
          We just played a preview of your voice clone saying: &ldquo;
          {DEMO_PHRASE}&rdquo;
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-sm rounded-xl border border-error/30 bg-error-container/40 p-md text-on-error-container"
        >
          <TriangleAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-error"
            aria-hidden="true"
          />
          <p className="text-body-sm">{error}</p>
        </div>
      ) : null}

      <div
        className="animate-slidein flex flex-col items-center gap-md"
        style={{ animationDelay: "600ms" }}
      >
        <Button
          variant="ghost"
          size="lg"
          leftIcon={
            isPlaying ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            )
          }
          onClick={() => void playVoice()}
          disabled={isPlaying}
        >
          {isPlaying ? "Playing..." : "Play again"}
        </Button>
      </div>

      <div
        className="animate-slidein flex w-full flex-col items-center gap-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center shadow-ambient"
        style={{ animationDelay: "700ms" }}
      >
        <h2 className="text-xl font-semibold text-on-surface md:text-headline-sm">
          Create a free account to save and protect this forever.
        </h2>
        <p className="max-w-prose text-body-md text-on-surface-variant">
          Your voice clone, phrase bank, and AI tools — all in one place. No
          credit card required.
        </p>
        <div className="flex items-center gap-xs text-body-sm text-on-surface-variant">
          <Shield className="h-4 w-4" aria-hidden="true" />
          <span>Private. Secure. Delete any time.</span>
        </div>
        <SignUpButton
          mode="modal"
          forceRedirectUrl="/consent"
        >
          <Button
            variant="primary"
            size="lg"
            className="text-lg hover:!text-white hover:[&_svg]:!text-white"
          >
            Create Account
          </Button>
        </SignUpButton>
      </div>
    </section>
  );
}
