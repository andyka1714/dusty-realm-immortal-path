# Realm Item Lines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可支撐任務、掉落、採集、商店、功法、煉丹與煉器的多線物品資料基礎。

**Architecture:** 先用九條 OpenSpec change 固定物品分類邊界，第一輪只實作功法秘卷、裝備、煉丹材料、煉器材料與丹藥五條線。新增內容優先走 catalog item、audit helper 與 recipe/source/sink coverage，不新增 persisted state。

**Tech Stack:** TypeScript 5, React 19, Redux Toolkit, Vite, Vitest, OpenSpec.

---

### Task 1: OpenSpec 與總設計

**Files:**
- Create: `docs/superpowers/specs/2026-04-28-realm-item-lines-design.md`
- Create: `openspec/changes/add-skill-manual-item-line/*`
- Create: `openspec/changes/add-equipment-item-line/*`
- Create: `openspec/changes/add-alchemy-material-line/*`
- Create: `openspec/changes/add-smithing-material-line/*`
- Create: `openspec/changes/add-pill-item-line/*`
- Create: `openspec/changes/add-quest-item-line/*`
- Create: `openspec/changes/add-region-specialty-item-line/*`
- Create: `openspec/changes/add-currency-token-item-line/*`
- Create: `openspec/changes/add-talisman-array-and-artifact-line/*`

- [x] **Step 1: 寫總設計文件**

寫入九條物品線、境界分層、Persistence 與驗證策略。

- [x] **Step 2: 驗證九條 OpenSpec**

Run:

```bash
for change in \
  add-skill-manual-item-line \
  add-equipment-item-line \
  add-alchemy-material-line \
  add-smithing-material-line \
  add-pill-item-line \
  add-quest-item-line \
  add-region-specialty-item-line \
  add-currency-token-item-line \
  add-talisman-array-and-artifact-line; do
  openspec validate "$change" --strict
done
```

Expected: 每條 change 都通過。

### Task 2: 共用物品 taxonomy audit

**Files:**
- Modify: `types.ts`
- Create: `data/items/itemLineMetadata.ts`
- Create: `data/items/itemLineAudit.test.ts`

- [x] **Step 1: 寫 RED test**

新增 `data/items/itemLineAudit.test.ts`，確認五條第一輪物品線都有境界 coverage：

```ts
import { describe, expect, it } from "vitest";
import { MajorRealm } from "../../types";
import { ITEM_LINE_REALM_COVERAGE } from "./itemLineMetadata";

describe("item line metadata", () => {
  it("covers low and mid realms for first-wave item lines", () => {
    const requiredRealms = [
      MajorRealm.Mortal,
      MajorRealm.QiRefining,
      MajorRealm.Foundation,
      MajorRealm.GoldenCore,
    ];

    for (const line of ["manual", "equipment", "alchemy_material", "smithing_material", "pill"] as const) {
      for (const realm of requiredRealms) {
        expect(ITEM_LINE_REALM_COVERAGE[line][realm]?.length ?? 0, `${line} realm ${realm}`).toBeGreaterThan(0);
      }
    }
  });
});
```

- [x] **Step 2: 確認 RED**

Run:

```bash
npm test -- data/items/itemLineAudit.test.ts
```

Expected: FAIL，因為 `itemLineMetadata.ts` 尚未存在。

- [x] **Step 3: 實作 metadata**

建立 `data/items/itemLineMetadata.ts`，輸出：

```ts
import { MajorRealm } from "../../types";

export type ItemLineId =
  | "manual"
  | "equipment"
  | "alchemy_material"
  | "smithing_material"
  | "pill"
  | "quest_item"
  | "region_specialty"
  | "currency_token"
  | "talisman_array_artifact";

export const ITEM_LINE_REALM_COVERAGE: Record<
  ItemLineId,
  Partial<Record<MajorRealm, string[]>>
> = {
  manual: {
    [MajorRealm.Mortal]: ["凡界藏經閣入門秘卷"],
    [MajorRealm.QiRefining]: ["宗門入門秘卷"],
    [MajorRealm.Foundation]: ["宗門進階秘卷"],
    [MajorRealm.GoldenCore]: ["金丹真傳秘卷"],
  },
  equipment: {
    [MajorRealm.Mortal]: ["凡鐵武器", "粗布防具"],
    [MajorRealm.QiRefining]: ["入門法器", "門派制式裝"],
    [MajorRealm.Foundation]: ["築基職業套裝"],
    [MajorRealm.GoldenCore]: ["金丹真傳裝備"],
  },
  alchemy_material: {
    [MajorRealm.Mortal]: ["聚靈草", "野山參"],
    [MajorRealm.QiRefining]: ["凝氣草", "靈露"],
    [MajorRealm.Foundation]: ["凝露花", "玄霜芝"],
    [MajorRealm.GoldenCore]: ["九葉金蓮", "赤陽果"],
  },
  smithing_material: {
    [MajorRealm.Mortal]: ["凡鐵", "粗玉"],
    [MajorRealm.QiRefining]: ["玄鐵", "靈木"],
    [MajorRealm.Foundation]: ["寒鐵", "青玉"],
    [MajorRealm.GoldenCore]: ["赤銅精", "金紋石"],
  },
  pill: {
    [MajorRealm.Mortal]: ["回春散"],
    [MajorRealm.QiRefining]: ["聚氣丹"],
    [MajorRealm.Foundation]: ["築基輔助丹"],
    [MajorRealm.GoldenCore]: ["凝元丹"],
  },
  quest_item: {},
  region_specialty: {},
  currency_token: {},
  talisman_array_artifact: {},
};
```

