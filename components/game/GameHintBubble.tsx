import React from "react";
import clsx from "clsx";

interface GameHintBubbleProps {
  children: React.ReactNode;
  className?: string;
}

export const GameHintBubble: React.FC<GameHintBubbleProps> = ({
  children,
  className,
}) => (
  <div
    className={clsx(
      "pointer-events-none absolute z-[100] rounded-xl border border-amber-900/35 bg-[linear-gradient(180deg,rgba(28,22,12,0.98)_0%,rgba(10,10,10,0.98)_100%)] px-3 py-2 text-xs text-stone-200 shadow-[0_18px_40px_rgba(0,0,0,0.45)] opacity-0 transition-opacity group-hover:opacity-100",
      className
    )}
  >
    <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent" />
    <div className="relative z-10 whitespace-nowrap tracking-[0.08em]">
      {children}
    </div>
  </div>
);
