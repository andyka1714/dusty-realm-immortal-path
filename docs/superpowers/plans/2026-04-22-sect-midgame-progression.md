# Sect Midgame Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 補齊三宗門 `築基 -> 金丹` 的正式任務承接，並把現有 kill quest 的最小 progress / completion wiring 補成可驗證狀態。

**Architecture:** 先用一個小型純函式 helper 收斂 quest readiness 與 enemy defeat progress 計算，避免把 battle hook 與 `QuestModal` 各自寫一套判斷。宗門中期內容本體維持資料驅動，只補 `data/quests.ts`、`data/npcs.ts` 與對應 regression tests，不擴張 manual source registry 或 event system。

**Tech Stack:** TypeScript, React 19, Redux Toolkit, Vitest, OpenSpec

---

## File Map

- Create: `utils/questProgress.ts`
  - 集中處理 kill quest progress 更新與 quest readiness 判斷。
- Create: `utils/questProgress.test.ts`
  - 驗證 kill quest 在 enemy defeat 後會正確標記 progress / ready，並驗證 `level + kill` 不會被錯誤 auto-complete。
- Create: `data/sectMidgameProgression.test.ts`
  - 驗證三宗中期 quest chain、quest NPC wiring、reward item validity。
- Modify: `hooks/useAdventureBattleEffects.ts`
  - 在 world battle 勝利後，把 enemy defeat 映射到 active quest progress。
- Modify: `pages/Adventure.tsx`
  - 將 `activeQuests` 傳入 battle replay hook，提供 quest progress wiring 所需 context。
- Modify: `components/adventure/QuestModal.tsx`
  - 用共用 helper 判斷任務是否 ready，避免 `level + kill` 在互動時被直接標為完成。
- Modify: `data/quests.ts`
  - 新增 `sect_*_task_02` / `sect_*_task_03`。
- Modify: `data/npcs.ts`
  - 新增三宗中期 quest NPC 並掛入對應 sect hub。
- Modify: `openspec/changes/add-sect-midgame-progression/tasks.md`
  - implementation 完成後改成 `[x]`。

## Fixed Content Decisions

- 劍宗中期 NPC：`sect_sword_patrol_captain`
  - 名稱：`巡山統領`
  - 座標：`(28, 15)`
- 獸莊中期 NPC：`sect_beast_huntmaster`
  - 名稱：`獵場監軍`
  - 座標：`(28, 15)`
- 仙宮中期 NPC：`sect_mystic_envoy`
  - 名稱：`外務使`
  - 座標：`(28, 15)`

- 劍宗 `task_02`
  - id：`sect_sword_task_02`
  - boss：`m32_b1` / `極地劍靈`
  - rewards：`flow_light_sword`, `sword_scabbard`
- 劍宗 `task_03`
  - id：`sect_sword_task_03`
  - boss：`m62_b1` / `金翅大鵬`
  - rewards：`azure_frost_sword`, `sword_spirit_stone`

- 獸莊 `task_02`
  - id：`sect_beast_task_02`
  - boss：`m42_b1` / `烈焰妖王`
  - rewards：`tiger_king_gauntlet`, `scale_shield`
- 獸莊 `task_03`
  - id：`sect_beast_task_03`
  - boss：`m72_b1` / `厄難毒體`
  - rewards：`dragon_claw`, `black_tortoise_shield`

- 仙宮 `task_02`
  - id：`sect_mystic_task_02`
  - boss：`m52_b1` / `雷澤領主`
  - rewards：`jade_bamboo_staff`, `elemental_fan`
- 仙宮 `task_03`
  - id：`sect_mystic_task_03`
  - boss：`m82_b1` / `覆海蛟龍`
  - rewards：`phoenix_feather_staff`, `yin_yang_mirror`

---

### Task 1: 寫出 quest progress / readiness 的失敗測試

**Files:**
- Create: `utils/questProgress.test.ts`
- Reference: `data/quests.ts`, `types.ts`

