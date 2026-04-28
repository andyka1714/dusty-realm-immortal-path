import React from "react";
import {
  Backpack,
  BookOpen,
  Hammer,
  Home,
  Map,
  Scroll,
} from "lucide-react";
import clsx from "clsx";
import { GameHintBubble } from "./GameHintBubble";
import { Button } from "../ui/button";

export type GamePanelId =
  | "character"
  | "inventory"
  | "skills"
  | "workshop"
  | "compendium"
  | "map";

interface FloatingDockProps {
  activePanel: GamePanelId | null;
  onTogglePanel: (panel: GamePanelId) => void;
}

const ITEMS: Array<{
  id: GamePanelId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "character", label: "道途", icon: Home },
  { id: "inventory", label: "背包", icon: Backpack },
  { id: "skills", label: "功法", icon: Scroll },
  { id: "workshop", label: "洞府", icon: Hammer },
  { id: "compendium", label: "圖鑑", icon: BookOpen },
  { id: "map", label: "地圖", icon: Map },
];

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activePanel,
  onTogglePanel,
}) => {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[3200] flex justify-center px-3"
      data-testid="floating-dock"
      data-display-mode="separate-actions"
    >
      <div
        className="pointer-events-auto flex max-w-full items-end justify-center gap-2 overflow-x-auto rounded-[28px] px-1 py-1 [scrollbar-width:none] sm:gap-3"
        data-testid="floating-dock-actions"
      >
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;

          return (
            <div
              key={item.id}
              className="group relative shrink-0"
              data-testid={`dock-action-${item.id}`}
            >
              <Button
                onClick={() => onTogglePanel(item.id)}
                variant="tab"
                size="sm"
                className={clsx(
                  "flex h-auto min-w-[58px] flex-col items-center gap-1.5 rounded-2xl border px-2.5 py-2 text-[11px] tracking-widest shadow-[0_10px_28px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all sm:min-w-[66px] sm:px-3 sm:text-xs",
                  isActive
                    ? "border-amber-500/65 bg-amber-500/18 text-amber-200 shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_14px_34px_rgba(0,0,0,0.48)]"
                    : "border-stone-700/75 bg-stone-950/82 text-stone-400 hover:border-stone-500/85 hover:bg-stone-900/90 hover:text-stone-100"
                )}
                data-testid={`dock-${item.id}`}
              >
                <div
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors sm:h-9 sm:w-9",
                    isActive
                      ? "border-amber-400/70 bg-amber-400/14"
                      : "border-stone-700/90 bg-black/20 group-hover:border-stone-500"
                  )}
                >
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </Button>
              <GameHintBubble
                eyebrow="PANEL SWITCH"
                className="bottom-full left-1/2 mb-2 -translate-x-1/2"
              >
                {isActive ? `收起${item.label}` : `打開${item.label}`}
              </GameHintBubble>
            </div>
          );
        })}
      </div>
    </div>
  );
};
