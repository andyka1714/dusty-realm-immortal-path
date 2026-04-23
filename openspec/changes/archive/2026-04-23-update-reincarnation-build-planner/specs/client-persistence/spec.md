## ADDED Requirements

### Requirement: 輪迴 planner 演進式存檔承接
系統必須 (MUST) 讓既有 `soul` save 能安全承接擴充後的 planner catalog，而不是因第二批 perk / 遺珍規則而失效。

#### Scenario: 舊版 soul save 載入新版 planner
- **WHEN** 玩家載入尚未包含新版 planner 欄位或進階 perk catalog 的舊存檔
- **THEN** 系統必須自動補上 baseline planner 預設值與可用 perk 狀態
- **AND** 不得因缺少新版欄位而無法讀檔

#### Scenario: 清理過期或超限選擇
- **WHEN** 舊存檔內的 `rebirthConfig` 與新版 slot / perk 規則不相容
- **THEN** 系統必須保留仍合法的選擇並清理超限項目
- **AND** 不得讓無效 planner 配置直接進入下一世