- [ ] **Step 1: 建立 fail-first 測試檔**

```ts
import { describe, expect, it } from "vitest";
import { MajorRealm, Quest, QuestType } from "../types";
import {
  resolveQuestReadinessAtNpc,
  resolveQuestKillProgressOnEnemyDefeat,
} from "./questProgress";

const levelAndKillQuest: Quest = {
  id: "test_foundation_kill",
  type: QuestType.Side,
  title: "測試任務",
  description: "同時要求境界與擊殺",
  giverId: "quest_npc",
  submitNpcId: "quest_npc",
  requirements: [
    { type: "level", minRealm: MajorRealm.Foundation },
    { type: "kill", targetId: "m32_b1", count: 1 },
  ],
  rewards: [],
  dialogue: {
    start: ["start"],
    progress: ["progress"],
    complete: ["complete"],
  },
};

describe("questProgress", () => {
  it("does not mark a level+kill quest ready before the kill target is defeated", () => {
    const ready = resolveQuestReadinessAtNpc({
      quest: levelAndKillQuest,
      activeQuestState: { progress: 0, isReadyToComplete: false },
      majorRealm: MajorRealm.Foundation,
      npcId: "quest_npc",
    });

    expect(ready).toBe(false);
  });

  it("marks a level+kill quest ready after defeating the matching target", () => {
    const update = resolveQuestKillProgressOnEnemyDefeat({
      quest: levelAndKillQuest,
      activeQuestState: { progress: 0, isReadyToComplete: false },
      defeatedEnemyId: "m32_b1",
      majorRealm: MajorRealm.Foundation,
    });

    expect(update).toEqual({
      progress: 1,
      isReadyToComplete: true,
    });
  });

  it("ignores unrelated enemy defeats", () => {
    const update = resolveQuestKillProgressOnEnemyDefeat({
      quest: levelAndKillQuest,
      activeQuestState: { progress: 0, isReadyToComplete: false },
      defeatedEnemyId: "m42_b1",
      majorRealm: MajorRealm.Foundation,
    });

    expect(update).toBeNull();
  });
});
```

- [ ] **Step 2: 執行單檔測試確認失敗**

Run: `npm test -- utils/questProgress.test.ts`

Expected: FAIL，錯誤包含 `Cannot find module './questProgress'` 或 `resolveQuestReadinessAtNpc is not defined`

- [ ] **Step 3: 提交 fail-first 測試**

```bash
git add utils/questProgress.test.ts
git commit -m "test: add quest progression helper coverage"
```

---

### Task 2: 補最小 quest progress wiring，讓 kill quest 真的能完成

**Files:**
- Create: `utils/questProgress.ts`
- Modify: `hooks/useAdventureBattleEffects.ts`
- Modify: `pages/Adventure.tsx`
- Modify: `components/adventure/QuestModal.tsx`
- Test: `utils/questProgress.test.ts`

- [ ] **Step 1: 實作純函式 helper**

