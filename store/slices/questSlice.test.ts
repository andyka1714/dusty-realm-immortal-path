import { describe, expect, it, vi } from "vitest";
import reducer, {
  adjustAffinity,
  completeQuest,
  createInitialQuestState,
} from "./questSlice";

describe("questSlice affinity state", () => {
  it("records quest completion affinity for the submit NPC and sect", () => {
    vi.spyOn(Date, "now").mockReturnValue(123456);

    const state = reducer(
      {
        ...createInitialQuestState(),
        activeQuests: {
          sect_sword_task_04: {
            progress: 1,
            isReadyToComplete: true,
          },
        },
      },
      completeQuest({ questId: "sect_sword_task_04" })
    );

    expect(state.completedQuests).toContain("sect_sword_task_04");
    expect(state.npcAffinity.sect_sword_patrol_captain).toMatchObject({
      value: 8,
      lastReason: "完成任務：顧巡岳",
    });
    expect(state.sectAffinity.sect_sword).toMatchObject({
      value: 5,
      lastReason: "完成宗門任務",
    });
    expect(state.recentAffinityChanges[0]).toMatchObject({
      targetType: "npc",
      targetId: "sect_sword_patrol_captain",
      delta: 8,
      nextValue: 8,
      reason: "完成任務：顧巡岳",
      timestamp: 123456,
    });
  });

  it("clamps explicit affinity updates and keeps the newest change reasons", () => {
    const state = reducer(
      createInitialQuestState(),
      adjustAffinity({
        targetType: "sect",
        targetId: "sect_mystic",
        delta: 999,
        reason: "星詔密約",
      })
    );

    expect(state.sectAffinity.sect_mystic).toMatchObject({
      value: 100,
      lastReason: "星詔密約",
    });
    expect(state.recentAffinityChanges[0]).toMatchObject({
      targetType: "sect",
      targetId: "sect_mystic",
      delta: 999,
      nextValue: 100,
      reason: "星詔密約",
    });
  });
});
