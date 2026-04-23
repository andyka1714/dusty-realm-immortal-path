## Context

目前 encounter 已具備正式 flow，但事件之間的關係主要靠 `resolvedEventIds` 單點 gating。這足以阻擋重複事件，卻不足以表現長期後果、分支記憶或跨系統回饋。

## Goals

- 讓事件能標記 chain id、step 與 world memory tag
- 讓後續事件可以讀取玩家曾經選過的結果
- 讓 UI 在玩家選擇前顯示 chain / memory cue
- 讓 migration 能安全補齊或清理舊存檔缺失欄位

## Non-Goals

- 不重寫 quest engine
- 不把所有事件都改成鏈式事件
- 不把 Workshop 或宗門章節的完整內容塞進這條 change

## Decisions

- 優先沿用 `resolvedEventIds`，新增最小 world memory structure
- chain event 先用資料表欄位與 selector helper 表達，不導入外部狀態機
- UI 只顯示玩家需要理解的 chain / memory cue，不顯示內部 id

## Risks / Trade-offs

- 若 memory tag 過細，後續內容會難以維護
  - Mitigation: 第一輪只建立少量 route / consequence / workshop source 類 tag
- 若 chain selector 太複雜，會破壞 yearly encounter 節奏
  - Mitigation: 保持 selector deterministic helper 與 regression 覆蓋
