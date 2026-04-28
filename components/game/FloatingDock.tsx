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
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[3200] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-[24px] border border-stone-700/80 bg-stone-950/85 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;

          return (
            <div key={item.id} className="group relative">
              <Button
                onClick={() => onTogglePanel(item.id)}
                variant="tab"
                size="sm"
                className={clsx(
                  "flex min-w-[60px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs tracking-widest transition-all",
                  isActive
                    ? "bg-amber-500/15 text-amber-300 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.3)]"
                    : "text-stone-400 hover:bg-stone-800/80 hover:text-stone-100"
                )}
                data-testid={`dock-${item.id}`}
              >
                <div
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                    isActive
                      ? "border-amber-500/60 bg-amber-500/10"
                      : "border-stone-700 bg-stone-900/80 group-hover:border-stone-500"
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
