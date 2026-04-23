## MODIFIED Requirements
### Requirement: 應用程式導航 (App Navigation)
系統必須 (MUST) 提供單一全畫面遊戲主畫面，並以浮動快捷按鈕與浮動面板切換主要功能模組。

#### Scenario: 主遊戲殼層
- **WHEN** 角色已初始化且未死亡
- **THEN** 系統顯示單一全畫面主場景
- **AND** 不再顯示舊的側邊欄切頁式主導航
- **AND** 玩家可以在主場景上開啟角色、背包、洞府、圖鑑等浮動面板

#### Scenario: 功能面板開啟
- **WHEN** 玩家點擊浮動快捷列中的功能按鈕
- **THEN** 系統在主場景上方開啟對應的浮動面板
- **AND** 主場景保持在背景常駐

### Requirement: 響應式佈局 (Responsive Layout)
系統必須 (MUST) 以遊戲殼層方式適配桌面與行動裝置的使用體驗。

#### Scenario: 桌面版 (Desktop > 768px)
- **WHEN** 在桌面裝置遊玩
- **THEN** 主場景全螢幕顯示
- **AND** HUD 固定於畫面邊緣
- **AND** 浮動面板以桌面尺寸在主場景上層顯示

#### Scenario: 行動版 (Mobile)
- **WHEN** 在行動裝置遊玩
- **THEN** 主場景仍維持全螢幕顯示
- **AND** 浮動按鈕與 HUD 必須避開系統安全區域
- **AND** 浮動面板以行動裝置友善的覆蓋層或底部抽屜形式顯示

### Requirement: 視覺風格與五行 (Visual Style & Five Elements)
系統必須 (MUST) 保持深色修仙主題，並將 HUD、主場景、面板整合為更接近遊戲介面的視覺層次。

#### Scenario: HUD 與主場景
- **WHEN** 玩家進入主遊戲畫面
- **THEN** HUD、快捷列、浮動面板必須疊加在主場景之上
- **AND** 主場景須保有沉浸式全畫面視覺，不得再呈現明顯的網頁側欄主佈局
