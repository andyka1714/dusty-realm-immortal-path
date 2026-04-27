## ADDED Requirements

### Requirement: 圖鑑瀏覽整理不新增 persisted state
系統必須 (MUST) 讓 Compendium v4 的分類、tabs、source summary 與 layout 修正只從既有 catalog 推導，避免為瀏覽體驗新增存檔負擔。

#### Scenario: Compendium route browsing v4 不新增 schema
- **WHEN** 圖鑑顯示職業 tabs、境界摘要、宗門 route hook summary 或 item source tracing
- **THEN** 系統必須從既有 `ITEMS`、skill registry、sect config、encounter metadata、Workshop recipes 與 source tracing helper 推導
- **AND** 不得新增 LocalStorage envelope 欄位、玩家圖鑑進度欄位或新的 persisted source registry
