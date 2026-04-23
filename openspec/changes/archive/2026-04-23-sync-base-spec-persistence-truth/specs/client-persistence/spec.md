## MODIFIED Requirements

### Requirement: 版本化存檔封裝 (Versioned Save Envelope)
系統必須 (MUST) 以版本化存檔封裝在 LocalStorage 中儲存 current run 與 soul progression，而不是只存單層 Redux root state。

#### Scenario: 序列化 current 與 soul
- **WHEN** 系統序列化存檔
- **THEN** 存檔物件必須包含 `schemaVersion`
- **AND** 必須包含 `current` 區塊，承接 `character / logs / adventure / inventory / workshop / quest / encounter`
- **AND** 必須包含 `soul` 區塊，承接功德、Lifetime Stats、魂印解鎖、遺珍倉庫與輪迴暫存資訊

#### Scenario: 輪迴僅重置 current run
- **WHEN** 玩家完成輪迴並開始新一世
- **THEN** 存檔必須重建新的 `current` 區塊
- **AND** 同一份存檔內的 `soul` 區塊必須保留並寫入最新功德、魂印與遺珍狀態
- **AND** 不得把上一世的 `adventure / inventory / workshop / quest / encounter` 狀態殘留到新一世

### Requirement: 存檔版本遷移 (Save Schema Migration)
系統必須 (MUST) 能將 legacy LocalStorage 存檔與 retired skill/manual 資料遷移到正式版本化 schema。

#### Scenario: 載入 legacy raw save
- **WHEN** LocalStorage 中仍是舊版 raw root state
- **THEN** 系統必須將其視為 legacy current run
- **AND** 自動補上預設 `soul` state、預設 `encounter` state 與新版 schemaVersion
- **AND** 不得因缺少新版欄位而讓遊戲無法讀檔

#### Scenario: retired skill 與 manual 正式遷移
- **WHEN** 舊存檔內仍含 retired skill id、legacy manual item id 或 manual-like 無效殘值
- **THEN** 系統必須將可映射項目正規化到 formal core skill / manual id
- **AND** 對無法映射的 manual-like 殘值必須安全丟棄
- **AND** 不得把 retired skill 或壞掉的 manual id 直接帶進新版 current run

#### Scenario: encounter hydration 與保存
- **WHEN** 存檔中包含 `encounter.pendingEvent` 或 `resolvedEventIds`
- **THEN** 系統必須只接受合法 shape 的 pending event 與已解決事件清單
- **AND** 後續保存必須繼續使用正式 versioned envelope，而不是退回 legacy shape
