"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Download,
  HeartHandshake,
  Laugh,
  Mic,
  ShieldAlert,
  Sun,
  Trash2,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

type ConfirmTarget = "voice" | "all" | null;

type SummaryRow = {
  id: string;
  label: string;
  count: number;
  icon: LucideIcon;
  iconClass: string;
};

const phraseSummary: SummaryRow[] = [
  {
    id: "family",
    label: "Family",
    count: 4,
    icon: HeartHandshake,
    iconClass: "text-on-primary-fixed-variant",
  },
  {
    id: "daily",
    label: "Daily Needs",
    count: 3,
    icon: Sun,
    iconClass: "text-on-secondary-fixed-variant",
  },
  {
    id: "comfort",
    label: "Comfort",
    count: 2,
    icon: HeartHandshake,
    iconClass: "text-on-tertiary-fixed-variant",
  },
  {
    id: "humor",
    label: "Humor",
    count: 1,
    icon: Laugh,
    iconClass: "text-tertiary",
  },
  {
    id: "emergency",
    label: "Emergency",
    count: 1,
    icon: ShieldAlert,
    iconClass: "text-error",
  },
];

const VOICE_ID = "mock_voice_123";
const COMMUNICATION_TONE = "Warm & expressive";
const LAST_UPDATED = "October 24, 2026";

export default function DashboardPage() {
  const totalPhrases = phraseSummary.reduce((sum, row) => sum + row.count, 0);

  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);

  const handleDeleteVoice = () => {
    console.log("[dashboard] (mock) Delete Voice Data confirmed.");
    setConfirmTarget(null);
  };

  const handleDeleteAll = () => {
    console.log("[dashboard] (mock) Delete All Data confirmed.");
    setConfirmTarget(null);
  };

  const handleExport = () => {
    console.log("[dashboard] (mock) Export Phrase Bank clicked.");
  };

  const handleRerecord = () => {
    console.log("[dashboard] (mock) Re-record Voice clicked.");
  };

  return (
    <section className="flex w-full flex-col gap-lg">
      <header className="flex flex-col gap-sm">
        <h1 className="text-headline-lg text-on-surface">
          Profile &amp; Settings
        </h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          Manage your voice identity, review what you've saved, and control
          your privacy preferences.
        </p>
      </header>

      <article className="flex flex-col gap-md rounded-xl border border-outline-variant/30 bg-surface-container p-md shadow-ambient md:p-lg">
        <div className="flex items-center gap-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <h2 className="text-headline-sm text-on-surface">
              Voice Status: Ready
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Your private voice prototype is preserved and ready to use.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-sm md:grid-cols-3">
          <InfoTile label="Voice ID" value={VOICE_ID} mono />
          <InfoTile label="Communication tone" value={COMMUNICATION_TONE} />
          <InfoTile label="Last updated" value={LAST_UPDATED} />
        </div>

        <Button
          variant="primary"
          size="lg"
          leftIcon={<Mic className="h-5 w-5" aria-hidden="true" />}
          onClick={handleRerecord}
          className="self-start"
        >
          Re-record voice
        </Button>
      </article>

      <article className="flex flex-col gap-md rounded-xl border border-outline-variant/20 bg-surface-container-low p-md shadow-ambient md:p-lg">
        <div className="flex flex-wrap items-center justify-between gap-sm">
          <div className="flex flex-col gap-xs">
            <h2 className="text-headline-sm text-on-surface">
              Phrase Bank Summary
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              {totalPhrases} phrases saved across {phraseSummary.length}{" "}
              categories.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Download className="h-5 w-5" aria-hidden="true" />}
            onClick={handleExport}
          >
            Export phrase bank
          </Button>
        </div>

        <ul className="grid grid-cols-1 gap-sm md:grid-cols-2 lg:grid-cols-3">
          {phraseSummary.map((row) => {
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
      </article>

      <article className="flex flex-col gap-md rounded-xl border border-error/30 bg-error-container/30 p-md md:p-lg">
        <div className="flex items-start gap-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-xs">
            <h2 className="text-headline-sm text-on-surface">
              Data &amp; Privacy
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Your data is private. You have full control to remove your voice
              clone, your phrase bank, or everything we've stored for you.
            </p>
          </div>
        </div>

        <DestructiveAction
          label="Delete voice data"
          description="Removes your cloned voice. Your saved phrases stay."
          isOpen={confirmTarget === "voice"}
          isAnotherOpen={confirmTarget !== null && confirmTarget !== "voice"}
          onRequest={() => setConfirmTarget("voice")}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={handleDeleteVoice}
        />
        <DestructiveAction
          label="Delete all data"
          description="Permanently removes your voice, phrases, and profile. This cannot be undone."
          confirmLabel="Yes, delete everything"
          isOpen={confirmTarget === "all"}
          isAnotherOpen={confirmTarget !== null && confirmTarget !== "all"}
          onRequest={() => setConfirmTarget("all")}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={handleDeleteAll}
        />
      </article>
    </section>
  );
}

function DestructiveAction({
  label,
  description,
  confirmLabel = "Yes, delete",
  isOpen,
  isAnotherOpen,
  onRequest,
  onCancel,
  onConfirm,
}: {
  label: string;
  description: string;
  confirmLabel?: string;
  isOpen: boolean;
  isAnotherOpen: boolean;
  onRequest: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (isOpen) {
    return (
      <div
        role="alertdialog"
        aria-label={`Confirm: ${label}`}
        className="flex flex-col gap-sm rounded-xl border-2 border-error/50 bg-error-container/60 p-md"
      >
        <div className="flex flex-col gap-xs">
          <p className="text-label-lg text-on-error-container">
            Are you sure you want to {label.toLowerCase()}?
          </p>
          <p className="text-body-sm text-on-error-container/80">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-sm sm:flex-row">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Trash2 className="h-5 w-5" aria-hidden="true" />}
            onClick={onConfirm}
            className="bg-error text-on-error hover:bg-error/90 focus-visible:ring-error"
            autoFocus
          >
            {confirmLabel}
          </Button>
          <Button
            variant="ghost"
            size="md"
            leftIcon={<X className="h-5 w-5" aria-hidden="true" />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xs">
      <Button
        variant="destructive"
        size="md"
        leftIcon={<Trash2 className="h-5 w-5" aria-hidden="true" />}
        onClick={onRequest}
        disabled={isAnotherOpen}
        className={cn("self-start", isAnotherOpen && "opacity-50")}
      >
        {label}
      </Button>
      <p className="text-body-sm text-on-surface-variant">{description}</p>
    </div>
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