```ts
import { MajorRealm, Quest, QuestRequirement } from "../types";

type ActiveQuestState = {
  progress: number;
  isReadyToComplete: boolean;
};

const isDialogueRequirementSatisfied = (
  requirement: QuestRequirement,
  quest: Quest,
  npcId: string
) => {
  if (requirement.type !== "dialogue") return false;
  if (requirement.targetNpcId) return requirement.targetNpcId === npcId;
  return (quest.submitNpcId ?? quest.giverId) === npcId;
};

export const resolveQuestReadinessAtNpc = ({
  quest,
  activeQuestState,
  majorRealm,
  npcId,
}: {
  quest: Quest;
  activeQuestState: ActiveQuestState;
  majorRealm: MajorRealm;
  npcId: string;
}) =>
  quest.requirements.every((requirement) => {
    switch (requirement.type) {
      case "level":
        return requirement.minRealm !== undefined && majorRealm >= requirement.minRealm;
      case "kill":
      case "item":
        return activeQuestState.progress >= (requirement.count ?? 1);
      case "dialogue":
        return isDialogueRequirementSatisfied(requirement, quest, npcId);
      default:
        return false;
    }
  });

export const resolveQuestKillProgressOnEnemyDefeat = ({
  quest,
  activeQuestState,
  defeatedEnemyId,
  majorRealm,
}: {
  quest: Quest;
  activeQuestState: ActiveQuestState;
  defeatedEnemyId: string;
  majorRealm: MajorRealm;
}) => {
  const killRequirement = quest.requirements.find(
    (requirement) => requirement.type === "kill"
  );

  if (!killRequirement || killRequirement.targetId !== defeatedEnemyId) {
    return null;
  }

  const nextProgress = Math.min(
    activeQuestState.progress + 1,
    killRequirement.count ?? 1
  );

  const isReadyToComplete = quest.requirements.every((requirement) => {
    switch (requirement.type) {
      case "level":
        return requirement.minRealm !== undefined && majorRealm >= requirement.minRealm;
      case "kill":
        return nextProgress >= (requirement.count ?? 1);
      case "dialogue":
        return false;
      case "item":
        return activeQuestState.progress >= (requirement.count ?? 1);
      default:
        return false;
    }
  });

  return {
    progress: nextProgress,
    isReadyToComplete,
  };
};
```

- [ ] **Step 2: 在 battle 勝利後更新 active quest progress**

在 `hooks/useAdventureBattleEffects.ts` 加入 quest update：

```ts
import { updateQuestProgress } from "../store/slices/questSlice";
import { QUESTS } from "../data/quests";
import { resolveQuestKillProgressOnEnemyDefeat } from "../utils/questProgress";
```

把 `activeQuests` 納入 hook params：

```ts
type UseAutoBattleReplayControllerEffectParams = {
  // ...
  activeQuests: Record<string, { progress: number; isReadyToComplete: boolean }>;
  completedQuests: string[];
  // ...
};
```

在 `finishResultPlan.battleResult.won` 後、`dispatch(resolveBattle(...))` 之後補：

```ts
      if (finishResultPlan.battleResult.won && currentEnemy) {
        Object.entries(activeQuests).forEach(([questId, activeQuestState]) => {
          const quest = QUESTS[questId];
          if (!quest) return;

          const update = resolveQuestKillProgressOnEnemyDefeat({
            quest,
            activeQuestState,
            defeatedEnemyId: currentEnemy.id,
            majorRealm,
          });

          if (!update) return;

          dispatch(
            updateQuestProgress({
              questId,
              progress: update.progress,
              isReady: update.isReadyToComplete,
            })
          );
        });
      }
```

- [ ] **Step 3: 將 `activeQuests` 從 `Adventure.tsx` 傳入 hook**

在 `pages/Adventure.tsx` 的 hook 呼叫補入：

```ts
  useAutoBattleReplayControllerEffect({
    dispatch,
    isBattling,
    lastBattleResult,
    isReplayingBattle,
    replayQueue,
    battleSnapshot,
    displayedLogs,
    currentEnemy,
    currentEnemyInstanceId,
    activeMonsters,
    activeQuests,
    completedQuests,
    playerPosition,
    attributes,
    majorRealm,
    spiritRootId,
    equipmentStats,
    characterName: character.name,
    profession,
    characterSkills: character.skills,
    battleProcessedRef,
    replayTimerSet: combatTimersRef.current.replay,
    applyBattleReplayState,
    dispatchWorldStrikeVisualPlan,
    applyBattleRewardApplicationPlan,
    clearReplayTimers: () => clearCombatTimerBucket(combatTimersRef.current, "replay"),
  });
```

- [ ] **Step 4: 用 helper 收斂 `QuestModal` readiness 判斷**

在 `components/adventure/QuestModal.tsx` 改成：

```ts
import { resolveQuestReadinessAtNpc } from "../../utils/questProgress";
```

