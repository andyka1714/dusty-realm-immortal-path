# 變更：擴張事件與奇遇內容庫

## 為什麼

事件系統已經完成第一輪機制收口，現在的缺口不是 selector、pending UI 或 resolved flow，而是內容厚度不平均。尤其 `元嬰 -> 合體 -> 大乘` 之間可重複刷取的 route-specific 事件偏少，後段仍容易退回少數 one-time 事件與材料事件支撐。

## 這次要改什麼

- 建立 encounter content coverage matrix，明確追蹤境界段、職業路線、宗門路線與里程碑事件覆蓋率
- 補中後期可重複事件，優先覆蓋 `元嬰 / 化神 / 煉虛 / 合體 / 大乘 / 渡劫`
- 擴充高辨識度事件結果，讓材料、Workshop source cue、穩定收益與里程碑獎勵更清楚
- 補內容覆蓋 regression，避免後續改版讓某條路線或境界段事件池退化
- 同步更新 encounter gameplay 文件

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/encounters.ts`
  - `data/encounters.test.ts`
  - `store/actions/timeActions.event.test.ts`
  - `store/actions/encounterActions.test.ts`
  - `components/game/PendingEncounterPanel.test.tsx`
  - `docs/02_Gameplay/workshop.md`
  - `docs/06_Balance_Audit/18_五線內容深度執行計畫.md`

