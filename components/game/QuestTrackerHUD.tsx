import React from "react";
import { useSelector } from "react-redux";
import { CheckCircle2, ScrollText } from "lucide-react";
import clsx from "clsx";
import { QUESTS } from "../../data/quests";
import { RootState } from "../../store/store";
import { buildQuestTrackerItems } from "../../utils/questTracker";

export const QuestTrackerHUD: React.FC = () => {
  const activeQuests = useSelector(
    (state: RootState) => state.quest.activeQuests
  );
  const trackerItems = buildQuestTrackerItems({
    activeQuests,
    quests: QUESTS,
    limit: 4,
  });

  return (
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
      </div>
    </aside>
  );
};