把原本的 `dialogueReq / levelReq / isReady` 區塊改成：

```ts
            let isReady = activeState.isReadyToComplete;

            if (!isReady) {
                const computedReady = resolveQuestReadinessAtNpc({
                    quest,
                    activeQuestState: activeState,
                    majorRealm,
                    npcId: npc.id,
                });

                if (computedReady) {
                    isReady = true;
                    dispatch(updateQuestProgress({ questId: submitQuestId, isReady: true }));
                }
            }
```

- [ ] **Step 5: 執行 helper 測試確認通過**

Run: `npm test -- utils/questProgress.test.ts`

Expected: PASS，3 tests passed

- [ ] **Step 6: 提交 quest wiring**

```bash
git add utils/questProgress.ts utils/questProgress.test.ts hooks/useAdventureBattleEffects.ts pages/Adventure.tsx components/adventure/QuestModal.tsx
git commit -m "feat: wire quest kill progression"
```

---

### Task 3: 寫出宗門中期內容的資料 regression tests

**Files:**
- Create: `data/sectMidgameProgression.test.ts`
- Reference: `data/quests.ts`, `data/npcs.ts`, `data/enemies/boss.ts`, `data/items/index.ts`

- [ ] **Step 1: 建立 fail-first 資料測試**

```ts
import { describe, expect, it } from "vitest";
import { MajorRealm } from "../types";
import { ITEMS } from "./items";
import { BOSS_ENEMIES } from "./enemies/boss";
import { QUESTS } from "./quests";
import { SWORD_SECT_NPCS, BEAST_SECT_NPCS, MYSTIC_SECT_NPCS } from "./npcs";

const MIDGAME_QUEST_CASES = [
  {
    questId: "sect_sword_task_02",
    prerequisiteQuestId: "sect_sword_task_01",
    giverId: "sect_sword_patrol_captain",
    minRealm: MajorRealm.Foundation,
    targetId: "m32_b1",
    rewardItemIds: ["flow_light_sword", "sword_scabbard"],
  },
  {
    questId: "sect_sword_task_03",
    prerequisiteQuestId: "sect_sword_task_02",
    giverId: "sect_sword_patrol_captain",
    minRealm: MajorRealm.GoldenCore,
    targetId: "m62_b1",
    rewardItemIds: ["azure_frost_sword", "sword_spirit_stone"],
  },
  {
    questId: "sect_beast_task_02",
    prerequisiteQuestId: "sect_beast_task_01",
    giverId: "sect_beast_huntmaster",
    minRealm: MajorRealm.Foundation,
    targetId: "m42_b1",
    rewardItemIds: ["tiger_king_gauntlet", "scale_shield"],
  },
  {
    questId: "sect_beast_task_03",
    prerequisiteQuestId: "sect_beast_task_02",
    giverId: "sect_beast_huntmaster",
    minRealm: MajorRealm.GoldenCore,
    targetId: "m72_b1",
    rewardItemIds: ["dragon_claw", "black_tortoise_shield"],
  },
  {
    questId: "sect_mystic_task_02",
    prerequisiteQuestId: "sect_mystic_task_01",
    giverId: "sect_mystic_envoy",
    minRealm: MajorRealm.Foundation,
    targetId: "m52_b1",
    rewardItemIds: ["jade_bamboo_staff", "elemental_fan"],
  },
  {
    questId: "sect_mystic_task_03",
    prerequisiteQuestId: "sect_mystic_task_02",
    giverId: "sect_mystic_envoy",
    minRealm: MajorRealm.GoldenCore,
    targetId: "m82_b1",
    rewardItemIds: ["phoenix_feather_staff", "yin_yang_mirror"],
  },
];

describe("sect midgame progression data", () => {
  it("adds chained midgame quests for each sect", () => {
    MIDGAME_QUEST_CASES.forEach((testCase) => {
      const quest = QUESTS[testCase.questId];

      expect(quest, `${testCase.questId} should exist`).toBeDefined();
      expect(quest?.prerequisiteQuestId).toBe(testCase.prerequisiteQuestId);
      expect(quest?.giverId).toBe(testCase.giverId);
      expect(quest?.submitNpcId).toBe(testCase.giverId);

      const levelRequirement = quest?.requirements.find((req) => req.type === "level");
      const killRequirement = quest?.requirements.find((req) => req.type === "kill");

      expect(levelRequirement?.minRealm).toBe(testCase.minRealm);
      expect(killRequirement?.targetId).toBe(testCase.targetId);
      expect(killRequirement?.count).toBe(1);
      expect(BOSS_ENEMIES[testCase.targetId]).toBeDefined();

      const rewardItemIds =
        quest?.rewards.flatMap((reward) => reward.items?.map((item) => item.itemId) ?? []) ?? [];
      expect(rewardItemIds).toEqual(testCase.rewardItemIds);

      testCase.rewardItemIds.forEach((itemId) => {
        expect(ITEMS[itemId], `${itemId} should exist`).toBeDefined();
      });
    });
  });

  it("adds dedicated quest NPCs to each sect hub", () => {
    expect(SWORD_SECT_NPCS.find((npc) => npc.id === "sect_sword_patrol_captain")?.questIds).toEqual([
      "sect_sword_task_02",
      "sect_sword_task_03",
    ]);
    expect(BEAST_SECT_NPCS.find((npc) => npc.id === "sect_beast_huntmaster")?.questIds).toEqual([
      "sect_beast_task_02",
      "sect_beast_task_03",
    ]);
    expect(MYSTIC_SECT_NPCS.find((npc) => npc.id === "sect_mystic_envoy")?.questIds).toEqual([
      "sect_mystic_task_02",
      "sect_mystic_task_03",
    ]);
  });
});
```

