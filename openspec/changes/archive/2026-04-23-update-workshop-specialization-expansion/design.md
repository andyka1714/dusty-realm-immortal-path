## Context

目前 Workshop 已有三個重要基線：

1. `WORKSHOP_RECIPES` 已支援 `tier / minRealm / routeTags / qualityHint / sourceHint / masteryYield`
2. `WorkshopState` 已有 `masteryByDiscipline` 與 `specializationByDiscipline`
3. Workshop UI 已會顯示高階 recipe 的境界需求、來源、品質、熟練收益與鎖定原因

因此第二輪不需要重做 schema，而是要讓這些欄位從「可顯示」變成「會影響玩法」。

## Goals

- 補更多中高階與終盤 recipe，讓 route-specific materials 有多個去處
- 讓 `alchemy / smithing` specialization 具備實際 craft 效果
- 讓 Workshop UI 能清楚呈現專精效果與受影響 recipe
- 用 regression 固定 specialization 不會意外放鬆高境界材料 sink

## Non-Goals

- 不新增第三個百業 discipline
- 不新增 persisted state 欄位，除非實作時確認現有 state 無法承接
- 不把 recipe 效果接成即時戰鬥技能

## Decisions

- 專精優先採用資料表定義，而不是把分支硬寫在 UI
- 第一批專精效果應保持可測、可讀、低風險，例如：
  - 煉丹專精：降低指定高階丹方材料成本、提高 mastery yield、增加額外丹藥輸出
  - 煉器專精：降低指定器方靈石成本、提高鍛造 mastery、對路線裝備增加額外 output cue
- UI 應先顯示目前專精與影響 recipe，不做複雜 build simulator

## Risks / Trade-offs

- 風險：專精效果如果太強，會繞過高境界材料 sink。
  - Mitigation: regression 檢查高階 recipe 仍需要 route-specific material。
- 風險：recipe 擴量如果只加數值，玩家感受不到路線差異。
  - Mitigation: 每批 recipe 都要有 route tags 或 source hint。
- 風險：UI 把專精說明塞太滿。
  - Mitigation: 卡片只顯示目前專精是否影響該 recipe，詳細說明放在專精區塊。

## Migration Plan

目前預期不需要 migration，因為 `specializationByDiscipline` 已存在。實作時若需要新增 state 欄位，必須同步補 `store/persistedStateMigration.ts` 與 regression。
