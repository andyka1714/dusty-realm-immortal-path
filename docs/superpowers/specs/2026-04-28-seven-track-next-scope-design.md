# 七條後續主線規劃

## 背景

目前 `main` 沒有 active OpenSpec change，`expand-endgame-route-v5` 已完成並歸檔。接下來不應再把所有需求塞進同一條大 change，而應把剩餘玩法缺口拆成可獨立驗證、可分階段提交、可 archive 的主線。

這份文件整理目前建議的七條主線。它不是實作計畫，也不是 OpenSpec proposal；後續每一條要開始實作時，都應再獨立開 OpenSpec change、tasks 與驗證 gate。

## 目標

1. 讓目前仍偏展示的角色屬性變成真正會影響玩法的系統。
2. 讓戰鬥資源、突破、NPC、商店與終盤內容形成更完整的中長期 loop。
3. 避免後續內容擴張破壞已建立的 regression gate、source tracing 與 persistence 規則。

## 非目標

- 不在單一 change 同時重做角色、戰鬥、商店、任務與 UI。
- 不先新增 persisted schema，除非該主線確實需要長期狀態。
- 不重做 quest engine、encounter engine、Workshop foundation 或 Reincarnation foundation。

## Priority 1. 核心屬性實裝

建議 change id: `implement-core-attribute-effects`

### 要解決的問題

`悟性 / 福緣 / 魅力` 目前在文件與 UI 中已有定位，但實際玩法影響仍不完整：

- `悟性`: 文件寫到領悟、修煉、突破，但實際影響還不夠系統化。
- `福緣`: 應影響掉落、奇遇、閃避或稀有事件，但目前沒有完整閉環。
- `魅力`: 應影響 NPC 互動、商店折扣、任務對話或好感，但目前還沒有正式 runtime。

### 建議範圍

- 建立 `utils/attributeEffects.ts` 或同等 helper，集中定義每個屬性的 derived effect。
- 將悟性接到修煉效率、突破成功率或技能領悟速度，但避免和現有公式重複疊太重。
- 將福緣接到 encounter roll、drop quality 或 rare reward chance。
- 將魅力先接到商店折扣與 NPC 對話提示，不一開始做大型好感系統。
- UI 上在角色狀態、StatsPanel 或 tooltip 直接顯示「目前這個屬性實際影響什麼」。

### 驗證重點

- `utils/cultivation.test.ts`
- `utils/dropSystem.test.ts` 或新增 attribute effect test
- `store/slices/characterSlice.test.ts`
- `components/StatsPanel` 或 `GameHUD` snapshot / static markup test

### Persistence

優先不新增 persisted schema。屬性值已存在於 `character.attributes`，新效果應從既有值推導。

## Priority 2. 正式 MP / 靈力 runtime

建議 change id: `add-spirit-power-runtime`

### 要解決的問題

目前 `calculatePlayerStats` 已能算出 MP，消耗品 helper 也支援 `heal_mp / full_restore`，但世界戰鬥的可見 runtime 仍主要只有 HP。這會讓補靈丹、技能消耗與 MP UI 看起來像資料存在但玩法未閉環。

### 建議範圍

- 在 Adventure 世界戰鬥 runtime 增加當前 MP 快照，例如 `worldPlayerMp`。
- 主動技能消耗 MP，不足時不能施放並顯示原因。
- `heal_mp / full_restore` 能在 Adventure / Inventory 裡恢復當前 MP。
- 左上角角色狀態與戰鬥目標卡顯示 HP / MP。
- 避免把 MP 持久化到 `character`，除非後續確認離開戰鬥後也要保存即時資源。

### 驗證重點

- `utils/consumableEffects.test.ts`
- `pages/Inventory.supplies.test.tsx`
- `pages/Adventure` 相關 Playwright smoke
- `utils/battleSystem.test.ts`

### Persistence

第一版建議不新增 persisted schema。MP 作為可見戰鬥 runtime resource，和現有 `worldPlayerHp` 同層處理。

## Priority 3. 突破與災劫系統

建議 change id: `expand-breakthrough-tribulation-system`

### 要解決的問題

突破目前已可運作，但「天劫 / 心魔 / 丹藥輔助 / 境界風險」還沒有形成正式系統。這會讓高境界突破仍偏按鈕與機率，不像修仙遊戲的核心儀式。

### 建議範圍

- 將突破拆成 preview、準備、結果三層。
- 境界越高，突破失敗不只扣修為，也可能觸發心魔、傷勢、壽元損耗或短期 debuff。
- 丹藥與 Workshop recipe 能提供明確突破輔助 cue。
- `福緣 / 悟性 / 根骨` 影響不同部分：成功率、災劫傷害、失敗保底。
- Dashboard 的 `境界突破` 按鈕顯示完整風險與準備狀態，不只顯示可不可點。

### 驗證重點

- `store/slices/characterSlice.test.ts`
- `pages/Dashboard.reincarnation.test.tsx` 或新增突破 panel test
- `data/progression/highRealmLoopSupport.test.ts`
- Playwright `道途` panel regression

### Persistence

若只做結果即時結算，不需要新增 schema。若加入持續性傷勢或心魔狀態，必須升級成 migration-bearing change。

## Priority 4. NPC 好感與商店互動

建議 change id: `add-npc-affinity-and-shop-discounts`

### 要解決的問題