- [ ] **Step 2: 執行資料測試確認失敗**

Run: `npm test -- data/sectMidgameProgression.test.ts`

Expected: FAIL，因為 `sect_*_task_02` / `sect_*_task_03` 和新 NPC 尚不存在

- [ ] **Step 3: 提交 fail-first 資料測試**

```bash
git add data/sectMidgameProgression.test.ts
git commit -m "test: cover sect midgame progression data"
```

---

### Task 4: 實作宗門中期 quest 與 NPC 資料

**Files:**
- Modify: `data/quests.ts`
- Modify: `data/npcs.ts`
- Test: `data/sectMidgameProgression.test.ts`

- [ ] **Step 1: 在 `data/quests.ts` 新增三宗中期 quest chain**

在現有三宗 `task_01` 後插入以下 quest 定義：

```ts
    "sect_sword_task_02": {
        id: "sect_sword_task_02",
        type: QuestType.Side,
        title: "劍宗歷練：鎮劍靈",
        description: "巡山統領命你前往築基地界，鎮壓極地劍靈，穩住劍塚外溢的鋒芒。",
        giverId: "sect_sword_patrol_captain",
        submitNpcId: "sect_sword_patrol_captain",
        prerequisiteQuestId: "sect_sword_task_01",
        requirements: [
            { type: "level", minRealm: MajorRealm.Foundation },
            { type: "kill", targetId: "m32_b1", count: 1 }
        ],
        rewards: [
            { exp: 2400, spiritStones: 1200 },
            { items: [{ itemId: "flow_light_sword", count: 1 }, { itemId: "sword_scabbard", count: 1 }] }
        ],
        dialogue: {
            start: [
                "萬劍塚的餘勢已不足以磨你，接下來去築基地界斬那頭極地劍靈。",
                "取其劍核回來，讓我看看你是不是只會在宗門裡耍花架子。"
            ],
            progress: [
                "極地劍靈鋒芒極盛，若心志不穩，劍未出鞘便先亂了。"
            ],
            complete: [
                "很好，劍核尚溫，說明你是正面斬下來的。",
                "這對流光劍與養劍鞘歸你，往後巡山便帶著它們。"
            ]
        }
    },
    "sect_sword_task_03": {
        id: "sect_sword_task_03",
        type: QuestType.Side,
        title: "劍宗真傳：斬大鵬",
        description: "巡山統領命你追入金丹天域，斬下金翅大鵬，為外門立威。",
        giverId: "sect_sword_patrol_captain",
        submitNpcId: "sect_sword_patrol_captain",
        prerequisiteQuestId: "sect_sword_task_02",
        requirements: [
            { type: "level", minRealm: MajorRealm.GoldenCore },
            { type: "kill", targetId: "m62_b1", count: 1 }
        ],
        rewards: [
            { exp: 8200, spiritStones: 4200 },
            { items: [{ itemId: "azure_frost_sword", count: 1 }, { itemId: "sword_spirit_stone", count: 1 }] }
        ],
        dialogue: {
            start: [
                "金翅大鵬橫掠雲海，已連斷我宗三條飛劍傳訊。",
                "去，把它的金羽斬下來，你就算真正踏進劍宗真傳的門檻。"
            ],
            progress: [
                "大鵬擅裂空疾襲，若只追它的影子，你永遠斬不中本體。"
            ],
            complete: [
                "這根金羽夠鋒，也夠重，看來你沒辱沒凌霄劍宗。",
                "青霜劍與劍靈石收下，往後你的劍要更快，也要更準。"
            ]
        }
    },
```

