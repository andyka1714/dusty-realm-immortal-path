# Change: 啟動 battle core 下一輪收尾主線

## Why
本輪平衡改造 checklist 已正式結案，但 battle core 的下一輪收尾工作仍有明確範圍：部分 battle 模組仍偏肥、world / timeline / replay 的共享 contract 還可再收斂、少數高境界被動與狀態回報仍未完全對齊，且 `README / Gameplay / Audit` 仍有部分敘述落後於目前的模組化實況。

若繼續沿用舊 checklist 追蹤，會把「本輪已完成」與「下一輪優化」混在一起，造成文件與實作邊界再次漂移。因此需要另外建立一條正式主線，專門處理 battle core 的下一輪模組化、驗證與文件同步。

## What Changes
- 以 battle core 單一引擎為前提，建立下一輪 battle 收尾主線
- 針對仍偏大的 battle 模組進行第二輪模組化整理，優先處理 `battleAftermath`、`battleWorldStrike`、`battleWorldController`、`battleReplay`、`battleStatuses`、`battleAutoTimeline`、`battleStats`、`battleStatusEffects`、`battleLifecycle`
- 補齊少數高境界被動、狀態效果與 world / timeline / replay 回報可見性的剩餘缺口
- 建立 battle core 下一輪專用追蹤清單與文件同步規則，避免再把舊 checklist 改回未完成
- 將 `README`、`docs/02_Gameplay`、`docs/06_Balance_Audit` 與測試，一起對齊到 battle core 的現行模組邊界與單一規則來源

## Impact
- Affected specs: `game-mechanics`
- Affected code: `utils/battle*.ts`、`pages/Adventure.tsx` 相關 battle bridge、battle 測試
- Affected docs: `README.md`、`docs/02_Gameplay/combat.md`、`docs/06_Balance_Audit/*`

## Non-Goals
- 不重新打開本輪平衡改造 checklist
- 不重做整體數值曲線或重新盤一輪修為 / 裝備 / 地圖
- 不在本變更中重寫 UI shell 或回到多套 battle 規則並行
