"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mic,
  RotateCcw,
  Square,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

const PHRASES: readonly string[] = [
  "I am recording my voice so I can always sound like myself.",
  "I love you very much, and I'm so glad you're here.",
  "It was a beautiful morning for a walk by the sea.",
  "Could you please help me with this for a moment?",
  "Thank you, that means more to me than you know.",
  "I'm feeling a little tired today, but I'm doing alright.",
  "Tell me about your day — I want to hear everything.",
  "Everything is going to be okay. We'll figure it out together.",
];

type RecordingState = "idle" | "recording" | "processing" | "done";

function pickAudioMimeType(): string | undefined {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return undefined;
  }
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return undefined;
}

function extensionForMime(mime: string | undefined): string {
  if (!mime) return "webm";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

export default function RecordPage() {
  const router = useRouter();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlobs, setAudioBlobs] = useState<(Blob | null)[]>(() =>
    Array<Blob | null>(PHRASES.length).fill(null),
  );
  const [error, setError] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const targetIndexRef = useRef<number>(0);

  const phrase = PHRASES[phraseIndex];
  const totalPhrases = PHRASES.length;
  const recordedCount = audioBlobs.filter((blob) => blob !== null).length;
  const allRecorded = recordedCount === totalPhrases;
  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing";
  const isDone = recordingState === "done";
  const currentPhraseRecorded = audioBlobs[phraseIndex] !== null;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      stopStream();
    };
  }, [stopStream]);

  const startRecording = useCallback(async () => {
    setError(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError(
        "Audio recording isn't supported in this browser. Please try Chrome, Safari, or Firefox.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickAudioMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      targetIndexRef.current = phraseIndex;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        const indexAtStart = targetIndexRef.current;
        setAudioBlobs((prev) => {
          const next = [...prev];
          next[indexAtStart] = blob;
          return next;
        });
        stopStream();
        recorderRef.current = null;
        setRecordingState("idle");
      };

      recorder.onerror = (event) => {
        console.error("[record] MediaRecorder error", event);
        setError("Something went wrong while recording. Please try again.");
        stopStream();
        recorderRef.current = null;
        setRecordingState("idle");
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecordingState("recording");
    } catch (err) {
      console.error("[record] getUserMedia failed", err);
      stopStream();
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access was blocked. Please allow microphone access and try again."
          : err instanceof Error
            ? err.message
            : "Could not access your microphone.";
      setError(message);
      setRecordingState("idle");
    }
  }, [phraseIndex, stopStream]);

  const stopRecording = useCallback(() => {
    if (
      recorderRef.current &&
      recorderRef.current.state !== "inactive"
    ) {
      setRecordingState("processing");
      recorderRef.current.stop();
    }
  }, []);

  const handleRecordToggle = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (isRecording) {
        stopRecording();
      } else if (!isProcessing && !isDone) {
        void startRecording();
      }
    },
    [isDone, isProcessing, isRecording, startRecording, stopRecording],
  );

  const goToPhrase = useCallback(
    (nextIndex: number) => {
      if (isRecording || isProcessing) return;
      const clamped = Math.max(0, Math.min(totalPhrases - 1, nextIndex));
      setPhraseIndex(clamped);
    },
    [isProcessing, isRecording, totalPhrases],
  );

  const submitRecordings = useCallback(async () => {
    if (!allRecorded || isProcessing) return;

    setRecordingState("processing");
    setError(null);

    try {
      const formData = new FormData();
      const mimeType = pickAudioMimeType();
      const ext = extensionForMime(mimeType);
      audioBlobs.forEach((blob, index) => {
        if (blob) {
          formData.append("files", blob, `phrase-${index + 1}.${ext}`);
        }
      });

      const response = await fetch("/api/voice/upload", {
        method: "POST",
        body: formData,
      });

      const payload: {
        success?: boolean;
        voice_id?: string;
        error?: string;
      } = await response.json().catch(() => ({}));

      if (!response.ok || !payload.success || !payload.voice_id) {
        throw new Error(
          payload.error ??
            `Voice clone upload failed (status ${response.status}).`,
        );
      }

      setVoiceId(payload.voice_id);
      setRecordingState("done");
    } catch (err) {
      console.error("[record] submit failed", err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't upload your recordings. Please try again.",
      );
      setRecordingState("idle");
    }
  }, [allRecorded, audioBlobs, isProcessing]);

  if (isDone) {
    return (
      <section
        className="animate-slidein mx-auto flex w-full max-w-2xl flex-col items-center gap-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center shadow-ambient"
        style={{ animationDelay: "300ms" }}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="text-headline-lg text-on-surface">
          Your voice is preserved.
        </h1>
        <p className="max-w-prose text-body-lg text-on-surface-variant">
          We&apos;ve safely uploaded your recordings and created your private
          voice prototype. You can now build your phrase bank and speak in your
          own voice.
        </p>
        {voiceId ? (
          <p className="text-body-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Voice ID:</span>{" "}
            <code className="rounded-sm bg-surface-container-low px-xs py-[2px] font-mono text-on-surface">
              {voiceId}
            </code>
          </p>
        ) : null}
        <div className="mt-md flex flex-col gap-sm sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
            onClick={() => router.push("/phrases")}
          >
            Build Your Phrase Bank
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </section>
    );
  }

  const progressPercent = Math.round((recordedCount / totalPhrases) * 100);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-lg">
      <header
        className="animate-slidein flex flex-col gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-ambient"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center justify-between gap-sm">
          <div className="flex items-center gap-xs rounded-full bg-surface-container-high px-sm py-xs">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isRecording ? "animate-pulse bg-error" : "bg-primary",
              )}
              aria-hidden="true"
            />
            <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
              {isRecording
                ? "Recording"
                : isProcessing
                  ? "Processing"
                  : "Ready"}
            </span>
          </div>
          <p
            className="text-label-lg text-on-surface"
            aria-live="polite"
          >
            Phrase {phraseIndex + 1} of {totalPhrases}
          </p>
          <p className="text-label-md text-on-surface-variant">
            {recordedCount}/{totalPhrases} recorded
          </p>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-surface-variant"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalPhrases}
          aria-valuenow={recordedCount}
          aria-label="Recording progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <article
        className="animate-slidein flex flex-col items-center gap-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center shadow-ambient"
        style={{ animationDelay: "500ms" }}
      >
        <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
          Read this aloud, in your natural voice
        </p>
        <h1 className="max-w-2xl text-headline-lg text-on-primary-fixed-variant">
          &ldquo;{phrase}&rdquo;
        </h1>
        {currentPhraseRecorded ? (
          <p className="flex items-center gap-xs text-body-sm text-primary">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>
              Captured. Press the mic again to re-record this phrase.
            </span>
          </p>
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            Speak clearly at your usual pace. You can re-record at any time.
          </p>
        )}
      </article>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-sm rounded-xl border border-error/30 bg-error-container/40 p-md text-on-error-container"
        >
          <TriangleAlert
            className="mt-1 h-5 w-5 shrink-0 text-error"
            aria-hidden="true"
          />
          <p className="text-body-sm">{error}</p>
        </div>
      ) : null}

      <div
        className="animate-slidein flex flex-col items-center gap-md"
        style={{ animationDelay: "700ms" }}
      >
        <div className="grid w-full grid-cols-2 items-center gap-sm sm:grid-cols-[1fr_auto_1fr] sm:gap-md">
          <Button
            variant="ghost"
            size="lg"
            leftIcon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            onClick={() => goToPhrase(phraseIndex - 1)}
            disabled={phraseIndex === 0 || isRecording || isProcessing}
            className="justify-self-start px-md sm:px-xl"
          >
            Previous
          </Button>

          {allRecorded ? (
            <Button
              variant="primary"
              size="lg"
              leftIcon={
                <Mic className="h-5 w-5 text-[#fff8ed]" aria-hidden="true" />
              }
              onClick={() => void submitRecordings()}
              disabled={isProcessing}
              className="order-first col-span-2 w-full justify-self-center px-lg sm:order-none sm:col-span-1 sm:w-auto sm:min-w-[260px] sm:px-xl"
            >
              {isProcessing ? "Creating clone…" : "Create My Voice Clone"}
            </Button>
          ) : (
            <div className="order-first col-span-2 flex justify-center sm:order-none sm:col-span-1">
              <div className="relative flex items-center justify-center">
                {isRecording ? (
                  <>
                    <span
                      className="absolute inset-0 -m-2 animate-ping rounded-full bg-error/30"
                      aria-hidden="true"
                    />
                    <span
                      className="absolute inset-0 -m-4 animate-pulse rounded-full bg-error/15"
                      aria-hidden="true"
                    />
                  </>
                ) : null}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRecordToggle}
                  disabled={isProcessing}
                  aria-label={
                    isRecording
                      ? "Stop recording"
                      : currentPhraseRecorded
                        ? "Re-record this phrase"
                        : "Start recording"
                  }
                  aria-pressed={isRecording}
                  className={cn(
                    "relative z-10 h-24 w-24 min-h-0 gap-0 rounded-full border-4 border-surface px-0 shadow-ambient",
                    isRecording &&
                      "bg-error text-on-error hover:bg-error/90 focus-visible:ring-error",
                    !isRecording &&
                      currentPhraseRecorded &&
                      "bg-primary-container",
                  )}
                >
                  {isRecording ? (
                    <Square
                      className="h-8 w-8 fill-current"
                      aria-hidden="true"
                    />
                  ) : currentPhraseRecorded ? (
                    <RotateCcw className="h-8 w-8" aria-hidden="true" />
                  ) : (
                    <Mic
                      className="h-9 w-9 text-[#fff8ed]"
                      aria-hidden="true"
                    />
                  )}
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="lg"
            rightIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
            onClick={() => goToPhrase(phraseIndex + 1)}
            disabled={
              phraseIndex === totalPhrases - 1 || isRecording || isProcessing
            }
            className="justify-self-end px-md sm:px-xl"
          >
            Next
          </Button>
        </div>

        <p className="text-body-sm text-on-surface-variant">
          {isRecording
            ? "Tap stop when you&apos;ve finished reading the phrase."
            : allRecorded
              ? "All phrases captured. Create your voice clone whenever you&apos;re ready."
              : currentPhraseRecorded
                ? "Move to the next phrase, or re-record if you&apos;d like another take."
                : "Tap the microphone to start recording this phrase."}
        </p>
      </div>
    </section>
  );
}
