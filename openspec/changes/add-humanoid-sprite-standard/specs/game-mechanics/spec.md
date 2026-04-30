## ADDED Requirements

### Requirement: 生成素材必須支援人形 Sprite 標準

生成素材系統必須 (MUST) 為 player 與 NPC 的人形 walk sprite 提供共用 humanoid profile，讓遊戲內容作者能用相同規格產出可互換的人形地圖角色素材。

#### Scenario: 註冊人形角色 walk asset
- **WHEN** registry 新增 player 或 NPC 的 humanoid walk asset
- **THEN** asset metadata 必須標示 humanoid profile
- **AND** metadata 必須描述 frame size、frame count、row order、footline、center line、target height 與 QC 狀態
- **AND** asset 必須通過 humanoid QC 後才可作為正式 map token 使用

#### Scenario: 人形 walk sheet 後處理
- **WHEN** 生成管線處理 4x4 humanoid walk sheet
- **THEN** 每格輸出必須 normalize 到 96x96 frame
- **AND** 角色完整高度必須落在 80px `±1px`
- **AND** 腳底必須對齊 `y=88`
- **AND** bbox 中心必須落在 `x=48 ±1px`
- **AND** 頭髮、髮髻、帽子或可見頭部輪廓不得被裁切

#### Scenario: 人形 combat sheet 後處理
- **WHEN** 生成管線處理 4x6 humanoid combat sheet
- **THEN** 每格輸出必須 normalize 到 96x96 frame
- **AND** sheet 必須提供 `down`、`left`、`right`、`up` 四個方向 row
- **AND** 每個方向必須提供 6 個攻擊 frame
- **AND** 腳底必須對齊 `y=88`
- **AND** bbox 中心必須落在 `x=48 ±2px`
- **AND** player combat asset metadata 必須標示 `framesPerDirection: 6` 與 QC 狀態

### Requirement: 人形 Sprite QC 必須拒收不一致素材

生成素材系統必須 (MUST) 在寫入正式 assets 前拒收不符合人形 sprite 標準的 player / NPC walk sprite 與 player combat sprite。

#### Scenario: QC 偵測到高度或切圖錯誤
- **WHEN** humanoid QC 發現任一 frame 高度超出允收範圍、腳底線不一致、水平中心漂移、碰到 frame 邊界、出現 detached fragment 或 chroma-key 殘邊
- **THEN** 該 asset 不得被標記為 `qcStatus: "passed"`
- **AND** 不得覆蓋正式 `sheet-transparent.png`、`frames/` 或 `animation.gif`
- **AND** 必須重新生成或重新後處理，而不是手工修補單一方向造成新的比例不一致
