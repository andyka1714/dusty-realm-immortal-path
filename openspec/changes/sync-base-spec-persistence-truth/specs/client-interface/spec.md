## ADDED Requirements

### Requirement: GameShell 內正式功能入口
系統必須 (MUST) 在正式 `GameShell` 內承接目前已落地的主要功能面板，而不是只保留單一 `Adventure` 畫面。

#### Scenario: Dock panel 切換正式面板
- **WHEN** 玩家位於有 active current run 的正式 `GameShell`
- **THEN** 系統必須允許從 dock 或等效入口切換 `Dashboard`、`Inventory`、`Workshop` 與 `Compendium`
- **AND** 各面板必須以 overlay panel 或等效承接方式顯示，而不離開主場景 shell

### Requirement: Pending encounter 正式承接
系統必須 (MUST) 在 yearly event 觸發遭遇時，以正式 modal / panel 流程承接選項與結果。

#### Scenario: 遭遇事件浮現
- **WHEN** 玩家處於正式遊玩流程且產生 pending encounter
- **THEN** `GameShell` 必須顯示對應的 encounter panel 或 modal
- **AND** 面板必須顯示事件標題、描述、年份與可選分支

#### Scenario: 遭遇選項完成
- **WHEN** 玩家在 pending encounter 中選擇某個 choice
- **THEN** 介面必須將選擇結果交回正式 state flow 處理
- **AND** 成功處理後不得留下過期的 pending encounter UI
