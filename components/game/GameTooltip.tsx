import React from "react";
import ReactDOM from "react-dom";
import clsx from "clsx";
import { GameTitleStack } from "./GameTitleStack";
import { GameOrnamentFrame } from "./GameOrnamentFrame";

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
}) => {
  const tooltip = (
    <div
      className={clsx(
        "fixed z-[9999] overflow-hidden rounded-[18px] border border-amber-900/35 bg-[linear-gradient(180deg,rgba(28,22,12,0.98)_0%,rgba(10,10,10,0.98)_100%)] p-4 text-stone-300 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-none",
        widthClassName,
        className
      )}
      style={style}
      data-testid="game-tooltip"
    >
      <GameOrnamentFrame
        size="compact"
        insetClassName="inset-[10px] rounded-[12px] border-amber-950/30"
        glowClassName="-right-8 top-2 h-20 w-20 bg-amber-500/8 blur-2xl"
      />

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

  if (typeof document === "undefined") {
    return tooltip;
  }

  return ReactDOM.createPortal(tooltip, document.body);
};
