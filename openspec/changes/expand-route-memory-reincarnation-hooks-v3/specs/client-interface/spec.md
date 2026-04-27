## MODIFIED Requirements

### Requirement: 輪迴 build preview v2
輪迴大殿介面必須 (MUST) 顯示下一世 build identity、主要限制與預期收益。

#### Scenario: Preview 顯示魂印與限制
- **WHEN** 玩家調整 perk、魂印或遺珍配置
- **THEN** preview 必須顯示當前 build identity、魂印效果、功德成本與遺珍限制
- **AND** 不相容的遺珍或 perk 必須提供可讀原因

#### Scenario: v3 route memory 顯示於魂印選項
- **WHEN** 玩家在 Reincarnation Hall 查看由 `sect:*:world-chapter-03` 解鎖的魂印或 perk
- **THEN** 介面必須顯示對應宗門路線、v3 world memory source、identity cue 與 expected benefit
- **AND** 缺少 route memory 時，locked card 必須顯示缺少哪條 v3 記憶
