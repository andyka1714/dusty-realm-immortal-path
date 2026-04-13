import React from "react";
import clsx from "clsx";

interface GameTitleStackProps {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  eyebrowClassName?: string;
  compact?: boolean;
}

export const GameTitleStack: React.FC<GameTitleStackProps> = ({
  eyebrow,
  title,
  icon,
  className,
  titleClassName,
  eyebrowClassName,
  compact = false,
}) => {
  if (!eyebrow && !title && !icon) return null;

  return (
    <div className={clsx("flex min-w-0 items-center gap-3", compact && "gap-2", className)}>
      {icon}
      <div className="flex min-w-0 flex-col">
        {eyebrow && (
          <span
            className={clsx(
              compact
                ? "text-[10px] font-bold uppercase tracking-[0.24em] text-stone-500"
                : "text-[10px] uppercase tracking-[0.28em] text-amber-200/60",
              eyebrowClassName
            )}
          >
            {eyebrow}
          </span>
        )}
        {title && (
          <span
            className={clsx(
              compact
                ? "text-base font-bold tracking-[0.12em] text-amber-400"
                : "text-[1.05rem] font-bold tracking-[0.18em] text-stone-100",
              titleClassName
            )}
          >
            {title}
          </span>
        )}
      </div>
    </div>
  );
};
