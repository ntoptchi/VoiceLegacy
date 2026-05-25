"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Download,
  HeartHandshake,
  Laugh,
  Loader2,
  Mic,
  ShieldAlert,
  Sun,
  Trash2,
  TriangleAlert,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  COMMUNICATION_STYLES,
  type CommunicationStyle,
} from "@/lib/types";
import { useClerk } from "@clerk/nextjs";
import { useRequireUser } from "@/lib/useRequireUser";

type Category =
  | "family"
  | "daily"
  | "comfort"
  | "humor"
  | "emergency"
  | "personal";

type SummaryRow = {
  id: Category;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  count: number;
};

type PhraseData = {
  id: string;
  text: string;
  category: Category;
};

const categoryMeta: Record<
  Category,
  { label: string; icon: LucideIcon; iconClass: string }
> = {
  family: {
    label: "Family",
    icon: HeartHandshake,
    iconClass: "text-on-primary-fixed-variant",
  },
  daily: {
    label: "Daily Needs",
    icon: Sun,
    iconClass: "text-on-secondary-fixed-variant",
  },
  comfort: {
    label: "Comfort",
    icon: HeartHandshake,
    iconClass: "text-on-tertiary-fixed-variant",
  },
  humor: { label: "Humor", icon: Laugh, iconClass: "text-tertiary" },
  emergency: {
    label: "Emergency",
    icon: ShieldAlert,
    iconClass: "text-error",
  },
  personal: { label: "Personal", icon: User, iconClass: "text-primary" },
};

const toneLabels: Record<CommunicationStyle, string> = {
  warm: "Warm",
  direct: "Direct",
  humorous: "Humorous",
};

