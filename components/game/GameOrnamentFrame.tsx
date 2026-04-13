import React from "react";
import clsx from "clsx";

interface GameOrnamentFrameProps {
  className?: string;
  insetClassName?: string;
  glowClassName?: string;
  size?: "compact" | "default" | "large";
}

export const GameOrnamentFrame: React.FC<GameOrnamentFrameProps> = ({
  className,
  insetClassName,
  glowClassName,
  size = "default",
}) => (
  <div
    className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}
  >
    <div
      className={clsx(
        "absolute inset-[12px] border border-stone-800/70 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.04)]",
        insetClassName
      )}
    ></div>
    <div
      className={clsx(
        "absolute border-l border-t border-amber-400/25",
        size === "large"
          ? "left-5 top-5 h-8 w-8 rounded-tl-[14px]"
          : size === "compact"
            ? "left-3 top-3 h-4 w-4 rounded-tl-[8px]"
            : "left-4 top-4 h-6 w-6 rounded-tl-[10px]"
      )}
    ></div>
    <div
      className={clsx(
        "absolute border-r border-t border-amber-400/25",
        size === "large"
          ? "right-5 top-5 h-8 w-8 rounded-tr-[14px]"
          : size === "compact"
            ? "right-3 top-3 h-4 w-4 rounded-tr-[8px]"
            : "right-4 top-4 h-6 w-6 rounded-tr-[10px]"
      )}
    ></div>
    <div
      className={clsx(
        "absolute border-b border-l border-stone-500/25",
        size === "large"
          ? "bottom-5 left-5 h-8 w-8 rounded-bl-[14px]"
          : size === "compact"
            ? "bottom-3 left-3 h-4 w-4 rounded-bl-[8px]"
            : "bottom-4 left-4 h-6 w-6 rounded-bl-[10px]"
      )}
    ></div>
    <div
      className={clsx(
        "absolute border-b border-r border-stone-500/25",
        size === "large"
          ? "bottom-5 right-5 h-8 w-8 rounded-br-[14px]"
          : size === "compact"
            ? "bottom-3 right-3 h-4 w-4 rounded-br-[8px]"
            : "bottom-4 right-4 h-6 w-6 rounded-br-[10px]"
      )}
    ></div>
    <div
      className={clsx(
        "absolute h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent",
        size === "large"
          ? "inset-x-8 top-[10px]"
          : size === "compact"
            ? "inset-x-4 top-0"
            : "inset-x-6 top-[10px]"
      )}
    ></div>
    <div
      className={clsx(
        "absolute h-px bg-gradient-to-r from-transparent via-stone-500/20 to-transparent",
        size === "large"
          ? "inset-x-12 top-[58px]"
          : size === "compact"
            ? "inset-x-6 top-[44px]"
            : "inset-x-10 top-[58px]"
      )}
    ></div>
    <div
      className={clsx(
        "absolute -right-10 top-3 h-28 w-28 rounded-full bg-amber-500/10 blur-3xl",
        glowClassName
      )}
    ></div>
  </div>
);