同樣模式加入獸莊與仙宮：

```ts
    "sect_beast_task_02": {
        id: "sect_beast_task_02",
        type: QuestType.Side,
        title: "獸莊歷練：焚王骨",
        description: "獵場監軍命你擊倒烈焰妖王，奪其妖骨，補上山莊下一批鍛體藥引。",
        giverId: "sect_beast_huntmaster",
        submitNpcId: "sect_beast_huntmaster",
        prerequisiteQuestId: "sect_beast_task_01",
        requirements: [
            { type: "level", minRealm: MajorRealm.Foundation },
            { type: "kill", targetId: "m42_b1", count: 1 }
        ],
        rewards: [
            { exp: 2400, spiritStones: 1200 },
            { items: [{ itemId: "tiger_king_gauntlet", count: 1 }, { itemId: "scale_shield", count: 1 }] }
        ],
        dialogue: {
            start: [
                "築基之後，光靠蠻勁沒用，你得學會怎麼把兇獸拆成自己的筋骨。",
                "去把烈焰妖王的妖骨帶回來，我要看你夠不夠狠。"
            ],
            progress: [
                "烈焰妖王火性太燥，若只會硬扛，你的骨頭會先熬不住。"
            ],
            complete: [
                "妖骨焦黑卻沒碎，手法不錯。",
                "虎王拳套和龍鱗盾拿去，下一次獵場衝陣由你開路。"
            ]
        }
    },
    "sect_beast_task_03": {
        id: "sect_beast_task_03",
        type: QuestType.Side,
        title: "獸莊真傳：壓毒體",
        description: "獵場監軍命你鎮壓厄難毒體，驗證你是否已能以金丹之軀扛住萬厄反噬。",
        giverId: "sect_beast_huntmaster",
        submitNpcId: "sect_beast_huntmaster",
        prerequisiteQuestId: "sect_beast_task_02",
        requirements: [
            { type: "level", minRealm: MajorRealm.GoldenCore },
            { type: "kill", targetId: "m72_b1", count: 1 }
        ],
        rewards: [
            { exp: 8200, spiritStones: 4200 },
            { items: [{ itemId: "dragon_claw", count: 1 }, { itemId: "black_tortoise_shield", count: 1 }] }
        ],
        dialogue: {
            start: [
                "厄難毒體不是一般妖獸，它本身就是一口會擴散的災。",
                "你若能把它壓住，才算撐得起萬獸山莊的金丹招牌。"
            ],
            progress: [
                "毒域鋪開時別退，你越退，它越會把你整個人拖進去。"
            ],
            complete: [
                "很好，毒血還沒滲進你的骨頭裡，表示你撐住了。",
                "裂地龍爪和玄武盾收下，這才像山莊的真傳。"
            ]
        }
    },
    "sect_mystic_task_02": {
        id: "sect_mystic_task_02",
        type: QuestType.Side,
        title: "仙宮歷練：平雷澤",
        description: "外務使命你前往雷澤封區，平定雷澤領主對周遭靈脈的侵蝕。",
        giverId: "sect_mystic_envoy",
        submitNpcId: "sect_mystic_envoy",
        prerequisiteQuestId: "sect_mystic_task_01",
        requirements: [
            { type: "level", minRealm: MajorRealm.Foundation },
            { type: "kill", targetId: "m52_b1", count: 1 }
        ],
        rewards: [
            { exp: 2400, spiritStones: 1200 },
            { items: [{ itemId: "jade_bamboo_staff", count: 1 }, { itemId: "elemental_fan", count: 1 }] }
        ],
        dialogue: {
            start: [
                "靈湖只是入門，真正麻煩的是雷澤領主對外圍靈脈的反覆抽擊。",
                "去把那股雷潮壓平，順便證明你不只會在丹房裡念法訣。"
            ],
            progress: [
                "雷澤領主術速極快，若只想和它對轟，神識會先亂掉。"
            ],
            complete: [
                "靈脈的躁動已經平下來了，做得很好。",
                "玉竹杖與五羽扇歸你，往後外務巡查便由你接手。"
            ]
        }
    },
    "sect_mystic_task_03": {
        id: "sect_mystic_task_03",
        type: QuestType.Side,
        title: "仙宮真傳：覆海息潮",
        description: "外務使命你擊潰覆海蛟龍，封回外海靈潮，驗證你是否已能獨當一面。",
        giverId: "sect_mystic_envoy",
        submitNpcId: "sect_mystic_envoy",
        prerequisiteQuestId: "sect_mystic_task_02",
        requirements: [
            { type: "level", minRealm: MajorRealm.GoldenCore },
            { type: "kill", targetId: "m82_b1", count: 1 }
        ],
        rewards: [
            { exp: 8200, spiritStones: 4200 },
            { items: [{ itemId: "phoenix_feather_staff", count: 1 }, { itemId: "yin_yang_mirror", count: 1 }] }
        ],
        dialogue: {
            start: [
                "覆海蛟龍引潮翻海，仙宮外圍的護陣已被它撞了三次。",
                "去把潮勢息掉，你回來時，我就按真傳標準重新看你。"
            ],
            progress: [
                "龍潮一層疊一層，別只看表面的浪，你要截的是底下的靈脈走向。"
            ],
            complete: [
                "潮勢已息，外海的霧線也退了。",
                "鳳羽杖和陰陽鏡收好，往後你出去，別再自稱外門弟子。"
            ]
        }
    },
```

