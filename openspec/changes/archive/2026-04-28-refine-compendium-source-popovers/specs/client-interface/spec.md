## ADDED Requirements

### Requirement: 圖鑑來源追蹤彈窗必須可讀且可分辨來源類型
圖鑑來源追蹤必須 (MUST) 讓玩家快速分辨掉落、商店販賣、工坊製作、工坊用途與奇遇路線，並能依怪物類型辨識掉落來源。

#### Scenario: 玩家查看裝備來源
- **WHEN** 玩家查看裝備法寶卡片的來源追蹤
- **THEN** 普通怪物掉落 badge 必須使用灰色
- **AND** 精英怪物掉落 badge 必須使用藍色
- **AND** 首領怪物掉落 badge 必須使用紅色
- **AND** `+更多` 彈窗必須以掉落、商店販賣、工坊製作、工坊用途、奇遇路線分組呈現
- **AND** 彈窗必須提供足夠寬度、固定最大高度與捲動能力，讓玩家可完整閱讀來源

#### Scenario: 玩家查看裝備品質 badge
- **WHEN** 玩家 hover 裝備卡右上角的單一品質 badge
- **THEN** 只應顯示該品質 badge 的 tooltip
- **AND** hover 整張卡片不得一次顯示全部品質 tooltip
