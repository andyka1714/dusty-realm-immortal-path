# 變更：收斂即時戰鬥的怪物分工與狀態提示 polish

## 為什麼

`P0 / P1 / P2` 與 retired skill 退場主線都已完成後，目前 battle core 與地圖內即時戰鬥已經進入「主流程可用」狀態。

現在最明確的下一步，不是再開 3D 原型，也不是回頭補舊 checklist，而是把 `PixiJS` 即時戰鬥做完最後一層可讀性與分工差異：

- 怪物雖已區分近戰 / 遠程 / 法術，但角色分工與走位手感還偏粗
- 控制與狀態已進 battle core，但地圖內 HUD / 場上提示仍不夠完整
- 文件已明確把後續重點轉成「更細的怪物分工」與「更完整的狀態圖示 / 控制提示」

如果不另外開新主線，這批 polish 會再次散落在 `combat.md`、`13_3D渲染與戰鬥呈現評估.md`、`03_職業與技能審計.md` 與 `AdventureStage` 視覺調整之間，沒有明確完成定義。

## 這次要改什麼

- 把怪物即時戰鬥角色再細分成更清楚的近戰壓迫、遠程風箏、法術蓄力與 Boss 危險區節奏
- 補上正式的狀態圖示、控制提示、剩餘時間或層數等 live-combat 可讀性資訊
- 強化場上命中、危險區、投射物與控制成功 / 免疫的視覺語言
- 保持 world / timeline / replay 的 status 語意一致，不在頁面層重造一套控制規則
- 同步更新 `combat.md`、`13_3D渲染與戰鬥呈現評估.md` 與相關驗證

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `pages/Adventure.tsx`
  - `components/adventure/AdventureStage.tsx`
  - `utils/worldCombat.ts`
  - `utils/worldCombatPresentation.ts`
  - `utils/adventureBattleVisualBridge.ts`
  - `store/slices/adventureSlice.ts`
  - `utils/worldCombatPresentation.test.ts`
  - `utils/worldCombat.test.ts`
  - `store/slices/adventureSlice.test.ts`