export default function DashboardPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const appUser = useRequireUser();
  const userId = appUser?.id ?? null;

  const [voiceStatus, setVoiceStatus] = useState<string>("unknown");
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [communicationStyle, setCommunicationStyle] =
    useState<CommunicationStyle | null>(null);
  const [phrases, setPhrases] = useState<PhraseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingTone, setSavingTone] = useState<CommunicationStyle | null>(null);
  const [toneError, setToneError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [userRes, phrasesRes] = await Promise.all([
        fetch(`/api/user/${userId}`),
        fetch(`/api/phrases/${userId}`),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && userData.user) {
          setVoiceStatus(userData.user.voiceStatus ?? "none");
          setVoiceId(userData.user.voiceId ?? null);
          setCommunicationStyle(userData.user.communicationStyle ?? null);
        }
      }

      if (phrasesRes.ok) {
        const phrasesData = await phrasesRes.json();
        if (phrasesData.success && Array.isArray(phrasesData.phrases)) {
          setPhrases(
            phrasesData.phrases.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              text: p.text as string,
              category: p.category as Category,
            })),
          );
        }
      }
    } catch {
      // fallback to whatever we have
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  const summary: SummaryRow[] = Object.entries(categoryMeta)
    .map(([id, meta]) => ({
      id: id as Category,
      ...meta,
      count: phrases.filter((p) => p.category === id).length,
    }))
    .filter((row) => row.count > 0);

  const totalPhrases = phrases.length;

  const handleExport = () => {
    if (phrases.length === 0) return;
    const data = JSON.stringify(phrases, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voicelegacy-phrases.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteVoice = async () => {
    if (!userId || !voiceId) return;
    if (!confirm("Delete your voice clone? You can re-record later.")) return;
    try {
      const res = await fetch("/api/voice/delete", {
        method: "POST",
      });
      if (res.ok) {
        setVoiceId(null);
        setVoiceStatus("none");
      }
    } catch {
      // best-effort
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete all your data? This cannot be undone.")) return;
    if (userId) {
      try {
        await fetch(`/api/user/${userId}`, { method: "DELETE" });
      } catch {
        // best-effort server-side delete
      }
    }
    await signOut({ redirectUrl: "/" });
  };

  const handleRerecord = () => {
    router.push("/record");
  };

  const handleToneChange = async (nextTone: CommunicationStyle) => {
    if (!userId || nextTone === communicationStyle || savingTone) return;
    const previousTone = communicationStyle;
    setCommunicationStyle(nextTone);
    setSavingTone(nextTone);
    setToneError(null);

    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communicationStyle: nextTone }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error ?? "Failed to update voice tone.");
      }
      setCommunicationStyle(data.user.communicationStyle);
    } catch (error) {
      setCommunicationStyle(previousTone);
      setToneError(
        error instanceof Error ? error.message : "Failed to update voice tone.",
      );
    } finally {
      setSavingTone(null);
    }
  };

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isVoiceReady = voiceStatus === "ready";

  return (
    <section className="flex w-full flex-col gap-lg">
      <header className="flex flex-col gap-sm">
        <h1 className="text-3xl font-bold leading-tight text-on-surface md:text-headline-lg">
          Profile & Settings
        </h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          Manage your voice identity, review what you&apos;ve saved, and control
          your privacy preferences.
        </p>
      </header>

      <article className="flex flex-col gap-md rounded-xl border border-outline-variant/30 bg-surface-container p-4 shadow-ambient sm:p-md md:p-lg">
        <div className="flex items-start gap-sm sm:items-center">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${isVoiceReady ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}
          >
            {isVoiceReady ? (
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Clock className="h-6 w-6" aria-hidden="true" />
            )}
          </span>
          <div className="flex flex-col">
            <h2 className="text-headline-sm text-on-surface">
              Voice Status:{" "}
              {isVoiceReady
                ? "Ready"
                : voiceStatus === "none"
                  ? "Not recorded"
                  : voiceStatus}
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              {isVoiceReady
                ? "Your private voice prototype is preserved and ready to use."
                : "Record your voice to get started."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
          {voiceId ? <InfoTile label="Voice ID" value={voiceId} mono /> : null}
        </div>

        <div className="flex flex-col gap-sm rounded-xl bg-surface p-md">
          <div className="flex flex-col gap-xs">
            <h3 className="text-label-lg text-on-surface">Voice tone</h3>
            <p className="text-body-sm text-on-surface-variant">
              Choose the tone used when the assistant rewrites saved messages in
              your voice.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Voice tone"
            className="grid grid-cols-2 gap-xs sm:grid-cols-4"
          >
            {COMMUNICATION_STYLES.map((style) => {
              const isSelected = communicationStyle === style;
              const isSaving = savingTone === style;
              return (
                <button
                  key={style}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => void handleToneChange(style)}
                  disabled={savingTone !== null}
                  className={`flex min-h-11 items-center justify-center gap-xs rounded-full px-sm text-label-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    isSelected
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-dim hover:text-on-surface"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {toneLabels[style]}
                </button>
              );
            })}
          </div>
          {toneError ? (
            <p className="text-body-sm text-error" role="alert">
              {toneError}
            </p>
          ) : null}
        </div>

        <Button
          variant="primary"
          size="lg"
          leftIcon={<Mic className="h-5 w-5" aria-hidden="true" />}
          onClick={handleRerecord}
          className="w-full self-stretch sm:w-auto sm:self-start"
        >
          {isVoiceReady ? "Re-record voice" : "Record voice"}
        </Button>
      </article>

      <article className="flex flex-col gap-md rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 shadow-ambient sm:p-md md:p-lg">
        <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-xs">
            <h2 className="text-headline-sm text-on-surface">
              Phrase Bank Summary
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              {totalPhrases} phrase{totalPhrases !== 1 ? "s" : ""} saved
              {summary.length > 0
                ? ` across ${summary.length} categor${summary.length !== 1 ? "ies" : "y"}`
                : ""}
              .
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Download className="h-5 w-5" aria-hidden="true" />}
            onClick={handleExport}
            disabled={phrases.length === 0}
            className="w-full md:w-auto"
          >
            Export phrase bank
          </Button>
        </div>

        {summary.length > 0 ? (
          <ul className="grid grid-cols-1 gap-sm md:grid-cols-2 lg:grid-cols-3">
            {summary.map((row) => {
              const Icon = row.icon;
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-sm rounded-xl border border-outline-variant/30 bg-surface p-sm"
                >
                  <div className="flex items-center gap-sm">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-surface-container ${row.iconClass}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-body-md text-on-surface">
                      {row.label}
                    </span>
                  </div>
                  <span className="rounded-full bg-surface-variant px-sm py-xs text-label-md text-on-surface-variant">
                    {row.count}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            No phrases saved yet. Head to the Phrases page to start building
            your bank.
          </p>
        )}
      </article>

      <article className="flex flex-col gap-md rounded-xl border border-error/30 bg-error-container/30 p-4 sm:p-md md:p-lg">
        <div className="flex items-start gap-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-xs">
            <h2 className="text-headline-sm text-on-surface">Data & Privacy</h2>
            <p className="text-body-sm text-on-surface-variant">
              Your data is private. You have full control to remove your voice
              clone, your phrase bank, or everything we&apos;ve stored for you.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-sm sm:flex-row">
          {voiceId ? (
            <Button
              variant="destructive"
              size="md"
              leftIcon={<Trash2 className="h-5 w-5" aria-hidden="true" />}
              onClick={() => void handleDeleteVoice()}
            >
              Delete voice data
            </Button>
          ) : null}
          <Button
            variant="destructive"
            size="md"
            leftIcon={<Trash2 className="h-5 w-5" aria-hidden="true" />}
            onClick={() => void handleDeleteAll()}
            className="w-full sm:w-auto"
          >
            Delete all data
          </Button>
        </div>
      </article>
    </section>
  );
}

function InfoTile({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-xs rounded-xl bg-surface p-md">
      <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <span
        className={
          mono
            ? "overflow-hidden text-ellipsis font-mono text-body-md text-on-surface"
            : "text-body-lg text-on-surface"
        }
      >
        {value}
      </span>
    </div>
  );
}