目前 NPC、quest、shop 已有資料，但 NPC 互動主要還是任務入口。`魅力`、宗門身份與 route memory 還沒有明顯影響 NPC / 商店互動。

### 建議範圍

- 第一版只做 deterministic affinity，不做複雜禮物或日常排程。
- NPC 顯示互動態度：陌生、友善、敬重、忌憚。
- 商店價格依魅力、宗門身份或完成任務提供折扣 / 加價。
- QuestModal / ShopPanel 顯示折扣來源，例如 `魅力 +3%`、`凌霄劍宗身份 +5%`。
- 圖鑑 NPC 或宗門頁顯示 NPC 所屬與可互動功能。

### 驗證重點

- `components/adventure/ShopPanel` tests
- `components/adventure/QuestModal` tests
- `utils/currency.test.ts`
- `store/slices/questSlice.test.ts` 或新增 affinity helper test

### Persistence

若 affinity 完全由 completed quests、world memory、profession 與 charm 推導，不需要新增 schema。若要永久記錄 NPC 個別好感，必須新增 `soul` 或 `current` 欄位並補 migration。

## Priority 5. Endgame route density v6

建議 change id: `expand-endgame-route-density-v6`

### 要解決的問題

v5 已把 `sect:*:endgame-loop-v4` 接到 repeatable aftermath、帝冕 follow-up、歸墟 NPC 與輪迴魂印，但目前每宗仍是第一批後續內容。若要讓仙帝端更耐玩，需要增加密度，而不是新增第三套終盤架構。

### 建議範圍

- 每宗再補 2 到 3 個 repeatable aftermath：
  - 穩定材料收益
  - 高風險高收益
  - build identity / soul seal cue
- 增加 `emperor_crown` 或 route material 的不同用途，但不新增全新通用終盤貨幣。
- 更新 content authoring audit，避免三宗 route 不平衡。
- Pending encounter panel 繼續顯示 route、category、chain、memory、風險、收益 cue。

### 驗證重點

- `data/encounters.test.ts`
- `data/contentAuthoringAudit.test.ts`
- `components/game/PendingEncounterPanel.test.tsx`
- Playwright pending encounter smoke

### Persistence

不新增 persisted schema。沿用 `resolvedEventIds`、`soul.worldMemoryTags` 與 encounter repeat policy。

## Priority 6. Workshop endgame specialization v6

建議 change id: `expand-workshop-endgame-specialization-v6`

### 要解決的問題

Workshop 已有 high-tier recipe、route source、specialization tree 與 v5 follow-up，但專精的終盤差異還可以更明確。現在更像「有 cue 的高階 recipe」，下一步可以讓專精改變品質、副產物或材料回收。

### 建議範圍

- 新增 2 到 3 個 endgame leaf node，對應劍修、體修、法修帝冕 follow-up。
- 專精效果只影響靈石成本、mastery、品質 cue、副產物或少量材料回收，不跳過核心 route material。
- Recipe card 顯示 leaf 是否影響此 recipe。
- Source tracing 保持核心 sink 優先，不讓 v6 recipe 擠掉 v3/v4/v5 主要用途。

### 驗證重點

- `data/workshopRecipes.test.ts`
- `store/actions/workshopActions.test.ts`
- `pages/Workshop.crafting.test.tsx`
- `components/Compendium/sourceTracing.test.ts`

### Persistence

優先沿用 `specializationTreeByDiscipline`，不新增 persisted schema。

## Priority 7. Endgame map local density v6

建議 change id: `expand-endgame-map-local-density-v6`

### 要解決的問題

`歸墟裂界 (182)` 已有 v5 local hook，但更高層終盤地圖仍可以補更多 local NPC、route rumor、Boss clue 與 Workshop / Reincarnation 提示。這能讓世界地圖不像只有怪物池和圖鑑資料。

### 建議範圍

- 優先補 180+ 代表地圖。
- 每張新增地圖至少有：
  - 1 個 route-agnostic local hook
  - 1 個 sect / profession sensitive hook
  - 1 個 Workshop 或 Reincarnation clue
- Compendium 地圖頁顯示 NPC / quest / route source 入口。
- 不新增第二套 map event runtime。

### 驗證重點

- `data/mapLocalContentDensity.test.ts`
- `data/contentAuthoringAudit.test.ts`
- `components/Compendium/CompendiumModal.test.tsx`
- Playwright map / compendium smoke

### Persistence

不新增 persisted schema。NPC / Quest / MAP catalog 擴充可自然被舊存檔看到。

## 建議總順序

1. `implement-core-attribute-effects`
2. `add-spirit-power-runtime`
3. `expand-breakthrough-tribulation-system`
4. `add-npc-affinity-and-shop-discounts`
5. `expand-endgame-route-density-v6`
6. `expand-workshop-endgame-specialization-v6`
7. `expand-endgame-map-local-density-v6`

前四條是底層玩法，會讓角色和世界規則更真實；後三條是內容深度，適合在底層數值與 UI 能承接後再擴。

## 共用驗證策略

每條主線完成時至少跑：

- `openspec validate <change-id> --strict`
- Targeted unit / component tests
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium`
- `openspec validate --all --strict`
- `git diff --check`

每條主線完成後都要：

1. 更新對應 gameplay / balance tracking docs。
2. 更新 OpenSpec tasks 狀態。
3. 提交 implementation commit。
4. `openspec archive <change-id> --yes`。
5. 提交 archive commit。
