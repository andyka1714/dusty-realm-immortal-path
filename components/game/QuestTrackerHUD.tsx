import React, { useState } from "react";
import { useSelector } from "react-redux";
import { CheckCircle2, ScrollText, X } from "lucide-react";
import clsx from "clsx";
import { QUESTS } from "../../data/quests";
import { RootState } from "../../store/store";
import { buildQuestTrackerItems } from "../../utils/questTracker";
import { Button } from "../ui/button";

export const QuestTrackerHUD: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeQuests = useSelector(
    (state: RootState) => state.quest.activeQuests
  );
  const trackerItems = buildQuestTrackerItems({
    activeQuests,
    quests: QUESTS,
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
          {trackerItems.map((item) => (
            <div
              key={item.questId}
              className={clsx(
                "rounded-lg border px-3 py-2",
                item.isReadyToComplete
                  ? "border-emerald-700/70 bg-emerald-950/24"
                  : "border-stone-800/80 bg-black/25"
              )}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="min-w-0 truncate text-sm font-bold text-stone-100">
                  {item.title}
                </div>
                <span className="shrink-0 rounded border border-stone-700/80 px-1.5 py-0.5 text-[10px] text-stone-400">
                  {item.typeLabel}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                <span
                  className={clsx(
                    "inline-flex min-w-0 items-center gap-1 truncate",
                    item.isReadyToComplete
                      ? "text-emerald-300"
                      : "text-stone-400"
                  )}
                >
                  {item.isReadyToComplete && <CheckCircle2 size={12} />}
                  {item.statusLabel}
                </span>
                <span className="shrink-0 text-stone-500">
                  {item.progressLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <aside
        className="pointer-events-none absolute left-4 top-[8.25rem] z-30 hidden w-[min(320px,calc(100vw-2rem))] md:block"
        data-testid="quest-tracker-hud"
        aria-label="任務追蹤"
      >
        <div className="rounded-xl border border-stone-700/80 bg-stone-950/78 p-3 shadow-[0_12px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl">
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
          className="pointer-events-auto fixed bottom-28 left-4 z-[3100] inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-stone-950/88 px-3 py-2 text-xs font-bold tracking-widest text-amber-200 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
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
            "pointer-events-auto fixed bottom-28 left-4 right-4 z-[3090] max-h-[42dvh] overflow-y-auto rounded-xl border border-stone-700/80 bg-stone-950/92 p-3 shadow-[0_16px_42px_rgba(0,0,0,0.55)] backdrop-blur-xl",
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
