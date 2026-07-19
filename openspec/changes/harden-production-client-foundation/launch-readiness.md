# Production Hardening Launch Readiness

## Release Scope

本次僅交付畫風中立的 production hardening，不含批量視覺換皮或數值重平衡。

## No-Go Conditions

出現任一條件即不得標記完成：

- 首次敘事、命名／性別、抽靈根到正式 GameShell 無法完成。
- mobile 小地圖、任務入口、action wheel 或 dock 被其他 HUD 攔截。
- 既有 unit tests、正式 E2E、typecheck 或 production build 失敗。
- production artifact 超過 50 MiB／12,000 files，或包含 prompt、pipeline metadata、本機絕對路徑。
- LocalStorage round-trip、legacy migration、trailing flush 或 pagehide flush 回歸失敗。
- production console 出現由本 change 引入的 fatal error。

## Rollout

- 先以本機 production preview dogfood，桌機與 390px mobile viewport 各走一次首次流程與 Adventure 關鍵操作。
- 本 change 不使用 persisted feature flag；若回歸，直接回退相關 build commit / artifact，不改玩家 schema。

## Rollback

- Asset allowlist 漏檔：回退 Vite production copy 設定，來源素材完全保留。
- 保存排程異常：回退至前一版保存器；envelope schema 不變，既有存檔可直接使用。
- 依賴相容問題：回退 lockfile 中對應 package 版本，不混入 gameplay data rollback。

## Evidence Required

- 完整 verify log。
- production artifact audit summary。
- desktop / mobile Playwright screenshots 與失敗 traces（若有）。
- tasks 與 validation 記錄更新。
