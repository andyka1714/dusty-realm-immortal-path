## ADDED Requirements

### Requirement: 人形角色地圖 Sprite 必須使用標準化 frame

介面必須 (MUST) 只使用通過人形 sprite 標準的 player / NPC walk frames 來呈現地圖上的人形角色，避免不同性別、角色或方向在地圖上出現高度、腳底或中心漂移。

#### Scenario: 玩家角色方向切換時維持一致站位
- **WHEN** 玩家角色在 Adventure 地圖中切換 `down`、`left`、`right`、`up` walk frame
- **THEN** 每個 frame 的腳底必須對齊同一個 tile anchor footline
- **AND** 每個 frame 的水平中心必須維持在同一個 tile center
- **AND** 男性與女性凡人 player walk sprite 必須使用相同 humanoid height profile

#### Scenario: NPC 後續接入地圖 sprite
- **WHEN** 任一 NPC asset 被標示為 humanoid walk sprite
- **THEN** 該 NPC 必須使用與 player 相同的 frame size、footline、center line 與 height tolerance
- **AND** 不得以單一 NPC 的原圖比例覆蓋共用人形地圖尺度

### Requirement: 地圖走路動畫必須使用獨立 frame PNG

介面必須 (MUST) 以獨立 frame PNG 載入 player / NPC walk animation，不得在 runtime 透過 rectangle 切整張 sheet 作為 walk frame，以避免相鄰格取樣污染。

#### Scenario: 載入玩家走路動畫
- **WHEN** AdventureStage 載入 player walk animation
- **THEN** 必須解析 `frames/player_sheet-N.png` 作為 frame textures
- **AND** 不得用整張 `sheet-transparent.png` 的 runtime rectangle 切片作為 player walk texture
- **AND** 若 frame PNG 載入失敗，必須保留既有文字 token fallback

### Requirement: 玩家戰鬥動畫必須支援四方向

介面必須 (MUST) 讓 player combat animation 使用與 walk animation 相同的方向 row order，避免進入戰鬥後只顯示單一角度攻擊動作。

#### Scenario: 依面向播放戰鬥 frame
- **WHEN** 玩家在 AdventureStage 中進入 world combat presentation
- **THEN** combat animation 必須依目前 `down`、`left`、`right`、`up` 面向選擇對應 row
- **AND** 每個方向必須使用 6 格攻擊 frame 來對齊 attack active window
- **AND** 不得固定播放單一 `2x3` combat sheet 角度
