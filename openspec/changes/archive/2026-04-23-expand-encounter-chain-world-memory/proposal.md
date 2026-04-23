# 變更：擴張事件鏈與世界記憶

## 為什麼

Encounter 已完成 pending / choice / reward / resolved 的第一輪正式化，但多數事件仍是單次結算。下一階段需要讓事件結果能形成後續記憶，讓宗門、世界、Workshop 與輪迴能讀到玩家過去選擇。

## 這次要改什麼

- 建立 encounter chain 與 world memory 的資料規格
- 補第一批 chain-aware encounter 內容
- 讓 pending encounter UI 顯示 chain / memory cue
- 讓 persistence 能安全保存、清理與讀取事件記憶
- 補事件鏈 selector、UI 與 migration regression

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
  - `client-persistence`
- Affected code:
  - `types.ts`
  - `data/encounters.ts`
  - `store/actions/encounterActions.ts`
  - `store/actions/timeActions.ts`
  - `store/slices/encounterSlice.ts`
  - `store/persistedStateMigration.ts`
  - `components/game/PendingEncounterPanel.tsx`
  - `docs/02_Gameplay/workshop.md`
  - `docs/03_World/story.md`
