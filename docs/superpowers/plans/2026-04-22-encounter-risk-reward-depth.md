# Encounter Risk Reward Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把現有 `Encounter` foundation 擴成具上下文條件、anti-repeat、route-specific pool 與可讀風險收益 cue 的正式內容系統。

**Architecture:** 先把 `data/encounters.ts` 從單純 `realm -> list` 提升為資料驅動的 selector layer：事件資料補 metadata，selector 接收 state-derived context，`resolvedEventIds` 真正參與 one-time gating。UI 層只在 `PendingEncounterPanel` / `GameShell` 補上下文與 choice cue，不新增新頁面或新 schema。

**Tech Stack:** TypeScript, React 19, Redux Toolkit, Vitest, OpenSpec

---

## File Map

- Modify: `data/encounters.ts`
  - 新增 encounter metadata、selector context、weighted selection、one-time gating 與 route-specific pools。
- Create: `data/encounters.test.ts`
  - 驗證 selector context、repeat policy 與 profession / sect pool 差異。
- Modify: `store/actions/timeActions.ts`
  - 由 Redux state 組 encounter selector context，不再只把 `realm` 傳給 selector。
- Modify: `store/actions/timeActions.event.test.ts`
  - 驗證 time flow 會依上下文派發正確的 encounter。
- Modify: `components/game/PendingEncounterPanel.tsx`
  - 補事件類型 / route cue 與 choice 風險收益摘要。
- Modify: `components/game/PendingEncounterPanel.test.tsx`
  - 驗證 panel 會顯示 cue，而不是只有標題與按鈕文字。
- Modify: `components/game/GameShell.tsx`
  - 保持 modal wiring，但補必要 props 傳遞與 eyebrow/context 呈現。
- Modify: `components/game/GameShell.test.tsx`
  - 驗證 GameShell 會顯示新的 encounter cue。
- Modify: `store/actions/encounterActions.ts`
  - 如有需要，補 choice reward summary 對應邏輯，但不改 schema。
- Modify: `docs/02_Gameplay/workshop.md`
  - 回寫正式 encounter 深化後與 workshop / route-specific rewards 的承接。
- Modify: `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
  - 若 implementation 決策需要微調，用實作真相同步收口。
- Modify: `openspec/changes/update-encounter-risk-reward-depth/tasks.md`
  - implementation 完成後改成 `[x]`。

## Fixed Design Decisions

- Encounter state schema 先維持：
  - `pendingEvent: { eventId, year }`
  - `resolvedEventIds: string[]`
- selector context 至少包含：
  - `majorRealm`
  - `profession`
  - `completedQuestIds`
  - `resolvedEventIds`
- 事件 repeat policy 先分成：
  - `repeatable`
  - `once_per_run`
- 第一批 route-specific pool 至少包含：
  - 三宗門各一個 sect-specific 事件
  - 三職業各一個 profession-specific 事件
  - 現有高境界事件保留，並可標註為對應類型
- UI cue 只補：
  - 事件類型標籤
  - 路線 / 宗門 / 職業標籤
  - 選項風險 / 收益摘要
- 不在這批新增：
  - 新 store slice
  - persisted state schema migration
  - branching narrative engine

---

### Task 1: 用 fail-first tests 鎖定 encounter selector context 與 anti-repeat

**Files:**
- Create: `data/encounters.test.ts`
- Modify: `data/encounters.ts`
- Modify: `store/actions/timeActions.ts`
- Modify: `store/actions/timeActions.event.test.ts`

- [ ] **Step 1: 先寫 selector 的失敗測試**

```ts
import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../types";
import { getAvailableEncounterEvents, pickEncounterEvent } from "./encounters";

describe("encounter selector", () => {
  it("filters out once-per-run events that were already resolved", () => {
    const available = getAvailableEncounterEvents({
      majorRealm: MajorRealm.Foundation,
      profession: ProfessionType.Sword,
      completedQuestIds: ["sect_sword_join"],
      resolvedEventIds: ["sword_sect_patrol_cache"],
    });

    expect(available.some((event) => event.id === "sword_sect_patrol_cache")).toBe(false);
  });

  it("exposes sect-specific events only when the matching sect progression is present", () => {
    const swordAvailable = getAvailableEncounterEvents({
      majorRealm: MajorRealm.Foundation,
      profession: ProfessionType.Sword,
      completedQuestIds: ["sect_sword_join"],
      resolvedEventIds: [],
    });
    const bodyAvailable = getAvailableEncounterEvents({
      majorRealm: MajorRealm.Foundation,
      profession: ProfessionType.Body,
      completedQuestIds: ["sect_beast_join"],
      resolvedEventIds: [],
    });

    expect(swordAvailable.some((event) => event.id === "sword_sect_patrol_cache")).toBe(true);
    expect(bodyAvailable.some((event) => event.id === "sword_sect_patrol_cache")).toBe(false);
  });

  it("uses weighted selection over the filtered pool", () => {
    const picked = pickEncounterEvent(
      {
        majorRealm: MajorRealm.Foundation,
        profession: ProfessionType.Sword,
        completedQuestIds: ["sect_sword_join"],
        resolvedEventIds: [],
      },
      0
    );

    expect(picked).toBeTruthy();
  });
});
```

- [ ] **Step 2: 執行單測確認它先失敗**

Run: `npm test -- data/encounters.test.ts store/actions/timeActions.event.test.ts`

Expected:
- `data/encounters.test.ts` fail，因為 selector 目前不接受 context object
- `timeActions.event.test.ts` 可能也會因 API 變更或新條件失敗

- [ ] **Step 3: 寫最小 implementation 把 selector 升級成 context-aware**

```ts
export type EncounterRepeatPolicy = "repeatable" | "once_per_run";

