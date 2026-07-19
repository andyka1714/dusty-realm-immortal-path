## ADDED Requirements

### Requirement: Mobile Adventure HUD 互動區不得互相攔截
Adventure 主畫面的角色狀態、任務入口、小地圖、action wheel 與底部 dock 必須 (MUST) 在 mobile viewport 保持各自可點擊，非互動透明容器不得攔截其他控制。

#### Scenario: 玩家點擊右上小地圖
- **WHEN** 玩家在約 390px 寬的 mobile viewport 點擊小地圖
- **THEN** 點擊必須開啟地圖介面
- **AND** 左上角色 HUD 的透明盒或超出視覺範圍不得攔截該點擊

#### Scenario: 主要 mobile controls 保持獨立 hit area
- **WHEN** 角色卡、任務入口、小地圖、action wheel 與底部 dock 同時出現
- **THEN** 主要 touch control 的有效 hit area 應至少為 44×44 CSS px
- **AND** 這些控制的 hit rectangles 不得互相重疊或讓主要地圖操作不可達

#### Scenario: 非互動 HUD 裝飾不接收 pointer
- **WHEN** HUD wrapper 只負責定位、外框、glow 或其他裝飾
- **THEN** wrapper 必須讓 pointer 穿透
- **AND** 只有實際按鈕、展開入口或可操作內容可以恢復 pointer interaction

### Requirement: Browser regression 必須驗證正式產品契約
Playwright 關鍵流程必須 (MUST) 以目前正式分類、互動範圍與可見結果驗證產品，不得依賴已被正式規格取代的舊文案或精確格點。

#### Scenario: 圖鑑分類符合正式資訊架構
- **WHEN** E2E 驗證 novice sword 等裝備圖鑑內容
- **THEN** 測試必須在 equipment 分類驗證該裝備
- **AND** 不得要求已從 item 分類移除的裝備卡仍出現在 item tab

#### Scenario: 任務多目標進度可讀
- **WHEN** 任務追蹤分別顯示目標名稱與數量 counter
- **THEN** E2E 必須驗證玩家可見的目標語意與進度數量
- **AND** 不得強迫兩者合併成已不使用的單一舊字串

#### Scenario: NPC 近距離互動符合 runtime
- **WHEN** 自動導航在 NPC 一格互動距離內開啟 interaction
- **THEN** E2E 必須以 interaction 成功與合法距離判定通過
- **AND** 不得要求玩家一定站到 NPC 的完全相同座標

#### Scenario: Overflow 偵測排除不可見裝飾假陽性
- **WHEN** 卡片的 clip decoration 或隱藏 tooltip 造成 scroll geometry 多出少量像素但玩家無法水平捲動
- **THEN** 測試或元件結構必須排除該非內容幾何
- **AND** 真正可見內容超出 viewport 時仍必須讓 regression 失敗
