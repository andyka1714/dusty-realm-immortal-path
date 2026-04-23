# 變更：擴張宗門與世界路線章節 v2

## 為什麼

三宗中期與第一輪後段章節已完成，但目前仍偏任務節點。下一階段需要讓宗門身份延伸為跨地圖、跨境界、可被 encounter 與 Workshop 讀取的 route chapters。

## 這次要改什麼

- 補化神後三宗路線章節
- 補 map-local NPC、對話或 chapter encounter hook
- 讓章節結果能提供 route memory 或 material source cue
- 補章節可發現性與 regression

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/quests.ts`
  - `data/npcs.ts`
  - `data/maps.ts`
  - `data/encounters.ts`
  - `store/selectors/questSelectors.ts`
  - `components/game/QuestModal.tsx`
  - `docs/02_Gameplay/sect-world.md`
  - `docs/03_World/story.md`
