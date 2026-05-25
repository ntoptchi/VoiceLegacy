"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HeartHandshake,
  Laugh,
  Loader2,
  Pause,
  Play,
  ShieldAlert,
  Sparkles,
  Star,
  Sun,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useRequireUser } from "@/lib/useRequireUser";

type Category =
  | "family"
  | "daily"
  | "comfort"
  | "humor"
  | "emergency"
  | "personal";

type Phrase = {
  id: string;
  text: string;
  category: Category;
  isFavorite: boolean;
};

type CategoryMeta = {
  id: Category;
  label: string;
  chip: string;
  dot: string;
  cardBorder: string;
};

const categories: CategoryMeta[] = [
  {
    id: "family",
    label: "Family",
    chip: "bg-primary-fixed-dim/40 text-on-primary-fixed-variant",
    dot: "bg-emerald-400",
    cardBorder: "border-l-emerald-400",
  },
  {
    id: "daily",
    label: "Daily Needs",
    chip: "bg-secondary-fixed-dim/40 text-on-secondary-fixed-variant",
    dot: "bg-sky-400",
    cardBorder: "border-l-sky-400",
  },
  {
    id: "comfort",
    label: "Comfort",
    chip: "bg-tertiary-fixed-dim/40 text-on-tertiary-fixed-variant",
    dot: "bg-violet-400",
    cardBorder: "border-l-violet-400",
  },
  {
    id: "humor",
    label: "Humor",
    chip: "bg-tertiary-fixed/60 text-on-tertiary-fixed-variant",
    dot: "bg-amber-400",
    cardBorder: "border-l-amber-400",
  },
  {
    id: "emergency",
    label: "Emergency",
    chip: "bg-error-container text-on-error-container",
    dot: "bg-rose-400",
    cardBorder: "border-l-rose-400",
  },
  {
    id: "personal",
    label: "Personal",
    chip: "bg-primary-fixed/40 text-on-primary-fixed-variant",
    dot: "bg-teal-400",
    cardBorder: "border-l-teal-400",
  },
];

const categoryById: Record<Category, CategoryMeta> = categories.reduce(
  (acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  },
  {} as Record<Category, CategoryMeta>,
);

