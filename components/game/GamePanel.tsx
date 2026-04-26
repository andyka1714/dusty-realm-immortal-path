import React from "react";
import clsx from "clsx";
import { GameTitleStack } from "./GameTitleStack";
import { GameOrnamentFrame } from "./GameOrnamentFrame";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface GamePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
  title?: string;
  eyebrow?: string;
  titleIcon?: React.ReactNode;
}

export const GamePanel: React.FC<GamePanelProps> = ({
  isOpen,
  onClose,
  children,
  widthClassName = "max-w-6xl",
  title,
  eyebrow = "IMMORTAL ARCHIVE",
  titleIcon,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent
        hideClose
        aria-describedby={undefined}
        className={clsx(
          "!left-1/2 !top-auto !bottom-0 flex !h-[min(92dvh,760px)] !max-h-[calc(100dvh-1rem)] !w-full !max-w-none !translate-x-[-50%] !translate-y-0 flex-col overflow-hidden rounded-t-[30px] rounded-b-none border border-amber-700/20 p-0 pt-0 md:!bottom-auto md:!top-1/2 md:!h-[90vh] md:!max-h-[960px] md:!w-[min(95vw,1500px)] md:!translate-y-[-50%] md:rounded-[30px]",
          widthClassName
        )}
        data-testid="game-shell-panel"
      >
        <DialogTitle className="sr-only">{title ?? "遊戲面板"}</DialogTitle>
        <GameOrnamentFrame
          size="large"
          className="rounded-[inherit]"
          insetClassName="inset-[14px] rounded-[22px]"
          glowClassName="-right-12 top-8 h-40 w-40 bg-amber-500/8"
        />

        {title && (
          <div className="pointer-events-none absolute left-7 top-6 z-20">
            <GameTitleStack eyebrow={eyebrow} title={title} icon={titleIcon ? <span className="text-amber-500/95">{titleIcon}</span> : undefined} className="px-1 py-1" />
          </div>
        )}

        <div className="relative z-10 flex min-h-0 flex-1 flex-col p-4 pt-[72px] md:p-5 md:pt-[76px]">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 z-20 h-11 w-11 rounded-full border border-stone-700/80 bg-stone-950/78 text-stone-400 shadow-[0_8px_18px_rgba(0,0,0,0.35)] backdrop-blur hover:border-amber-500 hover:text-amber-300"
            aria-label="關閉視窗"
            data-testid="game-shell-panel-close"
          >
            ×
          </Button>

          <div className="min-h-0 flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
