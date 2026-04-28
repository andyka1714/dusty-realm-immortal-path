import React from "react";
import clsx from "clsx";

interface GameHintBubbleProps {
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  trigger?: "default" | "tier";
}

export const GameHintBubble: React.FC<GameHintBubbleProps> = ({
  eyebrow,
  children,
  className,
  trigger = "default",
}) => (
  <div
    className={clsx(
      "pointer-events-none absolute z-[100] overflow-hidden rounded-xl border border-amber-900/35 bg-[linear-gradient(180deg,rgba(28,22,12,0.98)_0%,rgba(10,10,10,0.98)_100%)] px-3 py-2 text-xs text-stone-200 shadow-[0_18px_40px_rgba(0,0,0,0.45)] opacity-0 transition-opacity",
      trigger === "tier" ? "group-hover/tier:opacity-100" : "group-hover:opacity-100",
      className
    )}
  >
    <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent" />
    <div className="pointer-events-none absolute left-2 top-2 h-3 w-3 rounded-tl-[6px] border-l border-t border-amber-400/25" />
    <div className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 rounded-br-[6px] border-b border-r border-stone-500/20" />
    <div className="relative z-10">
      {eyebrow && (
        <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.24em] text-stone-500">
          {eyebrow}
        </div>
      )}
      <div className="whitespace-nowrap tracking-[0.08em]">
      {children}
      </div>
    </div>
  </div>
);
