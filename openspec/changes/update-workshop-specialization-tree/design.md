## Context

Workshop 現在有高階 recipe 與第一批專精效果，但 state 仍是 `specializationByDiscipline` 的扁平 map。若要做真正專精樹，必須清楚處理 state shape、migration、UI reset 與 recipe effect 邊界。

## Goals

- 讓煉丹 / 煉器都有可擴充的專精樹
- 讓專精選擇能產生前置、互斥與 reset 決策
- 讓 route-specific 材料有更多高階 sink

## Non-Goals

- 不重寫整個 Workshop UI
- 不新增後端或伺服器存檔
- 不讓專精折扣直接繞過 route-specific 核心材料

## Decisions

- 專精樹資料拆成獨立 data module，避免 `workshopRecipes.ts` 過度膨脹
- state 記錄已解鎖節點與 active branch，recipe effect 從資料推導
- reset UI 只重置該 discipline 的專精樹，不清除熟練度與已製作 recipe 紀錄

## Risks / Trade-offs

- state shape 變更可能破壞舊存檔。
  - Mitigation: 補 persisted state migration 與 migration tests。
- 專精效果若過強，會破壞材料 sink。
  - Mitigation: 專精可影響靈石、熟練、品質或副產物，但不直接免除高階 route-specific 材料。

## Migration Plan

舊存檔若只有 `specializationByDiscipline`，migration 必須轉成安全的專精樹初始狀態，並保留既有 active specialization 的相容資訊。

