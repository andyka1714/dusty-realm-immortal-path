# Post-v6 下一波規劃

## 背景

目前 `main` 已完成 HUD / gameplay v6 批次，且沒有 active OpenSpec change。第 26 節的七線與 HUD / 任務追蹤規劃已被後續 change 吸收，後續不應再從舊規劃重開同一批事項。

這份文件是新的 live planning source。它不是 OpenSpec proposal，也不是 implementation plan；開始實作前仍需針對選定方向獨立開 OpenSpec change、tasks 與驗證 gate。

## 已完成且不應重開

- `add-combat-power-and-enemy-intel`
- `update-adventure-hud-layout`
- `add-quest-tracker-hud`
- `implement-core-attribute-effects`
- `add-spirit-power-runtime`
- `expand-breakthrough-tribulation-system`
- `add-npc-affinity-and-shop-discounts`
- `expand-endgame-route-density-v6`
- `expand-workshop-endgame-specialization-v6`
- `expand-endgame-map-local-density-v6`

## 規劃原則

1. 一個方向開一條 OpenSpec change，不把 UI、內容密度、migration-bearing runtime 全塞進同一批。
2. 可由既有 state 推導的內容維持 runtime-only 或 catalog-only。
3. 只有持續性心魔 / 傷勢、永久 NPC 好感、跨世代 soul reward 這類真正需要長期記錄的功能才進 client-persistence spec。
4. UI 可視行為要補 component test 或 Playwright smoke；資料密度與 route coverage 要補 authoring audit。
5. 開工順序優先選低風險、可快速 archive 的 change，讓後續大型 persistence change 有穩定基線。

## 建議總順序

1. `update-mobile-quest-tracker-collapse`
2. `add-reincarnation-v6-soul-seals`
3. `expand-endgame-route-density-v7`
4. `expand-breakthrough-tribulation-consequences`
5. `add-persistent-npc-affinity-system`

## 1. Mobile 任務追蹤收合

建議 change id: `update-mobile-quest-tracker-collapse`

### 要解決的問題

`QuestTrackerHUD` 已在 Adventure 主畫面落地，但目前重點仍是 desktop 左側常駐資訊。mobile 上需要明確的低佔用入口與展開狀態，否則任務追蹤容易被視為 desktop-only improvement。

### 建議範圍

- 在 mobile viewport 將任務追蹤收合為固定小入口。
- 點擊後以底部 sheet 或側邊 overlay 顯示 active quests。
- 不新增 persisted pin state；展開 / 收合只存在目前 React runtime。
- 確保不遮住 bottom dock、action wheel、地圖 modal 與 combat target card。

### 驗證重點

- `components/game/QuestTrackerHUD.test.tsx`
- `components/game/GameShell.test.tsx`
- `tests/e2e/shared-ui-foundation.spec.ts` mobile viewport smoke
- `git diff --check`

### Persistence

不新增 persisted schema，不需要 migration。

## 2. Reincarnation v6 魂印 / Build reward

建議 change id: `add-reincarnation-v6-soul-seals`

### 要解決的問題

v6 route、Workshop leaf 與歸墟 local clue 已提到 Reincarnation 方向，但目前還沒有正式 v6 魂印或下一世 build reward。這會讓 v6 clue 像提示，還沒有真正回到輪迴 build loop。

### 建議範圍

- 為三宗 v6 route 增加對應魂印或 build reward。
- 魂印解鎖條件讀取既有 route memory、resolved encounter 或 Workshop / quest clue。
- Reincarnation UI 顯示 v6 魂印來源、鎖定原因與 build identity。
- 若可沿用既有 reincarnation perk / soul seal shape，避免新增 schema。

### 驗證重點

- `components/game/ReincarnationFlow.test.tsx`
- `utils/reincarnation.test.ts`
- `data/contentAuthoringAudit.test.ts`
- `components/Compendium/CompendiumModal.test.tsx` source cue regression

### Persistence

