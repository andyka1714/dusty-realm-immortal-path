# 背包與物品 (Inventory)

## 1. 背包網格
- 固定大小 (如 40 格)。
- 物品可堆疊 (Stackable)，上限通常為 99 或 999。

## 2. 裝備系統
- **部位**: 武器、衣服、戒指、護符。
- **限制**: 裝備有境界需求 (如「練氣期」裝備凡人無法使用)。
- **屬性**: 裝備直接增加六維屬性。

## 3. 物品分類
- 參見 [05_Data/item_list.md](../05_Data/item_list.md)

## 4. 技能書系統

- 功法與技能改為「技能書」形式，屬於 `ConsumableType.Manual`。
- 技能書需在背包中主動使用，使用後才會習得技能。
- 技能書具備以下限制：
  - 職業限制
  - 境界限制
  - 前置技能限制
  - 已習得的技能不可重複參悟

### 4.1 技能書取得規則

- 正式技能書目前只會為 `poolStatus = core` 的技能生成。
- `transition / legacy` 技能保留資料相容，但已退出商店 / 精英 / Boss / 傳承取得池。
- 若舊手冊或舊存檔仍引用退場技能，背包顯示與學習流程會先映射到對應 `replacementSkillId`。
- 凡界藏經閣：販售三職業的練氣入門秘卷
- 宗門藏經閣：販售本宗的基礎進階秘卷
- 精英怪：掉落同境界被動技能書
- Boss：掉落同境界主動技能書
- 古修傳承殿：收錄 `formalSourceTier = inheritance` 的高階秘卷，不再混進一般精英 / Boss 掉落

### 4.2 使用流程

1. 在背包選中技能書
2. 系統檢查職業、境界與前置技能是否符合
3. 若符合則消耗技能書，將對應 `skillId` 寫入角色已學技能
   若該技能已退場，會先正規化成正式核心技能再寫入
4. 若不符合，背包顯示原因且不可使用

### 4.3 正式技能池 metadata

目前每一本技能書背後對應的技能，已在程式資料中具備正式 metadata：

- `poolStatus`: `core / transition / legacy`
- `formalRole`: `guaranteed / utility / burst / passive`
- `formalSourceTier`: `shop / elite / boss / inheritance`
- `prerequisiteSkillIds`
- `replacementSkillId`

也就是說，背包現在不是只看道具文案，而是直接吃正式技能池資料來決定能不能參悟。

另外，顯示層也已開始吃 formal helper：

- 舊 skillId 若已退場，背包會先映射到正式核心技能再顯示
- 圖鑑的「功法神通 / 宗門傳承」頁也只再顯示 formal core 技能
- 技能書與商店配置也開始直接讀 formal core 索引層（依 `source tier / profession / realm` 分流）
- 精英與 Boss 的技能書掉落池也已改走同一套 formal core 查詢 helper
- 技能資料本身也已切出按境界的 `formal core / retired` 索引，後續刪整舊技能不必再從全域技能表反推
- 這樣 UI 不會再把 `transition / legacy` 當成正式可取得技能對外呈現
- 背包內的丟棄確認與批量丟棄視窗，也已開始對齊 `Modal` 的正式 eyebrow 殼層語言
- 背包格內的裝備、技能書與消耗品懸停浮層，也已開始對齊 `GameTooltip` 的完整 `eyebrow + title + body + footer` 結構
- 背包內的批量整理、批量管理與單件丟棄等尾端操作提示，也已補齊 `GameHintBubble` 的 eyebrow，和其他遊戲提示語言一致
- 技能書 hover 現在會直接顯示：
  - 主動 / 被動分類
  - 技能書品階
  - 正式來源標籤
  - 前置技能鏈
- 裝備 hover 現在會直接顯示：
  - 基礎屬性
  - 附加詞條
  - 品質 / 境界 / 持有數量 footer
