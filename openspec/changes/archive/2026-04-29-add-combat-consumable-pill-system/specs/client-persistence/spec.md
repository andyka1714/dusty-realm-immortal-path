## ADDED Requirements

### Requirement: 自動服丹設定必須安全持久化
LocalStorage persistence 必須 (MUST) 保存地圖內自動服丹設定，並能從舊存檔補齊預設值。

#### Scenario: 舊存檔缺少自動服丹設定
- **WHEN** 系統載入沒有 `adventure.autoConsumableSettings` 的舊存檔
- **THEN** migration 必須補上 HP 與 MP 自動服丹預設設定
- **AND** 非法閾值必須被清理回安全範圍
- **AND** 恢復丹藥冷卻 timestamp 不得被持久化
