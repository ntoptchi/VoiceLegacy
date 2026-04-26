"use client";

import { cn } from "@/lib/cn";

const BAR_COUNT = 5;

export function Waveform({
  active = false,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center gap-[3px]", className)}
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block w-[3px] rounded-full bg-current transition-all",
            active ? "animate-[waveform_0.8s_ease-in-out_infinite]" : "h-2",
          )}
          style={
            active
              ? {
                  height: "100%",
                  animationDelay: `${i * 0.12}s`,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