- [x] **Step 4: GREEN**

Run:

```bash
npm test -- data/items/itemLineAudit.test.ts
```

Expected: PASS。

### Task 3: 煉丹與煉器材料第一批資料

**Files:**
- Modify: `types.ts`
- Modify: `data/items/materials.ts`
- Modify: `data/workshopRecipes.ts`
- Test: `data/items/itemLineAudit.test.ts`
- Test: `data/workshopRecipes.test.ts`

- [x] **Step 1: 寫 RED test**

在 `data/items/itemLineAudit.test.ts` 增加測試：低中境界丹材與器材 item id 必須存在於 `ITEMS`。

- [x] **Step 2: 確認 RED**

Run:

```bash
npm test -- data/items/itemLineAudit.test.ts
```

Expected: FAIL，因為新 item id 尚未加入。

- [x] **Step 3: 新增材料**

在 `data/items/materials.ts` 補低中境界材料，例如：

- `wild_ginseng`
- `condensed_qi_grass`
- `spirit_dew`
- `frost_lingzhi`
- `nine_leaf_golden_lotus`
- `common_iron`
- `cold_iron`
- `green_jade`
- `red_copper_essence`
- `gold_vein_stone`

- [x] **Step 4: 接入 recipe**

把 `qi_pill` 與 `novice_sword_reforge` 的 ingredient 保持相容，再新增 1-2 個低中境界 recipe，例如 `condensed_qi_pill`、`foundation_iron_reforge`。

- [x] **Step 5: GREEN**

Run:

```bash
npm test -- data/items/itemLineAudit.test.ts data/workshopRecipes.test.ts
```

Expected: PASS。

### Task 4: 丹藥第一批資料

**Files:**
- Modify: `types.ts`
- Modify: `data/items/consumables.ts`
- Modify: `data/workshopRecipes.ts`
- Test: `data/items/itemLineAudit.test.ts`
- Test: `pages/Inventory.supplies.test.tsx`

- [x] **Step 1: 寫 RED test**

新增測試確認低中境界至少有修為丹、恢復丹、戰鬥丹、突破輔助丹。

- [x] **Step 2: 確認 RED**

Run:

```bash
npm test -- data/items/itemLineAudit.test.ts
```

Expected: FAIL，因為戰鬥丹與部分境界丹藥尚未存在。

- [x] **Step 3: 新增丹藥**

在 `data/items/consumables.ts` 補：

- `minor_qi_pill`
- `condensed_qi_pill`
- `marrow_cleansing_pill`
- `iron_skin_pill`
- `spirit_focus_pill`
- `golden_core_condensing_pill`

- [x] **Step 4: 接入 recipe 或商店**

至少讓新丹藥有 Workshop recipe 或商店來源，避免只有 catalog。

- [x] **Step 5: GREEN**

Run:

```bash
npm test -- data/items/itemLineAudit.test.ts pages/Inventory.supplies.test.tsx
```

Expected: PASS。

### Task 5: 功法秘卷與裝備線 audit 收口

**Files:**
- Modify: `data/items/manuals.ts`
- Modify: `data/items/equipment/audit.ts`
- Modify: `data/skills/skillBookCoverage.test.ts`
- Modify: `data/items/equipment/equipmentAudit.test.ts`

- [x] **Step 1: 跑既有基線**

Run:

```bash
npm test -- data/skills/skillBookCoverage.test.ts data/skillManualRouting.test.ts data/items/equipment/equipmentAudit.test.ts
```

Expected: PASS。

- [x] **Step 2: 補缺口**

若 audit 顯示缺境界或來源，補 metadata 或測試，不改 persisted schema。

- [x] **Step 3: 更新 tasks**

把前五條 OpenSpec tasks 對應項目標記完成。

### Task 6: 驗證與下一輪交接

**Files:**
- Modify: `docs/superpowers/plans/2026-04-28-realm-item-lines.md`
- Modify: all active OpenSpec `tasks.md`

- [x] **Step 1: OpenSpec validate**

Run:

```bash
for change in \
  add-skill-manual-item-line \
  add-equipment-item-line \
  add-alchemy-material-line \
  add-smithing-material-line \
  add-pill-item-line \
  add-quest-item-line \
  add-region-specialty-item-line \
  add-currency-token-item-line \
  add-talisman-array-and-artifact-line; do
  openspec validate "$change" --strict
done
```

- [x] **Step 2: 全量驗證**

Run:

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

- [x] **Step 3: Archive 第一批已完成 changes**

第一批只 archive 已完成實作的前五條；後四條維持 active 規格或等下一輪內容實作。