- [ ] **Step 2: 在 `data/npcs.ts` 補三宗中期 quest NPC**

```ts
    {
        id: "sect_sword_patrol_captain",
        name: "巡山統領",
        symbol: "巡",
        type: NPCType.Quest,
        x: 28,
        y: 15,
        description: "負責外門巡山與劍塚歷練調度。",
        questIds: ["sect_sword_task_02", "sect_sword_task_03"],
        dialogue: [
            "想在劍宗往上走，就別只在山門口轉圈。",
            "能不能扛事，看你拿回來的是劍核還是藉口。"
        ]
    },
```

```ts
    {
        id: "sect_beast_huntmaster",
        name: "獵場監軍",
        symbol: "獵",
        type: NPCType.Quest,
        x: 28,
        y: 15,
        description: "統管山莊獵場與血戰試煉。",
        questIds: ["sect_beast_task_02", "sect_beast_task_03"],
        dialogue: [
            "山莊不要只會吼的弟子，要的是敢進獵場的狠人。",
            "你若能把獵物拖回來，我就當你有資格再往前。"
        ]
    },
```

```ts
    {
        id: "sect_mystic_envoy",
        name: "外務使",
        symbol: "使",
        type: NPCType.Quest,
        x: 28,
        y: 15,
        description: "負責仙宮外務巡查與靈脈回報。",
        questIds: ["sect_mystic_task_02", "sect_mystic_task_03"],
        dialogue: [
            "仙宮弟子若只會閉門清修，外頭的靈潮遲早會壓回山門。",
            "出去走一趟，把該平的事平掉，再來和我談真傳。"
        ]
    },
```

