## MODIFIED Requirements

### Requirement: 響應式佈局與視覺語言 (Responsive Layout & Visual Language)
系統必須 (MUST) 維持深色主題、五行語意、shared panel 可讀性與桌面 / 行動裝置可用性。

#### Scenario: 桌面與行動版
- **WHEN** 在不同尺寸螢幕瀏覽
- **THEN** 側邊欄、內容區與全屏流程必須維持可操作性與可讀性
- **AND** 行動版不得因 full-screen flow 或 GameShell 切換而破版

#### Scenario: 五行與靈根語意
- **WHEN** 介面顯示靈根、元素、危險提示或關鍵狀態
- **THEN** 必須沿用既有五行色彩與靈根 glow 語意
- **AND** 不得在不同畫面使用互相衝突的語意映射

#### Scenario: 共享浮層面板不裁切關鍵內容
- **WHEN** 玩家在 shared `GamePanel` 中開啟 `道途 / 行囊 / 洞府 / 萬界圖鑑`
- **THEN** 面板內的主要 action、資訊卡、側欄詳情、分類 tabs 與摘要區不得被父容器裁切
- **AND** 同一列 action 必須使用一致尺寸與排列，不得因額外 wrapper 造成按鈕高度或位置異常
- **AND** 內容需要超出 panel 高度時必須可透過內層或外層 scroll 讀取，而不是被 `overflow-hidden` 靜默截斷

#### Scenario: 共享面板 browser smoke 覆蓋代表性幾何問題
- **WHEN** Playwright smoke 在 desktop 與 mobile viewport 驗證 shared panel
- **THEN** 測試必須覆蓋 horizontal overflow、section overlap、sticky heading 遮擋、action row alignment 與重要內容可見性
- **AND** 測試不得只檢查文字存在，必須至少對近期回歸過的面板加入 bounding box 或 viewport geometry assertion
