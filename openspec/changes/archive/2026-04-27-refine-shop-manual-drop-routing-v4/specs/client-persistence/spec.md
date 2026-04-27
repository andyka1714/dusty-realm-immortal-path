## ADDED Requirements

### Requirement: 技能書 routing v4 不新增 persisted state
系統必須 (MUST) 讓技能書商店、掉落與圖鑑 route 只從既有 catalog 推導，避免為 source tracing 新增玩家存檔負擔。

#### Scenario: 技能書 routing 不新增 schema
- **WHEN** 系統建立 manual routing helper 或圖鑑 skill source trace
- **THEN** 必須使用既有 skill metadata、`SHOPS`、`BESTIARY`、manual item id 與 source labels
- **AND** 不得新增 LocalStorage envelope 欄位、玩家技能書來源進度或新的 persisted route registry
