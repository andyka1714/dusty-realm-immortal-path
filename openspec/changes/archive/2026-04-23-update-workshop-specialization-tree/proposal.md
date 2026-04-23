# 變更：建立 Workshop 專精樹與更深材料 sink

## 為什麼

Workshop 已有高階 recipe、熟練度、扁平專精與 route-specific 材料來源，但目前每個 discipline 只有一個專精 slot，沒有前置節點、互斥分支、可操作 reset UI 或更深材料 sink。這讓百業長線仍偏薄，專精選擇的 build 決策感不足。

## 這次要改什麼

- 建立煉丹 / 煉器專精樹模型
- 加入前置節點、互斥分支、解鎖條件與 reset 成本
- 擴充高階 recipe 與 route-specific material sink
- 讓 Workshop UI 顯示專精樹、鎖定原因、分支衝突與 reset 操作
- 補 persisted state migration 與 regression tests

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
  - `client-persistence`
- Affected code:
  - `types.ts`
  - `data/workshopRecipes.ts`
  - `data/workshopSpecializationTree.ts`
  - `store/actions/workshopActions.ts`
  - `store/slices/workshopSlice.ts`
  - `store/persistedStateMigration.ts`
  - `pages/Workshop.tsx`
  - `data/workshopRecipes.test.ts`
  - `store/actions/workshopActions.test.ts`
  - `store/persistedStateMigration.test.ts`
  - `pages/Workshop.crafting.test.tsx`

