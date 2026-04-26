"use client";

import { useMemo, useState } from "react";
import {
  HeartHandshake,
  Laugh,
  ShieldAlert,
  Sparkles,
  Star,
  Sun,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

type Category = "family" | "daily" | "comfort" | "humor" | "emergency";

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
};

const categories: CategoryMeta[] = [
  {
    id: "family",
    label: "Family",
    chip: "bg-primary-fixed-dim/40 text-on-primary-fixed-variant",
  },
  {
    id: "daily",
    label: "Daily Needs",
    chip: "bg-secondary-fixed-dim/40 text-on-secondary-fixed-variant",
  },
  {
    id: "comfort",
    label: "Comfort",
    chip: "bg-tertiary-fixed-dim/40 text-on-tertiary-fixed-variant",
  },
  {
    id: "humor",
    label: "Humor",
    chip: "bg-tertiary-fixed/60 text-on-tertiary-fixed-variant",
  },
  {
    id: "emergency",
    label: "Emergency",
    chip: "bg-error-container text-on-error-container",
  },
];

const categoryById: Record<Category, CategoryMeta> = categories.reduce(
  (acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  },
  {} as Record<Category, CategoryMeta>,
);

const initialPhrases: Phrase[] = [
  {
    id: "p-1",
    text: "I love you all so much.",
    category: "family",
    isFavorite: false,
  },
  {
    id: "p-2",
    text: "Tell my daughter I'm proud of who she's become.",
    category: "family",
    isFavorite: false,
  },
  {
    id: "p-3",
    text: "You are my whole world.",
    category: "family",
    isFavorite: false,
  },
  {
    id: "p-4",
    text: "Could I have some water, please?",
    category: "daily",
    isFavorite: false,
  },
  {
    id: "p-5",
    text: "I'm feeling a bit tired today.",
    category: "daily",
    isFavorite: false,
  },
  {
    id: "p-6",
    text: "Can you turn the lights down a little?",
    category: "daily",
    isFavorite: false,
  },
  {
    id: "p-7",
    text: "Everything is going to be alright.",
    category: "comfort",
    isFavorite: false,
  },
  {
    id: "p-8",
    text: "I'm right here. You're not alone.",
    category: "comfort",
    isFavorite: false,
  },
  {
    id: "p-9",
    text: "I'm not slow — I'm just savoring the moment.",
    category: "humor",
    isFavorite: false,
  },
  {
    id: "p-10",
    text: "Please call someone — I think I need help.",
    category: "emergency",
    isFavorite: false,
  },
];

const aiSuggestionsByCategory: Record<Category, string[]> = {
  family: [
    "I'm so proud of who you've become.",
    "Family is the heart of everything I value.",
    "I'll always be here, in some way, when you need me.",
  ],
  daily: [
    "Could you pass me my glasses, please?",
    "I'd like to sit by the window today.",
    "Let's have tea at three, like always.",
  ],
  comfort: [
    "Take your time. We're not in any rush.",
    "It's okay to rest. You've done enough today.",
    "We'll get through this, together.",
  ],
  humor: [
    "I may be slow, but I'm well-rehearsed.",
    "If you're reading this, I'm probably already laughing.",
    "Old age and treachery beat youth and skill, every time.",
  ],
  emergency: [
    "Please call my doctor — their number is on the fridge.",
    "I need help. I think I should sit down.",
    "Get my partner. They'll know what to do.",
  ],
};