const STARTER_PHRASES: Record<Category, string[]> = {
  family: [
    "I love you more than you know.",
    "Tell the kids I'm proud of them.",
    "Thank you for being here with me.",
  ],
  daily: [
    "Could I have some water, please?",
    "I'd like to sit up for a while.",
    "Thank you for helping me.",
  ],
  comfort: [
    "Take a deep breath with me.",
    "I'm right here with you.",
    "Everything is going to be okay.",
  ],
  humor: [
    "Well, that could have gone smoother.",
    "Don't let me lose my reputation for timing.",
    "Some things really do write themselves.",
  ],
  emergency: [
    "I need help right now.",
    "Please call my doctor.",
    "Get my family for me.",
  ],
  personal: [
    "Hi, sweetheart.",
    "I'm so glad you came today.",
    "Love you, kiddo.",
  ],
};

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function PhrasesPage() {
  const appUser = useRequireUser();
  const userId = appUser?.id ?? null;
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setPlayingId(null);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const playPhrase = useCallback(
    async (phraseId: string, text: string) => {
      const voiceId = appUser?.voiceId;
      if (!voiceId) return;

      if (playingId === phraseId) {
        cleanupAudio();
        return;
      }

      cleanupAudio();
      setLoadingAudioId(phraseId);

      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            (data as { error?: string }).error ?? `TTS failed (${res.status})`,
          );
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => {
          setPlayingId(phraseId);
          setLoadingAudioId(null);
        };
        audio.onended = () => {
          setPlayingId(null);
          URL.revokeObjectURL(url);
          audioUrlRef.current = null;
        };
        audio.onerror = () => {
          setPlayingId(null);
          setLoadingAudioId(null);
          URL.revokeObjectURL(url);
          audioUrlRef.current = null;
        };

        await audio.play();
      } catch {
        setLoadingAudioId(null);
      }
    },
    [appUser?.voiceId, playingId, cleanupAudio],
  );

  const fetchPhrases = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/phrases/${userId}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && Array.isArray(data.phrases)) {
        setPhrases(
          data.phrases.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            text: p.text as string,
            category: p.category as Category,
            isFavorite: Boolean(p.isFavorite),
          })),
        );
      }
    } catch {
      // silently fallback to empty
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPhrases();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchPhrases]);

  const filtered = useMemo(() => {
    return phrases.filter((phrase) => {
      if (activeFilter !== "all" && phrase.category !== activeFilter) {
        return false;
      }
      if (favoritesOnly && !phrase.isFavorite) {
        return false;
      }
      return true;
    });
  }, [phrases, activeFilter, favoritesOnly]);

  const counts = useMemo(() => {
    const base: Record<Category | "all", number> = {
      all: phrases.length,
      family: 0,
      daily: 0,
      comfort: 0,
      humor: 0,
      emergency: 0,
      personal: 0,
    };
    for (const phrase of phrases) {
      base[phrase.category] = (base[phrase.category] ?? 0) + 1;
    }
    return base;
  }, [phrases]);

  const toggleFavorite = (id: string) => {
    const target = phrases.find((p) => p.id === id);
    if (!target || !userId) return;
    const next = !target.isFavorite;
    setPhrases((prev) =>
      prev.map((phrase) =>
        phrase.id === id ? { ...phrase, isFavorite: next } : phrase,
      ),
    );
    fetch(`/api/phrases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    }).catch(() => {
      setPhrases((prev) =>
        prev.map((phrase) =>
          phrase.id === id ? { ...phrase, isFavorite: !next } : phrase,
        ),
      );
    });
  };

  const deletePhrase = async (id: string) => {
    if (!userId) return;
    setPhrases((prev) => prev.filter((phrase) => phrase.id !== id));
    try {
      await fetch(`/api/phrases/${id}`, {
        method: "DELETE",
      });
    } catch {
      void fetchPhrases();
    }
  };

  const addPhrase = async (text: string, category: Category) => {
    if (!userId) return;
    const optimistic: Phrase = {
      id: makeId(),
      text,
      category,
      isFavorite: false,
    };
    setPhrases((prev) => [optimistic, ...prev]);

    try {
      const res = await fetch("/api/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.phrase) {
        setPhrases((prev) =>
          prev.map((p) =>
            p.id === optimistic.id
              ? { ...p, id: data.phrase.id as string }
              : p,
          ),
        );
      }
    } catch {
      void fetchPhrases();
    }
  };

  const requestSuggestions = async () => {
    if (isThinking) return;
    setIsThinking(true);
    setError(null);

    const targetCategory: Category =
      activeFilter === "all" ? "family" : activeFilter;

    try {
      const res = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: targetCategory, count: 3 }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !Array.isArray(data.suggestions)) {
        throw new Error(data.error ?? "Could not get suggestions.");
      }

      for (const text of data.suggestions as string[]) {
        await addPhrase(text, targetCategory);
      }

      if (activeFilter === "all") {
        setActiveFilter(targetCategory);
      }
      setFavoritesOnly(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get suggestions.",
      );
    } finally {
      setIsThinking(false);
    }
  };

  const targetCategoryLabel =
    activeFilter === "all"
      ? "Family"
      : categoryById[activeFilter]?.label ?? activeFilter;
  const starterCategory: Category =
    activeFilter === "all" ? "family" : activeFilter;
  const starterPhrases = STARTER_PHRASES[starterCategory];

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-lg">
      <header
        className="animate-slidein flex flex-col gap-sm text-center"
        style={{ animationDelay: "300ms" }}
      >
        <h1 className="text-3xl font-bold leading-tight text-on-surface md:text-headline-lg">
          Your Phrase Bank
        </h1>
        <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
          Capture and organize the expressions, wisdom, and daily requests that
          make up your unique voice.
        </p>
      </header>

      {/* Category filters with color dots */}
      <div
        role="tablist"
        aria-label="Filter phrases by category"
        className="animate-slidein flex flex-wrap items-start gap-xs rounded-xl border border-outline-variant/20 bg-surface-container-low p-sm sm:items-center sm:gap-sm"
        style={{ animationDelay: "500ms" }}
      >
        <FilterTab
          label="All"
          count={counts.all}
          isActive={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
        />
        {categories.map((category) => (
          <FilterTab
            key={category.id}
            label={category.label}
            count={counts[category.id]}
            isActive={activeFilter === category.id}
            onClick={() => setActiveFilter(category.id)}
            dotColor={category.dot}
          />
        ))}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFavoritesOnly((prev) => !prev)}
            aria-pressed={favoritesOnly}
            className={cn(
              "flex w-full items-center justify-center gap-xs rounded-full px-md py-xs text-label-md transition-colors sm:w-auto",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              favoritesOnly
                ? "bg-tertiary text-on-tertiary"
                : "bg-surface text-on-surface-variant hover:bg-surface-dim",
            )}
          >
            <Star
              className={cn(
                "h-4 w-4",
                favoritesOnly && "fill-current text-on-tertiary",
              )}
              aria-hidden="true"
            />
            Favorites only
          </button>
        </div>
      </div>

      {/* AI Suggestions — secondary, compact */}
      <div
        className="animate-slidein flex flex-wrap items-center justify-between gap-sm rounded-lg border border-outline-variant/20 bg-surface-container-low px-md py-sm"
        style={{ animationDelay: "700ms" }}
      >
        <p className="text-body-sm text-on-surface-variant">
          Need ideas for <span className="font-semibold text-on-surface">{targetCategoryLabel}</span>?
        </p>
        <button
          type="button"
          onClick={() => void requestSuggestions()}
          disabled={isThinking}
          aria-busy={isThinking}
          className={cn(
            "flex items-center gap-xs rounded-full px-md py-xs text-label-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "bg-primary/10 text-primary hover:bg-primary/20",
            isThinking && "cursor-wait opacity-60",
          )}
        >
          {isThinking ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {isThinking ? "Thinking..." : "AI Suggestions"}
        </button>
        {error ? <p className="w-full text-body-sm text-error">{error}</p> : null}
      </div>

      {phrases.length === 0 ? (
        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-md shadow-ambient">
          <div className="flex flex-col gap-xs">
            <h2 className="text-headline-sm text-on-surface">
              Starter phrases for {categoryById[starterCategory].label}
            </h2>
            <p className="max-w-2xl text-body-sm text-on-surface-variant">
              Local demo mode uses a curated starter set so the page stays
              useful even before API keys are configured.
            </p>
          </div>

          <ul className="mt-md grid grid-cols-1 gap-sm md:grid-cols-3">
            {starterPhrases.map((text) => (
              <li
                key={text}
                className="flex min-h-[140px] flex-col justify-between rounded-xl border border-outline-variant/20 bg-surface p-md"
              >
                <p className="font-serif text-xl italic leading-snug text-on-surface">
                  &ldquo;{text}&rdquo;
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void addPhrase(text, starterCategory)}
                  className="mt-md self-stretch sm:self-start"
                >
                  Save phrase
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState favoritesOnly={favoritesOnly} />
      ) : (
        <ul className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((phrase, index) => (
            <PhraseCard
              key={phrase.id}
              phrase={phrase}
              animationDelay={`${900 + index * 200}ms`}
              isPlaying={playingId === phrase.id}
              isLoadingAudio={loadingAudioId === phrase.id}
              hasVoice={!!appUser?.voiceId}
              onPlay={() => void playPhrase(phrase.id, phrase.text)}
              onToggleFavorite={() => toggleFavorite(phrase.id)}
              onDelete={() => void deletePhrase(phrase.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function FilterTab({
  label,
  count,
  isActive,
  onClick,
  dotColor,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  dotColor?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "flex min-h-10 items-center gap-xs rounded-full px-sm py-xs text-label-md transition-colors sm:min-h-11 sm:px-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "bg-primary text-on-primary"
          : "bg-surface text-on-surface-variant hover:bg-surface-dim hover:text-on-surface",
      )}
    >
      {dotColor ? (
        <span
          className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotColor)}
          aria-hidden="true"
        />
      ) : null}
      {label}
      <span
        className={cn(
          "rounded-full px-xs py-[2px] text-[11px] font-semibold leading-none",
          isActive
            ? "bg-on-primary/20 text-on-primary"
            : "bg-surface-variant text-on-surface-variant",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function PhraseCard({
  phrase,
  animationDelay,
  isPlaying,
  isLoadingAudio,
  hasVoice,
  onPlay,
  onToggleFavorite,
  onDelete,
}: {
  phrase: Phrase;
  animationDelay: string;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  hasVoice: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const meta = categoryById[phrase.category];
  return (
    <li
      className={cn(
        "animate-slidein flex min-h-[180px] flex-col rounded-xl border-l-4 border bg-surface p-md transition-shadow hover:shadow-ambient-hover",
        meta?.cardBorder ?? "border-l-outline-variant",
        isPlaying
          ? "border-primary/50 shadow-ambient ring-1 ring-primary/20"
          : "border-outline-variant/20 shadow-ambient",
      )}
      style={{ animationDelay }}
    >
      <div className="mb-sm flex items-start justify-between gap-sm">
        <div className="flex items-center gap-xs">
          <span
            className={cn(
              "inline-flex items-center gap-xs rounded-md px-sm py-xs text-label-md",
              meta?.chip ?? "bg-surface-container text-on-surface-variant",
            )}
          >
            <CategoryGlyph category={phrase.category} />
            {meta?.label ?? phrase.category}
          </span>
          {isPlaying ? (
            <Volume2
              className="h-4 w-4 animate-pulse text-primary"
              aria-label="Playing"
            />
          ) : null}
        </div>
      </div>

      {/* Phrase text — serif, larger, italic for emotional weight */}
      <p className="flex-grow py-sm font-serif text-2xl italic leading-snug text-on-surface md:text-[1.65rem]">
        &ldquo;{phrase.text}&rdquo;
      </p>

      {/* Actions row: Play | Favorite | Delete */}
      <div className="mt-auto flex items-center gap-xs border-t border-surface-variant pt-sm">
        {hasVoice ? (
          <button
            type="button"
            onClick={onPlay}
            disabled={isLoadingAudio}
            aria-label={
              isLoadingAudio
                ? "Generating audio"
                : isPlaying
                  ? "Pause playback"
                  : "Play phrase in your voice"
            }
            className={cn(
              "flex items-center gap-xs rounded-full px-sm py-xs text-label-md transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              isLoadingAudio
                ? "cursor-wait text-on-surface-variant"
                : isPlaying
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary",
            )}
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Generating...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-4 w-4" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>Play</span>
              </>
            )}
          </button>
        ) : (
          <span />
        )}

        <div className="ml-auto flex items-center gap-xs">
          {/* Favorite — prominent, always visible */}
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={phrase.isFavorite}
            aria-label={
              phrase.isFavorite ? "Remove from favorites" : "Mark as favorite"
            }
            className={cn(
              "flex items-center gap-xs rounded-full px-sm py-xs text-label-md transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              phrase.isFavorite
                ? "bg-amber-500/15 text-amber-500"
                : "text-on-surface-variant hover:bg-amber-500/10 hover:text-amber-500",
            )}
          >
            <Star
              className={cn("h-4 w-4", phrase.isFavorite && "fill-current")}
              aria-hidden="true"
            />
            <span>{phrase.isFavorite ? "Saved" : "Favorite"}</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete this phrase"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              "hover:bg-error-container hover:text-error",
            )}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}

function CategoryGlyph({ category }: { category: Category }) {
  const Icon =
    category === "family"
      ? HeartHandshake
      : category === "daily"
        ? Sun
        : category === "comfort"
          ? HeartHandshake
          : category === "humor"
            ? Laugh
            : category === "personal"
              ? User
              : ShieldAlert;
  return <Icon className="h-3.5 w-3.5" aria-hidden="true" />;
}

function EmptyState({ favoritesOnly }: { favoritesOnly: boolean }) {
  return (
    <div className="flex w-full flex-col items-center gap-sm rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-lowest p-lg text-center">
      <p className="text-headline-sm text-on-surface">
        {favoritesOnly
          ? "No favorites in this view yet."
          : "Nothing here yet."}
      </p>
      <p className="w-full max-w-[28rem] text-body-sm leading-relaxed text-on-surface-variant">
        {favoritesOnly
          ? "Tap the star on any phrase to keep it close at hand."
          : "Switch categories or ask the assistant to suggest a few starter phrases."}
      </p>
    </div>
  );
}
