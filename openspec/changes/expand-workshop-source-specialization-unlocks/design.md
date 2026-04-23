## Context

目前 Workshop 已有：

1. 第二批高階 `Alchemy / Smithing` recipe
2. `鴻蒙凝丹 / 星火鍛胚` 兩個第一批專精效果
3. `masteryByDiscipline` 與 `specializationByDiscipline` state
4. route-specific 材料與宗門 / 世界後段 milestone reward

但專精仍是「有 state、有效果、可直接選」的狀態。這在短期可驗證玩法，但長期會讓專精缺少 build 決策重量。

## Goals

- 讓 route-specific material source 更分散到世界 / encounter loop
- 讓專精選擇需要符合明確 requirement，而不是無成本 toggle
- 讓 UI 能顯示專精鎖定原因、解鎖來源與切換成本
- 保持高階 recipe 的 route-specific material sink，不因專精而被繞過

## Non-Goals

- 不增加新 discipline
- 不把專精做成大型 skill tree
- 不新增後端或排程系統
- 不改 Adventure actor representation

## Decisions

- 專精 requirement 優先用資料表承接，例如 `minMastery / minRealm / requiredResolvedEventIds / switchCost`
- 若現有 `setWorkshopSpecialization` reducer 無法安全阻擋非法選擇，改由 guarded action / selector 統一處理，不直接在 UI 硬判斷
- route-specific material source 優先補 encounter / milestone reward，而不是直接增加商店購買
- regression 要同時覆蓋「可解鎖」與「不可解鎖」兩種路徑

## Risks / Trade-offs

- 風險：專精 gating 太硬，玩家看到效果但很久不能使用。
  - Mitigation: 第一批 gating 只使用既有 mastery、境界與已完成 world event，不新增過深前置。
- 風險：材料來源太多會稀釋 route identity。
  - Mitigation: 每個 source 仍保留 route label / profession / realm gating。
- 風險：UI 過度擁擠。
  - Mitigation: 只在專精區塊顯示 unlock / switch cue，recipe card 保留受影響提示。

## Migration Plan

目前預期不需要新增 persisted state 欄位。若實作時新增專精 unlock state，必須同步更新 `store/persistedStateMigration.ts` 與 migration regression。
