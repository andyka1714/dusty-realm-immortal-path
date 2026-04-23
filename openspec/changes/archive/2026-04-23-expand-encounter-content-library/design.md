## Context

`Encounter` 已有正式資料池、pending flow、resolved state、route cue 與 Workshop source cue。這次不新增第二套事件框架，只擴充內容密度與 coverage regression。

## Goals

- 讓中後期每個主要境界段都有足夠 encounter 內容
- 讓職業、宗門與世界路線在事件池中更容易辨識
- 讓內容覆蓋率可被 regression 測試固定

## Non-Goals

- 不重做 pending encounter UI
- 不重寫 encounter selector
- 不在這條 change 中加入多步驟事件鏈引擎

## Decisions

- 以 `data/encounters.ts` 既有模型擴充，不新增平行 event schema
- coverage matrix 優先用測試推導，不把大型矩陣寫進 runtime state
- 新事件優先補中後期可重複事件，one-time milestone 只補必要缺口

## Risks / Trade-offs

- 若只補數量，事件會退化成同模板換字。
  - Mitigation: 每個新增事件必須有 route label、category label 或 cue tag 差異。
- 若 coverage 測試過硬，後續內容調整會變難。
  - Mitigation: regression 固定最低覆蓋門檻，不固定精確事件數。

## Migration Plan

這條 change 不新增 persisted state 欄位。舊存檔可直接沿用既有 `resolvedEventIds / pending` 結構。

