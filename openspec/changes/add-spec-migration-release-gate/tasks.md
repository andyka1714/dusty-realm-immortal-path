## 1. Shared gate 定義
- [ ] 1.1 盤點目前 specs、archive 與 persistence migration 測試
- [ ] 1.2 在 v2 tracking docs 定義每條 change 的 release checklist
- [ ] 1.3 明確 schema 變更與無 schema 變更時的不同收口路徑
- [ ] 1.4 明確未追蹤工作區項目不得混入正式 change commit

## 2. Spec / migration 規格
- [ ] 2.1 補 client-persistence 的 migration gate requirement
- [ ] 2.2 補 game-mechanics 的 base spec truth gate requirement
- [ ] 2.3 確認六條 v2 change 都引用同一套驗證規則
- [ ] 2.4 明確 archive 前必須先確認 base specs 已吸收正式行為，或記錄 `--skip-specs` 理由

## 3. 驗證與收口
- [ ] 3.1 驗證 `openspec validate add-spec-migration-release-gate --strict`
- [ ] 3.2 驗證 `openspec validate --specs --strict`
- [ ] 3.3 驗證 `npm run typecheck` 與 `git diff --check`
- [ ] 3.4 更新 v2 tracking docs