export interface EncounterSelectorContext {
  majorRealm: MajorRealm;
  profession: ProfessionType;
  completedQuestIds: string[];
  resolvedEventIds: string[];
}

export interface EncounterEvent {
  id: string;
  title: string;
  description: string;
  minRealm: MajorRealm;
  maxRealm: MajorRealm;
  choices: EncounterChoice[];
  weight?: number;
  repeatPolicy?: EncounterRepeatPolicy;
  eligibleProfessions?: ProfessionType[];
  requiredCompletedQuestIds?: string[];
  categoryLabel?: string;
  routeLabel?: string;
}

const matchesEncounterContext = (
  event: EncounterEvent,
  context: EncounterSelectorContext
) => {
  if (context.majorRealm < event.minRealm || context.majorRealm > event.maxRealm) return false;
  if (
    event.repeatPolicy === "once_per_run" &&
    context.resolvedEventIds.includes(event.id)
  ) {
    return false;
  }
  if (
    event.eligibleProfessions &&
    !event.eligibleProfessions.includes(context.profession)
  ) {
    return false;
  }
  if (
    event.requiredCompletedQuestIds &&
    !event.requiredCompletedQuestIds.every((questId) =>
      context.completedQuestIds.includes(questId)
    )
  ) {
    return false;
  }

  return true;
};

export const getAvailableEncounterEvents = (context: EncounterSelectorContext) =>
  Object.values(ENCOUNTER_EVENTS).filter((event) => matchesEncounterContext(event, context));

export const pickEncounterEvent = (
  context: EncounterSelectorContext,
  roll = Math.random()
) => {
  const available = getAvailableEncounterEvents(context);
  if (available.length === 0) return null;

  const totalWeight = available.reduce((sum, event) => sum + (event.weight ?? 1), 0);
  let cursor = roll * totalWeight;

  for (const event of available) {
    cursor -= event.weight ?? 1;
    if (cursor <= 0) return event;
  }

  return available[available.length - 1];
};
```

- [ ] **Step 4: 在 `timeActions.ts` 接上 selector context**

```ts
const { encounter, quest, character } = getState();
const encounterContext = {
  majorRealm: character.majorRealm,
  profession: character.profession,
  completedQuestIds: quest.completedQuests,
  resolvedEventIds: encounter.resolvedEventIds,
};

const pickedEncounter = pickEncounterEvent(encounterContext, Math.random());
```

- [ ] **Step 5: 重新跑相關測試，確認轉綠**

Run: `npm test -- data/encounters.test.ts store/actions/timeActions.event.test.ts`

Expected:
- `data/encounters.test.ts` passes
- `store/actions/timeActions.event.test.ts` passes

- [ ] **Step 6: Commit**

```bash
git add data/encounters.ts data/encounters.test.ts store/actions/timeActions.ts store/actions/timeActions.event.test.ts
git commit -m "feat(encounter): add context-aware selector"
```

---

### Task 2: 補第一批 sect / profession specific event pools 與 choice reward cue

**Files:**
- Modify: `data/encounters.ts`
- Modify: `store/actions/encounterActions.ts`
- Modify: `store/actions/encounterActions.test.ts`

- [ ] **Step 1: 先寫資料與 resolution 的失敗測試**

```ts
import { describe, expect, it } from "vitest";
import { ENCOUNTER_EVENTS } from "./encounters";

describe("encounter route-specific content", () => {
  it("defines sword sect and mystic profession events with explicit route labels", () => {
    expect(ENCOUNTER_EVENTS.sword_sect_patrol_cache?.routeLabel).toBe("凌霄劍宗");
    expect(ENCOUNTER_EVENTS.mage_ink_resonance?.routeLabel).toBe("法修");
  });

  it("defines reward preview tags for risky or costly choices", () => {
    const buyOre = ENCOUNTER_EVENTS.wandering_smith.choices.find(
      (choice) => choice.id === "buy_ore"
    );

    expect(buyOre?.previewTags).toContain("耗費靈石");
  });
});
```

- [ ] **Step 2: 執行測試確認它先失敗**

Run: `npm test -- data/encounters.test.ts store/actions/encounterActions.test.ts`

Expected:
- fail on missing route-specific events or `previewTags`

- [ ] **Step 3: 寫最小 implementation**

```ts
export interface EncounterChoice {
  id: string;
  label: string;
  description: string;
  reward: EncounterChoiceReward;
  tone?: "steady" | "risky" | "costly";
  previewTags?: string[];
}

