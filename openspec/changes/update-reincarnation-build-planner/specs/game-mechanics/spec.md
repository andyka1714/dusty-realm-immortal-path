## ADDED Requirements

### Requirement: 輪迴大殿 build planning 深化
系統必須 (MUST) 讓輪迴配置成為真正的多周目 build 規劃，而不是固定單一路徑。

#### Scenario: 魂印與遺珍形成不同開局
- **WHEN** 玩家在 `Reincarnation Hall` 選擇不同的 perk、靈根改寫與遺珍組合
- **THEN** 系統必須為下一世建立對應的起手資源、屬性偏向或遺珍繼承結果
- **AND** 不得把所有輪迴配置壓回幾乎相同的開局

#### Scenario: 進階 planner 依里程碑解鎖
- **WHEN** 玩家累積更多輪迴次數、最高境界或等效生命里程碑
- **THEN** 系統必須解鎖對應的進階 planner 條目
- **AND** 玩家不應在第一輪就無條件取得所有高階輪迴配置

### Requirement: 主動坐化沿用正式結算語意
系統必須 (MUST) 讓 `主動坐化` 與死亡型輪迴共用同一套結算與 rebirth pipeline。

#### Scenario: 主動坐化結算
- **WHEN** 玩家透過正式入口主動結束本世
- **THEN** 系統必須照常計算本世 merit、Lifetime Stats 與遺珍候選
- **AND** 不得繞過 `Life Review` 或直接跳到新角色初始化
