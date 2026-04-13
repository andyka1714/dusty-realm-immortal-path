import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";
import { GameTitleStack } from "./GameTitleStack";
import { GameOrnamentFrame } from "./GameOrnamentFrame";

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
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[4000] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm animate-fade-in md:items-center md:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div
        className={clsx(
          "relative z-10 h-[96vh] w-full rounded-t-[30px] border border-amber-700/20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_22%),linear-gradient(180deg,rgba(42,31,10,0.88)_0%,rgba(12,12,12,0.92)_18%,rgba(8,8,8,0.96)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.7)] md:h-[90vh] md:max-h-[960px] md:w-[min(95vw,1500px)] md:rounded-[30px]",
          widthClassName
        )}
      >
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

        <div className="relative z-10 h-full p-4 pt-[72px] md:p-5 md:pt-[76px]">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-stone-700/80 bg-stone-950/78 text-stone-400 shadow-[0_8px_18px_rgba(0,0,0,0.35)] backdrop-blur transition-colors hover:border-amber-500 hover:text-amber-300"
            aria-label="關閉視窗"
          >
            <X size={18} />
          </button>

          <div className="h-full overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
