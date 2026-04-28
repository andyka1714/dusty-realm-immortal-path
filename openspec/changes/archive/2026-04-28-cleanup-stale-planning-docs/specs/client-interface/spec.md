## ADDED Requirements

### Requirement: 規劃文件不得把歷史待辦誤導為 active backlog
專案文件必須 (MUST) 清楚區分歷史 plan 與目前 active OpenSpec backlog，避免已完成 runtime 被舊 checklist 重新標成未完成。

#### Scenario: 開發者盤點未完成項目
- **WHEN** 開發者查看舊 plan 或 checklist
- **THEN** 文件必須指出已被後續 tracking / archive 吸收的 plan 不再是 active backlog
- **AND** active backlog 必須以 `openspec list` 與最新 tracking 節為準
