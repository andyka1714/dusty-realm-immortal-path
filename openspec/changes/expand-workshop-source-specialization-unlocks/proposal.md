# 變更：深化 Workshop 材料來源與專精解鎖

## Why

`update-workshop-specialization-expansion` 已完成第二批高階丹方 / 器方與第一批 `Alchemy / Smithing` 專精效果。下一個缺口不再是 recipe 是否存在，而是：

- route-specific 材料來源仍偏集中，玩家刷材料時缺少更多世界 / 奇遇路徑
- 專精目前可直接選擇，缺少 mastery、境界或路線成就 gating
- UI 已能顯示專精效果，但還不能清楚說明「如何解鎖 / 如何重置 / 這些材料從哪裡來」

如果不另外開主線，後續很容易只繼續堆 recipe，而沒有把 Workshop 接回世界探索與長期 build 決策。

## What Changes

- 擴充 route-specific material 的世界 / encounter source，讓 `凌霄劍星鋼 / 縹緲星魂蓮 / 萬獸血骨殘材` 不只依賴少數里程碑
- 為 `鴻蒙凝丹 / 星火鍛胚` 這類專精加入正式 unlock requirement 與 reset / switch 成本規則
- 讓 Workshop UI 顯示專精鎖定原因、解鎖來源、切換成本與受影響 recipe
- 補 regression，固定材料來源、專精 gating 與 UI cue，不讓專精繞過高階材料 sink
- 同步更新 Workshop 文件與下一階段追蹤文件

## Non-Goals

- 不新增第三個百業 discipline
- 不重做 `masteryByDiscipline / specializationByDiscipline` persistence schema，除非實作時證明現有欄位無法承接
- 不重寫 battle core 或地圖內戰鬥
- 不改玩家 / 怪物 / NPC 的文字 token 呈現

## Impact

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/encounters.ts`
  - `data/encounters.test.ts`
  - `data/workshopRecipes.ts`
  - `data/workshopRecipes.test.ts`
  - `store/slices/workshopSlice.ts`
  - `store/actions/workshopActions.ts`
  - `store/actions/workshopActions.test.ts`
  - `pages/Workshop.tsx`
  - `pages/Workshop.crafting.test.tsx`
  - `docs/02_Gameplay/workshop.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
  - `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
