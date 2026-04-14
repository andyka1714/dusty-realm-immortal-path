# 數值平衡審計總覽

本資料夾現在只保留「索引、結論與來源指向」，不再重複攤開已經分散到各子文件與正式程式 registry 的長篇清單。

## 目前正式來源

- 修為節奏與高境界乘區：
  [01_修為與境界曲線審計](./01_修為與境界曲線審計.md)
  [data/progression/balanceAudit.ts](../../data/progression/balanceAudit.ts)
- 戰鬥、裝備與 TTK：
  [02_戰鬥與裝備曲線審計](./02_戰鬥與裝備曲線審計.md)
  [docs/02_Gameplay/combat.md](../02_Gameplay/combat.md)
  [utils/battleSystem.ts](../../utils/battleSystem.ts)
- 職業、技能池與技能書：
  [03_職業與技能審計](./03_職業與技能審計.md)
  [11_三職業核心技能池草案](./11_三職業核心技能池草案.md)
  [12_技能書實作收斂](./12_技能書實作收斂.md)
  [data/skills/index.ts](../../data/skills/index.ts)
- 即時戰鬥改造：
  [09_即時戰鬥改造分析](./09_即時戰鬥改造分析.md)
  [utils/worldCombat.ts](../../utils/worldCombat.ts)
  [utils/battleSystem.ts](../../utils/battleSystem.ts)
- 最終進度：
  [14_整體改造Checklist](./14_整體改造Checklist.md)

## 目前已正式化的內容

- 高境界修為乘區、追趕機制與各大境界 TTK 目標，已落地到 `data/progression/balanceAudit.ts`
- 技能池已收斂出 `core / battle-absorbed / retirement-ready` 的正式視圖，realm dataset 目前已正式鎖定為 `core only`
- retired skill 現在只保留中央 alias / 相容查詢層；retired alias 的 realm 聚合也只保留在 alias-layer，不再注入正式 realm dataset
- `CORE_SKILL_SETS_BY_REALM` 現在也已成為正式 export，realm dataset 的 `core only` 組裝不再只是 skill index 內部常數
- retired active / passive alias 的 record / view 組裝，也已改由 `retired_alias_utils.ts` 單點承接，alias-layer 不再維護兩份近似樣板
- `runAutoBattle()` 已拆出多個 shared helper，world strike 與 timeline combat 的冷卻、status、runtime、outcome 正持續收斂
- `GameTooltip / GameHintBubble / GamePanel / Modal / GameSection` 已成為主要 UI 殼層語言，且 `Dashboard / QuestModal / Workshop` 內部資訊區也已開始套入同一套 section chrome
- `Adventure` 的底部戰鬥快捷列也已開始改走 `GameSection`，地圖即時戰鬥操作面不再是獨立風格。
- 所有 passive，包含 formal core 與 retired passive alias，現在都已退出 generic `passiveEffectTags` fallback，`passiveEffectTags` 欄位也已從技能資料層移除
- `Adventure` 內 player / enemy world strike 的 preview 與延遲執行排程，也已開始共用 `scheduleWorldActionExecution(...) / queueWorldStrikeExecution(...)`，地圖即時戰鬥分支不再各自維護 readyAt / 狀態 / 戰鬥訊息流程
- `Adventure` 內 player / enemy world strike 的結算訊息與護盾承傷，也已開始共用 resolution helper，地圖即時戰鬥分支不再各自維護傷害文案與承傷拆分流程
- `Adventure` 內 player / enemy world strike 的 projectile / area / impact / text dispatch 也已開始共用 visual helper，地圖即時戰鬥效果派發不再各自維護兩套流程
- `Adventure` 內 player / enemy world strike 的實際執行鏈也已開始抽成 `executePlayerWorldStrike(...) / executeEnemyWorldStrike(...)`，命中後的傷害、掉落與承傷流程不再各自攤開

## 尚未結案的主線

- 刪除或合併重複功能技能
- 世界戰鬥與 timeline battle 收成單一最終引擎
- `README / Gameplay / World / Audit` 最後一輪完全交叉校對
- 面板內部視覺的最後一輪遊戲化收口

## 建議閱讀順序

1. [06_實作修正落點](./06_實作修正落點.md)
2. [01_修為與境界曲線審計](./01_修為與境界曲線審計.md)
3. [02_戰鬥與裝備曲線審計](./02_戰鬥與裝備曲線審計.md)
4. [03_職業與技能審計](./03_職業與技能審計.md)
5. [09_即時戰鬥改造分析](./09_即時戰鬥改造分析.md)
6. [14_整體改造Checklist](./14_整體改造Checklist.md)
