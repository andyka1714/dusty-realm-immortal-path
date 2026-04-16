<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 塵寰仙途

純前端修仙放置 RPG，使用 `Vite + React + TypeScript + Redux Toolkit` 建構，資料儲存在瀏覽器 `localStorage`。

## 目前正式狀態

本專案目前已不是早期的純頁面切換與戰報結算版本，而是：

- 地圖戰鬥已成主路徑：玩家可在地圖內直接移動、鎖定目標、普攻與施放主動術式；投射物、AOE、浮字與掉落都直接在場景內完成。
- `runAutoBattle()` 目前仍保留作為時間軸數值驗證入口；世界戰鬥、時間軸戰鬥與 replay 的 queue、controller、preview、outcome、reward、cleanup 與 lifecycle，現在都已集中到同一套 battle core，其中 `battleSystem.ts` 持有主流程，`battleLog.ts`、`battleStatuses.ts`、`battleTiming.ts`、`battleRewards.ts`、`battleReplay.ts`、`battleLifecycle.ts`、`battleWorldStrike.ts`、`battleWorldController.ts` 與 `battleTimelineResults.ts` 已開始分別承接 combat log / snapshot provider 容器、status snapshot / DOT tick / status label、timing、reward、replay controller / state / visual / finish、lifecycle、world-strike、world combat controller，以及 auto-battle 的結果收尾與戰利品結算。
- `Adventure` 目前已退回 UI bridge：頁面只負責 state apply、visual dispatch 與 Redux 串接；其中 battle 相關的 React/Redux 套用已開始收斂到 `createAdventureBattleUiBridge(...)`，visual dispatch 已開始收斂到 `createAdventureBattleVisualBridge(...)`，而 world/replay 的 effect 外殼也已開始收斂到 `useAdventureBattleEffects(...)`，不再自己持有 live world / replay 的 battle 規則與主控判定。
- 技能改為透過技能書學習，不再隨職業 / 突破自動送；正式技能池、正式 realm 視圖與公開 registry 都已鎖定為 `core only`，transition / legacy 現在只保留中央 alias / 相容查詢層與 final-cull manifests。
- 正式 realm 技能視圖目前由 `CORE_SKILL_SETS_BY_REALM` 作為正式 export；retired alias 的 realm 聚合、record 合併與正式視圖組裝，都已收斂到 alias-layer / skill index 的共用 util。
- 所有 passive 現在都已改成逐招專屬效果，`passiveEffectTags` 欄位也已自技能資料層完全移除；高境界與 retired passive alias 也不再依賴 generic fallback。
- `化神 -> 仙帝` 的後期修為乘區、高境界追趕機制，以及 `凡人 -> 仙帝` 的三職業 TTK 目標表，已正式落到 progression registry 與測試。
- UI 殼層已開始統一：`GamePanel / Modal / GameTooltip / GameHintBubble / GameSection` 正在收斂成同一套遊戲化語言；主要面板、tooltip、hint bubble 與工坊卡片都已開始套用同一套 section chrome。
- `Gameplay / World / UI / Audit` 文件已完成主要交叉校對與去重；目前 checklist 主線已全部落地到正式程式與文件。

## 文件入口

- 規格總索引：[docs/index.md](./docs/index.md)
- 平衡審計總覽：[docs/06_Balance_Audit/README.md](./docs/06_Balance_Audit/README.md)
- 即時戰鬥說明：[docs/02_Gameplay/combat.md](./docs/02_Gameplay/combat.md)
- 背包與技能書：[docs/02_Gameplay/inventory.md](./docs/02_Gameplay/inventory.md)

## Run Locally

**Prerequisites:** Node.js 20+


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Build the app:
   `npm run build`
4. Run type checks:
   `npm run typecheck`
5. Run tests:
   `npm run test`