export const ENCOUNTER_EVENTS = {
  sword_sect_patrol_cache: {
    id: "sword_sect_patrol_cache",
    title: "巡山暗匣",
    description: "巡山統領留下一只只給外門劍修開啟的暗匣。",
    minRealm: MajorRealm.Foundation,
    maxRealm: MajorRealm.GoldenCore,
    repeatPolicy: "once_per_run",
    requiredCompletedQuestIds: ["sect_sword_join"],
    eligibleProfessions: [ProfessionType.Sword],
    categoryLabel: "Sect Encounter",
    routeLabel: "凌霄劍宗",
    choices: [
      {
        id: "claim_cache",
        label: "啟匣取劍材",
        description: "直接取走最適合養劍的資材。",
        tone: "steady",
        previewTags: ["穩定收益", "養劍資材"],
        reward: { items: [{ itemId: "sword_spirit_stone", count: 1 }], logMessage: "..." },
      },
    ],
  },
};
```

- [ ] **Step 4: 跑測試確認 route-specific event 與 reward cue 生效**

Run: `npm test -- data/encounters.test.ts store/actions/encounterActions.test.ts`

Expected:
- route-specific data tests pass
- existing encounter resolution tests still pass

- [ ] **Step 5: Commit**

```bash
git add data/encounters.ts data/encounters.test.ts store/actions/encounterActions.test.ts store/actions/encounterActions.ts
git commit -m "feat(encounter): add route specific event pools"
```

---

### Task 3: 補 encounter panel 的可讀 cue、文件與最終驗證

**Files:**
- Modify: `components/game/PendingEncounterPanel.tsx`
- Modify: `components/game/PendingEncounterPanel.test.tsx`
- Modify: `components/game/GameShell.tsx`
- Modify: `components/game/GameShell.test.tsx`
- Modify: `docs/02_Gameplay/workshop.md`
- Modify: `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
- Modify: `openspec/changes/update-encounter-risk-reward-depth/tasks.md`

- [ ] **Step 1: 先寫 panel 的失敗測試**

```ts
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PendingEncounterPanel } from "./PendingEncounterPanel";
import { ENCOUNTER_EVENTS } from "../../data/encounters";

describe("PendingEncounterPanel", () => {
  it("renders category, route, and choice preview cues", () => {
    const markup = renderToStaticMarkup(
      <PendingEncounterPanel
        event={ENCOUNTER_EVENTS.sword_sect_patrol_cache}
        pending={{ eventId: "sword_sect_patrol_cache", year: 120 }}
        onChoose={() => undefined}
      />
    );

    expect(markup).toContain("Sect Encounter");
    expect(markup).toContain("凌霄劍宗");
    expect(markup).toContain("穩定收益");
  });
});
```

- [ ] **Step 2: 執行 UI 測試確認先失敗**

Run: `npm test -- components/game/PendingEncounterPanel.test.tsx components/game/GameShell.test.tsx`

Expected:
- fail on missing encounter cue rendering

- [ ] **Step 3: 寫最小 UI implementation**

```tsx
<div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em]">
  {event.categoryLabel && (
    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-cyan-200">
      {event.categoryLabel}
    </span>
  )}
  {event.routeLabel && (
    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
      {event.routeLabel}
    </span>
  )}
</div>

{choice.previewTags?.length ? (
  <div className="mt-3 flex flex-wrap gap-2">
    {choice.previewTags.map((tag) => (
      <span key={tag} className="rounded-full border border-stone-700 px-2 py-1 text-xs text-stone-300">
        {tag}
      </span>
    ))}
  </div>
) : null}
```

- [ ] **Step 4: 更新文件與 OpenSpec task checklist**

```md
- encounter 現在已正式依 profession / sect / resolved history 做 selector filtering
- panel 會顯示事件類型、路線與 choice 風險收益 cue
```

- [ ] **Step 5: 跑最終驗證**

Run:
- `npm test -- data/encounters.test.ts store/actions/timeActions.event.test.ts store/actions/encounterActions.test.ts components/game/PendingEncounterPanel.test.tsx components/game/GameShell.test.tsx`
- `npm run typecheck`
- `openspec validate update-encounter-risk-reward-depth --strict`

Expected:
- targeted tests all pass
- typecheck passes
- OpenSpec validation passes

- [ ] **Step 6: Commit**

```bash
git add components/game/PendingEncounterPanel.tsx components/game/PendingEncounterPanel.test.tsx components/game/GameShell.tsx components/game/GameShell.test.tsx docs/02_Gameplay/workshop.md docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md openspec/changes/update-encounter-risk-reward-depth/tasks.md
git commit -m "feat(encounter): surface encounter risk reward cues"
```
