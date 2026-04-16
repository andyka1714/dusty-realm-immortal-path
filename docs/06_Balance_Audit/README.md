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
- `runAutoBattle()` 目前仍保留作為時間軸數值驗證入口，但 world / timeline / replay 的 queue、controller、preview、outcome、reward、cleanup 與 lifecycle 現在都已集中到 `battleSystem.ts` 的同一套 battle core
- `Adventure` 內 world strike 與舊戰報 replay 的 preview、queue、execute、resolution、visual dispatch、replay step、replay context，現在都已開始共用 helper；其中 preview state 也已回收到 `createPlayerWorldStrikePreviewPlan(...) / createEnemyWorldStrikePreviewPlan(...)`，不再維護多套近似流程
- `Adventure` 內 world strike 與舊戰報 replay 的 timed plan primitive、queue builder 與 replay step runner，現在也已回收到 `battleSystem.ts` 的 `createTimedCombatPlan(...) / createWorldStrikeQueuePlan(...) / createResolvedWorldStrikeActionPlan(...) / createBattleReplayStepPlan(...) / queueTimedCombatPlan(...) / runResolvedTimedCombatPlan(...) / runResolvedWorldStrikeAction(...) / runAutoBattleReplayStep(...)`，頁面不再自己維護 battle-side queue 原語
- `Adventure` 內 world strike 與 replay step 的 visual payload，現在也已開始共用 `WorldStrikeVisualPlan` 路徑；live / replay 的 effect dispatch 不再各自維護 payload 組裝
- `Adventure` 內舊戰報 replay 的 delay 與 context 組裝，現在也已開始共用 `createBattleReplayStepPlan(...) + queueTimedCombatPlan(...)`，回放 effect 不再每次重算 step delay 與 target / skill context
- `Adventure` 內 `runAutoBattle() -> replay` 的橋接與 replay step state transition，現在也已開始共用 `createAutoBattleReplaySession(...) / advanceAutoBattleReplaySession(...)`，頁面不再自己重建 first log / snapshot / replayQueue，也不再自己手動 append log、slice queue、patch snapshot
- battle timer bucket 與 replay 啟動 / 重置判定，現在也已開始共用 `createCombatTimerBuckets(...) / clearCombatTimerBucket(...) / clearAllCombatTimers(...) / runAutoBattleReplayController(...)`，頁面不再自己維護 world / replay timer manager 與 replay lifecycle gate
- replay step / reset 的 state shape，現在也已開始共用 `runAutoBattleReplayController(...) / createAutoBattleReplayStepStatePlan(...)`，頁面不再自己手拼 replay session state 與 replay visual payload
- replay frame 的 step / finish 外殼，現在也已併入 `runAutoBattleReplayController(...)`，頁面不再自己先拆 `runAutoBattleReplayFrame(...)` 的 step / finish 結果再組對應 plan
- replay finish 的 battle result、finish effects、rewards 與 defeat log，現在也已開始共用 `resolveAutoBattleReplayFinishResultPlan(...)`，頁面不再自己手拼 replay 結算 payload
- battle rewards 的掉落 / 修為 / loot log manifest，現在也已開始共用 `createBattleRewardManifest(...) / createBattleRewardApplicationPlan(...)`，而 live world strike 也已開始透過 `runPlayerWorldStrikePipeline(...) / runEnemyWorldStrikePipeline(...)` 直接套用 reward / log / defeat / encounter clear；頁面不再自己手算 exp、靈石與掉落字串
- `Adventure` 內舊戰報 replay 的 visual payload，現在已正式共用 `battleSystem.ts` 的 `createBattleReplayVisualPlan(...)`，頁面不再自己維護 attack / damage visual 規則
- `Adventure` 內 player / enemy world strike 的 execute 結果組裝與 outcome state 套用，現在也已整併到 `runPlayerWorldStrikePipeline(...) / runEnemyWorldStrikePipeline(...)`；execution plan、outcome plan 與 outcome state plan 的內部流程已回收到 battle core，頁面不再自己 loop 套用範圍命中、護盾吸收、命中特效、擊殺獎勵與敗北 outcome
- live world defeat 的回城地點、重生座標與提示文案，現在也已開始共用 `resolveWorldPlayerDefeatOutcome(...)`，頁面不再自己手寫敗北 outcome
- replay 完成時的勝敗、擊殺目標與回城規則，現在也已開始共用 `resolveAutoBattleReplayOutcome(...) / getBattleRespawnMapId(...)`，頁面不再自己重算 replay defeat respawn 與 defeated monster
- replay 完成時的 battle result、finish effects、rewards 與 defeat log，也已開始共用 `resolveAutoBattleReplayFinishResultPlan(...)`，頁面不再自己從 replay outcome 手拆這批結算欄位
- world encounter 的 clear/reset state shape，現在也已開始共用 `createClearWorldCombatEncounterState(...) / createResetWorldCombatEncounterState(...)`，頁面不再自己手拼 target/status/cooldown/shield 清理欄位
- world defeat 的 respawn + 頁面狀態重置 plan，現在也已開始共用 `resolveWorldPlayerDefeatPlan(...) / createWorldPlayerDefeatStatePlan(...)`，並由 `resolveEnemyWorldStrikeOutcomeStatePlan(...)` 直接帶出 defeat state plan；頁面不再自己散寫 auto-battle 停止、world hp 重置與 encounter state 套用
- 戰報自動收起延遲與戰後 world state cleanup，現在也已開始共用 `resolveWorldBattleResultLifecyclePlan(...)`，頁面不再自己散寫 auto-close 與清 target/path/auto-battle 條件
- `Adventure` 內舊戰報 replay 的 visual payload 也已開始共用 `createBattleReplayVisualPlan(...)`，attack / damage visual dispatch 不再在 replay step 內直接拼裝輸入
- `Adventure` 內 world strike 與舊戰報 replay 的延遲排程，現在也已開始共用 `queueTimedCombatPlan(...)`，不再各自維護一套 `setTimeout` 流程
- `Adventure` 內 player / enemy world strike 的 live action wrapper，現在也已回收到 `battleSystem.ts` 的 `runPlayerWorldStrikePipeline(...) / runEnemyWorldStrikePipeline(...) / runWorldCombatControllerFrame(...)`，頁面不再自己維護 preview、execute 與 outcome apply 的 resolved strike plan 樣板
- `Adventure` 內 auto-target 與 live world action window 的判定，現在也已開始共用 `runWorldCombatControllerFrame(...)`，頁面不再自己維護最近怪、出手窗口與 player / enemy live action 串接
- `Adventure` 內 live world / replay 的 battle 規則目前都已退回 `battleSystem.ts`；而頁面上的 React/Redux 套用、visual dispatch 與 world/replay effect 外殼也已開始分別收斂到 `createAdventureBattleUiBridge(...) / createAdventureBattleVisualBridge(...) / useAdventureBattleEffects(...)`，頁面本體只剩 state apply、visual dispatch 與 Redux/UI bridge
- battle 第二輪整理目前已開始把純函式自 `battleSystem.ts` 分流到專責模組：`battleLog.ts` 承接 combat log / snapshot provider 容器，`battleStatuses.ts` 承接 status snapshot / DOT tick / status label，`battleStatusEffects.ts` 承接技能 / 特招狀態生成與套用，`battleTiming.ts` 承接 timed queue / replay delay / resolved queue primitive，`battleRewards.ts` 承接 reward manifest / application plan，`battleReplay.ts` 承接 replay controller、state、visual 與 finish plan，`battleLifecycle.ts` 承接 timer / replay transition / respawn / encounter reset，`battleWorldStrike.ts` 承接 world-strike 的 preview / execution / outcome / state plan，`battleWorldController.ts` 承接 auto-target、action window、world step 與 live world action pipeline，`battleTimelineResults.ts` 承接 auto-battle 的結果收尾與戰利品結算；後續若再整理 battle core，應沿這個模組邊界拆分而不是回頭擴大頁面橋接層
- `GameTooltip / GameHintBubble / GamePanel / Modal / GameSection` 已成為主要 UI 殼層語言，且 `Dashboard / QuestModal / Workshop / Adventure` 內部資訊區與操作區都已開始套入同一套 section chrome

## 尚未結案的主線

- 目前 checklist 主線已全數落地完成；後續若再擴 battle，只屬於下一輪優化，不再是這輪改造遺留

## 建議閱讀順序

1. [06_實作修正落點](./06_實作修正落點.md)
2. [01_修為與境界曲線審計](./01_修為與境界曲線審計.md)
3. [02_戰鬥與裝備曲線審計](./02_戰鬥與裝備曲線審計.md)
4. [03_職業與技能審計](./03_職業與技能審計.md)
5. [09_即時戰鬥改造分析](./09_即時戰鬥改造分析.md)
6. [14_整體改造Checklist](./14_整體改造Checklist.md)
