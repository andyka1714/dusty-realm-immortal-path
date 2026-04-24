## ADDED Requirements
### Requirement: 正式共享互動元件基礎
系統必須 (MUST) 讓高風險互動流程優先收斂到共享 `dialog/sheet`、表單與切換元件基礎，而不是每頁各自維護不同的 overlay 或 control 語意。

#### Scenario: Overlay 行為維持一致
- **WHEN** 玩家在 `Reincarnation Hall`、`Inventory`、`Workshop`、`Compendium` 或 `GameShell` 中打開正式 panel、modal 或 sheet
- **THEN** 介面必須沿用一致的 backdrop、關閉、焦點與 mobile 呈現語意
- **AND** 不得讓不同頁面的 overlay 出現互相衝突的關閉規則或捲動行為

#### Scenario: Shared control 維持遊戲語義
- **WHEN** 介面改用共享 `button`、`tabs`、`input`、`tooltip` 或其他正式 control
- **THEN** 它們必須維持既有遊戲世界觀的深色、五行與戰鬥語義
- **AND** 不得直接套用與正式遊戲風格衝突的預設 component 外觀

### Requirement: 高風險 UI flow 的正式瀏覽器驗證
系統必須 (MUST) 為高風險互動流程提供正式的 browser/e2e smoke 驗證，而不是只依賴靜態 markup 或 reducer regression。

#### Scenario: 輪迴大殿與 Inventory 可被 browser smoke 驗證
- **WHEN** 團隊變更 `Reincarnation Hall`、`GameShell overlay` 或 `Inventory` 的互動元件
- **THEN** 專案必須能以正式 browser/e2e smoke 驗證關鍵流程
- **AND** 驗證不得只停留在靜態文案存在與否

#### Scenario: 驗證基線保留穩定 selector
- **WHEN** 專案為高風險互動流程建立 browser/e2e smoke
- **THEN** 正式介面必須保留足夠穩定的 selector 或 equivalent semantic hook
- **AND** 不得讓驗證完全依賴脆弱的樣式 class 或純位置選取