- [ ] **Step 3: 執行資料 regression tests**

Run: `npm test -- data/sectMidgameProgression.test.ts utils/questProgress.test.ts data/skills/skillBookCoverage.test.ts`

Expected: PASS，所有新增 quest/NPC/reward assertions 通過，且 manual coverage 不受影響

- [ ] **Step 4: 提交宗門中期資料**

```bash
git add data/quests.ts data/npcs.ts data/sectMidgameProgression.test.ts
git commit -m "feat: add sect midgame progression quests"
```

---

### Task 5: 完整驗證、回寫 OpenSpec tasks、提交收尾

**Files:**
- Modify: `openspec/changes/add-sect-midgame-progression/tasks.md`

- [ ] **Step 1: 標記 OpenSpec tasks 完成**

把 `openspec/changes/add-sect-midgame-progression/tasks.md` 改成：

```md
## 1. 宗門中期內容

- [x] 1.1 為劍宗、獸莊、仙宮各補 1 名中期 quest NPC
- [x] 1.2 為三宗各補 `task_02`、`task_03`，形成 `加入 -> 入門試煉 -> 築基 -> 金丹` 的鏈式節奏
- [x] 1.3 以既有 boss 節點與職業裝備承接 quest 目標與獎勵，不擴張 manual source registry

## 2. 測試與驗證

- [x] 2.1 補 quest data regression，驗證前置鏈、realm gate、giver / submit NPC 與目標 boss
- [x] 2.2 補 NPC wiring / reward validity regression，驗證 questIds 與獎勵 item 對齊
- [x] 2.3 驗證 typecheck、相關 tests 與 `openspec validate add-sect-midgame-progression --strict`

## 3. 文件與追蹤

- [x] 3.1 更新 `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
- [x] 3.2 維護 `docs/superpowers/specs/2026-04-22-sect-midgame-progression-design.md` 與這條 change 的完成狀態
```

- [ ] **Step 2: 跑完整驗證**

Run:

```bash
npm test -- utils/questProgress.test.ts data/sectMidgameProgression.test.ts data/skills/skillBookCoverage.test.ts
npm run typecheck
openspec validate add-sect-midgame-progression --strict
```

Expected:

```text
PASS utils/questProgress.test.ts
PASS data/sectMidgameProgression.test.ts
PASS data/skills/skillBookCoverage.test.ts

> tsc --noEmit

Change 'add-sect-midgame-progression' is valid
```

- [ ] **Step 3: 最終提交**

```bash
git add openspec/changes/add-sect-midgame-progression/tasks.md
git commit -m "chore: close sect midgame progression tasks"
```

---

## Self-Review

- Spec coverage
  - 三宗 `築基 -> 金丹` 任務鏈：Task 3 + Task 4
  - route-specific NPC / boss / rewards：Task 3 + Task 4
  - 不依賴新 quest engine shape：Task 1 + Task 2 只補最小 readiness / kill progress wiring
- Placeholder scan
  - 無 `TBD` / `TODO` / `之後補`
  - 每個 code step 都有具體檔案、片段與命令
- Type consistency
  - helper 介面統一用 `{ progress, isReadyToComplete }`
  - battle hook / modal 都使用同一組 helper 名稱
