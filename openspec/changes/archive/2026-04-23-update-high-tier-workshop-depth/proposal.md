# 變更：深化高階洞府百業、品質分化與專精循環

## 為什麼

`add-workshop-and-event-loops` 已把 `聚靈陣 / 煉丹 / 煉器` 從 placeholder 推進成第一批正式 loop，`update-encounter-risk-reward-depth` 與 `expand-sect-world-late-progression` 也已讓 route-specific reward source 有了基本來源。

目前剩下的主要缺口是：高境界乘區雖已在 audit 與 regression 中成立，但遊戲內的 Workshop 仍只有低階 `聚氣丹` 與 `鏽鐵劍重鑄`，尚未提供足夠的高階 recipe、品質分化、專精選擇與材料 sink。若不補這條線，後段 build 仍會回到打怪 / 事件掉落為主，百業只像前期教學功能。

## 這次要改什麼

- 補高階丹方與高階器方，讓 `化神 -> 仙帝` 的丹藥 / 裝備支撐有實際 recipe 入口
- 增加 recipe tier、品質預覽、craft mastery 或專精資料，讓百業不只產出固定物品
- 把宗門 / 世界 / encounter 已建立的 route-specific reward source 接成高階材料 sink
- 讓 Workshop UI 顯示高階 recipe 的境界需求、材料來源、品質或專精 cue
- 補 persisted state migration 與 regression，避免舊存檔缺少新百業欄位時無法讀檔
- 同步更新 `docs/02_Gameplay/workshop.md`、高境界乘區審計與下一輪優先級文件

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
  - `client-persistence`
- Affected code:
  - `types.ts`
  - `data/workshopRecipes.ts`
  - `data/items/materials.ts`
  - `data/items/consumables.ts`
  - `data/progression/highRealmLoopSupport.ts`
  - `store/slices/workshopSlice.ts`
  - `store/actions/workshopActions.ts`
  - `store/persistedStateMigration.ts`
  - `pages/Workshop.tsx`
  - `store/actions/workshopActions.test.ts`
  - `pages/Workshop.crafting.test.tsx`
  - `data/progression/highRealmLoopSupport.test.ts`
  - `store/persistedStateMigration.test.ts`
  - `docs/02_Gameplay/workshop.md`
  - `docs/06_Balance_Audit/01_修為與境界曲線審計.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
  - `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
