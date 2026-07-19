## ADDED Requirements

### Requirement: Production artifact 必須只包含 runtime 素材
系統必須 (MUST) 以明確 manifest 或 allowlist 建立 production artifact，不得把完整素材生成工作區直接公開部署。

#### Scenario: 正式建置複製 runtime 素材
- **WHEN** 執行 production build
- **THEN** artifact 必須包含 runtime registry 可解析的 player、NPC、monster frames 與必要 fallback
- **AND** 現有 runtime URL contract 在本 change 內必須保持可解析

#### Scenario: 生成期產物不得進正式包
- **WHEN** production artifact audit 掃描輸出
- **THEN** raw、generation sheet、preview GIF、prompt、pipeline metadata 與生成紀錄不得存在
- **AND** artifact 內容不得包含 `/Users/`、`/tmp/` 或其他本機絕對路徑

#### Scenario: 來源工作區保持完整
- **WHEN** production build 排除生成期產物
- **THEN** `public/assets` 或等效來源工作區內的 raw、sheet、prompt、metadata 與 QC 輸出不得被刪除或覆寫
- **AND** 排除行為必須只作用於 production artifact

### Requirement: Production artifact 必須有可執行 budget
正式建置必須 (MUST) 以實際輸出檔案驗證素材總量、檔案數、JS chunk 與重複內容，而不是只設定 warning threshold。

#### Scenario: 正式素材位於第一階段 budget 內
- **WHEN** artifact audit 完成
- **THEN** production static assets 總量不得超過 `50 MiB`
- **AND** production asset 檔案數不得超過 12,000
- **AND** 超標時 CI 必須失敗並列出主要貢獻目錄與檔案

#### Scenario: 重複內容與 chunk 受控
- **WHEN** artifact 出現 content hash 相同的多份檔案或 JS chunk 超過正式 gate
- **THEN** audit 必須失敗或要求明確 allowlist 理由
- **AND** 不得只調高 Vite warning 數值來視為修復

### Requirement: 正式 HTML 與依賴不得依靠開發用途服務
Production client 必須 (MUST) 使用編譯後的本機 CSS / JS 與相容安全依賴，不得在正式入口載入標示為開發用途的 CSS runtime。

#### Scenario: 正式入口載入樣式
- **WHEN** 瀏覽器開啟 production build
- **THEN** Tailwind 樣式必須來自建置產物
- **AND** 不得請求 Tailwind Play CDN

#### Scenario: 安全依賴 gate
- **WHEN** CI 執行 dependency audit 與 production tests
- **THEN** 已有相容安全修正版的 critical / high direct toolchain advisory 必須被阻擋
- **AND** 升級後必須重新通過 typecheck、unit、E2E 與 production build

### Requirement: CI 必須驗證玩家可交付版本
系統必須 (MUST) 提供單一可重複的驗證入口，涵蓋程式正確性、正式建置與玩家關鍵流程。

#### Scenario: Pull request 或正式變更驗證
- **WHEN** CI 驗證客戶端變更
- **THEN** 必須執行 typecheck、strict no-regression、unit、production build、artifact audit 與 desktop / mobile E2E
- **AND** 任一 gate 失敗時不得把該版本標記為可交付

#### Scenario: E2E 失敗保留證據
- **WHEN** Playwright 關鍵流程失敗
- **THEN** CI 必須保存可用的 screenshot、trace 或等效證據
- **AND** 報告必須能區分產品互動失敗與 assertion 契約過時
