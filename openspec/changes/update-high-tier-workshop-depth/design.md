## Context

目前 Workshop 的 live code 很薄：

1. `WorkshopState` 只有 `alchemyLevel / blacksmithLevel / unlockedRecipes / craftedRecipeCounts`
2. `WORKSHOP_RECIPES` 只有 `qi_pill` 與 `novice_sword_reforge`
3. 高境界 loop support 已經知道 `化神 -> 仙帝` 需要丹藥與洞府乘區，但 recipe 本體沒有對應高階入口
4. route-specific encounter 與宗門 / 世界後段已開始提供材料語意，但 Workshop 還沒有把這些來源變成高階材料 sink

這次要做的是「把第一批 Workshop loop 推進到中後期可追求」，不是重寫整個 crafting engine。

## Goals

- 讓 `化神 -> 仙帝` 至少有代表性的高階丹方 / 器方支撐
- 讓 recipe 有清楚 tier、realm gate、材料來源與品質 / 專精 cue
- 讓玩家能在 UI 上看懂高階 recipe 為什麼被鎖、缺什麼材料、會產出什麼品質或路線收益
- 讓 persisted save 可安全承接新增的 Workshop mastery / specialization 欄位
- 用 regression 固定高境界乘區不再只引用 placeholder feature id

## Non-Goals

- 不新增全新的職業樹 UI
- 不把煉丹 / 煉器做成即時小遊戲
- 不重寫裝備掉落或 battle core 品質公式
- 不改 `AdventureStage`、玩家、NPC 或怪物 token 呈現
- 不做全像素化角色 / 怪物素材

## Data Model Direction

- `WorkshopRecipe` 補足高階 recipe metadata：
  - `tier`: recipe 階層，例如 `basic / advanced / highRealm`
  - `minRealm`: recipe 對應最低大境界
  - `routeTags`: recipe 來源或職業 / 宗門 / 世界路線語意
  - `qualityHint`: UI 用來說明預期品質或變化
  - `masteryYield`: 完成後提供的百業熟練度或專精進度
- `WorkshopState` 補：
  - `masteryByDiscipline`
  - `specializationByDiscipline`
  - 舊存檔 migration 預設值
- 第一批高階配方應優先用既有 item system，不引入第二套物品模型。

## UI Direction

`pages/Workshop.tsx` 仍沿用 `GameSection`。高階化要做的是加強 recipe card 的可讀性：

- 顯示 recipe tier / min realm / route tags
- 顯示材料擁有量與來源提示
- 顯示產物品質與專精收益 cue
- 若被境界、等級或材料鎖住，按鈕與提示要明確說明原因

## Testing Direction

- `store/actions/workshopActions.test.ts` 驗證高階 recipe 消耗材料、產出高品質物品並累積 mastery
- `pages/Workshop.crafting.test.tsx` 驗證 UI 顯示高階 recipe cue、鎖定原因與品質提示
- `store/persistedStateMigration.test.ts` 驗證舊存檔補上 Workshop 新欄位
- `data/progression/highRealmLoopSupport.test.ts` 驗證高境界丹藥 / 洞府支撐引用真實 high-tier recipe 或 item

## Risks / Trade-offs

- 若一次做太完整，Workshop 會變成另一個過大的系統。
  - Mitigation: 只做代表性高階 recipe、mastery / specialization 的最小可用結構。
- 若只加 recipe，不加 UI cue，玩家看不懂高階材料從哪裡來。
  - Mitigation: 每張高階 recipe card 都要顯示材料來源與鎖定原因。
- 若改 persistence 卻沒有 migration，舊存檔會爆。
  - Mitigation: 這條 change 必須包含 persisted state migration regression。
