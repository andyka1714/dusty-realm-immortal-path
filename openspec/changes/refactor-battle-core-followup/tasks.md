## 1. Battle Core 基礎模組收尾
- [x] 1.1 拆分 `battleAftermath.ts`，將 player active aftermath、enemy incoming damage、fatal survival、echo/summon follow-up 與共用 logger 拆成專責模組
- [x] 1.2 拆分 `battleStatuses.ts`、`battleStatusEffects.ts`、`battleStats.ts`，收斂 shared status / arg / result contracts
- [x] 1.3 移除 battle core 內已無內部引用價值的 façade / barrel / 過渡型別出口

## 2. World / Replay / Timeline Orchestration 收尾
- [x] 2.1 拆分 `battleWorldStrike.ts` 與 `battleWorldController.ts`，分離 preview、execution、outcome、state-plan、controller frame 與 live action pipeline
- [x] 2.2 拆分 `battleReplay.ts`、`battleLifecycle.ts`、`battleAutoTimeline.ts`，分離 replay session、finish plan、timer/lifecycle、timeline runner 與 result wiring
- [x] 2.3 補齊 world / timeline / replay 共用 contract 的 regression tests，避免重構後行為漂移

## 3. 高境界被動、狀態與文件同步
- [x] 3.1 補齊少數高境界被動的事件、可見性與 world / timeline / replay 回報對齊
- [x] 3.2 補齊下一批正式狀態效果與必要的怪物 / 玩家狀態回報
- [x] 3.3 更新 `README.md`、`docs/02_Gameplay/combat.md`、`docs/06_Balance_Audit/*`，移除 battle core 舊敘事並建立 battle core 下一輪追蹤清單

## 4. 驗證
- [x] 4.1 執行 `npm run typecheck`
- [x] 4.2 執行 battle 相關測試與必要的回歸測試
- [x] 4.3 執行 `openspec validate refactor-battle-core-followup --strict`
