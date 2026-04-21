## Context

現況已經完成兩件事：

- 正式技能池、技能書來源與 realm dataset 都已切成 `core only`
- 每個 retired skill 都已有 `replacementSkillId`，而 reducer / consume flow 也已經能做 replacement-aware 正規化

但目前仍有三個結構問題：

1. 舊存檔載入時，`character.skills` 與背包裡的舊秘卷仍可能先進入 store，再靠 reducer 逐步修正
2. `transition / legacy` 技能雖不再進正式池，卻還保留不少 final-cull / removal 輸出，顯示最後一哩還沒正式收掉
3. 玩家可見系統已大多切乾淨，但相容層與最終退場邊界還沒有被明確制度化

## Goals

- 舊存檔載入後，store 內只留下 formal core 技能與 formal core 秘卷引用
- `transition / legacy` 技能不再出現在玩家可見的技能 / 秘卷 / 獎勵視圖
- replacement migration 必須是 deterministic 且 idempotent
- 保留必要 compatibility source，但限制在 hydrate / import / regression test 邊界

## Non-Goals

- 不在這次變更中新增新的高境界技能或技能書來源層級
- 不在這次變更中重做 battle core 數學或技能平衡
- 不要求立刻刪除所有 retired alias 原始資料檔；若測試與 migration helper 仍需要，可暫留中央 alias 檔

## Decisions

- 以既有 `replacementSkillId` 與 final-cull manifests 作為唯一 migration source，不再建立第二套手寫對照表
- `loadState()` 後、進入 Redux store 前就執行 persisted-state migration，讓 preloaded state 直接是 formal core 視角
- reducer 內既有的 replacement-aware 正規化保留為 defensive fallback，但不再作為主要遷移機制
- 舊 skill id 若最終映射到同一個 formal core id，hydrate 後必須去重，避免角色技能列表留下重複學習結果
- 舊 manual item 若能映射到正式秘卷，保留數量並升級 item id；若無法映射到有效正式秘卷，則在 migrate 階段濾除

## Risks / Trade-offs

- 退場邊界收緊後，部分依賴 retired alias 的測試可能需要重寫
  - Mitigation: 把 alias 使用限制在 migration helper 與測試 fixture，而不是散落在 player-facing exports
- hydrate migration 若處理不完整，會直接影響玩家舊檔
  - Mitigation: 先補舊 skill / manual migration regression tests，再接入 `loadState()`
- `data/skills/index.ts` 的 final-cull 輸出很多，直接刪太快容易連帶破壞盤點工具
  - Mitigation: 先把真正會被 production flow 使用的 manifest 收到 migration util，再逐步裁減多餘 export

## Migration Plan

1. 先建立 retired skill / manual persisted-state migration helper
2. 把 hydrate 路徑接到 `store/localStorage.ts` / `store/store.ts`
3. 再清理玩家可見出口與相應測試
4. 最後同步文件與 checklist，明確標記這條新主線承接 `16` 之後的下一步
