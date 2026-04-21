# Change: 啟動 battle P0 缺口補完主線

## Why
`refactor-battle-core-followup` 已完成 battle core 的第二輪模組化與第一批正式狀態補完，但審計文件內仍保留一批更偏語意層的戰鬥缺口：少數高境界技能欄位與事件仍偏模板化、`battleEncounter / battleWorldStrike / replay` 的回報可見性尚未完全對齊，且正式狀態效果仍不足以承接下一輪怪物 / 玩家控制與環境互動設計。

這批工作若不另外開主線，會再次分散在 `03_職業與技能審計`、`06_實作修正落點`、`02_戰鬥與裝備曲線審計` 與 `combat.md` 等文件之間，造成 backlog 難以執行與驗證。因此需要把 `16_下一輪執行優先級Checklist` 的 `P0` 正式提升為一條 OpenSpec 主線。

## What Changes
- 建立 battle `P0` 缺口補完主線，專門處理高境界技能欄位、battle event、可見性與正式狀態補完
- 補齊少數高境界技能在 `battleEncounter / battleWorldStrike / battleTurnPhases / battleAftermath / replay` 的事件與回報對齊
- 擴充下一批正式 battle status，並讓 world / timeline / replay 三條路徑共用同一套 status 語意與顯示規則
- 為 battle 語意補完建立對應 regression tests
- 同步更新 `docs/02_Gameplay/combat.md`、`docs/06_Balance_Audit/03_職業與技能審計.md`、`docs/06_Balance_Audit/06_實作修正落點.md` 與 `16_下一輪執行優先級Checklist.md`

## Impact
- Affected specs: `game-mechanics`
- Affected code: `data/skills/*.ts`、`utils/battleEncounter*.ts`、`utils/battleWorldStrike*.ts`、`utils/battleTurnPhase*.ts`、`utils/battleAftermath*.ts`、battle 測試
- Affected docs: `docs/02_Gameplay/combat.md`、`docs/06_Balance_Audit/03_職業與技能審計.md`、`docs/06_Balance_Audit/06_實作修正落點.md`、`docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`

## Non-Goals
- 不處理 `P1` 的後期內容密度、掉落主題化與三職業後段係數細修
- 不處理 `P2` 的技能書體系深化與即時戰鬥表現層擴充
- 不重新拆 battle core 模組邊界；本主線聚焦於 battle 語意、狀態與可見性補完
