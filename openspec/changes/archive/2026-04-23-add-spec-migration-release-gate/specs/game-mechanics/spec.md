## ADDED Requirements
### Requirement: Base spec truth release gate
系統必須 (MUST) 讓完成的正式功能回寫 base specs 與 tracking docs，避免實作完成但規格真相停留在舊狀態。

#### Scenario: 功能 change 完成
- **WHEN** 任一 OpenSpec change 的實作、測試與文件完成
- **THEN** 該 change 必須更新對應 tasks 為完成狀態
- **AND** 封存前必須確認 base specs 已吸收正式行為或明確使用 `--skip-specs` 的理由

#### Scenario: 後續主線選擇
- **WHEN** 一條主線完成並準備選下一條 backlog
- **THEN** 必須先檢查 `openspec list`、base specs 與 tracking docs
- **AND** 不得只依賴舊審計文字判斷下一步
