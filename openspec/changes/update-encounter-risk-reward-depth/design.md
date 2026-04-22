## Context

目前 `Encounter` 已是正式存在的系統，但仍停在第一批 foundation：

1. event selector 基本只看 `realm`
2. `resolvedEventIds` 沒有真正參與內容 gating
3. UI 可讀性不足，玩家很難在選擇前分辨風險與收益
4. route-specific / profession / sect 差異尚不夠厚

這條 change 的目的不是再證明事件流程可行，而是把它做成能承接後續世界內容擴張的正式內容層。

## Goals

- 讓 encounter selection 具備上下文條件、權重與 anti-repeat 規則
- 讓選項具備更清楚的風險 / 收益辨識
- 補一批真正有 profession / sect / high-realm 差異的 encounter pool

## Non-Goals

- 不做完整 branching narrative engine
- 不重寫 quest engine
- 不重做 persistence schema
- 不在這批處理 actor 像素化

## Decisions

- 優先擴 encounter data model 與 selector helper，而不是增加新的 store slice
- 沿用 `pendingEvent + resolvedEventIds`，把重點放在 event metadata 與 selector context
- UI 只補 encounter panel / shell 的可讀性，不新增大型新頁面
- 測試以 selector、choice resolution 與 panel rendering 為主

## Risks / Trade-offs

- 若直接擴成劇情引擎，scope 會失控
  - Mitigation: 先限制在 selector / one-time gating / cue / route pool
- 若只補資料不補介面，玩家感知仍會不足
  - Mitigation: 把 panel cue 納入同一條 change

## Migration Plan

1. 先盤點目前 encounter 資料與 selector 缺口
2. 再補 metadata、route-specific pool 與 choice cue
3. 最後補 regression tests 與文件
