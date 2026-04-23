## ADDED Requirements
### Requirement: 輪迴 build diversity 存檔承接
系統必須 (MUST) 讓舊版 soul save 能安全載入輪迴 v2 catalog，並清理不合法 planner 配置。

#### Scenario: 舊 soul save 載入 v2 catalog
- **WHEN** 玩家載入不含 v2 perk、魂印或 planner 欄位的舊存檔
- **THEN** migration 必須補上合法預設值
- **AND** 不得讓 Reincarnation Hall 因欄位缺失崩潰

#### Scenario: 不合法配置被清理
- **WHEN** 舊存檔內的 rebirth config 不符合 v2 slot、互斥或 cost 規則
- **THEN** 系統必須保留合法選擇並清理不合法項目
- **AND** 不得允許非法配置開始新一世
