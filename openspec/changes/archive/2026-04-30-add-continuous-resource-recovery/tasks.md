## 1. Implementation
- [x] 1.1 新增 `utils/worldPlayerResourceRecovery.test.ts`，用 RED 測試固定 5 秒週期、HP 公式、MP 公式、上限 clamp 與 runtime effect 疊加。
- [x] 1.2 新增 `utils/worldPlayerResourceRecovery.ts`，輸出 `WORLD_RESOURCE_RECOVERY_INTERVAL_MS`、`ResourceRecoveryEffect`、`resolveWorldPlayerResourceRecovery`。
- [x] 1.3 在 `pages/Adventure.tsx` 加入 `lastResourceRecoveryAtRef` 與 interval effect，讓 Adventure runtime 每 5 秒套用 helper 結果。
- [x] 1.4 執行單元測試、typecheck、OpenSpec strict validation。
- [x] 1.5 更新本 tasks checklist。

## 2. Persisted State
- [x] 2.1 確認不需要 migration：本 change 只使用 Adventure component local state 與純 helper，未新增 persisted Redux / LocalStorage schema。
