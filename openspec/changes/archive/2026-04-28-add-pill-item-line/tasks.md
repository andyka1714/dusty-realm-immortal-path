## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增丹藥用途 taxonomy regression
- [x] 1.3 新增境界需求與效果 coverage regression

## 2. 實作

- [x] 2.1 擴充丹藥用途 metadata
- [x] 2.2 補低中境界修為丹、恢復丹、戰鬥丹與突破輔助丹
- [x] 2.3 將丹藥接入 Workshop recipe、商店或任務獎勵
- [x] 2.4 更新追蹤文件，記錄不需要 migration 的理由

## 3. 驗證

- [x] 3.1 Run targeted consumable and inventory tests
- [x] 3.2 Run `npx tsc --noEmit`
- [x] 3.3 Run `openspec validate add-pill-item-line --strict`
