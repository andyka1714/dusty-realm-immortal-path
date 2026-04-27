## MODIFIED Requirements

### Requirement: 像素地圖 production polish
系統必須 (MUST) 讓正式 `AdventureStage` 的 terrain / background 像素語言具備可重複擴量的 biome palette、tile semantic、landmark / POI / path 規格與 visual QA 摘要，同時維持玩家、NPC、怪物與角色本體的文字 token 呈現。

#### Scenario: biome 與 tile 語意可追蹤
- **WHEN** 正式地圖依 theme / route 產生 pixel terrain
- **THEN** 系統必須能追蹤主要 tile semantic，例如 ground、path、water、hazard、POI、portal clearing 或 Boss arena
- **AND** 不得只用隨機雜訊或單純 palette replacement 取代地圖語意

#### Scenario: visual QA 摘要可驗證
- **WHEN** 測試或工具檢查代表地圖的 terrain/background
- **THEN** 系統必須輸出或可推導 palette、semantic role、skeleton、motif 與 forbidden actor-token 狀態
- **AND** QA 摘要必須可被 regression 驗證，避免 pixel terrain 退回黑畫面或單一 floorplan

#### Scenario: route-specific landmark 可讀
- **WHEN** 玩家進入不同路線或同 theme 的不同代表地圖
- **THEN** 背景層必須提供可辨識的 route-specific skeleton 或 landmark
- **AND** 不得讓 `North / East / West / Spirit / Void / Immortal / Ultimate` 等代表地圖全部退化成相同 floorplan

#### Scenario: actor token 維持文字遊戲感
- **WHEN** terrain / background 進行 pixel polish
- **THEN** 玩家、NPC、怪物、角色本體、portal marker、combat overlay 與 HUD 必須維持正式版既有呈現
- **AND** 不得在這條 change 中把 actor layer 改成 pixel sprite 或 prototype token 牌

#### Scenario: 桌面與手機端維持 budget
- **WHEN** 正式 Adventure 地圖在桌機與手機瀏覽器顯示 pixel terrain
- **THEN** terrain polish 必須維持既有整數倍像素縮放與可讀性
- **AND** 不得讓背景細節壓過戰鬥 cue、target marker 或 HUD
