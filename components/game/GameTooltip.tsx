import React from "react";
import clsx from "clsx";
import { GameTitleStack } from "./GameTitleStack";

interface GameTooltipProps {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  titleClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  widthClassName?: string;
  style?: React.CSSProperties;
}

export const GameTooltip: React.FC<GameTooltipProps> = ({
  eyebrow,
  title,
  titleClassName,
  footer,
  children,
  className,
  widthClassName = "w-72",
  style,
}) => (
  <div
    className={clsx(
      "fixed z-[9999] overflow-hidden rounded-[18px] border border-amber-900/35 bg-[linear-gradient(180deg,rgba(28,22,12,0.98)_0%,rgba(10,10,10,0.98)_100%)] p-4 text-stone-300 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-none",
      widthClassName,
      className
    )}
    style={style}
  >
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent" />
      <div className="absolute left-3 top-3 h-4 w-4 rounded-tl-[8px] border-l border-t border-amber-400/30" />
      <div className="absolute right-3 top-3 h-4 w-4 rounded-tr-[8px] border-r border-t border-amber-400/30" />
      <div className="absolute bottom-3 left-3 h-4 w-4 rounded-bl-[8px] border-b border-l border-stone-500/25" />
      <div className="absolute bottom-3 right-3 h-4 w-4 rounded-br-[8px] border-b border-r border-stone-500/25" />
      <div className="absolute -right-8 top-2 h-20 w-20 rounded-full bg-amber-500/8 blur-2xl" />
    </div>

    <div className="relative z-10">
      {(eyebrow || title) && (
        <GameTitleStack
          eyebrow={eyebrow}
          title={title}
          compact
          className="mb-2"
          titleClassName={titleClassName}
        />
      )}
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
      {footer && (
        <div className="mt-3 border-t border-stone-800/90 pt-2 text-[11px] text-stone-500 italic">
          {footer}
        </div>
      )}
    </div>
  </div>
);
