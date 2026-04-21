# 變更：收斂 P2 技能書來源層級與學習限制

## 為什麼

`P0 / P1` 完成後，技能書仍停留在第一版規則：

- 只有粗略的 `shop / elite / boss / inheritance` 來源標記
- 商店 / 任務 / 技能書描述 / 測試之間仍靠人工對齊
- 商店文案已寫成「可先購得秘卷，待符合條件後再參悟」，但實際列表仍先把高境界技能書隱藏

這會讓 `P2` 的技能書深化繼續卡在半成品狀態。

## 這次要改什麼

- 為正式 `core` 技能書建立 acquisition tier：`basic / advanced / boss_core / inheritance`
- 讓技能書 registry 正式攜帶來源類型、前置技能、職業與境界 metadata
- 讓宗門試煉獎勵改由正式技能池導出，避免手填硬編碼
- 讓商店可提前顯示高於目前境界的技能書，但仍保留參悟限制
- 補齊技能書 coverage / source alignment / acquisition tier 測試
- 同步更新 `08`、`12`、`16` 文件

## 影響範圍

- Affected specs: `game-mechanics`
- Affected code:
  - `types.ts`
  - `data/skills/index.ts`
  - `data/items/manuals.ts`
  - `data/quests.ts`
  - `pages/Inventory.tsx`
  - `components/adventure/ShopPanel.tsx`
  - `components/adventure/QuestModal.tsx`
  - `data/skills/skillBookCoverage.test.ts`
  - `data/skills/skillPoolRegistry.test.ts`
