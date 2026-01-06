## ADDED Requirements

### Requirement: 應用程式導航 (App Navigation)
系統必須 (MUST) 提供側邊欄導航以切換主要功能模組。

#### Scenario: 主要頁面 (Tabs)
- **WHEN** 渲染側邊欄
- **THEN** 包含以下導航項目：
  1. **道始中心 (Dashboard)**: `Home` Icon，顯示角色屬性、當前修煉進度、日誌。
  2. **修仙歷練 (Adventure)**: `Sword` Icon，顯示冒險地圖。若在閉關中 (`isInSeclusion`) 則禁用。
  3. **洞府百業 (Workshop)**: `Hammer` Icon，顯示聚靈陣、煉丹、煉器介面。
  4. **行囊空間 (Inventory)**: `Backpack` Icon，顯示背包網格與裝備欄位。

### Requirement: 響應式佈局 (Responsive Layout)
系統必須 (MUST) 適配桌面與行動裝置的使用體驗。

#### Scenario: 桌面版 (Desktop > 768px)
- **WHEN** 在寬螢幕瀏覽
- **THEN** 側邊欄可折疊 (Collapsed)，折疊時僅顯示 Icon，展開時顯示標籤。
- **AND** 內容區域有左側 Margin 以避開側邊欄。

#### Scenario: 行動版 (Mobile)
- **WHEN** 在窄螢幕瀏覽
- **THEN** 側邊欄預設隱藏 (Drawer 模式)，點擊漢堡選單 (Hamburger) 滑出。
- **AND** 背景有半透明遮罩 (Backdrop Blur)。

### Requirement: 視覺風格與五行 (Visual Style & Five Elements)
系統必須 (MUST) 使用 Tailwind CSS 實作一致的深色主題與五行配色。

#### Scenario: 五行顏色映射
- **WHEN** 顯示特定屬性的文字或特效
- **THEN** 必須使用以下 Tailwind 類別：
  - **金 (Metal)**: `text-yellow-400` / `text-yellow-500`
  - **木 (Wood)**: `text-emerald-400` / `text-emerald-500`
  - **水 (Water)**: `text-blue-400` / `text-blue-500`
  - **火 (Fire)**: `text-red-400` / `text-red-500`
  - **土 (Earth)**: `text-amber-700`

#### Scenario: 靈根顯示
- **WHEN** 對話視窗或角色面板顯示靈根
- **THEN** 使用對應的 `glowClass` (如 `shadow-red-500/50`) 產生光暈效果。
