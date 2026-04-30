## ADDED Requirements

### Requirement: UI 必須透過 assetId 解析生成素材
介面必須 (MUST) 能透過共用素材 registry 解析生成素材，避免角色、NPC、怪物、物品、地圖與戰鬥效果直接散落 public path。

#### Scenario: UI 查詢已註冊素材
- **WHEN** 介面以 `character.player.mortal_male.v1` 查詢素材
- **THEN** registry 必須回傳可用的素材定義與 runtime URL
- **AND** 素材定義必須包含用途、檔案、風格與 sprite metadata

#### Scenario: UI 查詢未知素材
- **WHEN** 介面查詢不存在的 assetId
- **THEN** registry 必須回傳 fallback 素材
- **AND** 不得造成 render crash
