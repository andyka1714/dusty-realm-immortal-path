# client-persistence Specification

## Purpose
定義目前正式使用的 LocalStorage 存檔結構、離線收益規則與輪迴相關 schema migration。

## Requirements

### Requirement: 版本化存檔封裝 (Versioned Save Envelope)
系統必須 (MUST) 以版本化存檔封裝在 LocalStorage 中儲存 current run 與 soul progression，而不是只存單層 Redux root state。

#### Scenario: 序列化 current 與 soul
- **WHEN** 系統序列化存檔
- **THEN** 存檔物件必須包含 `schemaVersion`
- **AND** 必須包含 `current` 區塊，承接 `character / logs / adventure / inventory / workshop / quest`
- **AND** 必須包含 `soul` 區塊，承接功德、Lifetime Stats、魂印解鎖、遺珍倉庫與輪迴暫存資訊

#### Scenario: 輪迴僅重置 current run
- **WHEN** 玩家完成輪迴並開始新一世
- **THEN** 存檔必須重建新的 `current` 區塊
- **AND** 同一份存檔內的 `soul` 區塊必須保留並寫入最新功德、魂印與遺珍狀態

### Requirement: 存檔版本遷移 (Save Schema Migration)
系統必須 (MUST) 能將舊版單層 LocalStorage 存檔遷移到新的版本化 soul/current schema。

#### Scenario: 載入 legacy raw save
- **WHEN** LocalStorage 中仍是舊版 raw root state
- **THEN** 系統必須將其視為 legacy current run
- **AND** 自動補上預設 `soul` state 與新版 schemaVersion
- **AND** 不得因缺少新版欄位而讓遊戲無法讀檔

#### Scenario: 遷移後保存
- **WHEN** legacy save 成功載入
- **THEN** 後續保存必須寫回新版 versioned envelope
- **AND** 不得再持續以舊 schema 覆寫存檔

### Requirement: 離線收益計算 (Offline Logic)
系統必須 (MUST) 在讀取存檔時計算 current run 的離線收益，且不得對 soul-only 狀態錯誤發放修為。

#### Scenario: 有 active current run
- **WHEN** 載入包含有效 current run 的存檔
- **THEN** 系統仍依 `current.character.lastSaveTime` 計算離線收益
- **AND** 離線收益只作用於 current run

#### Scenario: 處於輪迴流程中
- **WHEN** 玩家處於死亡總結或輪迴大殿、尚未開始新一世
- **THEN** 系統不得對尚未建立的新 current run 發放修為