優先沿用既有 reincarnation / soul shape，不新增 persisted schema。若要新增跨世代 reward 計數或永久 unlock 欄位，必須改成 migration-bearing change。

## 3. Endgame route density v7

建議 change id: `expand-endgame-route-density-v7`

### 要解決的問題

v6 已讓三宗各有 repeatable aftermath，但每條 route 的終盤變化仍有限。v7 應補更多 encounter variety，而不是新增第三套終盤架構。

### 建議範圍

- 每宗新增 1 到 2 個 v7 repeatable aftermath。
- 至少分出穩定材料收益、高風險高收益、build identity 或 soul seal cue。
- 更新 authoring audit，檢查 v5 / v6 / v7 density 是否三宗平衡。
- Pending encounter panel 持續顯示 route、category、chain、memory、風險、收益 cue。

### 驗證重點

- `data/encounters.test.ts`
- `data/contentAuthoringAudit.test.ts`
- `components/game/PendingEncounterPanel.test.tsx`
- Playwright pending encounter smoke

### Persistence

不新增 persisted schema。沿用 `resolvedEventIds`、`soul.worldMemoryTags` 與 encounter repeat policy。

## 4. 突破災劫持續後果

建議 change id: `expand-breakthrough-tribulation-consequences`

### 要解決的問題

目前突破 preview 已顯示成功率、天劫 / 心魔風險與準備提示，但失敗後仍沒有持續性心魔、傷勢、反噬或壽元壓力。下一步若要讓災劫成為真正系統，需要補結果狀態與恢復手段。

### 建議範圍

- 設計突破失敗後的短期或持續性 consequence。
- Dashboard 顯示目前災劫後果、持續時間、恢復方式與下次突破風險。
- 丹藥、Workshop recipe 或屬性效果可降低或清除 consequence。
- 明確決定 consequence 存在於 `current` 還是 `soul` state。

### 驗證重點

- `store/slices/characterSlice.test.ts`
- `pages/Dashboard` breakthrough / reincarnation regression
- `utils/breakthroughPreview.test.ts`
- persistence migration / hydrate regression
- Playwright `道途` panel smoke

### Persistence

高度可能需要新增 persisted schema 與 migration。除非只做單次 log / runtime debuff，否則必須進 `client-persistence` spec。

## 5. 永久 NPC 好感系統

建議 change id: `add-persistent-npc-affinity-system`

### 要解決的問題

目前 NPC affinity 是 deterministic projection，適合第一版商店折扣，但不會記錄玩家和特定 NPC / sect 的長期關係。若要支援禮物、任務後續、特殊商店或多輪互動，需要正式 persistence。

### 建議範圍

- 設計 NPC / sect reputation state，決定存在於 `current` 或 `soul`。
- Quest reward、dialogue choice、shop transaction 或 route memory 可調整 affinity。
- ShopPanel / QuestModal 顯示目前關係等級、變化原因與折扣來源。
- 保留 deterministic charm / profession baseline，讓 persisted affinity 是增量而不是取代全部來源。

### 驗證重點

- quest / character slice regression
- persistence migration / hydrate regression
- `components/adventure/ShopPanel` tests
- `components/adventure/QuestModal` tests
- Playwright NPC / shop smoke

### Persistence

需要新增 persisted schema 與 migration。這條不應和 mobile quest tracker 或 v7 content density 合併。

## 建議立即下一步

若要最穩定地接續目前 HUD / quest tracker 工作，先開 `update-mobile-quest-tracker-collapse`。它範圍小、沒有 migration、能快速補齊 mobile 體驗缺口。

若想先推進終盤 build loop，第二優先是 `add-reincarnation-v6-soul-seals`。它能把 v6 route、Workshop 與地圖 clue 接回輪迴系統，但需要先確認是否能完全沿用既有 soul seal shape。

不建議立即開 `expand-breakthrough-tribulation-consequences` 或 `add-persistent-npc-affinity-system`，除非本輪目標明確包含 persisted schema / migration；這兩條的驗證與回歸成本明顯更高。
