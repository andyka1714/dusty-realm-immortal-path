## Context
`battle core follow-up` 已完成 battle family 的模組化收尾，並把 `vulnerable` 接入 world / timeline / replay。現在剩下的不是工程結構問題，而是 battle 語意層的尾端缺口：

- 少數高境界技能欄位仍偏模板化，尚未完全反映正式事件
- 部分高境界被動或技能效果在 `battleEncounter / battleWorldStrike / battleTurnPhases / battleAftermath / replay` 的回報可見性不完全一致
- battle status 已有 `burn / poison / bleed / shield / armorBreak / reflect / vulnerable`，但後續怪物 / 玩家控制與環境互動狀態仍未正式化
- 相關 backlog 目前散落在 `03_職業與技能審計`、`06_實作修正落點`、`02_戰鬥與裝備曲線審計` 與 `combat.md`

因此這條主線的目標，是把 `P0` 定義成「battle correctness + visibility alignment」批次，而不是再次做模組化。

## Goals / Non-Goals
- Goals:
  - 補齊少數高境界技能的正式欄位與 battle event
  - 讓 high-realm passive / active 的回報在 world / timeline / replay 完全對齊
  - 補上下一批正式 status，並統一其顯示、套用與測試語意
  - 把文件中的 P0 backlog 收斂成可驗證的主線
- Non-Goals:
  - 不處理後段怪物密度、掉落池與 TTK 微調
  - 不處理技能書來源體系或 retired skill 的大規模裁剪
  - 不推進即時戰鬥表現層、投射物或 AI 演出

## Decisions
- Decision: 以「技能欄位 / battle event / status 語意 / visibility」為主線切分，而不是再以 battle module family 切分
  - Why: 結構層已在上一輪完成，這輪真正的風險是 battle 三條路徑對同一技能或狀態有不同回報
- Decision: `world / timeline / replay` 必須共用同一份 status 語意，而不是只對齊數值
  - Why: 玩家實際感受到的 bug 多半是「有生效但沒顯示」或「世界戰鬥看到、replay 看不到」
- Decision: 文件同步列入同批必要工作
  - Why: P0 的主要輸出不只是程式修正，還包括把審計文件中的「仍待補完」陳述更新到最新狀態
- Decision: 先用 regression tests 鎖高境界技能事件與 status visibility，再進入後續 P1 / P2
  - Why: 若 P0 沒被測試固定，後續數值或表現層變更很容易再次打散 battle 三邊一致性

## Risks / Trade-offs
- 高境界技能欄位補完會跨 `data/skills` 與 battle core，多點改動容易漏接某一側
  - Mitigation: 每補一批技能事件，就同時補 world / timeline / replay regression cases
- 新 status 若只接進 timeline，會再次造成 live world / replay 行為漂移
  - Mitigation: status builder、status label/log 與 outcome visibility 必須一起檢查
- 文件更新若延後，會讓 backlog 描述仍停留在「還沒做」
  - Mitigation: 將 `03`、`06`、`combat.md` 與 `16 checklist` 更新列為同批必做

## Migration Plan
1. 盤點 `P0` 內實際要補的高境界技能欄位、battle event 與 status 名單
2. 先補技能欄位與 battle event，對齊 `battleEncounter / battleWorldStrike / battleTurnPhases / battleAftermath`
3. 再補下一批正式 status，接入 world / timeline / replay 的共用顯示與套用鏈
4. 補齊 regression tests，鎖定 high-realm event 與 status visibility
5. 更新 `combat.md`、`03_職業與技能審計.md`、`06_實作修正落點.md` 與 `16 checklist`
6. 驗證 typecheck、battle tests 與 OpenSpec 文件

## Open Questions
- 下一批正式 status 是否應優先補怪物控制型狀態，還是先補玩家主動術式會用到的環境互動狀態
- 高境界欄位補完是否只更新已 formal/core 的技能，或同時清理少量仍會影響戰鬥表現的 retired alias 對應
