## ADDED Requirements

### Requirement: NPC 身分必須分離個人名稱與歸屬標籤

NPC catalog 必須 (MUST) 讓每個 NPC 擁有可獨立辨識的個人名稱，並以額外欄位描述店鋪、宗門、機構或路線歸屬，不得用機構名稱取代角色本人名稱。

#### Scenario: 同名機構在不同地圖出現
- **WHEN** 多張地圖都有 `萬寶閣`、`靈寶閣` 或 `藏經閣` 類 NPC
- **THEN** 每個 NPC 的 `name` 必須是該角色個人名稱
- **AND** 機構名稱必須寫入 `affiliationLabel`
- **AND** 既有 `shopId`、`questIds`、`type`、`x`、`y` 與 `id` 必須保持功能語意不變

#### Scenario: NPC 沒有正式機構歸屬
- **WHEN** NPC 是散修、巡候、回聲、路諭師或其他非店鋪機構角色
- **THEN** 系統可以省略 `affiliationLabel`
- **AND** 必須仍可用 `name` 與 `roleLabel` 清楚描述其個人身份與職責

### Requirement: NPC Sprite 必須由職能與歸屬 Archetype 決定

NPC sprite 系統必須 (MUST) 以 `spriteArchetype` 描述角色職能外觀，以 `spriteVariant` 描述宗門、地區或境界風格變體，讓相同歸屬或相同職能能共用圖片，不同職能或歸屬類別則使用不同圖片。

#### Scenario: 相同歸屬共用基礎圖像
- **WHEN** 多個 NPC 屬於 `萬寶閣`
- **THEN** 他們可以共用 `wanbao_clerk` 類 sprite archetype
- **AND** 可以用 `village`、`sword`、`beast`、`mystic` 等 variant 呈現所在地差異
- **AND** 不得因個人名字不同而強制生成完全不同基礎圖像

#### Scenario: 不同角色類別使用獨立圖像
- **WHEN** NPC 分屬 `萬寶閣`、`靈寶閣`、`藏經閣`、宗門長老、路線使者、工坊師、書吏或回聲
- **THEN** 這些類別必須使用不同的 sprite archetype
- **AND** 不得讓商人、煉器師、藏書執事與宗門任務 NPC 共用同一張無差別人形圖

### Requirement: NPC 人形圖像必須沿用既有 Humanoid Walk 標準

NPC walk sprite 必須 (MUST) 沿用既有 player/NPC humanoid profile，不在本次規劃新增 NPC combat animation 或怪物圖像規格。

#### Scenario: NPC walk asset 登錄
- **WHEN** NPC sprite asset 被登錄為 production map token
- **THEN** asset 必須是 `4x4` walk sheet
- **AND** 每格必須 normalize 為 `96x96`
- **AND** row order 必須為 `down`、`left`、`right`、`up`
- **AND** 腳底必須對齊 `y=88`
- **AND** bbox 中心必須落在 `x=48 ±1px`
- **AND** 必須通過 humanoid QC 並標記 `qcStatus: "passed"`

#### Scenario: NPC 尚未有 sprite asset
- **WHEN** NPC 沒有可用 sprite asset 或 frame 載入失敗
- **THEN** 系統必須保留既有文字 token fallback
- **AND** 不得因缺少圖像導致 NPC 無法互動、任務無法提交或商店無法開啟
