import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";

interface GamePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
  title?: string;
  titleIcon?: React.ReactNode;
}

export const GamePanel: React.FC<GamePanelProps> = ({
  isOpen,
  onClose,
  children,
  widthClassName = "max-w-6xl",
  title,
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
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <div className="absolute inset-[14px] rounded-[22px] border border-stone-800/70 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.04)]"></div>
          <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-[14px] border-l border-t border-amber-400/25"></div>
          <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-[14px] border-r border-t border-amber-400/25"></div>
          <div className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-[14px] border-b border-l border-stone-500/25"></div>
          <div className="absolute bottom-5 right-5 h-8 w-8 rounded-br-[14px] border-b border-r border-stone-500/25"></div>
          <div className="absolute inset-x-8 top-[10px] h-px bg-gradient-to-r from-transparent via-amber-400/18 to-transparent"></div>
          <div className="absolute inset-x-12 top-[58px] h-px bg-gradient-to-r from-transparent via-stone-500/20 to-transparent"></div>
          <div className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-amber-500/8 blur-3xl"></div>
          <div className="absolute left-10 top-5 rounded-full border border-amber-500/15 bg-black/20 px-3 py-1 text-[10px] tracking-[0.28em] text-amber-200/65">
            IMMORTAL ARCHIVE
          </div>
        </div>

        {title && (
          <div className="pointer-events-none absolute left-7 top-6 z-20">
            <div className="inline-flex items-center gap-3 px-1 py-1">
              {titleIcon && (
                <span className="text-amber-500/95">{titleIcon}</span>
              )}
              <span className="text-[1.05rem] font-bold tracking-[0.18em] text-stone-100">
                {title}
              </span>
            </div>
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
