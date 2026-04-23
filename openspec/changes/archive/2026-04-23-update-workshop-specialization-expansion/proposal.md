# 變更：擴充 Workshop recipe 與專精效果

## Why

`add-workshop-and-event-loops` 已建立 `煉丹 / 煉器` 的正式入口，`update-high-tier-workshop-depth` 也已完成第一批高階丹方 / 器方、route-specific 材料 sink、熟練度 state 與 UI cue。

目前剩下的缺口不再是「Workshop 是否存在」，而是百業仍缺第二輪深度：高階 recipe 數量仍少、`specializationByDiscipline` 已有 state 但沒有實際加成分支，玩家在中後期尚未能用百業專精明確改變 build 節奏。

## What Changes

- 擴充 `Alchemy / Smithing` 的中高階與終盤 recipe，讓不同 route material 有更多 sink
- 定義並落地第一批 `煉丹 / 煉器` 專精效果，讓已存在的 `specializationByDiscipline` 影響 craft 結果或成本 / mastery 節奏
- 更新 Workshop UI，讓玩家能看懂專精選擇、目前熟練度、加成來源與 recipe 受影響的地方
- 補 regression，固定 recipe source、specialization effect、craft output / cost 與 UI cue
- 同步更新 Workshop 文件與下一階段優先級文件

## Non-Goals

- 不重做 Workshop foundation 或 persistence schema；優先使用已存在的 `masteryByDiscipline / specializationByDiscipline`
- 不改 battle core 公式
- 不把百業做成獨立後端或長時間自動排程系統
- 不在這條 change 中重做地圖像素化或 actor token 呈現

## Impact

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `types.ts`
  - `data/workshopRecipes.ts`
  - `data/items/materials.ts`
  - `store/slices/workshopSlice.ts`
  - `store/actions/workshopActions.ts`
  - `pages/Workshop.tsx`
  - `data/workshopRecipes.test.ts`
  - `store/actions/workshopActions.test.ts`
  - `pages/Workshop.crafting.test.tsx`
  - `docs/02_Gameplay/workshop.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
  - `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