const SUGGESTION_DELAY_MS = 1500;

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>(initialPhrases);
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

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
    };
    for (const phrase of phrases) {
      base[phrase.category] += 1;
    }
    return base;
  }, [phrases]);

  const toggleFavorite = (id: string) => {
    setPhrases((prev) =>
      prev.map((phrase) =>
        phrase.id === id
          ? { ...phrase, isFavorite: !phrase.isFavorite }
          : phrase,
      ),
    );
  };

  const deletePhrase = (id: string) => {
    setPhrases((prev) => prev.filter((phrase) => phrase.id !== id));
  };

  const requestSuggestions = async () => {
    if (isThinking) return;
    setIsThinking(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, SUGGESTION_DELAY_MS));
      const targetCategory: Category =
        activeFilter === "all" ? "family" : activeFilter;
      const suggestions = aiSuggestionsByCategory[targetCategory];
      const newPhrases: Phrase[] = suggestions.map((text) => ({
        id: makeId(),
        text,
        category: targetCategory,
        isFavorite: false,
      }));
      setPhrases((prev) => [...newPhrases, ...prev]);
      if (activeFilter === "all" || activeFilter !== targetCategory) {
        setActiveFilter(targetCategory);
      }
      setFavoritesOnly(false);
    } finally {
      setIsThinking(false);
    }
  };

  const targetCategoryLabel =
    activeFilter === "all" ? "Family" : categoryById[activeFilter].label;

  return (
    <section className="flex w-full flex-col gap-lg">
      <header
        className="animate-slidein flex flex-col gap-sm"
        style={{ animationDelay: "300ms" }}
      >
        <h1 className="text-headline-lg text-on-surface">Your Phrase Bank</h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          Capture and organize the expressions, wisdom, and daily requests that
          make up your unique voice.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Filter phrases by category"
        className="animate-slidein flex flex-wrap items-center gap-sm"
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
          />
        ))}
        <button
          type="button"
          onClick={() => setFavoritesOnly((prev) => !prev)}
          aria-pressed={favoritesOnly}
          className={cn(
            "flex min-h-[44px] items-center gap-xs whitespace-nowrap rounded-full px-md py-xs text-label-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            favoritesOnly
              ? "bg-tertiary text-on-tertiary"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-dim",
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

      <div
        className="animate-slidein rounded-xl border border-outline-variant/30 bg-surface-container-low p-md shadow-ambient"
        style={{ animationDelay: "700ms" }}
      >
        <div className="flex flex-col items-start justify-between gap-sm md:flex-row md:items-center">
          <div className="flex flex-col gap-xs">
            <h2 className="text-headline-sm text-on-surface">
              Need ideas for the {targetCategoryLabel} category?
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Get three pre-written suggestions inspired by your routines and
              relationships.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
            onClick={() => void requestSuggestions()}
            disabled={isThinking}
            aria-busy={isThinking}
          >
            {isThinking ? "Thinking…" : "Ask AI for Suggestions"}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState favoritesOnly={favoritesOnly} />
      ) : (
        <ul className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((phrase, index) => (
            <PhraseCard
              key={phrase.id}
              phrase={phrase}
              animationDelay={`${900 + index * 200}ms`}
              onToggleFavorite={() => toggleFavorite(phrase.id)}
              onDelete={() => deletePhrase(phrase.id)}
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
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] items-center gap-xs whitespace-nowrap rounded-full px-md py-xs text-label-md transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-dim hover:text-on-surface",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-xs text-[11px] font-semibold",
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
  onToggleFavorite,
  onDelete,
}: {
  phrase: Phrase;
  animationDelay: string;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const meta = categoryById[phrase.category];
  return (
    <li
      className="animate-slidein ambient-shadow flex min-h-[180px] flex-col rounded-xl border border-outline-variant/20 bg-surface p-md transition-shadow hover:shadow-ambient-hover"
      style={{ animationDelay }}
    >
      <div className="mb-sm flex items-start justify-between gap-sm">
        <span
          className={cn(
            "inline-flex items-center gap-xs rounded-md px-sm py-xs text-label-md",
            meta.chip,
          )}
        >
          <CategoryGlyph category={phrase.category} />
          {meta.label}
        </span>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={phrase.isFavorite}
          aria-label={
            phrase.isFavorite ? "Remove from favorites" : "Mark as favorite"
          }
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            phrase.isFavorite
              ? "text-tertiary hover:bg-tertiary-fixed/40"
              : "text-outline hover:bg-surface-container hover:text-tertiary",
          )}
        >
          <Star
            className={cn("h-5 w-5", phrase.isFavorite && "fill-current")}
            aria-hidden="true"
          />
        </button>
      </div>

      <p className="flex-grow py-sm text-headline-sm text-on-surface">
        &ldquo;{phrase.text}&rdquo;
      </p>

      <div className="mt-auto flex items-center justify-end border-t border-surface-variant pt-sm">
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
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </button>
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
            : ShieldAlert;
  return <Icon className="h-3.5 w-3.5" aria-hidden="true" />;
}

function EmptyState({ favoritesOnly }: { favoritesOnly: boolean }) {
  return (
    <div className="flex flex-col items-center gap-sm rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-lowest p-lg text-center">
      <p className="text-headline-sm text-on-surface">
        {favoritesOnly
          ? "No favorites in this view yet."
          : "Nothing here yet."}
      </p>
      <p className="max-w-md text-body-sm text-on-surface-variant">
        {favoritesOnly
          ? "Tap the star on any phrase to keep it close at hand."
          : "Switch categories or ask the assistant to suggest a few starter phrases."}
      </p>
    </div>
  );
}
