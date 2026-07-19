import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MapPin, ScrollText, X } from "lucide-react";
import clsx from "clsx";
import { MAPS } from "../../data/maps";
import { QUESTS } from "../../data/quests";
import { RootState } from "../../store/store";
import {
  buildQuestTrackerItems,
  QuestNavigationTarget,
} from "../../utils/questTracker";
import { Button } from "../ui/button";

const QUEST_NAVIGATION_EVENT = "dusty-realm:quest-navigation";

const dispatchQuestNavigation = (
  navigationTarget: QuestNavigationTarget | undefined
) => {
  if (!navigationTarget || typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<QuestNavigationTarget>(QUEST_NAVIGATION_EVENT, {
      detail: navigationTarget,
    })
  );
};

export const QuestTrackerHUD: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeQuests = useSelector(
    (state: RootState) => state.quest.activeQuests
  );
  const completedQuests = useSelector(
    (state: RootState) => state.quest.completedQuests
  );
  const inventoryItems = useSelector((state: RootState) => state.inventory.items);
  const majorRealm = useSelector((state: RootState) => state.character.majorRealm);
  const trackerItems = buildQuestTrackerItems({
    activeQuests,
    completedQuests,
    inventoryItems,
    majorRealm,
    quests: QUESTS,
    maps: MAPS,
    limit: 4,
  });

  const trackerContent = (
    <>
      {trackerItems.length === 0 ? (
        <div className="rounded-lg border border-stone-800/80 bg-black/25 px-3 py-2 text-xs text-stone-500">
          目前沒有進行中的任務
        </div>
      ) : (
        <div className="space-y-2">
          {trackerItems.map((item) => {
            const visibleProgressRows =
              item.lifecycleStatus === "ready"
                ? []
                : item.progressRows.filter((row) => row.kind !== "dialogue");

            return (
              <Button
                key={item.questId}
                type="button"
                variant="ghost"
                data-testid={`quest-tracker-item-${item.questId}`}
                data-navigation-kind={item.navigationTarget?.kind ?? "none"}
                data-lifecycle-status={item.lifecycleStatus}
                disabled={!item.navigationTarget}
                onClick={() => dispatchQuestNavigation(item.navigationTarget)}
                className={clsx(
                  "!h-auto w-full flex-col items-stretch justify-start gap-0 whitespace-normal rounded-lg border px-3 py-2 text-left transition",
                  item.navigationTarget
                    ? "cursor-pointer hover:border-amber-500/60 hover:bg-amber-950/16"
                    : "cursor-default",
                  item.lifecycleStatus === "ready"
                    ? "border-emerald-700/70 bg-emerald-950/24"
                    : item.lifecycleStatus === "available"
                      ? "border-amber-700/60 bg-amber-950/18"
                    : "border-stone-800/80 bg-black/25"
                )}
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div className="min-w-0 truncate text-sm font-bold text-stone-100">
                    {item.title}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="rounded border border-stone-700/80 px-1.5 py-0.5 text-[10px] text-stone-400">
                      {item.typeLabel}
                    </span>
                    <span
                      className={clsx(
                        "rounded border px-1.5 py-0.5 text-[10px] font-bold",
                        item.lifecycleStatus === "ready"
                          ? "border-emerald-600/70 text-emerald-300"
                          : item.lifecycleStatus === "available"
                            ? "border-amber-600/70 text-amber-300"
                            : "border-sky-700/60 text-sky-300"
                      )}
                    >
                      {item.lifecycleLabel}
                    </span>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-400">
                  {item.description}
                </p>
                {visibleProgressRows.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {visibleProgressRows.map((row, index) => (
                      <div
                        key={`${item.questId}-${row.kind}-${index}`}
                        className={clsx(
                          "flex items-center justify-between gap-2 text-[10px]",
                          row.complete ? "text-emerald-300/80" : "text-stone-500"
                        )}
                      >
                        <span className="min-w-0 truncate">{row.label}</span>
                        {row.current !== undefined &&
                          row.required !== undefined && (
                            <span className="shrink-0 font-mono">
                              {row.current} / {row.required}
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                )}
                {item.navigationTarget && (
                  <div className="mt-1 inline-flex max-w-full items-center gap-1 text-[10px] text-amber-300">
                    <MapPin size={11} className="shrink-0" />
                    <span className="truncate">
                      {item.primaryActionLabel}
                    </span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <>
      <aside
        className="pointer-events-none absolute left-4 top-[16rem] z-30 hidden w-[min(370px,calc(100vw-2rem))] md:block"
        data-testid="quest-tracker-hud"
        data-layout-anchor="below-character-hud"
        aria-label="任務追蹤"
      >
        <div className="paper-panel pointer-events-auto rounded-xl p-3 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-stone-200">
              <ScrollText size={15} className="text-amber-300" />
              <span className="text-sm font-bold tracking-widest">任務追蹤</span>
            </div>
            <span className="text-[10px] uppercase text-stone-500">
              Quest
            </span>
          </div>

          {trackerContent}
        </div>
      </aside>

      <div className="md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="paper-panel pointer-events-auto fixed bottom-28 left-3 z-[3100] inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold tracking-widest text-amber-200 backdrop-blur-xl"
          data-testid="quest-tracker-mobile-toggle"
          aria-controls="quest-tracker-mobile-panel"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((current) => !current)}
        >
          <ScrollText size={14} />
          任務
          {trackerItems.length > 0 && (
            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] text-stone-950">
              {trackerItems.length}
            </span>
          )}
        </Button>

        <section
          id="quest-tracker-mobile-panel"
          data-testid="quest-tracker-mobile-panel"
          aria-label="任務追蹤"
          className={clsx(
            "paper-panel pointer-events-auto fixed bottom-28 left-3 right-3 z-[3090] max-h-[42dvh] overflow-y-auto rounded-xl p-3 backdrop-blur-xl",
            isMobileOpen ? "block" : "hidden"
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-stone-200">
              <ScrollText size={15} className="text-amber-300" />
              <span className="text-sm font-bold tracking-widest">任務追蹤</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full border border-stone-700/80 p-1 text-stone-400 hover:border-stone-500 hover:text-stone-100"
              aria-label="收合任務追蹤"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={14} />
            </Button>
          </div>

          {trackerContent}
        </section>
      </div>
    </>
  );
};
