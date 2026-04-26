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
import { useRequireUser } from "@/lib/useRequireUser";
import { clearSession, getVoiceId } from "@/lib/userSession";

type Category = "family" | "daily" | "comfort" | "humor" | "emergency" | "personal";

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

const categoryMeta: Record<Category, { label: string; icon: LucideIcon; iconClass: string }> = {
  family: { label: "Family", icon: HeartHandshake, iconClass: "text-on-primary-fixed-variant" },
  daily: { label: "Daily Needs", icon: Sun, iconClass: "text-on-secondary-fixed-variant" },
  comfort: { label: "Comfort", icon: HeartHandshake, iconClass: "text-on-tertiary-fixed-variant" },
  humor: { label: "Humor", icon: Laugh, iconClass: "text-tertiary" },
  emergency: { label: "Emergency", icon: ShieldAlert, iconClass: "text-error" },
  personal: { label: "Personal", icon: User, iconClass: "text-primary" },
};

export default function DashboardPage() {
  const router = useRouter();
  const userId = useRequireUser();

  const [voiceStatus, setVoiceStatus] = useState<string>("unknown");
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [communicationStyle, setCommunicationStyle] = useState<string | null>(null);
  const [phrases, setPhrases] = useState<PhraseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          setVoiceId(userData.user.voiceId ?? getVoiceId());
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
    void fetchData();
  }, [fetchData]);

  const summary: SummaryRow[] = Object.entries(categoryMeta).map(([id, meta]) => ({
    id: id as Category,
    ...meta,
    count: phrases.filter((p) => p.category === id).length,
  })).filter((row) => row.count > 0);

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

  const handleDeleteAll = async () => {
    if (!confirm("Delete all your data? This cannot be undone.")) return;
    if (userId) {
      try {
        await fetch(`/api/user/${userId}`, { method: "DELETE" });
      } catch {
        // best-effort server-side delete
      }
    }
    clearSession();
    router.replace("/");
  };

  const handleRerecord = () => {
    router.push("/record");
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
        <h1 className="text-headline-lg text-on-surface">
          Profile & Settings
        </h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          Manage your voice identity, review what you've saved, and control
          your privacy preferences.
        </p>
      </header>

      <article className="flex flex-col gap-md rounded-xl border border-outline-variant/30 bg-surface-container p-md shadow-ambient md:p-lg">
        <div className="flex items-center gap-sm">
          <span className={`flex h-12 w-12 items-center justify-center rounded-full ${isVoiceReady ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
            {isVoiceReady ? (
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Clock className="h-6 w-6" aria-hidden="true" />
            )}
          </span>
          <div className="flex flex-col">
            <h2 className="text-headline-sm text-on-surface">
              Voice Status: {isVoiceReady ? "Ready" : voiceStatus === "none" ? "Not recorded" : voiceStatus}
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              {isVoiceReady
                ? "Your private voice prototype is preserved and ready to use."
                : "Record your voice to get started."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-sm md:grid-cols-3">
          {voiceId ? <InfoTile label="Voice ID" value={voiceId} mono /> : null}
          {communicationStyle ? (
            <InfoTile label="Communication tone" value={communicationStyle} />
          ) : null}
        </div>

        <Button
          variant="primary"
          size="lg"
          leftIcon={<Mic className="h-5 w-5" aria-hidden="true" />}
          onClick={handleRerecord}
          className="self-start"
        >
          {isVoiceReady ? "Re-record voice" : "Record voice"}
        </Button>
      </article>

      <article className="flex flex-col gap-md rounded-xl border border-outline-variant/20 bg-surface-container-low p-md shadow-ambient md:p-lg">
        <div className="flex flex-wrap items-center justify-between gap-sm">
          <div className="flex flex-col gap-xs">
            <h2 className="text-headline-sm text-on-surface">
              Phrase Bank Summary
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              {totalPhrases} phrase{totalPhrases !== 1 ? "s" : ""} saved
              {summary.length > 0 ? ` across ${summary.length} categor${summary.length !== 1 ? "ies" : "y"}` : ""}.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Download className="h-5 w-5" aria-hidden="true" />}
            onClick={handleExport}
            disabled={phrases.length === 0}
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
            No phrases saved yet. Head to the Phrases page to start building your bank.
          </p>
        )}
      </article>

      <article className="flex flex-col gap-md rounded-xl border border-error/30 bg-error-container/30 p-md md:p-lg">
        <div className="flex items-start gap-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-xs">
            <h2 className="text-headline-sm text-on-surface">
              Data & Privacy
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Your data is private. You have full control to remove your voice
              clone, your phrase bank, or everything we've stored for you.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-sm sm:flex-row">
          <Button
            variant="destructive"
            size="md"
            leftIcon={<Trash2 className="h-5 w-5" aria-hidden="true" />}
            onClick={handleDeleteAll}
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
    <div className="flex flex-col gap-xs rounded-xl bg-surface p-md">
      <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <span
        className={
          mono
            ? "font-mono text-body-md text-on-surface"
            : "text-body-lg text-on-surface"
        }
      >
        {value}
      </span>
    </div>
  );
}
