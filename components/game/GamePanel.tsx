import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";

interface GamePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
}

export const GamePanel: React.FC<GamePanelProps> = ({
  isOpen,
  onClose,
  children,
  widthClassName = "max-w-6xl",
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
    <div className="fixed inset-0 z-[4000] bg-black/45 backdrop-blur-sm animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div
        className={clsx(
          "absolute inset-x-0 bottom-0 top-[8vh] mx-auto w-full overflow-hidden rounded-t-[28px] border border-stone-700/80 bg-stone-950/92 shadow-[0_30px_100px_rgba(0,0,0,0.7)] md:inset-auto md:left-1/2 md:top-1/2 md:h-[84vh] md:max-h-[900px] md:w-[min(92vw,1400px)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]",
          widthClassName
        )}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
          <div className="absolute -right-12 top-10 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"></div>
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-stone-700 bg-stone-950/80 text-stone-400 transition-colors hover:border-amber-500 hover:text-amber-300"
        >
          <X size={18} />
        </button>

        <div className="relative h-full overflow-hidden">{children}</div>
      </div>
    </div>,
    document.body
  );
};
