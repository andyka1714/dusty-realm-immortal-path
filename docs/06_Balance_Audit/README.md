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
- retired skill 現在只保留中央 alias / 相容查詢層；retired alias 的 realm 聚合、record 合併與 view 組裝，已集中到 alias-layer 與 skill index 的共用 util
- `SKILL_PROFESSION_POOLS / SKILL_POOL_REGISTRY / CORE_SKILL_SETS_BY_REALM` 現在都已正式鎖定為 `core only`；`transition / legacy` 只保留中央 alias 相容與 final cull manifests，不再混入正式技能池
- skill index 目前也已不再保留 `battle-absorbed / retirement-ready` 的 resolved retired skill 過渡出口；resolved 視圖正式只留 alias-layer 與測試側組裝
- 所有 passive，包含 formal core 與 retired passive alias，現在都已退出 generic fallback，`passiveEffectTags` 欄位也已從技能資料層移除
- `runAutoBattle()` 已拆出多個 shared helper，world strike 與 timeline combat 的 cooldown、status、runtime、outcome 與 action queue 正持續收斂，但目前仍不是同一套即時引擎
- `Adventure` 內 world strike 與舊戰報 replay 的 preview、queue、execute、resolution、visual dispatch、replay step、replay context，現在都已開始共用 helper，不再維護多套近似流程
- `Adventure` 內 world strike 與舊戰報 replay 的 timed plan primitive、queue builder 與 replay step runner，現在也已回收到 `battleSystem.ts` 的 `createTimedCombatPlan(...) / createWorldStrikeQueuePlan(...) / createResolvedWorldStrikeActionPlan(...) / createBattleReplayStepPlan(...) / queueTimedCombatPlan(...) / runResolvedTimedCombatPlan(...) / runResolvedWorldStrikeAction(...) / runAutoBattleReplayStep(...)`，頁面不再自己維護 battle-side queue 原語
- `Adventure` 內 world strike 與 replay step 的 visual payload，現在也已開始共用 `WorldStrikeVisualPlan` 路徑；live / replay 的 effect dispatch 不再各自維護 payload 組裝
- `Adventure` 內舊戰報 replay 的 delay 與 context 組裝，現在也已開始共用 `createBattleReplayStepPlan(...) + queueTimedCombatPlan(...)`，回放 effect 不再每次重算 step delay 與 target / skill context
- `Adventure` 內 `runAutoBattle() -> replay` 的橋接與 replay step state transition，現在也已開始共用 `createAutoBattleReplaySession(...) / advanceAutoBattleReplaySession(...)`，頁面不再自己重建 first log / snapshot / replayQueue，也不再自己手動 append log、slice queue、patch snapshot
- battle timer bucket 與 replay 啟動 / 重置判定，現在也已開始共用 `createCombatTimerBuckets(...) / clearCombatTimerBucket(...) / clearAllCombatTimers(...) / resolveAutoBattleReplayTransitionStatePlan(...)`，頁面不再自己維護 world / replay timer manager 與 replay lifecycle gate
- replay step / reset 的 state shape，現在也已開始共用 `resolveAutoBattleReplayTransitionStatePlan(...) / createAutoBattleReplayStepStatePlan(...)`，頁面不再自己手拼 replay session state 與 replay visual payload
- replay finish 的 battle result、finish effects、rewards 與 defeat log，現在也已開始共用 `resolveAutoBattleReplayFinishResultPlan(...)`，頁面不再自己手拼 replay 結算 payload
- battle rewards 的掉落 / 修為 / loot log manifest，現在也已開始共用 `createBattleRewardManifest(...)`，而 live world strike 也已開始透過 `resolvePlayerWorldStrikeOutcomePlan(...)` 直接取得 reward manifest；頁面不再自己手算 exp、靈石與掉落字串
- `Adventure` 內舊戰報 replay 的 visual payload，現在已正式共用 `battleSystem.ts` 的 `createBattleReplayVisualPlan(...)`，頁面不再自己維護 attack / damage visual 規則
- `Adventure` 內 player / enemy world strike 的 execute 結果組裝，現在也已開始共用 `createPlayerWorldStrikeExecutionPlan(...) / createEnemyWorldStrikeExecutionPlan(...) / resolvePlayerWorldStrikeOutcomePlan(...) / resolveEnemyWorldStrikeOutcomePlan(...)`，頁面不再自己手算範圍命中、護盾吸收、命中特效、擊殺獎勵與敗北 outcome
- live world defeat 的回城地點、重生座標與提示文案，現在也已開始共用 `resolveWorldPlayerDefeatOutcome(...)`，頁面不再自己手寫敗北 outcome
- replay 完成時的勝敗、擊殺目標與回城規則，現在也已開始共用 `resolveAutoBattleReplayOutcome(...) / getBattleRespawnMapId(...)`，頁面不再自己重算 replay defeat respawn 與 defeated monster
- replay 完成時的 battle result、finish effects、rewards 與 defeat log，也已開始共用 `resolveAutoBattleReplayFinishResultPlan(...)`，頁面不再自己從 replay outcome 手拆這批結算欄位
- world encounter 的 clear/reset state shape，現在也已開始共用 `createClearWorldCombatEncounterState(...) / createResetWorldCombatEncounterState(...)`，頁面不再自己手拼 target/status/cooldown/shield 清理欄位
- world defeat 的 respawn + 頁面狀態重置 plan，現在也已開始共用 `resolveWorldPlayerDefeatPlan(...)`，並由 `resolveEnemyWorldStrikeOutcomePlan(...)` 直接帶出 defeat plan；頁面不再自己散寫 auto-battle 停止、world hp 重置與 encounter state 套用
- 戰報自動收起延遲與戰後 world state cleanup，現在也已開始共用 `getBattleReportAutoCloseDelayMs(...) / resolveWorldBattleResultCleanup(...)`，頁面不再自己散寫 auto-close 與清 target/path/auto-battle 條件
- `Adventure` 內舊戰報 replay 的 visual payload 也已開始共用 `createBattleReplayVisualPlan(...)`，attack / damage visual dispatch 不再在 replay step 內直接拼裝輸入
- `Adventure` 內 world strike 與舊戰報 replay 的延遲排程，現在也已開始共用 `queueTimedCombatPlan(...)`，不再各自維護一套 `setTimeout` 流程
- `Adventure` 內 player / enemy world strike 的 resolve + queue 串接，現在已回收到 `battleSystem.ts` 的 `runPlayerWorldStrikeAction(...) / runEnemyWorldStrikeAction(...)`，live 分支不再各自維護 player / enemy 的 resolved strike plan 細節
- `Adventure` 內 auto-target 與 live world action window 的判定，現在也已開始共用 `resolveWorldCombatAutoTarget(...) / runWorldCombatStep(...)`，頁面不再自己維護最近怪與雙方出手窗口邏輯
- `GameTooltip / GameHintBubble / GamePanel / Modal / GameSection` 已成為主要 UI 殼層語言，且 `Dashboard / QuestModal / Workshop / Adventure` 內部資訊區與操作區都已開始套入同一套 section chrome

## 尚未結案的主線

- 世界戰鬥與 timeline battle 收成單一最終引擎

其中 `世界戰鬥與 timeline battle 收成單一最終引擎` 目前仍未結案：
- `Adventure` 仍自行維護 live world action / replay 的 timed queue orchestration
- `runAutoBattle()` 仍自行維護 `resolveCombatLoopStep(...) + runCombatTimelineLoop(...)` 的 timeline 主循環
- 兩邊目前是大量共用 helper，而不是共用同一個 battle runner

## 建議閱讀順序

1. [06_實作修正落點](./06_實作修正落點.md)
2. [01_修為與境界曲線審計](./01_修為與境界曲線審計.md)
3. [02_戰鬥與裝備曲線審計](./02_戰鬥與裝備曲線審計.md)
4. [03_職業與技能審計](./03_職業與技能審計.md)
5. [09_即時戰鬥改造分析](./09_即時戰鬥改造分析.md)
6. [14_整體改造Checklist](./14_整體改造Checklist.md)
