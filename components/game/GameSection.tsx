import React from "react";
import clsx from "clsx";
import { GameOrnamentFrame } from "./GameOrnamentFrame";
import { GameTitleStack } from "./GameTitleStack";

interface GameSectionProps {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  titleIcon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const GameSection: React.FC<GameSectionProps> = ({
  title,
  eyebrow,
  titleIcon,
  actions,
  children,
  className,
  bodyClassName,
}) => (
  <section
    className={clsx(
      "relative overflow-hidden rounded-2xl border border-stone-800/90 bg-[linear-gradient(180deg,rgba(21,21,21,0.92)_0%,rgba(11,11,11,0.96)_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.24)]",
      className
    )}
  >
    <GameOrnamentFrame
      size="compact"
      className="rounded-[inherit]"
      insetClassName="inset-[8px] rounded-[14px]"
      glowClassName="-right-8 top-2 h-20 w-20 bg-amber-500/8"
    />
    <div className="relative z-10 border-b border-stone-800/80 bg-stone-950/65 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <GameTitleStack
          eyebrow={eyebrow}
          title={title}
          icon={titleIcon}
          className="min-w-0"
          eyebrowClassName="text-[9px] tracking-[0.36em]"
          titleClassName="text-sm font-bold tracking-[0.22em] text-stone-200 uppercase"
        />
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
    <div className={clsx("relative z-10 p-4", bodyClassName)}>{children}</div>
  </section>
);
