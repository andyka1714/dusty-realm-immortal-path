## ADDED Requirements

### Requirement: 地圖 NPC 標籤必須支援歸屬與個人名稱

Adventure 地圖介面必須 (MUST) 在 NPC 有歸屬標籤時，同時呈現機構或歸屬與角色本人名稱，讓玩家能看出「這是萬寶閣的人」以及「這個人叫什麼」。

#### Scenario: 顯示店鋪 NPC
- **WHEN** NPC 有 `affiliationLabel` 與 `name`
- **THEN** 地圖 NPC 標籤必須以 `affiliationLabel` 作為上層或主要歸屬文字
- **AND** 必須以 `name` 顯示角色本人名稱
- **AND** 若有 `roleLabel`，介面可以在詳情或互動面板顯示職責

#### Scenario: 顯示無歸屬 NPC
- **WHEN** NPC 沒有 `affiliationLabel`
- **THEN** 地圖 NPC 標籤必須維持以 `name` 為主要文字
- **AND** 不得顯示空白、重複名稱或 placeholder affiliation

### Requirement: NPC Sprite 呈現必須保留互動與 fallback

Adventure 地圖介面必須 (MUST) 使用 NPC sprite resolver 載入已通過 QC 的 humanoid idle frame 或 idle sheet frames，並在缺圖或載入失敗時保留既有 NPC token 互動。

#### Scenario: NPC sprite 載入成功
- **WHEN** NPC resolver 回傳可用 sprite asset
- **THEN** AdventureStage 必須使用獨立 frame PNG 顯示 NPC idle presentation
- **AND** sprite 必須對齊 tile center 與 humanoid footline
- **AND** idle sheet 只能播放原地呼吸、衣袖、髮絲、法光或手部小動作
- **AND** NPC 不得因 idle 動畫產生格子位移、追逐、戰鬥或方向切換需求
- **AND** NPC 點擊、任務、商店與資訊互動範圍不得改變

#### Scenario: NPC sprite 載入失敗
- **WHEN** NPC frame PNG 無法載入或 asset 未通過 QC
- **THEN** AdventureStage 必須回退到既有文字 token
- **AND** 使用者仍可點擊 NPC 並開啟原有互動
