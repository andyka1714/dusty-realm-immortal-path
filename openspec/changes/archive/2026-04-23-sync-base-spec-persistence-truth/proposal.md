# 變更：收口 base specs、persisted state migration 與正式基線真相

## 為什麼

目前 `輪迴轉生`、`洞府百業`、`事件 / 奇遇`、`即時戰鬥 HUD`、`技能書 formal migration` 與 `宗門中期任務線` 都已陸續落地，但 base specs 與 persistence truth 仍有幾個結構性缺口：

- `client-interface` 還沒有正式承認 `GameShell` 內的 `Workshop / Compendium / PendingEncounter` 入口與 modal 承接
- `client-persistence` 雖已描述 versioned envelope，但尚未明確收口 `formal skill/manual migration`、`encounter` hydration 與跨輪迴 current reset 邊界
- `game-mechanics` 已有 `輪迴` 與 `地圖內戰鬥` 基線，但還沒把已正式存在的 `Workshop` 支撐循環、遭遇選項承接與宗門任務成長線回寫成正式 requirement

如果這條線不先收，後續 `輪迴正式化深化 / 百業擴張 / 事件內容擴量 / 宗門與世界擴張` 都會繼續建立在半舊半新的基線上。

## 這次要改什麼

- 更新 `client-interface`，正式定義 `GameShell` 內面板與 pending encounter 承接
- 更新 `client-persistence`，收口 `schemaVersion: 2` save envelope、legacy skill/manual migration、`encounter` / `soul` hydration 與輪迴 reset 邊界
- 更新 `game-mechanics`，把 `Workshop`、事件 / 奇遇 choice flow、宗門中期 quest progression 納入正式基線
- 視實際差距補齊 `persistedStateMigration`、`localStorage` 與相關 regression tests
- 同步更新 tracking docs，讓後續主線有可信的正式起點

## 影響範圍

- Affected specs:
  - `client-interface`
  - `client-persistence`
  - `game-mechanics`
- Affected code:
  - `components/game/GameShell.tsx`
  - `components/game/PendingEncounterPanel.tsx`
  - `components/game/ReincarnationFlow.tsx`
  - `pages/Workshop.tsx`
  - `store/localStorage.ts`
  - `store/localStorage.test.ts`
  - `store/persistedStateMigration.ts`
  - `store/persistedStateMigration.test.ts`
  - `store/actions/reincarnationActions.ts`
  - `store/actions/encounterActions.ts`
  - `store/actions/timeActions.event.test.ts`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
