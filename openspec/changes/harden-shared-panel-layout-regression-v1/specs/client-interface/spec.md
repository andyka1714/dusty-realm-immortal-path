## MODIFIED Requirements

### Requirement: 共享控制與浮層必須可在 mobile-first flow 中操作
介面必須 (MUST) 讓 shared `Button / Input / Tabs / Modal / GamePanel` 在高頻遊戲流程中維持可讀、可點擊且不水平溢出，並以穩定 selector 支撐 browser smoke regression。

#### Scenario: 共享浮層面板不裁切關鍵內容
- **WHEN** 玩家在 shared `GamePanel` 中開啟 `道途 / 行囊 / 洞府 / 萬界圖鑑`
- **THEN** 面板內的主要 action、資訊卡、側欄詳情、分類 tabs 與摘要區不得被父容器裁切
- **AND** 同一列 action 必須使用一致尺寸與排列，不得因額外 wrapper 造成按鈕高度或位置異常
- **AND** 內容需要超出 panel 高度時必須可透過內層或外層 scroll 讀取，而不是被 `overflow-hidden` 靜默截斷

#### Scenario: 共享面板 browser smoke 覆蓋代表性幾何問題
- **WHEN** Playwright smoke 在 desktop 與 mobile viewport 驗證 shared panel
- **THEN** 測試必須覆蓋 horizontal overflow、section overlap、sticky heading 遮擋、action row alignment 與重要內容可見性
- **AND** 測試不得只檢查文字存在，必須至少對近期回歸過的面板加入 bounding box 或 viewport geometry assertion
