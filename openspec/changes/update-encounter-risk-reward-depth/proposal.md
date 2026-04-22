# 變更：深化事件與奇遇的權重、風險收益與路線差異

## 為什麼

目前遊戲中的 `Encounter` 已有正式基礎流程：

- 年歲流逝可觸發 pending encounter
- 玩家可在 modal 中做選擇
- reward 會正式結算到角色、背包與 log
- 高境界 multiplier 也已綁到真實事件 id

但現在最大的缺口，不再是「有沒有事件系統」，而是：

1. 事件挑選幾乎只看 `realm`
2. `resolvedEventIds` 尚未成為 anti-repeat / one-time gating 的正式規則
3. 玩家在選項介面上仍不容易判讀風險、成本與收益差異
4. profession / sect / route-specific event pool 還不夠厚

如果不把這批缺口補齊，`Encounter` 會長期停在「有 flow、但內容層很薄」的中間狀態，也很難成為後續宗門 / 世界與高階百業擴張的承接點。

## 這次要改什麼

- 補 encounter metadata 與 selector context，讓事件挑選不再只依賴 `realm`
- 正式使用 `resolvedEventIds` 承接 one-time / anti-repeat encounter gating
- 補 profession / sect / 高境界 / route-specific 的事件池差異
- 補 `PendingEncounterPanel` 的風險 / 收益 / 類型 cue，提高選擇可讀性
- 補對應 regression tests，並同步更新優先級與玩法文件

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/encounters.ts`
  - `store/actions/timeActions.ts`
  - `store/actions/encounterActions.ts`
  - `components/game/PendingEncounterPanel.tsx`
  - `components/game/GameShell.tsx`
  - `store/slices/encounterSlice.ts`
  - `docs/02_Gameplay/workshop.md`
  - `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
