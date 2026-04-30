## ADDED Requirements

### Requirement: 生成素材必須與遊戲資料模型解耦
生成素材必須 (MUST) 以 `assetId` 作為資料模型與實際檔案的邊界，讓角色、NPC、怪物、物品、技能與地圖可以逐步接入素材而不需要一次修改所有 domain model。

#### Scenario: 第一批玩家素材註冊
- **WHEN** 系統註冊男性凡人玩家素材
- **THEN** 素材必須以 `character.player.mortal_male.v1` 表示
- **AND** 實際檔案必須放在 `public/assets/generated/characters/player/mortal-male-v1/`
- **AND** 素材 metadata 必須保留生成 prompt 與 pipeline meta 以便日後重生或替換
