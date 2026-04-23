## Context
目前專案已完成本輪平衡改造的主線收口，地圖即時戰鬥、`runAutoBattle()` 與舊戰報 replay 也已回到同一套 battle core。前一輪整理已把 `battleSystem.ts`、`battleEncounter.ts`、turn phase、world strike 等大塊拆成較清楚的專責模組，但 battle core 內仍有幾群明顯偏大的檔案與 shared contract：

- `battleAftermath.ts`
- `battleWorldStrike.ts`
- `battleWorldController.ts`
- `battleReplay.ts`
- `battleStatuses.ts`
- `battleAutoTimeline.ts`
- `battleStats.ts`
- `battleStatusEffects.ts`
- `battleLifecycle.ts`

同時，文件層仍有兩種落差：

1. 少數文件仍沿用「battle 規則主要集中在 `battleSystem.ts`」的舊說法
2. 少數平衡審計文件仍把「下一輪可續修項」寫成像是本輪遺留

因此下一輪主線的重點，不是再重開數值盤點，而是把 battle core 的模組邊界、剩餘 shared contract、文件與測試一次收斂乾淨。

## Goals / Non-Goals
- Goals:
  - 以 battle core 單一引擎為前提，完成下一輪模組化收尾
  - 讓 world / timeline / replay 後續擴充維持單一路徑
  - 把 battle 文件敘述與測試同步到目前實際模組邊界
  - 建立新的 battle core 追蹤主線，不回頭污染舊 checklist
- Non-Goals:
  - 不重新定義整體平衡目標
  - 不回到 world / timeline / replay 三套規則分流
  - 不為了模組化而重寫 `Adventure` UI shell
  - 不把所有新技能或新怪物內容塞進同一批變更

## Decisions
- Decision: 以 battle module family 為拆分單位，而不是再以單一巨檔為中心整理
  - Why: 目前 `battleSystem.ts` 已經足夠薄，下一輪真正的風險來自 battle family 內的肥大 orchestration 與 shared contract 漂移
- Decision: 將 battle core 下一輪主線拆成三批執行
  - Why: 可以讓模組化、行為補完、文件/測試同步分批落地，同時避免一次性重構跨太多責任面
  - Batch 1: `aftermath / statuses / status-effects / stats`
  - Batch 2: `world-strike / world-controller / replay / lifecycle / auto-timeline`
  - Batch 3: 高境界被動可見性、狀態補完、文件同步與 regression tests
- Decision: 文件同步視為 battle core 變更的一部分，而不是最後再補
  - Why: 目前的主要痛點之一就是 battle core 已經拆開，但文件仍在講舊架構
- Decision: 下一輪另開 battle core 專用追蹤清單
  - Why: 舊 checklist 已結案，若繼續塞在同一份文件，會讓完成狀態失真

## Risks / Trade-offs
- battle core 大模組第二輪拆分，容易碰到 shared type 反覆搬動
  - Mitigation: 每一批拆分都先建立 shared arg/result/status contracts，再搬函式
- world / timeline / replay 雖已共用 battle core，但局部回報差異仍可能在重構時被放大
  - Mitigation: 每一批都要求同步補回歸測試，特別是 outcome、cooldown、status visibility 與 replay finish
- 文件同步若延後，會再次出現「程式已經改完，文件仍寫舊主線」的漂移
  - Mitigation: 把 README / Gameplay / Audit 更新列為同批必要任務，而不是收尾附帶

## Migration Plan
1. 建立 battle core 下一輪專用追蹤清單與主線文件
2. 先拆 `aftermath / statuses / status-effects / stats` 這批 battle 基礎模組
3. 再拆 `world-strike / world-controller / replay / lifecycle / auto-timeline` 這批 live/replay orchestration
4. 補齊高境界被動、狀態效果與回報可見性的剩餘缺口
5. 同步更新 README / Gameplay / Audit 與 battle regression tests
6. 驗證 typecheck、測試與 OpenSpec 文件

## Open Questions
- 高境界狀態補完是否要把 `vulnerable` 與下一批怪物專屬控制放在同一個變更，或拆成 battle core 主線後的獨立內容批
- battle core 下一輪專用 checklist 是否只保留工程與文件項，還是要同時列入少量高境界技能/狀態補完項
